import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { TenantConfig, FeatureFlags } from '../types/tenant';

interface TenantContextType {
  config: TenantConfig | null;
  isFeatureEnabled: (feature: string) => boolean;
  getConfig: (path: string) => any;
  updateConfig: (updates: Partial<TenantConfig>) => void;
  setConfig: (config: TenantConfig) => void;
}

export const TenantContext = createContext<TenantContextType | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  config: any;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children, config: initialConfig }) => {
  const [config, setConfigState] = useState<TenantConfig | null>(
    initialConfig as TenantConfig || null
  );

  // 機能が有効かチェック
  const isFeatureEnabled = useCallback((feature: string): boolean => {
    if (!config?.features) return false;
    return config.features[feature] === true;
  }, [config]);

  // ネストされた設定値を取得
  const getConfig = useCallback((path: string): any => {
    if (!config) return undefined;
    
    const keys = path.split('.');
    let value: any = config;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    
    return value;
  }, [config]);

  // 設定を更新
  const updateConfig = useCallback((updates: Partial<TenantConfig>) => {
    setConfigState(prev => {
      if (!prev) return prev;
      
      const newConfig = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // ローカルストレージに保存
      localStorage.setItem('secure-toolkit-config', JSON.stringify(newConfig));
      
      return newConfig;
    });
  }, []);

  // 設定を完全に置き換え
  const setConfig = useCallback((newConfig: TenantConfig) => {
    setConfigState(newConfig);
    localStorage.setItem('secure-toolkit-config', JSON.stringify(newConfig));
  }, []);

  const value: TenantContextType = {
    config,
    isFeatureEnabled,
    getConfig,
    updateConfig,
    setConfig
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};