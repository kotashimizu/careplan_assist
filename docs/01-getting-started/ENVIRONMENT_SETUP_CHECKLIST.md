# 環境構築チェックリスト（非エンジニア向け）

## 🎯 このチェックリストの目的
環境構築でつまずかないよう、順番に確認すべき項目をまとめました。
チェックボックスを使って、一つずつ確認してください。

## ✅ 環境構築前の準備

### 必要なツールの確認
- [ ] Node.js がインストールされている（`node -v` で確認）
- [ ] npm がインストールされている（`npm -v` で確認）
- [ ] Git がインストールされている（`git --version` で確認）
- [ ] Supabase CLI がインストールされている（`supabase --version` で確認）

### プロジェクトの準備
- [ ] プロジェクトをクローンまたはダウンロード済み
- [ ] ターミナルでプロジェクトフォルダに移動済み
- [ ] `npm install` を実行済み

## 🔍 環境変数ファイルの確認

### 1. 現在の環境変数ファイルを確認
```bash
ls -la .env*
```

### 2. 不要なファイルを削除
- [ ] `.env.local` があれば削除（`rm .env.local`）
- [ ] `.env.development` があれば削除（`rm .env.development`）

### 3. 使用する環境を決める
どれか1つを選んでください：

#### 🏠 ローカル開発環境を使う場合
- [ ] `.env.example` を `.env` にコピー
  ```bash
  cp .env.example .env
  ```
- [ ] `.env` を編集して以下を設定：
  ```
  VITE_ENVIRONMENT=local
  VITE_USE_DEMO_MODE=true
  ```

#### 🌐 ステージング環境を使う場合
- [ ] `.env.staging` を `.env` にコピー
  ```bash
  cp .env.staging .env
  ```
- [ ] Supabaseの情報が正しいか確認

#### 🚀 本番環境を使う場合
- [ ] `.env.production` を `.env` にコピー
  ```bash
  cp .env.production .env
  ```
- [ ] 本番のSupabase情報を設定

## 🚀 アプリケーションの起動

### 1. 開発サーバーを起動
```bash
npm run dev
```

### 2. ブラウザで確認
- [ ] http://localhost:5173 にアクセスできる
- [ ] ログイン画面が表示される

## 🔍 環境設定の確認

### 1. 環境デバッグページで確認
- [ ] http://localhost:5173/#/env-debug にアクセス
- [ ] 以下を確認：
  - Environment が意図した環境になっている
  - Supabase URL が正しい
  - API Key が設定されている

### 2. テストログインページで確認
- [ ] http://localhost:5173/#/test-login にアクセス
- [ ] "Test Direct Authentication" ボタンをクリック
- [ ] 成功メッセージが表示される

## 🚨 よくある問題と解決方法

### "ページが表示されない" 場合
1. [ ] ターミナルでエラーが出ていないか確認
2. [ ] `npm install` をもう一度実行
3. [ ] `npm run dev` を再実行

### "環境変数が undefined" の場合
1. [ ] `.env` ファイルが存在するか確認
2. [ ] アプリを停止（Ctrl+C）して再起動
3. [ ] ブラウザを完全リロード（Ctrl+Shift+R）

### "ログインできない" 場合
1. [ ] 環境デバッグページで環境を確認
2. [ ] デモモードか本番モードか確認
3. [ ] 正しいメールアドレスとパスワードを使用

## 📝 環境別ログイン情報

### デモ環境（VITE_USE_DEMO_MODE=true）
```
管理者: admin@carecheck.com / admin123456
スタッフ: staff@carecheck.com / staff123456
```

### ステージング・本番環境
Supabase Dashboardで作成したユーザーでログイン

## 🆘 それでも解決しない場合

1. [ ] このチェックリストを最初からやり直す
2. [ ] `docs/SUPABASE_AUTH_TROUBLESHOOTING_GUIDE.md` を確認
3. [ ] ターミナルのエラーメッセージをコピーして相談

## 💡 プロのヒント

### キャッシュクリアの方法
ブラウザで問題が続く場合：
1. 開発者ツール（F12）を開く
2. Network タブで "Disable cache" にチェック
3. ページをリロード

### ログの見方
1. ブラウザの開発者ツール → Console タブ
2. エラーは赤色で表示される
3. `[Config Debug]` や `[Auth Debug]` で検索

このチェックリストを順番に確認すれば、環境構築の問題の95%は解決できます！