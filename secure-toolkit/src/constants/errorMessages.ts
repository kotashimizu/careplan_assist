export const ERROR_MESSAGES = {
  // 認証エラー
  AUTH: {
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
    USER_NOT_FOUND: 'ユーザーが見つかりません。',
    USER_ALREADY_EXISTS: 'このメールアドレスは既に登録されています。',
    ACCOUNT_LOCKED: 'アカウントがロックされています。しばらくしてからもう一度お試しください。',
    SESSION_EXPIRED: 'セッションが期限切れです。再度ログインしてください。',
    INSUFFICIENT_PERMISSIONS: 'この操作を実行する権限がありません。',
    PASSWORD_TOO_WEAK: 'パスワードが要件を満たしていません。',
    PASSWORD_RECENTLY_USED: 'このパスワードは最近使用されています。別のパスワードを選択してください。',
    MFA_REQUIRED: '二要素認証が必要です。',
    INVALID_MFA_CODE: '認証コードが正しくありません。',
    TOKEN_EXPIRED: 'トークンが期限切れです。',
    INVALID_TOKEN: 'トークンが無効です。'
  },

  // 暗号化エラー
  ENCRYPTION: {
    ENCRYPTION_FAILED: 'データの暗号化に失敗しました。',
    DECRYPTION_FAILED: 'データの復号化に失敗しました。',
    INVALID_KEY: '暗号化キーが無効です。',
    KEY_NOT_FOUND: '暗号化キーが見つかりません。',
    INVALID_DATA_FORMAT: 'データ形式が無効です。',
    CORRUPTED_DATA: 'データが破損しています。'
  },

  // バリデーションエラー
  VALIDATION: {
    REQUIRED_FIELD: 'この項目は必須です。',
    INVALID_EMAIL: '有効なメールアドレスを入力してください。',
    INVALID_PHONE: '有効な電話番号を入力してください。',
    INVALID_URL: '有効なURLを入力してください。',
    INVALID_DATE: '有効な日付を入力してください。',
    INVALID_FILE_TYPE: 'サポートされていないファイル形式です。',
    FILE_TOO_LARGE: 'ファイルサイズが上限を超えています。',
    INVALID_LENGTH: '文字数が範囲外です。',
    INVALID_FORMAT: '形式が正しくありません。'
  },

  // ネットワークエラー
  NETWORK: {
    CONNECTION_FAILED: 'サーバーに接続できませんでした。',
    TIMEOUT: 'リクエストがタイムアウトしました。',
    SERVER_ERROR: 'サーバーエラーが発生しました。',
    NOT_FOUND: 'リソースが見つかりません。',
    FORBIDDEN: 'アクセスが拒否されました。',
    TOO_MANY_REQUESTS: 'リクエストが多すぎます。しばらくしてからもう一度お試しください。',
    OFFLINE: 'インターネット接続を確認してください。'
  },

  // ファイルエラー
  FILE: {
    UPLOAD_FAILED: 'ファイルのアップロードに失敗しました。',
    INVALID_FILE: 'ファイルが無効です。',
    FILE_NOT_FOUND: 'ファイルが見つかりません。',
    STORAGE_FULL: 'ストレージの容量が不足しています。',
    VIRUS_DETECTED: 'ウイルスが検出されました。',
    PROCESSING_FAILED: 'ファイルの処理に失敗しました。'
  },

  // データベースエラー
  DATABASE: {
    CONNECTION_FAILED: 'データベースに接続できませんでした。',
    QUERY_FAILED: 'データベースクエリに失敗しました。',
    RECORD_NOT_FOUND: 'レコードが見つかりません。',
    DUPLICATE_ENTRY: '重複するデータが存在します。',
    CONSTRAINT_VIOLATION: 'データ制約に違反しています。',
    TRANSACTION_FAILED: 'トランザクションに失敗しました。'
  },

  // 監査エラー
  AUDIT: {
    LOG_FAILED: '監査ログの記録に失敗しました。',
    INVALID_ACTION: '無効なアクションです。',
    PERMISSION_DENIED: 'ログの表示権限がありません。',
    EXPORT_FAILED: 'ログのエクスポートに失敗しました。'
  },

  // 設定エラー
  CONFIG: {
    INVALID_CONFIG: '設定が無効です。',
    CONFIG_NOT_FOUND: '設定が見つかりません。',
    UPDATE_FAILED: '設定の更新に失敗しました。',
    VALIDATION_FAILED: '設定の検証に失敗しました。',
    CONFLICT_DETECTED: '設定の競合が検出されました。'
  },

  // プライバシーエラー
  PRIVACY: {
    CONSENT_REQUIRED: 'データ処理には同意が必要です。',
    DATA_EXPORT_FAILED: 'データのエクスポートに失敗しました。',
    DELETION_FAILED: 'データの削除に失敗しました。',
    RETENTION_EXPIRED: 'データの保持期限が切れています。'
  },

  // セキュリティエラー
  SECURITY: {
    SUSPICIOUS_ACTIVITY: '不審な活動が検出されました。',
    IP_BLOCKED: 'このIPアドレスはブロックされています。',
    SECURITY_SCAN_FAILED: 'セキュリティスキャンに失敗しました。',
    VULNERABILITY_DETECTED: '脆弱性が検出されました。',
    INTRUSION_ATTEMPT: '侵入試行が検出されました。'
  },

  // 一般的なエラー
  GENERAL: {
    UNKNOWN_ERROR: '予期しないエラーが発生しました。',
    SERVICE_UNAVAILABLE: 'サービスが利用できません。',
    MAINTENANCE_MODE: 'システムメンテナンス中です。',
    FEATURE_DISABLED: 'この機能は無効になっています。',
    QUOTA_EXCEEDED: '利用制限に達しました。',
    OPERATION_CANCELLED: '操作がキャンセルされました。',
    INVALID_OPERATION: '無効な操作です。',
    RESOURCE_BUSY: 'リソースが使用中です。'
  }
} as const;

