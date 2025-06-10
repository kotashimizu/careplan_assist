# 本番環境移行ガイド

## 📋 目次
1. [概要](#概要)
2. [現在の実装状況](#現在の実装状況)
3. [Supabaseセットアップ](#supabaseセットアップ)
4. [環境変数設定](#環境変数設定)
5. [データベース構築](#データベース構築)
6. [認証設定](#認証設定)
7. [デプロイ手順](#デプロイ手順)
8. [移行後の確認事項](#移行後の確認事項)
9. [トラブルシューティング](#トラブルシューティング)

## 概要

現在、ケアチェックアシストはデモモードで動作しており、データはLocalStorageに保存されています。本番環境では、Supabaseを使用して以下を実現します：

- **リアルタイムデータベース**: PostgreSQLベースの高性能DB
- **認証システム**: セキュアなユーザー認証・認可
- **Row Level Security (RLS)**: データレベルでのアクセス制御
- **マルチテナント対応**: 複数事業所の独立運用

## 現在の実装状況

### ✅ 実装済み機能
1. **認証システム**
   - ロールベースアクセス制御（RBAC）
   - スーパー管理者、管理者、スタッフ、一般ユーザー
   - デモモード/本番モード自動切り替え

2. **SaaS管理機能**
   - 顧客管理（事業所CRUD）
   - サブスクリプション管理
   - ビジネスメトリクス表示
   - サポートチケット管理

3. **現場業務機能**
   - 利用者管理
   - スケジュール管理
   - 日々のチェックリスト
   - 支援計画書作成
   - AI分析（Gemini API）

### 🔄 デモ/本番自動切り替え
```typescript
// services/config.ts
const useDemoMode = config.isDemoMode || config.isLocalMode;
```

## Supabaseセットアップ

### 1. Supabaseプロジェクト作成
1. [Supabase](https://supabase.com)にアクセス
2. 新規プロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Project URL
   - anon public key

### 2. 必要な拡張機能の有効化
SQL Editorで以下を実行：
```sql
-- UUID生成拡張
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 暗号化拡張
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 環境変数設定

### 1. Vercel環境変数
Vercelダッシュボードで以下を設定：

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API（AI分析用）
VITE_GEMINI_API_KEY=AIzaSy...

# 環境設定
VITE_ENVIRONMENT=production
```

### 2. ローカル開発環境
`.env.local`ファイルを作成：

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API
VITE_GEMINI_API_KEY=AIzaSy...

# 環境設定
VITE_ENVIRONMENT=local
VITE_USE_DEMO_MODE=false
```

## データベース構築

### 1. 基本テーブル作成
Supabase SQL Editorで実行：

```bash
# 1. 基本テーブルとRLS設定
/database/00_execute_all_fixed.sql

# 2. SaaS管理テーブル
/database/08_complete_saas_setup.sql

# 3. スーパー管理者作成
/database/04_super_admin_setup.sql
```

### 2. テーブル構造
```
organizations（事業所）
├── staff（スタッフ/ユーザー）
├── users（利用者）
├── schedules（スケジュール）
├── service_records（サービス記録）
├── assessments（アセスメント）
└── support_plans（支援計画）

customer_subscriptions（契約情報）
├── subscription_plans（プランマスタ）
├── payment_history（支払い履歴）
└── usage_statistics（使用統計）

support_tickets（サポート）
└── support_ticket_comments（コメント）
```

### 3. Row Level Security (RLS)
各テーブルに適用されるセキュリティポリシー：
- 一般ユーザー: 自組織のデータのみ
- 管理者: 自組織の全データ
- スーパー管理者: 全組織のデータ

## 認証設定

### 1. Supabase認証設定
1. Authentication → Settings
2. Site URLを設定（例: https://carecheck-assist.vercel.app）
3. Email認証を有効化

### 2. 初期ユーザー作成
SQL Editorで実行：

```sql
-- スーパー管理者作成
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('super@carecheck.com', crypt('super123456', gen_salt('bf')), NOW());

-- staffテーブルに登録
INSERT INTO public.staff (auth_id, organization_id, name, email, role)
SELECT id, '00000000-0000-0000-0000-000000000000', 'システム管理者', 'super@carecheck.com', 'super_admin'
FROM auth.users WHERE email = 'super@carecheck.com';
```

## デプロイ手順

### 1. Vercelデプロイ
```bash
# ビルド確認
npm run build

# Vercel CLIでデプロイ
vercel --prod
```

### 2. デプロイ後の設定
1. Vercelダッシュボードで環境変数確認
2. ドメイン設定（カスタムドメインの場合）
3. Analytics/Speed Insightsの有効化

## 移行後の確認事項

### 1. 機能確認チェックリスト
- [ ] スーパー管理者ログイン
- [ ] 新規顧客（事業所）作成
- [ ] 作成した事業所の管理者でログイン
- [ ] 利用者登録・管理
- [ ] スケジュール作成
- [ ] AI分析機能
- [ ] PDFエクスポート

### 2. セキュリティ確認
- [ ] RLSポリシーの動作確認
- [ ] 異なる事業所間でのデータ分離
- [ ] APIキーの非公開性
- [ ] HTTPSの強制

### 3. パフォーマンス確認
- [ ] ページロード速度
- [ ] データベースクエリ速度
- [ ] 大量データでの動作

## トラブルシューティング

### よくある問題と解決方法

#### 1. Supabase接続エラー
```
エラー: Failed to fetch
```
**解決方法:**
- 環境変数が正しく設定されているか確認
- Supabase URLとanon keyの確認
- CORSポリシーの設定確認

#### 2. 認証エラー
```
エラー: Invalid login credentials
```
**解決方法:**
- Supabase Authenticationでユーザー存在確認
- パスワードリセット機能の利用
- RLSポリシーの確認

#### 3. データ取得エラー
```
エラー: permission denied for table
```
**解決方法:**
- RLSポリシーの確認と修正
- ユーザーのrole設定確認
- staffテーブルのデータ確認

### サポート情報
- Supabaseドキュメント: https://supabase.com/docs
- プロジェクトGitHub: [リポジトリURL]
- 技術サポート: [連絡先]

## 付録: 新規顧客登録フロー

### スーパー管理者による顧客作成
1. システム管理 → 顧客管理 → 新規顧客
2. 事業所情報入力
3. 管理者アカウント設定
4. 契約プラン選択
5. 作成完了

### 作成されるデータ
```
organizations（事業所）
  ↓
auth.users（認証ユーザー）
  ↓
staff（管理者ロール）
  ↓
customer_subscriptions（契約）
```

### 顧客のアクセス
- URL: https://carecheck-assist.vercel.app/login
- ログイン: 設定したメールアドレス/パスワード
- 初回ログイン後、自組織のデータのみ表示

---

**重要**: 本番移行前に必ずバックアップを取得し、ステージング環境でテストを実施してください。