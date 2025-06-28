# AI駆動開発プロジェクトテンプレート

> 🚀 **初めての方**: [START_HERE.md](START_HERE.md) から始めてください！

## 🚀 はじめに
このテンプレートは、AIエディター（Claude、Cursor、Windsurf等）を使った効率的なアプリケーション開発をサポートします。

## 📁 使い方

### 🔄 GitHubからクローンした場合

#### 🚀 mise を使った方法（推奨）
```bash
# 1. リポジトリをクローン
git clone https://github.com/your-username/your-project.git
cd your-project

# 2. mise をインストール（初回のみ）
# Mac: brew install mise
# Linux/WSL: curl https://mise.run | sh

# 3. 開発環境セットアップ（これだけ！）
mise run setup

# 4. 開発サーバー起動
mise run dev
```

#### 📦 従来の方法（npm）
```bash
# 1. リポジトリをクローン
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

### 📋 初回セットアップ後のAI指示例
```
このプロジェクトテンプレートを使って「[作りたいアプリ]」を開発します。
Next.js + Supabase + Vercel構成で、すぐに開発を始められます。
まずは基本的な画面から作成してください。
```

### 📂 従来の方法（フォルダコピー）
1. このテンプレートをコピー
2. AIエディターで開く
3. 上記のAI指示例を実行

## 🎯 対象ユーザー
- プログラミング初心者
- AI駆動開発を始めたい方
- 効率的に開発を進めたい方

## 📚 詳細ガイド
- [環境構築ガイド](docs/01-はじめての方へ/ENVIRONMENT_SETUP.md) 🌟 統合版！
- [プロジェクトの始め方](START_HERE.md)
- [開発ガイド](docs/02-開発ガイド/)

## 🔐 セキュリティ機能
- [セキュリティガイド](docs/03-セキュリティ/) - 段階的なセキュリティ実装
- [Supabase統合セキュリティ](SUPABASE_WINDSURF_SECURITY_SETUP.md) 🆕

## 💬 質問・相談大歓迎！

プログラミングが初めての方も安心してください。
- どんな小さな疑問でもOK
- 「こんなこと聞いていいの？」と思うことほど大切
- あなたの質問がこのシステムをより良くします

**よくある質問：**
- 「GitHubって何？」
- 「エラーが怖い...」
- 「どこから始めればいい？」

→ 全部、AIが優しく教えてくれます！
