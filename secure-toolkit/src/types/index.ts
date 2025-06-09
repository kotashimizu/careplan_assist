// 型定義のメインエクスポートファイル

export * from './auth';
export * from './tenant';
export * from './encryption';
export * from './audit';
export * from './common';
export * from './validation';

// 共通の設定型
export interface SecurityConfig {
  app?: {
    name?: string;
    version?: string;
    environment?: string;
    logo?: string;
  };
  auth?: AuthConfig;
  security?: {
    level?: 'standard' | 'high' | 'maximum';
    encryption?: EncryptionConfig;
    passwordPolicy?: PasswordPolicy;
    headers?: SecurityHeaders;
  };
  features?: Record<string, boolean>;
  audit?: AuditConfig;
  branding?: BrandingConfig;
  localization?: LocalizationConfig;
}

// 認証設定
export interface AuthConfig {
  providers?: string[];
  sessionTimeout?: number;
  rememberMeDuration?: number;
  multiFactorAuth?: boolean;
  guestPlay?: boolean;
  roles?: Record<string, RoleConfig>;
}

// ロール設定
export interface RoleConfig {
  permissions: string[];
  label: string;
}

// パスワードポリシー
export interface PasswordPolicy {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  preventCommonPasswords?: boolean;
}

// セキュリティヘッダー
export interface SecurityHeaders {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  strictTransportSecurity?: string;
}

// 監査設定
export interface AuditConfig {
  enabled?: boolean;
  retention?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  actions?: string[];
}

// ブランディング設定
export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  darkMode?: boolean;
  logo?: string;
  favicon?: string;
}

// ローカライゼーション設定
export interface LocalizationConfig {
  defaultLanguage?: string;
  supportedLanguages?: string[];
  timezone?: string;
}