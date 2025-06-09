import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { TenantProvider } from './TenantProvider';
import { EncryptionProvider } from './EncryptionProvider';
import { AuditLogProvider } from './AuditLogProvider';
import { SecurityConfig, TenantConfig } from '../types';

interface SecureProviderProps {
  children: ReactNode;
  config?: Partial<SecurityConfig & TenantConfig>;
  debug?: boolean;
}

/**
 * SecureProvider - すべてのセキュリティ機能を提供する統合プロバイダー
 * 
 * @example
 * ```tsx
 * <SecureProvider config={myConfig}>
 *   <App />
 * </SecureProvider>
 * ```
 */
export const SecureProvider: React.FC<SecureProviderProps> = ({ 
  children, 
  config = {},
  debug = false 
}) => {
  // デバッグモード
  if (debug) {
    console.log('[SecureToolkit] Initializing with config:', config);
  }

  // デフォルト設定とマージ
  const mergedConfig = {
    app: {
      name: 'Secure App',
      version: '1.0.0',
      environment: 'production',
      ...config.app
    },
    auth: {
      providers: ['email'],
      sessionTimeout: 3600,
      multiFactorAuth: false,
      ...config.auth
    },
    security: {
      level: 'standard',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        ...config.security?.encryption
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        ...config.security?.passwordPolicy
      },
      ...config.security
    },
    features: {
      ...config.features
    },
    audit: {
      enabled: true,
      retention: 90,
      logLevel: 'info',
      ...config.audit
    }
  };

  return (
    <TenantProvider config={mergedConfig}>
      <AuthProvider config={mergedConfig.auth}>
        <EncryptionProvider config={mergedConfig.security.encryption}>
          <AuditLogProvider config={mergedConfig.audit}>
            {children}
          </AuditLogProvider>
        </EncryptionProvider>
      </AuthProvider>
    </TenantProvider>
  );
};