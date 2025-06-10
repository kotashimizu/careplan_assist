# 👨‍💻 開発ガイド

開発を進めるための各種ガイドラインとベストプラクティスをまとめています。

## 📚 ドキュメント一覧

### 基本方針
- **[PROJECT_GUIDELINES.md](./PROJECT_GUIDELINES.md)**
  - プロジェクトの基本方針
  - 開発の進め方
  - チームでの作業方法

- **[AI_PROJECT_CONTEXT.md](./AI_PROJECT_CONTEXT.md)**
  - AIを使った開発の進め方
  - 効率的なAI活用法
  - よくある質問と対処法

### コーディング
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)**
  - コードの書き方ルール
  - 命名規則
  - ベストプラクティス

- **[ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md)**
  - エラー処理の実装方法
  - ユーザーへの表示方法
  - ログの取り方

### UI/UX
- **[UI_COMPONENTS_GUIDE.md](./UI_COMPONENTS_GUIDE.md)**
  - 利用可能なUIコンポーネント
  - 使い方とカスタマイズ
  - デザインガイドライン

### 高度な機能
- **[TENANT_CONFIG_GUIDE.md](./TENANT_CONFIG_GUIDE.md)**
  - マルチテナント対応
  - テナント別の設定管理
  - 権限管理

## 🎯 開発フロー

```
1. 要件確認 → PROJECT_GUIDELINES.md
2. AIと相談 → AI_PROJECT_CONTEXT.md
3. コーディング → CODING_STANDARDS.md
4. UI実装 → UI_COMPONENTS_GUIDE.md
5. エラー処理 → ERROR_HANDLING_GUIDE.md
6. テスト・デバッグ → ../05-troubleshooting/
```

## 💡 初心者の方へ

- まずは「PROJECT_GUIDELINES.md」で全体像を把握
- コードを書く前に「CODING_STANDARDS.md」を一読
- UIで迷ったら「UI_COMPONENTS_GUIDE.md」を参照

## 🔗 関連ドキュメント

- セキュリティ実装 → [セキュリティガイド](../03-security/)
- 本番環境への移行 → [デプロイガイド](../04-deployment/)
- 技術仕様の詳細 → [技術リファレンス](../07-technical-reference/)