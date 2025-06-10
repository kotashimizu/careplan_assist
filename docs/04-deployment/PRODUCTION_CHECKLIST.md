# 本番環境チェックリスト

## 🔐 Vercel環境変数設定

### 必須環境変数
- [ ] `VITE_ENVIRONMENT=production`
- [ ] `VITE_USE_DEMO_MODE=false`
- [ ] `VITE_SUPABASE_URL=https://mpabqsbcyllxbfjqotdc.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY=eyJhbGc...（完全なキー）`
- [ ] `VITE_GEMINI_API_KEY=（AIキー）`

### 注意事項
- **SERVICE_ROLE_KEY は絶対に設定しない**（サーバーサイドのみで使用）

## 🗄️ Supabase設定

### データベース
- [ ] 必要なテーブルが全て作成されている
- [ ] RLSが全てのテーブルで有効化されている
- [ ] 適切なRLSポリシーが設定されている

### 認証設定（Authentication → URL Configuration）
- [ ] Site URL: `https://carecheck-assist.vercel.app`
- [ ] Redirect URLs: `https://carecheck-assist.vercel.app/auth/callback`

### SMTP設定（本番メール送信用）
- [ ] カスタムSMTPサーバーの設定（SendGrid、AWS SES等）
- [ ] テストメールの送信確認

## 🔒 セキュリティ設定

### Supabase
- [ ] SSL強制が有効
- [ ] 組織レベルでMFA（多要素認証）が有効
- [ ] ネットワーク制限の設定（必要に応じて）

### Vercel
- [ ] 環境変数のスコープが正しく設定されている（Production only）
- [ ] COEPヘッダーが適切に設定されている

## 📊 パフォーマンス

### データベース
- [ ] 頻繁にアクセスされるカラムにインデックスが作成されている
- [ ] 適切なデータベースプランを選択している
- [ ] バックアップ戦略が確立されている

## 🧪 テスト

### 動作確認
- [ ] ログイン/ログアウトが正常に動作する
- [ ] データの読み込みが正常に動作する
- [ ] エラーが発生していない

### データ確認
- [ ] モックデータではなく実データが表示される
- [ ] ローカルストレージが空である

## 📝 メンテナンス

### マイグレーション
- [ ] Supabase CLIでマイグレーションを管理
- [ ] GitHub Actionsでの自動マイグレーション設定（オプション）

### モニタリング
- [ ] エラーログの監視体制
- [ ] パフォーマンスメトリクスの確認