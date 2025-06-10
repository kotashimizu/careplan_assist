# Supabase認証トラブルシューティング完全ガイド

## 📌 今回の問題の総括

### 何が問題だったか
1. **環境変数の優先順位問題**
   - `.env.local` が `.env.staging` より優先されていた
   - Viteの環境変数読み込み順序を理解していなかった

2. **複数の強制デモモード設定**
   - `services/config.ts`: `forceDemo = true`
   - `services/authValidator.ts`: `forceDemo = true`
   - `contexts/AuthContext.tsx`: `forceDemoMode = true`

3. **データベース設定の不整合**
   - staffテーブルの `auth_id` が未設定
   - RLS（Row Level Security）ポリシーが認証をブロック

4. **Supabaseインポートの混在**
   - 古い `services/supabase.ts`（ハードコードURL）
   - 新しい `services/supabaseClient.ts`（環境変数使用）

## 🎯 根本原因

**途中で環境構成を変更したことによる設定の不整合**
- 最初: デモモードのみ
- 途中: ローカルSupabase追加
- 最後: ステージング環境追加

各段階で追加された設定が残り、競合を起こしていた。

## ✅ 改善方法（実施済み）

### 1. 環境変数の整理
```bash
# 不要なファイルを削除
rm .env.local
rm .env.development

# 正しい環境変数ファイルを使用
.env          # デフォルト設定
.env.staging  # ステージング環境
.env.production # 本番環境
```

### 2. 強制デモモードの無効化
```typescript
// すべてのファイルで以下に変更
const forceDemo = false;
const forceDemoMode = false;
```

### 3. データベース整合性の確保
- staffテーブルに正しい `auth_id` を設定
- RLSポリシーを適切に設定

## 📋 環境構築チェックリスト

### 🔰 非エンジニア向け必須確認事項

#### 1. 環境変数ファイルの確認
```bash
# 必要なファイルのみ存在することを確認
ls -la .env*

# 期待される結果:
.env          # 現在使用する環境
.env.example  # サンプル（触らない）
.env.staging  # ステージング用（必要時のみ）
.env.production # 本番用（必要時のみ）

# ❌ 削除すべきファイル:
.env.local    # 混乱の元
.env.development # 不要
```

#### 2. 環境設定の確認方法
ブラウザで以下にアクセス:
```
http://localhost:5173/#/env-debug
```

確認項目:
- Environment（環境）が正しいか
- Supabase URLが正しいか
- API Keyが設定されているか

#### 3. デモモードの確認
```
http://localhost:5173/#/test-login
```
- `useDemoMode: false` であることを確認

## 🚨 よくあるエラーと対処法

### 1. "Invalid login credentials" エラー

**原因**: パスワードが間違っている、またはユーザーが存在しない

**対処法**:
1. Supabase Dashboardでユーザーを確認
2. パスワードをリセット
3. staffテーブルにレコードがあるか確認

### 2. "No API key found in request" エラー

**原因**: 環境変数が読み込まれていない

**対処法**:
1. `.env` ファイルを確認
2. アプリを再起動（Ctrl+C → npm run dev）
3. ブラウザを完全リロード（Ctrl+Shift+R）

### 3. "デモ環境では指定された認証情報のみ使用できます" エラー

**原因**: 強制デモモードが有効

**対処法**:
```bash
# 以下のファイルを確認
grep -r "forceDemo.*true" services/
grep -r "forceDemoMode.*true" contexts/
```

### 4. ログイン後に画面が真っ白

**原因**: staffテーブルのデータ不整合

**対処法**: Supabase Dashboardで確認
- staffテーブルに該当ユーザーのレコードがあるか
- `auth_id` が正しく設定されているか
- `role` が設定されているか

## 🏗️ 環境構築手順（ゼロから始める場合）

### 1. プロジェクトのクローン
```bash
git clone [repository-url]
cd carecheck_assist
npm install
```

### 2. 環境の選択
```bash
# 開発環境（ローカルSupabase）
cp .env.example .env
# VITE_ENVIRONMENT=local に設定

# ステージング環境
cp .env.staging .env
# 内容はそのまま使用

# 本番環境
cp .env.production .env
# 本番の認証情報を設定
```

### 3. 環境別の起動方法
```bash
# 開発環境
npm run dev

# ステージング確認
npm run dev  # .envがステージング設定の場合

# 本番ビルド
npm run build
```

### 4. 初回セットアップ
```bash
# Supabase CLIでプロジェクトをリンク
supabase link --project-ref [プロジェクトID]

# データベーススキーマを適用
supabase db push

# テストユーザーを作成（管理画面から）
```

## 🔍 トラブルシューティングフローチャート

```
ログインできない
├─ エラーメッセージは？
│  ├─ "Invalid credentials"
│  │  └─ → Supabase Dashboardでユーザー確認
│  ├─ "No API key"
│  │  └─ → 環境変数確認（.envファイル）
│  └─ "デモ環境では..."
│     └─ → 強制デモモード無効化
│
├─ コンソールエラーは？
│  ├─ 404エラー
│  │  └─ → Supabase URL確認
│  └─ CORSエラー
│     └─ → Supabase DashboardでURL許可
│
└─ ネットワークタブは？
   ├─ リクエストが送信されない
   │  └─ → ブラウザキャッシュクリア
   └─ 400エラー
      └─ → staffテーブル確認
```

## 📝 開発者向けベストプラクティス

### 1. 環境変数管理
```typescript
// ❌ 悪い例
const supabaseUrl = 'https://xxxx.supabase.co';

// ✅ 良い例
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

### 2. デモモード制御
```typescript
// ❌ 悪い例
const forceDemo = true; // ハードコード

// ✅ 良い例
const isDemoMode = config.environment === 'demo';
```

### 3. エラーハンドリング
```typescript
// ✅ 認証エラーの詳細ログ
if (error) {
  console.error('[Auth Error]', {
    message: error.message,
    code: error.code,
    details: error.details,
    environment: config.environment,
    url: config.supabase.url
  });
}
```

### 4. RLSポリシー設計
```sql
-- ✅ 認証ユーザーが自分のデータを読める
CREATE POLICY "Users can read own data"
ON table_name
FOR SELECT
TO authenticated
USING (auth_id = auth.uid());
```

## 🎯 まとめ

### 今回学んだ教訓
1. **環境変数の優先順位を理解する**
2. **ハードコードされた設定を避ける**
3. **複数の設定箇所で同じ値を管理しない**
4. **RLSポリシーとデータ整合性を保つ**

### 再発防止策
1. **環境構築時は必ずこのガイドを参照**
2. **デバッグページで環境確認を習慣化**
3. **エラー時は段階的に問題を切り分け**
4. **変更履歴を残し、何を変更したか記録**

このガイドに従えば、同様の問題を防ぐことができます。
不明な点があれば、必ずこのガイドを参照してください。