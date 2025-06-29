# 個別支援計画書作成支援システム

AIを活用した個別支援計画書の作成を支援するWebアプリケーションです。

## 🎯 主な機能

- **AIによる文章分析**: 利用者のアセスメント情報を自動分析
- **テンプレート選択**: 厚労省標準様式を含む複数のテンプレート対応
- **プライバシー重視**: ローカルストレージでのデータ管理
- **データ管理**: 作成した計画書の一覧・編集・削除機能
- **エクスポート機能**: PDF・Excel形式でのダウンロード対応

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- npm または yarn
- Google AI Studio APIキー（オプション）

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/kotashimizu/careplan_assist.git
cd careplan_assist

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localファイルを編集してAPIキーを設定
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてアクセスしてください。

## 📁 プロジェクト構造

```
careplan_assist/
├── app/                      # Next.js App Router
│   ├── support-plan/        # 支援計画書作成ページ
│   │   ├── page.tsx        # メイン作成画面
│   │   ├── list/          # 一覧画面
│   │   └── edit/[id]/     # 編集画面
│   └── layout.tsx          # 共通レイアウト
├── support-plan-module/     # 支援計画書コアモジュール
│   ├── src/
│   │   ├── core/          # コアビジネスロジック
│   │   ├── adapters/      # AI・ストレージアダプター
│   │   └── templates/     # 計画書テンプレート
│   └── README.md
├── docs/                    # ドキュメント
└── public/                  # 静的ファイル
```

## 🔧 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI統合**: Google Generative AI (Gemini)
- **データ管理**: ローカルストレージ（プライバシーファースト）

## 📚 ドキュメント

詳細なドキュメントは `docs/` ディレクトリを参照してください：

- [開発ガイド](docs/02-development/README.md)
- [APIキー設定ガイド](docs/01-getting-started/06-APIキー設定ガイド.md)
- [トラブルシューティング](docs/05-troubleshooting/README.md)

## 🛡️ セキュリティとプライバシー

- すべてのデータはローカルに保存（クラウド送信なし）
- AI分析時のみAPIを使用（オプション）
- 個人情報の自動マスキング機能

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/kotashimizu/careplan_assist/issues)でお知らせください。