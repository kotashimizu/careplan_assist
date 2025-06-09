// 暗号化関連の型定義

export interface EncryptionConfig {
  algorithm: 'AES-256' | 'AES-128' | 'RSA-2048' | 'RSA-4096';
  autoEncryptPII: boolean;
  keyRotation?: {
    enabled: boolean;
    intervalDays: number;
  };
  keyDerivation?: {
    iterations: number;
    saltLength: number;
  };
}

export interface EncryptedData {
  data: string;
  iv: string;
  algorithm: string;
  keyId?: string;
  timestamp: string;
}

export interface EncryptionKey {
  id: string;
  key: string;
  algorithm: string;
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'rotated' | 'revoked';
}

export interface EncryptionOptions {
  algorithm?: string;
  encoding?: 'base64' | 'hex';
  compress?: boolean;
  metadata?: Record<string, any>;
}

export interface DecryptionOptions {
  encoding?: 'base64' | 'hex';
  decompress?: boolean;
}

export interface HashOptions {
  algorithm?: 'SHA256' | 'SHA512' | 'MD5';
  encoding?: 'base64' | 'hex';
  salt?: string;
}

export interface PIIField {
  fieldName: string;
  fieldType: PIIType;
  encrypted: boolean;
  masking?: MaskingRule;
}

export type PIIType = 
  | 'email'
  | 'phone'
  | 'ssn'
  | 'creditCard'
  | 'bankAccount'
  | 'address'
  | 'name'
  | 'birthdate'
  | 'medicalRecord'
  | 'custom';

export interface MaskingRule {
  type: 'partial' | 'full' | 'custom';
  showFirst?: number;
  showLast?: number;
  maskChar?: string;
  pattern?: string;
}

export interface FileEncryptionResult {
  encryptedData: string;
  filename: string;
  originalSize: number;
  encryptedSize: number;
  mimeType: string;
  checksum: string;
}