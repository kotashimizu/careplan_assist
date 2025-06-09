// ゲームアプリのセキュリティ設定
export const gameConfig = {
  // アプリケーション基本情報
  app: {
    name: 'SecureGame',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // 認証設定
  auth: {
    providers: ['email', 'google', 'discord'],
    sessionTimeout: 7200,              // 2時間（ゲームプレイ中のタイムアウト防止）
    rememberMeDuration: 2592000,       // 30日間
    multiFactorAuth: false,            // ゲームなので二要素認証は任意
    guestPlay: true,                   // ゲストプレイ許可
    roles: {
      admin: {
        permissions: ['*'],
        label: '管理者'
      },
      moderator: {
        permissions: ['player.ban', 'chat.moderate', 'report.view'],
        label: 'モデレーター'
      },
      player: {
        permissions: ['game.play', 'score.submit', 'chat.send'],
        label: 'プレイヤー'
      },
      guest: {
        permissions: ['game.play'],
        label: 'ゲスト'
      }
    }
  },

  // セキュリティ設定
  security: {
    level: 'high',                     // ゲームは高セキュリティ推奨
    antiCheat: {
      enabled: true,
      validateScores: true,            // スコア検証
      checkMemoryTampering: true,      // メモリ改ざんチェック
      maxScorePerMinute: 10000,        // 1分間の最大スコア
      suspiciousActivityThreshold: 5   // 疑わしい行動の閾値
    },
    encryption: {
      algorithm: 'AES-256',
      encryptSaves: true,              // セーブデータ暗号化
      encryptScores: true,             // スコア暗号化
      encryptInventory: true           // インベントリ暗号化
    },
    rateLimit: {
      scoreSubmission: 60,             // スコア送信は60秒に1回
      itemPurchase: 5,                 // アイテム購入は5秒に1回
      chatMessage: 2                   // チャットは2秒に1回
    }
  },

  // ゲーム機能フラグ
  features: {
    multiplayer: true,                 // マルチプレイヤー
    leaderboards: true,                // リーダーボード
    achievements: true,                // 実績システム
    dailyRewards: true,                // デイリー報酬
    tournaments: true,                 // トーナメント
    chat: true,                        // チャット機能
    friendSystem: true,                // フレンドシステム
    cloudSave: true,                   // クラウドセーブ
    offlinePlay: true,                 // オフラインプレイ
    replaySystem: false,               // リプレイシステム
    modSupport: false                  // MODサポート
  },

  // ゲーム設定
  game: {
    maxLevel: 100,                     // 最大レベル
    startingLives: 3,                  // 初期ライフ
    startingCoins: 100,                // 初期コイン
    difficultyModes: ['easy', 'normal', 'hard', 'extreme'],
    scoreMultipliers: {
      easy: 0.5,
      normal: 1.0,
      hard: 1.5,
      extreme: 2.0
    },
    autoSaveInterval: 30000,           // 30秒ごとのオートセーブ
    inactivityTimeout: 300000          // 5分間の無操作でポーズ
  },

  // 監査ログ設定
  audit: {
    enabled: true,
    retention: 30,                     // 30日間保持
    logLevel: 'info',
    gameActions: [
      'GAME_START', 'GAME_OVER', 'GAME_PAUSE',
      'LEVEL_UP', 'ACHIEVEMENT_UNLOCKED',
      'ITEM_PURCHASE', 'ITEM_USE',
      'SCORE_SUBMIT', 'LEADERBOARD_UPDATE',
      'SAVE_GAME', 'LOAD_GAME',
      'CHEAT_DETECTED', 'SUSPICIOUS_ACTIVITY'
    ]
  },

  // リーダーボード設定
  leaderboard: {
    maxEntries: 100,                   // 最大100エントリー
    updateInterval: 60000,             // 1分ごとに更新
    categories: ['daily', 'weekly', 'allTime'],
    antiCheatValidation: true          // 提出前の検証
  },

  // ブランディング
  branding: {
    primaryColor: '#FFD700',           // ゴールド
    secondaryColor: '#FF6B6B',         // レッド
    accentColor: '#4ECDC4',            // ターコイズ
    darkMode: true,                    // ダークモードデフォルト
    logo: '/game-logo.png',
    favicon: '/game-favicon.ico'
  },

  // ローカライゼーション
  localization: {
    defaultLanguage: 'ja',
    supportedLanguages: ['ja', 'en', 'ko', 'zh'],
    timezone: 'Asia/Tokyo'
  }
};