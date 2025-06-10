# ステージング環境ログインデバッグガイド

## 問題の概要
ステージング環境でログインが失敗する問題の調査方法

## 調査手順

### 1. ブラウザの開発者ツールでの確認

#### A. Networkタブでの確認
1. Chrome/Edgeで開発者ツール（F12）を開く
2. Networkタブを選択
3. ログインを試行
4. 以下のリクエストを確認：
   - `/auth/v1/token?grant_type=password` へのPOSTリクエスト
   - リクエストURL、Headers、Payloadを確認
   - ResponseのStatus CodeとBodyを確認

#### B. Consoleタブでの確認
1. エラーメッセージの確認
2. 特に以下のエラーに注意：
   - CORS関連エラー
   - 認証エラー
   - ネットワークエラー

### 2. 環境変数の確認

#### A. 現在の設定
```typescript
// services/supabaseClient.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

#### B. ステージング環境の環境変数（.env.staging）
```
VITE_ENVIRONMENT=staging
VITE_USE_DEMO_MODE=false
VITE_SUPABASE_URL=https://ddqdjzlqclodiblnmrkn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 潜在的な問題点

#### A. 二重のSupabaseクライアント
現在、2つのSupabaseクライアントが存在：
1. `services/supabase.ts` - ハードコードされたURL/Key（本番環境）
2. `services/supabaseClient.ts` - 環境変数から読み込み

#### B. 認証ロジックの確認
`contexts/AuthContext.tsx`のlogin関数で：
```typescript
// 226-227行目
const forceDemoMode = false; // ステージング環境テストのため無効化
const useDemoMode = forceDemoMode || config.isDemoMode || (config.isLocalMode && import.meta.env.VITE_USE_DEMO_MODE === 'true');
```

### 4. デバッグ用コード追加

#### A. 環境変数の確認
```typescript
console.log('Environment:', {
  VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
  VITE_USE_DEMO_MODE: import.meta.env.VITE_USE_DEMO_MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  isDemoMode: config.isDemoMode,
  isLocalMode: config.isLocalMode
});
```

#### B. 認証リクエストの確認
```typescript
// AuthContext.tsx login関数内
console.log('Login attempt:', {
  email,
  useDemoMode,
  supabaseUrl: config.supabase.url
});
```

### 5. 一般的なエラーと対処法

#### A. CORS Error
**エラー例：**
```
Access to fetch at 'https://xxx.supabase.co/auth/v1/token' from origin 'https://staging.example.com' has been blocked by CORS policy
```

**対処法：**
- Supabase Dashboardで許可されたドメインを確認
- Authentication > URL Configuration > Site URLにステージングURLを追加

#### B. Invalid API Key
**エラー例：**
```
{
  "error": "Invalid API key",
  "error_description": "apikey is not valid"
}
```

**対処法：**
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトの設定でAPI keyを再確認

#### C. User Not Found
**エラー例：**
```
{
  "error": "invalid_grant",
  "error_description": "No user found with that email, or password invalid."
}
```

**対処法：**
- Supabase Studioでユーザーが存在するか確認
- パスワードが正しいか確認
- email_confirmed_atがnullでないか確認

### 6. 推奨される修正

#### A. Supabaseクライアントの統一
すべてのファイルで`services/supabaseClient.ts`を使用するように統一

#### B. デバッグモードの追加
```typescript
// .env.staging に追加
VITE_DEBUG_MODE=true

// 認証関連のコードでデバッグログを追加
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Auth Debug:', { /* デバッグ情報 */ });
}
```

### 7. テスト手順
1. ブラウザのキャッシュをクリア
2. 開発者ツールを開いた状態でログイン試行
3. Network/Consoleタブでエラーを確認
4. 上記のデバッグ情報を収集

## 緊急対応
もし問題が解決しない場合：
1. 一時的に`VITE_USE_DEMO_MODE=true`に設定してデモモードで動作確認
2. Supabaseのサービス状態を確認: https://status.supabase.com/
3. プロジェクトのログを確認: Supabase Dashboard > Logs