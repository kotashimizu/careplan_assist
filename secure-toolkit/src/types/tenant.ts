// テナント設定関連の型定義

export interface TenantConfig {
  tenantId: string;
  app: {
    name: string;
    logo?: string;
    favicon?: string;
    version?: string;
    description?: string;
  };
  industry: IndustryType;
  features: FeatureFlags;
  security: SecurityConfig;
  compliance?: ComplianceConfig;
  audit?: AuditConfig;
  theme?: ThemeConfig;
  api?: ApiConfig;
  notifications?: NotificationConfig;
  customization?: CustomizationConfig;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IndustryType = 
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'ecommerce'
  | 'government'
  | 'gaming'
  | 'blog'
  | 'general';

export interface FeatureFlags {
  // 基本機能
  auth?: boolean;
  encryption?: boolean;
  audit?: boolean;
  mfa?: boolean;
  
  // 高度な機能
  audioProcessing?: boolean;
  videoCall?: boolean;
  chat?: boolean;
  notifications?: boolean;
  fileUpload?: boolean;
  
  // 業界特有機能
  billing?: boolean;
  
  // インデックスシグネチャ
  [key: string]: boolean | undefined;
  inventory?: boolean;
  appointments?: boolean;
  analytics?: boolean;
}

export type SecurityLevel = 'standard' | 'high' | 'maximum';

export interface SecurityConfig {
  level: SecurityLevel;
  encryption?: {
    algorithm: string;
    autoEncryptPII: boolean;
    encryptAtRest?: boolean;
    encryptInTransit?: boolean;
    keyRotationInterval?: number;
  };
  authentication?: {
    requireMFA?: boolean;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
    lockoutDuration?: number;
    passwordPolicy?: {
      minLength: number;
      complexity: 'low' | 'medium' | 'high';
    };
  };
  accessControl?: {
    rbacEnabled: boolean;
    defaultRole: string;
    inheritanceEnabled: boolean;
  };
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

export interface ComplianceConfig {
  standards: ComplianceStandard[];
  dataRetention: {
    enabled?: boolean;
    days: number;
    autoDelete?: boolean;
  };
  dataLocation?: {
    restricted: boolean;
    allowedRegions: string[];
  };
  privacyPolicy?: {
    url?: string;
    version: string;
    lastUpdated: Date;
    consentRequired: boolean;
  };
}

export type ComplianceStandard = 
  | 'HIPAA'
  | 'GDPR'
  | 'PCI-DSS'
  | 'SOC2'
  | 'ISO27001'
  | 'FERPA'
  | 'CCPA'
  | 'COPPA';

export interface CustomizationConfig {
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    fontFamily?: string;
    darkMode?: boolean;
  };
  branding: {
    companyName: string;
    supportEmail?: string;
    supportUrl?: string;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    dateFormat: string;
    timeZone: string;
  };
}

// 追加の設定インターフェース
export interface AuditConfig {
  enabled: boolean;
  retentionDays: number;
  exportFormats: string[];
  realTimeAlerts: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  mode: 'light' | 'dark';
  customCSS?: string;
}

export interface ApiConfig {
  rateLimit: {
    requests: number;
    window: number;
  };
  allowedOrigins: string[];
  apiKeys: string[];
}

export interface NotificationConfig {
  email: {
    enabled: boolean;
    templates: Record<string, any>;
  };
  push: {
    enabled: boolean;
    vapidKey?: string;
  };
  sms: {
    enabled: boolean;
    provider?: string;
  };
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  industry: IndustryType;
  features: FeatureFlags;
  security: SecurityConfig;
  compliance?: ComplianceConfig;
  recommended?: boolean;
}