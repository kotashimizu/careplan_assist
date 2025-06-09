// 認証関連の型定義

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest' | string;

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface Permission {
  resource: string;
  action: string;
  scope?: string;
}

export interface AuthProvider {
  name: string;
  type: 'oauth' | 'saml' | 'local';
  clientId?: string;
  scope?: string[];
  authUrl?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MFASetup {
  type: 'totp' | 'sms' | 'email';
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

export interface MFAVerification {
  code: string;
  type: 'totp' | 'sms' | 'email';
}