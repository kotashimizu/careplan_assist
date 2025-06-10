# Supabaseローカル環境セットアップガイド

## 概要
このガイドでは、CareCheck AssistのローカルSupabase環境でスーパー管理者を含むテスト環境をセットアップする手順を説明します。

## 前提条件
- Docker Desktopがインストールされ、起動していること
- Supabase CLIがインストールされていること
- プロジェクトで`supabase start`が実行され、ローカル環境が起動していること

## セットアップ手順

### 1. Supabase Studioにアクセス
```bash
# ブラウザで以下のURLを開く
http://127.0.0.1:54323
```

### 2. 基本テーブルの作成
1. **SQL Editor**タブを開く
2. `database/00_complete_setup.sql`の内容をコピー
3. SQL Editorに貼り付けて実行（Runボタンをクリック）
4. 「セットアップ完了」のメッセージが表示されることを確認

### 3. テストユーザーの作成
1. **Authentication** → **Users**タブに移動
2. **Add user** → **Create new user**をクリック
3. 以下のユーザーを順番に作成：

#### スーパー管理者
- Email: `super@carecheck.com`
- Password: `super123456`

#### デモ管理者
- Email: `admin@carecheck.com`
- Password: `admin123456`

#### デモスタッフ
- Email: `staff@carecheck.com`
- Password: `staff123456`

### 4. ユーザーロールの設定
1. **SQL Editor**タブに戻る
2. `database/05_create_test_users.sql`の内容をコピー
3. SQL Editorに貼り付けて実行
4. 各ユーザーのロール設定完了メッセージを確認

### 5. 環境変数の設定
`.env.local`ファイルに以下を設定：
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 6. アプリケーションの起動
```bash
npm run dev
```

## 動作確認

### スーパー管理者でログイン
1. http://localhost:5173 にアクセス
2. Email: `super@carecheck.com`、Password: `super123456`でログイン
3. ナビゲーションに「システム管理」が表示されることを確認
4. 「システム管理」をクリックしてスーパー管理者ダッシュボードにアクセス

### 機能確認
- 全事業所の一覧表示
- システム統計情報の表示
- 事業所の検索・フィルター機能

## トラブルシューティング

### ログインできない場合
1. Supabase Studioでユーザーが作成されているか確認
2. SQL Editorで以下を実行して設定を確認：
```sql
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users;
```

### 「システム管理」が表示されない場合
1. staffテーブルでロールが正しく設定されているか確認：
```sql
SELECT * FROM public.staff WHERE email = 'super@carecheck.com';
```

### Dockerエラーの場合
```bash
# 全てのコンテナを停止
supabase stop

# プロジェクトIDを指定して停止
supabase stop --project-id <project-id>

# 再起動
supabase start
```

## 本番環境への移行
本番環境では、Supabaseダッシュボードから同様の手順でセットアップを行います。
セキュリティのため、本番環境では強力なパスワードを使用してください。