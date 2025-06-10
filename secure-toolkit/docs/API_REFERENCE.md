# Secure Toolkit APIリファレンス

## 目次

1. [プロバイダー](#プロバイダー)
2. [フック](#フック)
3. [サービス](#サービス)
4. [コンポーネント](#コンポーネント)
5. [ユーティリティ](#ユーティリティ)
6. [型定義](#型定義)

## プロバイダー

### SecureProvider

アプリケーション全体のセキュリティ設定を管理するプロバイダー。

```tsx
interface SecureProviderProps {
  config: SecureConfig;
  children: React.ReactNode;
}

interface SecureConfig {
  securityLevel: 'standard' | 'high' | 'maximum';
  features?: SecurityFeature[];
  customConfig?: Partial<DetailedConfig>;
}
```

**使用例:**
```tsx
<SecureProvider config={{
  securityLevel: 'maximum',
  features: ['auth', 'encryption', 'audit']
}}>
  <App />
</SecureProvider>
```

### AuthProvider

認証状態を管理するプロバイダー。

```tsx
interface AuthProviderProps {
  children: React.ReactNode;
  onAuthStateChange?: (user: User | null) => void;
}
```

### TenantProvider

マルチテナント設定を管理するプロバイダー。

```tsx
interface TenantProviderProps {
  tenantId: string;
  children: React.ReactNode;
}
```

## フック

### useAuth

認証機能にアクセスするためのフック。

```tsx
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  setupMFA: (method: MFAMethod) => Promise<MFASetupResult>;
  verifyMFA: (code: string) => Promise<MFAVerificationResult>;
  refreshToken: () => Promise<void>;
}
```

**使用例:**
```tsx
const LoginComponent = () => {
  const { login, isAuthenticated } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });
    if (result.success && result.requiresMFA) {
      // MFA画面へ遷移
    }
  };
};
```

### useEncryption

データ暗号化機能にアクセスするためのフック。

```tsx
interface UseEncryptionReturn {
  encrypt: (data: string) => Promise<string>;
  decrypt: (encryptedData: string) => Promise<string>;
  encryptObject: (obj: any) => Promise<string>;
  decryptObject: (encryptedObj: string) => Promise<any>;
  generateKey: () => string;
}
```

**使用例:**
```tsx
const SecureForm = () => {
  const { encrypt, decrypt } = useEncryption();
  
  const handleSubmit = async (sensitiveData: string) => {
    const encrypted = await encrypt(sensitiveData);
    // 暗号化されたデータを送信
  };
};
```

### useTenantConfig

テナント設定にアクセスするためのフック。

```tsx
interface UseTenantConfigReturn {
  config: TenantConfig;
  updateConfig: (updates: Partial<TenantConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  isLoading: boolean;
}
```

### useAuditLog

監査ログ機能にアクセスするためのフック。

```tsx
interface UseAuditLogReturn {
  log: (entry: AuditLogEntry) => Promise<void>;
  query: (filters: AuditLogFilters) => Promise<AuditLogEntry[]>;
  export: (format: 'json' | 'csv') => Promise<Blob>;
}
```

### useRateLimit

レート制限状態を監視するためのフック。

```tsx
interface UseRateLimitReturn {
  remaining: number;
  limit: number;
  reset: Date;
  isLimited: boolean;
}
```

### useSecurityMonitor

セキュリティイベントを監視するためのフック。

```tsx
interface UseSecurityMonitorReturn {
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  acknowledge: (alertId: string) => Promise<void>;
  dismiss: (alertId: string) => Promise<void>;
}
```

## サービス

### authService

認証関連の操作を提供するサービス。

```typescript
class AuthService {
  login(credentials: LoginCredentials): Promise<LoginResult>;
  logout(): Promise<void>;
  register(data: RegisterData): Promise<RegisterResult>;
  verifyEmail(token: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  getCurrentUser(): Promise<User | null>;
}
```

### mfaService

多要素認証の管理を提供するサービス。

```typescript
class MFAService {
  setupTOTP(user: User): Promise<TOTPSetupResult>;
  verifyTOTP(code: string, secret?: string): Promise<boolean>;
  setupSMS(phoneNumber: string): Promise<void>;
  verifySMS(code: string): Promise<boolean>;
  generateBackupCodes(): string[];
  verifyBackupCode(code: string): Promise<boolean>;
  disableMFA(userId: string): Promise<void>;
}
```

### jwtService

JWTトークンの管理を提供するサービス。

```typescript
class JWTService {
  generateTokenPair(user: User, deviceId?: string): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
  refreshTokenPair(refreshToken: string): Promise<TokenPair>;
  revokeToken(tokenId: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}
```

### cryptoService

暗号化操作を提供するサービス。

```typescript
class CryptoService {
  encrypt(data: string, key?: string): Promise<string>;
  decrypt(encryptedData: string, key?: string): Promise<string>;
  hash(data: string): string;
  generateRandomKey(length: number): string;
  generateSalt(): string;
  pbkdf2(password: string, salt: string, iterations: number): Promise<string>;
}
```

### kmsService

鍵管理システムの操作を提供するサービス。

```typescript
class KMSService {
  createKey(policy: KeyPolicy): Promise<string>;
  generateDataKey(masterKeyId?: string): Promise<DataKey>;
  encrypt(data: string, keyId?: string): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData): Promise<string>;
  rotateKey(keyId: string): Promise<string>;
  revokeKey(keyId: string, reason: string): Promise<void>;
}
```

### fhirService

FHIR医療データ標準の変換を提供するサービス。

```typescript
class FHIRService {
  convertToFHIRPatient(data: CustomPatientData): Promise<Patient>;
  convertFromFHIRPatient(patient: Patient): Promise<CustomPatientData>;
  convertToFHIRObservation(data: CustomObservationData): Promise<Observation>;
  createBundle(resources: Resource[], type: BundleType): Bundle;
  validateFHIRResource(resource: Resource): Promise<OperationOutcome>;
  secureFHIRExchange(resource: Resource, recipientId: string): Promise<EncryptedExchange>;
}
```

### dataMaskingService

データマスキング操作を提供するサービス。

```typescript
class DataMaskingService {
  maskData(data: any, userRole?: string): any;
  maskPHI(text: string): string;
  maskPII(data: any): any;
  unmaskData(maskedData: any, userRole: string): any;
  detectSensitiveData(data: any): SensitiveDataLocation[];
}
```

### securityMonitor

セキュリティイベントの監視を提供するサービス。

```typescript
class SecurityMonitor {
  recordEvent(event: SecurityEventInput): Promise<void>;
  getEvents(filters: EventFilters): Promise<SecurityEvent[]>;
  getActiveAlerts(): Promise<SecurityAlert[]>;
  analyzeThreats(): Promise<ThreatAnalysis>;
  configureRule(rule: SecurityRule): Promise<void>;
}
```

### auditLogService

監査ログの管理を提供するサービス。

```typescript
class AuditLogService {
  log(entry: AuditLogEntryInput): Promise<void>;
  query(filters: AuditLogFilters): Promise<AuditLogEntry[]>;
  export(format: ExportFormat, filters?: AuditLogFilters): Promise<Blob>;
  generateComplianceReport(options: ReportOptions): Promise<ComplianceReport>;
  purge(before: Date): Promise<number>;
}
```

### tenantConfigManager

テナント設定の管理を提供するサービス。

```typescript
class TenantConfigManager {
  getConfig(tenantId: string): Promise<TenantConfig>;
  updateConfig(tenantId: string, updates: Partial<TenantConfig>): Promise<void>;
  validateConfig(config: TenantConfig): ValidationResult;
  applyPreset(tenantId: string, presetId: string): Promise<void>;
  exportConfig(tenantId: string): Promise<string>;
  importConfig(tenantId: string, configJson: string): Promise<void>;
}
```

## コンポーネント

### ProtectedRoute

認証が必要なルートを保護するコンポーネント。

```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}
```

**使用例:**
```tsx
<ProtectedRoute requiredRoles={['admin', 'doctor']}>
  <AdminDashboard />
</ProtectedRoute>
```

### LoginForm

ログインフォームコンポーネント。

```tsx
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  enableMFA?: boolean;
  customFields?: CustomField[];
}
```

### MFASetup

多要素認証セットアップコンポーネント。

```tsx
interface MFASetupProps {
  user: User;
  methods?: MFAMethod[];
  onComplete?: (result: MFASetupResult) => void;
  onSkip?: () => void;
}
```

### MFAVerification

多要素認証検証コンポーネント。

```tsx
interface MFAVerificationProps {
  method: MFAMethod;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  allowBackupCode?: boolean;
}
```

### EncryptedField

暗号化されたフィールドコンポーネント。

```tsx
interface EncryptedFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoEncrypt?: boolean;
  showDecrypted?: boolean;
}
```

### AuditLogViewer

監査ログビューアコンポーネント。

```tsx
interface AuditLogViewerProps {
  filters?: AuditLogFilters;
  pageSize?: number;
  exportEnabled?: boolean;
  columns?: ColumnConfig[];
}
```

### SecurityDashboard

セキュリティダッシュボードコンポーネント。

```tsx
interface SecurityDashboardProps {
  timeRange?: TimeRange;
  metrics?: MetricType[];
  alertsEnabled?: boolean;
  refreshInterval?: number;
}
```

### MaskedDataView

マスクされたデータを表示するコンポーネント。

```tsx
interface MaskedDataViewProps {
  data: any;
  showToggle?: boolean;
  allowedRoles?: string[];
  className?: string;
}
```

## ユーティリティ

### secureStorage

セキュアなローカルストレージ操作。

```typescript
const secureStorage = {
  setItem(key: string, value: any): Promise<void>;
  getItem(key: string): Promise<any>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};
```

### passwordValidator

パスワード検証ユーティリティ。

```typescript
const passwordValidator = {
  validate(password: string): PasswordValidationResult;
  checkStrength(password: string): PasswordStrength;
  generateSecurePassword(options?: PasswordOptions): string;
};
```

### sanitizer

入力サニタイズユーティリティ。

```typescript
const sanitizer = {
  sanitizeHTML(html: string): string;
  sanitizeSQL(query: string): string;
  sanitizeJSON(json: string): string;
  escapeRegExp(string: string): string;
};
```

### ipValidator

IPアドレス検証ユーティリティ。

```typescript
const ipValidator = {
  isValidIPv4(ip: string): boolean;
  isValidIPv6(ip: string): boolean;
  isPrivateIP(ip: string): boolean;
  getIPInfo(ip: string): IPInfo;
};
```

## 型定義

### 認証関連

```typescript
interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin?: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResult {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresMFA?: boolean;
  error?: string;
}
```

### MFA関連

```typescript
type MFAMethod = 'totp' | 'sms' | 'email' | 'biometric';

interface MFASetupResult {
  method: MFAMethod;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

interface MFAVerificationResult {
  success: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
}
```

### 暗号化関連

```typescript
interface EncryptedData {
  ciphertext: string;
  keyId: string;
  algorithm: KeyAlgorithm;
  metadata?: Record<string, any>;
}

type KeyAlgorithm = 'AES-256' | 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256';

interface KeyPolicy {
  algorithm: KeyAlgorithm;
  keyType: KeyType;
  usage: KeyUsage[];
  rotationPeriod?: number;
  expirationDate?: Date;
}
```

### 監査ログ関連

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  details?: any;
}

interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resourceType?: string;
  result?: 'success' | 'failure';
}
```

### FHIR関連

```typescript
interface Patient {
  resourceType: 'Patient';
  id?: string;
  identifier?: Identifier[];
  name?: HumanName[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  telecom?: ContactPoint[];
}

interface Observation {
  resourceType: 'Observation';
  id?: string;
  status: ObservationStatus;
  code: CodeableConcept;
  subject?: Reference;
  effectiveDateTime?: string;
  valueQuantity?: Quantity;
}
```

## エラーハンドリング

すべてのAPIメソッドは、エラー時に以下の形式のエラーをスローします：

```typescript
interface SecureToolkitError extends Error {
  code: string;
  statusCode?: number;
  details?: any;
  retryable?: boolean;
}
```

**エラーコード一覧:**

| コード | 説明 |
|--------|------|
| AUTH_INVALID_CREDENTIALS | 無効な認証情報 |
| AUTH_MFA_REQUIRED | MFA検証が必要 |
| AUTH_TOKEN_EXPIRED | トークンの有効期限切れ |
| ENCRYPTION_FAILED | 暗号化に失敗 |
| DECRYPTION_FAILED | 復号化に失敗 |
| RATE_LIMIT_EXCEEDED | レート制限超過 |
| PERMISSION_DENIED | 権限不足 |
| VALIDATION_ERROR | 入力検証エラー |

## ミドルウェア

### rateLimiter

Express.js用のレート制限ミドルウェア。

```typescript
const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト数
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', rateLimitMiddleware);
```

## 設定例

### 医療機関向け設定

```typescript
const medicalConfig: SecureConfig = {
  securityLevel: 'maximum',
  features: ['auth', 'encryption', 'audit', 'mfa', 'fhir'],
  customConfig: {
    auth: {
      mfaMethods: ['totp', 'sms'],
      sessionTimeout: 15,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventReuse: 10
      }
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotationDays: 90
    },
    audit: {
      retentionDays: 2555, // 7年
      includeReadOperations: true
    }
  }
};
```

### Eコマース向け設定

```typescript
const ecommerceConfig: SecureConfig = {
  securityLevel: 'high',
  features: ['auth', 'encryption', 'audit'],
  customConfig: {
    auth: {
      mfaMethods: ['totp'],
      sessionTimeout: 60
    },
    encryption: {
      encryptFields: ['creditCard', 'cvv']
    },
    rateLimit: {
      checkout: { max: 10, window: 3600000 }
    }
  }
};
```