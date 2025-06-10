# 🔬 技術リファレンス

プロジェクトの技術的な仕様と詳細情報をまとめています。

## 📚 ドキュメント一覧

### API仕様
- **[API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)**
  - APIエンドポイント一覧
  - リクエスト/レスポンス形式
  - 認証方法

### データベース
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
  - テーブル構造
  - リレーション
  - インデックス設計

### 技術要件
- **[TECHNICAL_REQUIREMENTS.md](./TECHNICAL_REQUIREMENTS.md)**
  - 使用技術スタック
  - システム要件
  - 依存関係

### プロジェクト総括
- **[FINAL_PROJECT_SUMMARY.md](./FINAL_PROJECT_SUMMARY.md)**
  - プロジェクトの全体像
  - 実装された機能
  - 今後の展望

## 🎯 用途別ガイド

### 開発者向け
```
1. TECHNICAL_REQUIREMENTS.md で技術スタック確認
2. DATABASE_SCHEMA.md でDB構造理解
3. API_SPECIFICATIONS.md でAPI仕様確認
```

### 設計者向け
```
1. DATABASE_SCHEMA.md でデータモデル確認
2. API_SPECIFICATIONS.md でインターフェース設計
3. TECHNICAL_REQUIREMENTS.md で制約確認
```

### プロジェクト管理者向け
```
1. FINAL_PROJECT_SUMMARY.md で全体像把握
2. TECHNICAL_REQUIREMENTS.md でリソース確認
```

## 💡 技術スタック概要

### フロントエンド
- **Next.js 14** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - スタイリング

### バックエンド
- **Supabase** - 認証・データベース
- **PostgreSQL** - リレーショナルDB
- **Row Level Security** - セキュリティ

### インフラ
- **Vercel** - ホスティング
- **GitHub** - バージョン管理
- **Docker** - 開発環境

## 📊 アーキテクチャ図

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│  Supabase   │────▶│ PostgreSQL  │
│  Frontend   │     │    API      │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
   [Vercel]            [Auth/RLS]           [Backup]
```

## ⚠️ 技術的な注意事項

- API利用時は必ず認証を実装
- データベース変更時はマイグレーション使用
- 本番環境では環境変数を適切に設定

## 🔗 関連ドキュメント

- 開発手順 → [開発ガイド](../02-development/)
- セキュリティ → [セキュリティガイド](../03-security/)
- トラブル対応 → [トラブルシューティング](../05-troubleshooting/)
- デプロイ → [デプロイガイド](../04-deployment/)