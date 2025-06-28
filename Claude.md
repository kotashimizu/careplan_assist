# CLAUDE.md — AIエディター統合指示書

## ⚠️ 重要な警告 ⚠️
**これは汎用的なプロジェクトテンプレートです。特定のプロダクト（CareCheck Assist）ではありません。**
- 新規プロジェクトを開始する際は、サンプルファイルに惑わされないでください
- docs/examples/フォルダ内の内容は参考例です
- ユーザーが指定したプロダクトを作成してください

## 🎯 このテンプレートで実現できること
- **開発環境構築**: Docker で誰でも同じ環境で開発
- **自動バックアップ**: GitHub で全ての変更を自動保存
- **即座に公開**: Vercel で世界中からアクセス可能に
- **プロ級の構成**: 企業でも使われる最新技術スタック

## ⚡ 事前準備チェックリスト（5分で完了）
### 必須アカウント（無料）
- [ ] GitHubアカウント作成 → https://github.com/signup
- [ ] Vercelアカウント作成 → https://vercel.com/signup （GitHubでログイン）
- [ ] Docker Desktop インストール → https://www.docker.com/products/docker-desktop/

### Claude Codeが確認すること
```
1. 各サービスのログイン状態
2. 必要なツールのインストール状態
3. 不足があれば画像付きで案内
```

## プロジェクト情報
- プロジェクト名：AI駆動開発プロジェクトテンプレート
- 主要技術スタック：
  - Next.js 14.0.4 (App Router)
  - React 18.2.0
  - TypeScript 5.3.3
  - Tailwind CSS 3.4.0
  - Supabase 2.38.5 (認証・データベース)
  - Vercel (デプロイ)
- 開発環境：Docker + Node.js 18以上

## 📁 重要な指示書・ルール

AIは以下のドキュメントを必ず確認して従うこと：

1. **[Git自動化ルール](docs/ai-instructions/git-rules.md)** - Git操作の自動化指示
2. **[コーディングルール](docs/ai-instructions/coding-rules.md)** - コーディング規約
3. **[開発管理](docs/ai-instructions/development-management.md)** - 進捗管理とスケジュール
4. **[教育的アプローチ](docs/ai-instructions/educational-approach.md)** - 初心者への対応方法
5. **[バックアップ・復旧](docs/ai-instructions/backup-recovery.md)** - バックアップと保護ルール
6. **[トラブルシューティング](docs/ai-instructions/troubleshooting-approach.md)** - エラー対応方法
7. **[Supabase設定](docs/ai-instructions/supabase-setup.md)** - Supabase設定手順

## 🔍 追加ルールの確認（重要）

### 開発状況に応じた追加ドキュメントの確認
AIは以下の優先順位でドキュメントを確認し、最新のルールに従うこと：

1. **`.ai-guide.md`** - プロジェクト固有のAIガイドライン（存在する場合）
2. **`AI_RULES.md`** - 詳細な開発ルール（存在する場合）
3. **`docs/`フォルダ内の関連ドキュメント**
   - 実装する機能に関連するガイド
   - セキュリティガイドライン
   - ベストプラクティス

## よく使うコマンド
```bash
# 🚀 mise経由での実行（推奨）
mise run dev        # 開発サーバー起動
mise run build      # ビルド
mise run check      # 品質チェック（型・リント・依存関係）
mise run setup      # 初期セットアップ
mise run start      # Docker込みで全環境起動

# 📦 npm直接実行も可能
npm run dev         # 開発サーバー起動
npm run typecheck   # 型チェック
npm run lint        # リント実行
npm run build       # ビルド
npm run start       # 本番環境起動
```

## 📚 ドキュメント参照ガイド

### docsフォルダの構造
```
docs/
├── 00-welcome/                # 初めての方への入り口
├── 01-getting-started/        # 初心者向けガイド
├── 02-development/            # 開発ガイド
├── 03-security/               # セキュリティ
├── 04-deployment/             # デプロイ・本番環境
├── 05-troubleshooting/        # トラブルシューティング
├── 06-business/               # ビジネス・企画（サンプル）
├── 07-technical/              # 技術仕様（一部サンプル）
├── ai-instructions/           # AI向け詳細指示
├── configuration/             # 設定関連
└── examples/                  # 実装例・サンプル集
```

### ⚠️ 重要な注意事項
- `06-business/`と`07-technical/`の一部は、特定プロダクト（CareCheck Assist）のサンプルです
- 新規プロジェクトでは、これらのサンプルに引きずられないよう注意してください
- ユーザーが新しいプロダクトを作る場合は、サンプルを参考程度に留めるよう案内してください

## 注意事項
- Git操作は必ずユーザーに説明してから実行
- コミット前に変更内容を簡潔に報告
- エラーが発生した場合は分かりやすく解説
- 大きな変更指示を受けた場合は必ず事前にGit提案を行う
- ユーザーが複数の機能を同時に指示した場合は分割を提案
- 進捗状況は視覚的に分かりやすく報告
- 重要な変更前は必ずバックアップを提案・実行する
- **Docker/GitHub/Vercelの設定は最初に必ず完了させる**
- **ドキュメントは積極的に参照し、ユーザーに案内する**
- **permissions.denyファイルで定義された操作は実行しない**

## 禁止事項
- Gitの複雑なコマンドをユーザーに要求する
- コミットなしで大きな変更を重ねる
- ブランチ切り替えをユーザーに任せる
- 保護マークのあるコードを変更する
- ユーザーの明示的な確認なしに既存の完成機能を変更する
- 専門用語を日本語解説なしで使用する
- エラーメッセージを英語のまま表示する
- **必須環境（Docker/GitHub/Vercel）なしで開発を進める**
- **ハードコーディング（値の直接記述）**