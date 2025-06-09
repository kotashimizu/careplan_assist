// MFA（多要素認証）関連の型定義

export interface MFAMethod {
  type: 'totp' | 'sms' | 'email' | 'biometric';
  enabled: boolean;
  verified: boolean;
  primary?: boolean;
}

export interface MFASetupResult {
  method: MFAMethod['type'];
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  sessionId?: string;
}

export interface MFAVerificationRequest {
  userId: string;
  method: MFAMethod['type'];
  code?: string;
  sessionId?: string;
  biometricData?: any;
}

export interface MFAVerificationResult {
  verified: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
  requiresAdditionalStep?: boolean;
}

export interface MFAConfig {
  methods: MFAMethod[];
  requiredMethods: number; // 必要な認証方法の数
  lockoutPolicy: {
    maxAttempts: number;
    lockoutDuration: number; // 分単位
  };
  sessionPolicy: {
    timeout: number; // 秒単位
    allowRememberDevice: boolean;
    trustedDeviceExpiry: number; // 日単位
  };
  backupCodes: {
    count: number;
    length: number;
  };
}