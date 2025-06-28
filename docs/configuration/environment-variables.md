# 環境変数設定ガイド

## 必須設定

### アプリケーション基本設定
```env
NEXT_PUBLIC_APP_NAME="AI駆動開発アプリ"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NODE_ENV=development
```

### Supabase設定
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 本番環境用（サーバーサイド処理で必要な場合）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## オプション設定

### API設定
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_TIMEOUT=30000
```

### 機能フラグ
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
ENABLE_DEBUG=true
```

### セキュリティ設定
```env
SESSION_TIMEOUT=3600000         # 1時間（ミリ秒）
MAX_LOGIN_ATTEMPTS=5
PASSWORD_MIN_LENGTH=8
```

### ファイルアップロード
```env
MAX_FILE_SIZE=10485760          # 10MB（バイト）
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
UPLOAD_PATH=/uploads
```

### ページネーション
```env
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

### ログ設定
```env
LOG_LEVEL=debug                 # debug, info, warn, error
```

## 環境別の設定

### 開発環境（.env.local）
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
LOG_LEVEL=debug
```

### 本番環境（.env.production）
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.your-domain.com
LOG_LEVEL=error
```

## 設定の優先順位

1. `.env.local` - ローカル開発用（Gitで無視）
2. `.env.production` - 本番環境用
3. `.env` - デフォルト値

## トラブルシューティング

### 環境変数が反映されない
- Next.jsを再起動する
- `NEXT_PUBLIC_`プレフィックスを確認（クライアントサイドで使用する場合）

### Vercelでの設定
1. Vercelダッシュボードで「Settings」→「Environment Variables」
2. 各環境変数を追加
3. デプロイを再実行