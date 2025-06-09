/**
 * Secure Toolkit - メインエクスポートファイル
 * 
 * 他のプロジェクトから使用する際のエントリーポイント
 */

// ===== Core Providers =====
export { SecureProvider } from './providers/SecureProvider';
export { AuthProvider, AuthContext } from './providers/AuthProvider';
export { TenantProvider, TenantContext } from './providers/TenantProvider';

// ===== Authentication =====
export { useAuth } from './hooks/useAuth';
export { ProtectedRoute } from './components/ProtectedRoute';
export { LoginForm } from './components/LoginForm';
export { authService } from './services/authService';
// export type { AuthUser, AuthState, LoginCredentials } from './types/auth'; // TODO: 未実装

// ===== Encryption =====
export { useEncryption } from './hooks/useEncryption';
export { cryptoService } from './services/cryptoService';
export { EncryptedField } from './components/EncryptedField';
// export type { EncryptionOptions, EncryptedData } from './types/encryption'; // TODO: 未実装

// ===== Tenant Configuration =====
export { useTenantConfig } from './hooks/useTenantConfig';
// export { useAuthConfig } from './hooks/useTenantConfig'; // TODO: 未実装
// export { useAudioConfig } from './hooks/useTenantConfig'; // TODO: 未実装
// export { useEncryptionConfig } from './hooks/useTenantConfig'; // TODO: 未実装
// export { useComplianceConfig } from './hooks/useTenantConfig'; // TODO: 未実装
export { tenantConfigManager } from './services/tenantConfigManager';
export { TenantConfigPanel } from './components/TenantConfigPanel';
// export { ConfigConflictChecker } from './services/configConflictChecker'; // TODO: 未実装
export type { 
  TenantConfig, 
  FeatureFlags, 
  SecurityConfig, 
  // BrandingConfig, // TODO: 未実装
  PresetTemplate 
} from './types/tenant';

// ===== Audit Logging =====
export { useAuditLog } from './hooks/useAuditLog';
export { auditLogService } from './services/auditLogService';
export { AuditLogViewer } from './components/AuditLogViewer';
// export type { AuditLogEntry, AuditAction } from './types/audit'; // TODO: 未実装

// ===== Setup & Configuration =====
export { SetupWizard } from './components/SetupWizard';
// export { presets, getPresetById, getPresetsByIndustry } from './config/presets'; // TODO: 未実装

// ===== Security Components =====
export { SecurityBadge } from './components/SecurityBadge';
export { PasswordStrengthIndicator } from './components/PasswordStrengthIndicator';
export { ConsentBanner } from './components/ConsentBanner';
export { DataPrivacySettings } from './components/DataPrivacySettings';

// ===== Common Components =====
export { ErrorMessage } from './components/common/ErrorMessage';
export { LoadingSpinner } from './components/common/LoadingSpinner';

// ===== Privacy Components =====
export { ConsentManager } from './components/privacy/ConsentManager';
export { DataExporter } from './components/privacy/DataExporter';
export { AccountDeleter } from './components/privacy/AccountDeleter';

// ===== Utilities =====
export { secureStorage } from './utils/secureStorage';
export { passwordValidator } from './utils/passwordValidator';
export { sanitizer } from './utils/sanitizer';
export { ipValidator } from './utils/ipValidator';
export { emailValidator } from './utils/validators/emailValidator';
export { validators } from './utils/validators';

// ===== Constants =====
export { SECURITY_LEVELS } from './constants/security';
export { ERROR_MESSAGES } from './constants/errorMessages';
export { COMPLIANCE_STANDARDS } from './constants/compliance';

// ===== Type Exports =====
export type { ValidationResult, PasswordValidationResult, EmailValidationResult } from './types/validation';

// ===== Types (Additional) =====
// export type {
//   SecurityLevel,
//   ComplianceStandard,
//   UserRole,
//   Permission
// } from './types/common'; // TODO: 未実装

/**
 * デフォルトエクスポート - 全機能を含むオブジェクト
 * 
 * 使用例:
 * import SecureToolkit from '@your-org/secure-toolkit';
 * const { useAuth, useEncryption } = SecureToolkit;
 */
const SecureToolkit = {
  // Providers
  SecureProvider,
  AuthProvider,
  TenantProvider,
  
  // Hooks
  useAuth,
  useEncryption,
  useTenantConfig,
  useAuditLog,
  // useAuthConfig, // TODO: 未実装
  // useAudioConfig, // TODO: 未実装
  // useEncryptionConfig, // TODO: 未実装
  // useComplianceConfig, // TODO: 未実装
  
  // Services
  authService,
  cryptoService,
  tenantConfigManager,
  auditLogService,
  
  // Components
  ProtectedRoute,
  LoginForm,
  EncryptedField,
  TenantConfigPanel,
  AuditLogViewer,
  SetupWizard,
  SecurityBadge,
  PasswordStrengthIndicator,
  ConsentBanner,
  DataPrivacySettings,
  
  // Utils
  secureStorage,
  passwordValidator,
  sanitizer,
  ipValidator,
  
  // Config
  // presets, // TODO: 未実装
  // getPresetById, // TODO: 未実装
  // getPresetsByIndustry, // TODO: 未実装
  
  // Constants
  SECURITY_LEVELS,
  ERROR_MESSAGES,
  COMPLIANCE_STANDARDS
};

export default SecureToolkit;