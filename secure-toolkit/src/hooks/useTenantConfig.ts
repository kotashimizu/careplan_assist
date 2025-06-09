import { useContext } from 'react';
import { TenantContext } from '../providers/TenantProvider';

/**
 * useTenantConfig - テナント設定にアクセスするためのフック
 * 
 * @example
 * ```tsx
 * const { isFeatureEnabled, getConfig } = useTenantConfig();
 * 
 * if (isFeatureEnabled('chat')) {
 *   return <ChatWidget />;
 * }
 * 
 * const securityLevel = getConfig('security.level');
 * ```
 */
export function useTenantConfig() {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error(
      'useTenantConfig must be used within a TenantProvider. ' +
      'Make sure your app is wrapped with <SecureProvider> or <TenantProvider>.'
    );
  }
  
  return context;
}

// 便利なエイリアス
export function useFeatureFlag(feature: string): boolean {
  const { isFeatureEnabled } = useTenantConfig();
  return isFeatureEnabled(feature);
}

export function useAuthConfig() {
  const { getConfig } = useTenantConfig();
  return {
    providers: getConfig('auth.providers') || [],
    sessionTimeout: getConfig('auth.sessionTimeout') || 3600,
    multiFactorAuth: getConfig('auth.multiFactorAuth') || false,
    roles: getConfig('auth.roles') || {}
  };
}

export function useSecurityConfig() {
  const { getConfig } = useTenantConfig();
  return {
    level: getConfig('security.level') || 'standard',
    encryption: getConfig('security.encryption') || {},
    passwordPolicy: getConfig('security.passwordPolicy') || {},
    headers: getConfig('security.headers') || {}
  };
}

export function useComplianceConfig() {
  const { getConfig } = useTenantConfig();
  return {
    standards: getConfig('compliance.standards') || [],
    dataRetention: getConfig('compliance.dataRetention') || {},
    dataLocation: getConfig('compliance.dataLocation') || {},
    privacyPolicy: getConfig('compliance.privacyPolicy')
  };
}

export function useBrandingConfig() {
  const { getConfig } = useTenantConfig();
  return {
    primaryColor: getConfig('branding.primaryColor') || '#3B82F6',
    secondaryColor: getConfig('branding.secondaryColor') || '#10B981',
    logo: getConfig('branding.logo'),
    favicon: getConfig('branding.favicon'),
    darkMode: getConfig('branding.darkMode') || false
  };
}

export function useLocalizationConfig() {
  const { getConfig } = useTenantConfig();
  return {
    defaultLanguage: getConfig('localization.defaultLanguage') || 'en',
    supportedLanguages: getConfig('localization.supportedLanguages') || ['en'],
    timezone: getConfig('localization.timezone') || 'UTC'
  };
}

// 音声設定
export function useAudioConfig() {
  const { isFeatureEnabled, getConfig } = useTenantConfig();
  return {
    enabled: isFeatureEnabled('audioProcessing'),
    whisperApiKey: getConfig('audio.whisperApiKey'),
    maxFileSize: getConfig('audio.maxFileSize') || 10 * 1024 * 1024, // 10MB
    allowedFormats: getConfig('audio.allowedFormats') || ['mp3', 'wav', 'webm'],
    autoTranscribe: getConfig('audio.autoTranscribe') || true
  };
}

// 暗号化設定
export function useEncryptionConfig() {
  const { getConfig } = useTenantConfig();
  return {
    algorithm: getConfig('security.encryption.algorithm') || 'AES-256',
    autoEncryptPII: getConfig('security.encryption.autoEncryptPII') || true,
    encryptAtRest: getConfig('security.encryption.encryptAtRest') || true,
    encryptInTransit: getConfig('security.encryption.encryptInTransit') || true
  };
}