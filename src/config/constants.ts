/**
 * アプリケーション定数
 * 
 * マジックナンバーを避けるための定数定義
 * 変更が必要な場合はここを修正
 */

// ユーザー関連
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

// 認証関連
export const AUTH = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24時間
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7日
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

// API関連
export const API = {
  DEFAULT_TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒
} as const;

// ページネーション
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// ファイルアップロード
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  GENERIC: 'エラーが発生しました。もう一度お試しください。',
  NETWORK: 'ネットワークエラーが発生しました。接続を確認してください。',
  AUTH: {
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
    SESSION_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください。',
    UNAUTHORIZED: 'この操作を実行する権限がありません。',
  },
  VALIDATION: {
    REQUIRED: 'この項目は必須です。',
    EMAIL: '有効なメールアドレスを入力してください。',
    MIN_LENGTH: (min: number) => `${min}文字以上入力してください。`,
    MAX_LENGTH: (max: number) => `${max}文字以内で入力してください。`,
  },
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  SAVED: '保存しました。',
  DELETED: '削除しました。',
  UPDATED: '更新しました。',
  AUTH: {
    LOGIN: 'ログインしました。',
    LOGOUT: 'ログアウトしました。',
    REGISTER: '登録が完了しました。',
  },
} as const;

// ルートパス
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// テーマ
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// 型定義
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type Theme = typeof THEMES[keyof typeof THEMES];