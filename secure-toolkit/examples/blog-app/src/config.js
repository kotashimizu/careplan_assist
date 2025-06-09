// ブログアプリのセキュリティ設定
export const blogConfig = {
  // アプリケーション基本情報
  app: {
    name: 'SecureBlog',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // 認証設定
  auth: {
    providers: ['email', 'google'],
    sessionTimeout: 3600,           // 1時間
    rememberMeDuration: 604800,     // 7日間
    multiFactorAuth: false,         // 二要素認証
    roles: {
      admin: {
        permissions: ['*'],
        label: '管理者'
      },
      author: {
        permissions: ['post.create', 'post.edit.own', 'post.delete.own'],
        label: '著者'
      },
      reader: {
        permissions: ['post.read'],
        label: '読者'
      }
    }
  },

  // セキュリティ設定
  security: {
    level: 'standard',              // standard | high | maximum
    encryption: {
      algorithm: 'AES-256',
      autoEncryptPII: true,         // 個人情報の自動暗号化
      encryptDrafts: true           // 下書きの暗号化
    },
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      preventCommonPasswords: true
    },
    headers: {
      contentSecurityPolicy: "default-src 'self'",
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff'
    }
  },

  // 機能フラグ
  features: {
    comments: true,                 // コメント機能
    socialSharing: true,           // SNSシェア機能
    tags: true,                    // タグ機能
    search: true,                  // 検索機能
    rss: true,                     // RSSフィード
    analytics: false,              // アナリティクス
    newsletter: false              // ニュースレター
  },

  // 監査ログ設定
  audit: {
    enabled: true,
    retention: 90,                  // 90日間保持
    logLevel: 'info',              // debug | info | warn | error
    actions: [
      'LOGIN', 'LOGOUT',
      'POST_CREATE', 'POST_UPDATE', 'POST_DELETE', 'POST_PUBLISH',
      'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
      'SETTINGS_CHANGE'
    ]
  },

  // ブランディング
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logo: '/logo.png',
    favicon: '/favicon.ico'
  },

  // ローカライゼーション
  localization: {
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en'],
    timezone: 'Asia/Tokyo'
  }
};