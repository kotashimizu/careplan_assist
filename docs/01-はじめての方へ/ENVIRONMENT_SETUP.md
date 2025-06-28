# 🚀 環境構築完全ガイド

## 📋 このガイドについて
環境構築に関する情報を1箇所に統合しました。以前は複数のファイルに分散していた情報を、このファイルにまとめています。

## 🎯 対象者別ガイド

### 🌱 完全初心者の方
→ [セクション1: 基本環境構築](#基本環境構築)から始めてください

### 💻 プログラミング経験者の方
→ [セクション2: 開発環境構築](#開発環境構築)へ

### 🚀 すぐに始めたい方
→ [セクション3: クイックスタート](#クイックスタート)へ

---

## 🔧 基本環境構築

### 必要なもの（3つだけ！）

#### 1. Docker Desktop 🐳
**なぜ必要？** あなたのPCで安全に開発できる「魔法の箱」です

**インストール方法:**
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)にアクセス
2. お使いのOS（Windows/Mac）用をダウンロード
3. インストーラーを実行

**確認方法:**
```bash
docker --version
# Docker version 24.0.0 のように表示されればOK
```

#### 2. GitHub アカウント 🐙
**なぜ必要？** 作ったものを安全に保存する「クラウド金庫」です

**作成方法:**
1. [GitHub](https://github.com/signup)にアクセス
2. メールアドレスで登録（5分で完了）
3. 確認メールから認証

#### 3. Vercel アカウント ▲
**なぜ必要？** 作ったアプリを世界に公開する「展示場」です

**作成方法:**
1. [Vercel](https://vercel.com/signup)にアクセス
2. **GitHubアカウントでログイン**（重要！）
3. 自動的に連携完了

---

## 💻 開発環境構築

### Node.js のインストール

**Windows の場合:**
```powershell
# PowerShellを管理者として実行
winget install OpenJS.NodeJS.LTS
```

**Mac の場合:**
```bash
# Homebrewがない場合は先にインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsをインストール
brew install node
```

**確認:**
```bash
node --version  # v18.0.0 以上
npm --version   # 9.0.0 以上
```

### プロジェクトのセットアップ

```bash
# 1. プロジェクトをクローン
git clone https://github.com/your-username/your-project.git
cd your-project

# 2. 依存関係をインストール
npm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.localを編集してSupabase情報を追加

# 4. 開発サーバー起動
npm run dev
```

---

## ⚡ クイックスタート

### 30秒で環境構築（Docker使用）

```bash
# 1. プロジェクトフォルダで実行
docker-compose up -d

# 2. ブラウザでアクセス
# http://localhost:3000

# 完了！🎉
```

### トラブルシューティング

#### 「Permission denied」エラー
```bash
# Mac/Linuxの場合
sudo chmod +x setup.sh
./setup.sh

# Windowsの場合
# PowerShellを管理者として実行してください
```

#### 「Docker daemon is not running」エラー
→ Docker Desktopを起動してください（タスクバーの象のアイコン）

#### 「port 3000 is already in use」エラー
```bash
# 別のポートで起動
PORT=3001 npm run dev
```

---

## 📋 環境構築チェックリスト

### 必須項目
- [ ] Docker Desktop インストール済み
- [ ] GitHub アカウント作成済み
- [ ] Vercel アカウント作成済み（GitHub連携）
- [ ] Node.js 18以上インストール済み

### 推奨項目
- [ ] VS Code または Cursor インストール済み
- [ ] Git の基本設定完了
- [ ] npm の最新版に更新

### 確認コマンド
```bash
# すべての環境を一度に確認
npm run check-env

# 個別確認
docker --version
node --version
npm --version
git --version
```

---

## 🆘 困ったときは

### よくある質問

**Q: Dockerって本当に必要？**
A: はい！「動かない」問題を完全に防げます。最初だけ頑張って設定しましょう。

**Q: 無料で使える？**
A: すべて無料枠で十分です（Docker、GitHub、Vercel）

**Q: エラーが怖い...**
A: エラーメッセージをそのままAIに見せてください。必ず解決できます！

### サポート
- 公式ドキュメント: `docs/`フォルダ
- AIに質問: 「○○でエラーが出ました」
- 諦めない: 必ず動きます！

---

## 📝 補足情報

### APIキーの設定
Supabaseを使用する場合は、以下の情報が必要です：

1. [Supabase](https://supabase.com)でプロジェクト作成
2. Settings → API からキーを取得
3. `.env.local`に設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### セキュリティ注意事項
- `.env.local`は絶対にGitHubにアップロードしない
- サービスロールキーは本番環境のみで使用
- 定期的にキーをローテーション

---

*最終更新: 2025-06-28*
*このドキュメントは、以前の5つのファイルを統合したものです*