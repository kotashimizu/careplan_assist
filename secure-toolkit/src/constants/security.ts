export const SECURITY_LEVELS = {
  STANDARD: {
    level: 'standard',
    label: '標準',
    description: '一般的なWebアプリケーション向け',
    features: {
      encryption: 'AES-256',
      sessionTimeout: 3600,
      passwordMinLength: 8,
      auditRetention: 30,
      mfaRequired: false
    }
  },
  HIGH: {
    level: 'high',
    label: '高',
    description: '機密データを扱うアプリケーション向け',
    features: {
      encryption: 'AES-256',
      sessionTimeout: 1800,
      passwordMinLength: 12,
      auditRetention: 90,
      mfaRequired: false
    }
  },
  MAXIMUM: {
    level: 'maximum',
    label: '最高',
    description: '医療・金融など最高レベルが必要な場合',
    features: {
      encryption: 'AES-256',
      sessionTimeout: 900,
      passwordMinLength: 16,
      auditRetention: 365,
      mfaRequired: true
    }
  }
} as const;

export const ENCRYPTION_ALGORITHMS = {
  'AES-128': {
    keySize: 128,
    blockSize: 128,
    security: 'standard'
  },
  'AES-256': {
    keySize: 256,
    blockSize: 128,
    security: 'high'
  },
  'RSA-2048': {
    keySize: 2048,
    blockSize: 0,
    security: 'high'
  },
  'RSA-4096': {
    keySize: 4096,
    blockSize: 0,
    security: 'maximum'
  }
} as const;

export const SESSION_TIMEOUTS = {
  SHORT: 900,    // 15分
  STANDARD: 3600, // 1時間
  LONG: 7200,    // 2時間
  EXTENDED: 28800 // 8時間
} as const;

export const PASSWORD_POLICIES = {
  BASIC: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: true,
    requireNumbers: false,
    requireSpecialChars: false
  },
  STANDARD: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  STRICT: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  MAXIMUM: {
    minLength: 16,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
} as const;

export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 900000, // 15分
    blockDuration: 3600000 // 1時間
  },
  API: {
    maxRequests: 100,
    windowMs: 60000 // 1分
  },
  EXPORT: {
    maxRequests: 3,
    windowMs: 3600000 // 1時間
  }
} as const;

export const SECURITY_HEADERS = {
  STRICT: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },
  STANDARD: {
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:",
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  BASIC: {
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff'
  }
} as const;

export const AUDIT_SEVERITY_LEVELS = {
  LOW: {
    value: 'low',
    label: '低',
    color: 'green',
    retention: 30
  },
  MEDIUM: {
    value: 'medium',
    label: '中',
    color: 'yellow',
    retention: 90
  },
  HIGH: {
    value: 'high',
    label: '高',
    color: 'orange',
    retention: 365
  },
  CRITICAL: {
    value: 'critical',
    label: '致命的',
    color: 'red',
    retention: 2555 // 7年
  }
} as const;