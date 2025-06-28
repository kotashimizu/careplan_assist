# 🚀 mise による開発環境管理

## 📌 miseとは？

**mise**（ミーズ）は、開発環境を簡単に管理できるツールです。
- Node.jsのバージョン管理
- 環境変数の自動設定
- 開発タスクの一元管理
- Dockerとの連携

## 🎯 なぜmiseを使うの？

### 従来の問題
- 「私のPCでは動くのに...」問題
- Node.jsのバージョン違いでエラー
- 環境変数の設定忘れ
- 開発コマンドがバラバラ

### miseで解決
- **統一された環境**: 全員が同じNode.jsバージョン
- **自動セットアップ**: `mise install`だけ
- **便利なタスク**: `mise run dev`で開発開始

## 📦 インストール方法

### macOS
```bash
# Homebrewを使用
brew install mise

# または、インストーラーを使用
curl https://mise.run | sh
```

### Windows（WSL2）
```bash
# WSL2内で実行
curl https://mise.run | sh
```

### 初期設定
```bash
# PATHに追加（~/.zshrcまたは~/.bashrcに追記）
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc

# 動作確認
mise --version
```

## 🚀 使い方

### 1. プロジェクトのセットアップ
```bash
# プロジェクトディレクトリに移動
cd ai-driven-dev-template

# 必要なツールをインストール
mise install

# 初期セットアップを実行
mise run setup
```

### 2. 開発サーバーの起動
```bash
# 開発サーバーを起動
mise run dev

# または、Docker環境も含めて起動
mise run start
```

### 3. よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `mise install` | 必要なツールをインストール |
| `mise run setup` | 初期セットアップ |
| `mise run dev` | 開発サーバー起動 |
| `mise run build` | ビルド実行 |
| `mise run check` | コード品質チェック |
| `mise run clean` | キャッシュクリア |
| `mise tasks` | 利用可能なタスク一覧 |

## 🐳 Docker連携

### Docker Compose設定（オプション）
```bash
# docker-compose.ymlを作成（サンプルから）
cp docker-compose.yml.example docker-compose.yml

# Docker環境を起動
mise run docker-up

# Docker環境を停止
mise run docker-down
```

### 含まれるサービス
- **PostgreSQL**: データベース
- **Redis**: キャッシュ
- **MinIO**: ファイルストレージ（S3互換）
- **Mailhog**: メールテスト

## 📝 設定ファイル

### .mise.toml
プロジェクトのmise設定ファイルです。
- Node.jsバージョン
- 環境変数
- タスク定義

```toml
[tools]
node = "18.20.5"  # Node.js LTS

[env]
NODE_ENV = "development"
_.file = [".env.local"]  # 環境変数ファイル読み込み

[tasks.dev]
description = "開発サーバーを起動"
run = "npm run dev"
```

## 🔧 トラブルシューティング

### miseコマンドが見つからない
```bash
# PATHの設定を確認
echo $PATH | grep -q mise || echo "miseがPATHに含まれていません"

# 再度アクティベート
eval "$(mise activate zsh)"  # または bash
```

### Node.jsのバージョンが切り替わらない
```bash
# 現在のバージョンを確認
mise current

# 手動でインストール
mise install node@18.20.5

# 再度確認
node --version
```

### 環境変数が読み込まれない
```bash
# .env.localファイルの存在確認
ls -la .env.local

# 環境変数の確認
mise env
```

## 💡 便利な使い方

### 複数プロジェクトの管理
```bash
# プロジェクトA
cd ~/projects/project-a
mise install  # Node.js 18を使用

# プロジェクトB
cd ~/projects/project-b
mise install  # Node.js 20を使用

# 自動的に切り替わる！
```

### グローバルツールの管理
```bash
# グローバルにツールをインストール
mise use -g node@20

# プロジェクト固有の設定が優先される
cd ai-driven-dev-template
node --version  # 18.20.5
```

## 🎯 まとめ

miseを使うことで：
1. **環境構築が簡単**: `mise install`だけ
2. **バージョン管理**: Node.jsのバージョン統一
3. **タスク管理**: よく使うコマンドを登録
4. **Docker連携**: 開発環境の完全な再現

これで「動かない」問題とはお別れです！