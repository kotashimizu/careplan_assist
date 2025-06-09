import React, { useState } from 'react';
import { useTenantConfig } from '../hooks/useTenantConfig';
import { TenantConfig } from '../types/tenant';

interface TenantConfigPanelProps {
  onSave?: (config: TenantConfig) => void;
  className?: string;
}

/**
 * TenantConfigPanel - テナント設定管理パネル
 * 
 * @example
 * ```tsx
 * <TenantConfigPanel 
 *   onSave={(config) => saveConfig(config)}
 * />
 * ```
 */
export const TenantConfigPanel: React.FC<TenantConfigPanelProps> = ({
  onSave,
  className = ''
}) => {
  const { config, updateConfig } = useTenantConfig();
  const [activeTab, setActiveTab] = useState('general');
  const [localConfig, setLocalConfig] = useState<Partial<TenantConfig>>(config || {});

  if (!config) {
    return (
      <div className="p-4 text-center text-gray-500">
        設定が見つかりません
      </div>
    );
  }

  const handleSave = () => {
    if (localConfig) {
      updateConfig(localConfig);
      onSave?.(localConfig as TenantConfig);
    }
  };

  const tabs = [
    { id: 'general', label: '一般', icon: '⚙️' },
    { id: 'security', label: 'セキュリティ', icon: '🔒' },
    { id: 'features', label: '機能', icon: '🛠️' },
    { id: 'compliance', label: 'コンプライアンス', icon: '📋' }
  ];

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* タブナビゲーション */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* 一般設定 */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">一般設定</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アプリケーション名
                </label>
                <input
                  type="text"
                  value={localConfig.app?.name || ''}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    app: { ...localConfig.app, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  業界
                </label>
                <select
                  value={localConfig.industry || 'general'}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    industry: e.target.value as any
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">一般</option>
                  <option value="healthcare">医療</option>
                  <option value="finance">金融</option>
                  <option value="education">教育</option>
                  <option value="ecommerce">EC</option>
                  <option value="gaming">ゲーム</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* セキュリティ設定 */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">セキュリティ設定</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                セキュリティレベル
              </label>
              <select
                value={localConfig.security?.level || 'standard'}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  security: { 
                    ...localConfig.security, 
                    level: e.target.value as any 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">標準</option>
                <option value="high">高</option>
                <option value="maximum">最高</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.security?.authentication?.requireMFA || false}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      security: {
                        level: (localConfig.security?.level || 'standard') as any,
                        ...localConfig.security,
                        authentication: {
                          ...localConfig.security?.authentication,
                          requireMFA: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  二要素認証を必須にする
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.security?.encryption?.autoEncryptPII || false}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      security: {
                        level: (localConfig.security?.level || 'standard') as any,
                        ...localConfig.security,
                        encryption: {
                          algorithm: localConfig.security?.encryption?.algorithm || 'AES-256',
                          ...localConfig.security?.encryption,
                          autoEncryptPII: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  個人情報を自動暗号化
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 機能設定 */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">機能設定</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                auth: '認証',
                encryption: '暗号化',
                audit: '監査ログ',
                mfa: '二要素認証',
                audioProcessing: '音声処理',
                videoCall: 'ビデオ通話',
                chat: 'チャット',
                notifications: '通知',
                fileUpload: 'ファイルアップロード',
                billing: '請求',
                inventory: '在庫管理',
                appointments: '予約',
                analytics: 'アナリティクス'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.features?.[key] || false}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      features: {
                        ...localConfig.features,
                        [key]: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* コンプライアンス設定 */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">コンプライアンス設定</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                準拠基準
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['HIPAA', 'GDPR', 'PCI-DSS', 'SOC2', 'ISO27001', 'FERPA', 'CCPA'].map(standard => (
                  <label key={standard} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.compliance?.standards?.includes(standard as any) || false}
                      onChange={(e) => {
                        const currentStandards = localConfig.compliance?.standards || [];
                        const newStandards = e.target.checked
                          ? [...currentStandards, standard as any]
                          : currentStandards.filter(s => s !== standard);
                        
                        setLocalConfig({
                          ...localConfig,
                          compliance: {
                            dataRetention: { enabled: true, days: 90 },
                            ...localConfig.compliance,
                            standards: newStandards
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    {standard}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                データ保持期間（日）
              </label>
              <input
                type="number"
                value={localConfig.compliance?.dataRetention?.days || 90}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  compliance: {
                    standards: localConfig.compliance?.standards || [],
                    ...localConfig.compliance,
                    dataRetention: {
                      enabled: localConfig.compliance?.dataRetention?.enabled ?? true,
                      ...localConfig.compliance?.dataRetention,
                      days: parseInt(e.target.value)
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* 保存ボタン */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setLocalConfig(config)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              リセット
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              設定を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};