// エラーコードマッピング
export const ERROR_CODES = {
  // HTTP status codes
  400: ERROR_MESSAGES.VALIDATION.INVALID_FORMAT,
  401: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
  403: ERROR_MESSAGES.NETWORK.FORBIDDEN,
  404: ERROR_MESSAGES.NETWORK.NOT_FOUND,
  408: ERROR_MESSAGES.NETWORK.TIMEOUT,
  429: ERROR_MESSAGES.NETWORK.TOO_MANY_REQUESTS,
  500: ERROR_MESSAGES.NETWORK.SERVER_ERROR,
  503: ERROR_MESSAGES.GENERAL.SERVICE_UNAVAILABLE,

  // Custom error codes
  'E001': ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
  'E002': ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
  'E003': ERROR_MESSAGES.AUTH.ACCOUNT_LOCKED,
  'E004': ERROR_MESSAGES.ENCRYPTION.ENCRYPTION_FAILED,
  'E005': ERROR_MESSAGES.ENCRYPTION.DECRYPTION_FAILED,
  'E006': ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
  'E007': ERROR_MESSAGES.FILE.UPLOAD_FAILED,
  'E008': ERROR_MESSAGES.DATABASE.CONNECTION_FAILED,
  'E009': ERROR_MESSAGES.AUDIT.LOG_FAILED,
  'E010': ERROR_MESSAGES.SECURITY.SUSPICIOUS_ACTIVITY
} as const;

// ユーザーフレンドリーなエラーメッセージを取得
export function getUserFriendlyError(error: Error | string | number): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'number') {
    return ERROR_CODES[error as keyof typeof ERROR_CODES] || ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
  }

  // Error オブジェクトの場合
  const message = error.message;
  
  // エラーコードが含まれているかチェック
  for (const [code, errorMessage] of Object.entries(ERROR_CODES)) {
    if (message.includes(code)) {
      return errorMessage;
    }
  }

  // 特定のキーワードでマッピング
  if (message.toLowerCase().includes('network')) {
    return ERROR_MESSAGES.NETWORK.CONNECTION_FAILED;
  }
  
  if (message.toLowerCase().includes('timeout')) {
    return ERROR_MESSAGES.NETWORK.TIMEOUT;
  }
  
  if (message.toLowerCase().includes('auth')) {
    return ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
  }

  return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
}