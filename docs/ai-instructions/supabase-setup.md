# Supabase設定手順

## 基本設定
1. https://supabase.com でプロジェクト作成
2. Project Settings > API からURL・KEYを取得
3. .env.localファイルを作成して設定
4. 認証設定：Authentication > Settings で設定

## 環境変数の設定
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 本番環境用（サーバーサイド処理で必要な場合）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 認証設定のポイント
- Email認証の有効化
- パスワードポリシーの設定
- リダイレクトURLの設定
- Row Level Security (RLS) の適切な設定

## トラブルシューティング
詳細は `docs/05-troubleshooting/01-Supabase認証トラブルシューティング.md` を参照してください。