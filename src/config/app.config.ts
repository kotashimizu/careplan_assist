/**
 * アプリケーション設定
 * 
 * 環境変数から読み込み、デフォルト値を提供
 * ハードコーディングを避けるための中央設定
 */

// 開発環境かどうかの判定
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const appConfig = {
  // 基本設定
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'AI駆動開発アプリ',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // API設定
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
  },

  // Supabase設定
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // 機能フラグ
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableMaintenance: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
    enableDebugMode: isDevelopment || process.env.ENABLE_DEBUG === 'true',
  },

  // セキュリティ設定
  security: {
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1時間
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  },

  // アップロード設定
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
    uploadPath: process.env.UPLOAD_PATH || '/uploads',
  },

  // ページネーション
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100'),
  },

  // 開発ツール
  dev: {
    enableHotReload: isDevelopment,
    enableSourceMaps: isDevelopment,
    logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  },
} as const;

// 型定義
export type AppConfig = typeof appConfig;

// 設定の検証（起動時に実行）
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `必須の環境変数が設定されていません: ${missing.join(', ')}\n` +
      `.env.localファイルを確認してください。`
    );
  }
}