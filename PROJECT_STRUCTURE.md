# プロジェクト構造

## ディレクトリ構成

```
ai-driven-dev-template/
├── src/                      # ソースコード
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reactコンポーネント
│   ├── lib/                  # ライブラリ・ユーティリティ
│   ├── config/              # 設定ファイル
│   └── utils/               # ヘルパー関数
├── public/                   # 静的ファイル
├── docs/                     # ドキュメント
│   ├── 00-welcome/          # 初心者向け導入
│   ├── 01-getting-started/  # 環境構築・開始方法
│   ├── 02-development/      # 開発ガイド
│   ├── 03-security/         # セキュリティ
│   ├── 04-deployment/       # デプロイ・本番環境
│   ├── 05-troubleshooting/  # トラブルシューティング
│   ├── 06-business/         # ビジネス・企画（サンプル）
│   ├── 07-technical/        # 技術仕様（サンプル）
│   ├── ai-instructions/     # AI向け詳細指示
│   ├── configuration/       # 設定関連ドキュメント
│   ├── archive/             # アーカイブされた提案
│   └── examples/            # 実装例・サンプル
├── scripts/                  # ユーティリティスクリプト
├── tests/                    # テストファイル
└── secure-toolkit/          # セキュリティツールキット（別パッケージ）

## 重要なファイル

### 設定ファイル
- `.env.example` - 環境変数のテンプレート
- `.mise.toml` - mise開発環境設定
- `docker-compose.yml` - Docker設定
- `playwright.config.ts` - E2Eテスト設定
- `tsconfig.json` - TypeScript設定
- `tailwind.config.ts` - Tailwind CSS設定

### AI関連ファイル
- `CLAUDE.md` - AI開発の基本ルール
- `.ai-guide.md.example` - プロジェクト固有のAIガイドライン（テンプレート）
- `AI_RULES.md.example` - 詳細な開発ルール（テンプレート）
- `permissions.deny` - AI操作制限ファイル

### ドキュメント
- `README.md` - プロジェクトの概要
- `START_HERE.md` - クイックスタートガイド
- `DEVELOPMENT_SCHEDULE.md` - 開発スケジュール管理
- `NAVIGATION.md` - ドキュメントナビゲーション
- `PROJECT_STRUCTURE.md` - このファイル

### その他
- `.vscode/mcp.json` - VS Code MCP設定
- `LIBRARY_INTEGRATION_GUIDE.md` - ライブラリ統合ガイド

## 命名規則

### ファイル名
- コンポーネント: `PascalCase.tsx` (例: UserProfile.tsx)
- その他: `kebab-case.ts` (例: user-utils.ts)
- ドキュメント: `日本語可.md` または `UPPERCASE.md`

### ディレクトリ名
- 基本: `kebab-case` (例: user-profile)
- docsフォルダ: 英語名を使用 (例: 01-getting-started)

## 開発の流れ

1. **環境構築**
   - mise, Docker, GitHub, Vercelの設定
   - 環境変数の設定

2. **開発**
   - srcフォルダ内でコード作成
   - DEVELOPMENT_SCHEDULE.mdで進捗管理

3. **テスト**
   - Playwrightでのテスト
   - 型チェック・リント

4. **デプロイ**
   - Vercelへの自動デプロイ
   - 本番環境チェックリスト確認