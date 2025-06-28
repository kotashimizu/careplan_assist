# 🔬 技術リファレンス

## ⚠️ 重要：このフォルダについて

**このフォルダ内の一部ドキュメントは、介護施設向けSaaS（CareCheck Assist）の実装例を含んでいます。**

### あなたのプロジェクトでは：
1. **技術スタックは参考に**してください
2. **データベース設計は書き換え**が必要です
3. **プロジェクト総括は削除**してください

---

## 📚 ドキュメント構成

### 汎用的なドキュメント ✅
- **[API仕様書](./01-API仕様書.md)**
  - RESTful APIの設計パターン
  - 認証・認可の実装方法
  - エラーハンドリング

- **[技術要件書](./02-技術要件書.md)**
  - Next.js + Supabaseスタック
  - システム要件
  - 開発環境構成

### プロジェクト固有のサンプル ⚠️
- **[データベーススキーマ](./03-データベーススキーマ.md)** ⚠️ CareCheck Assist固有
  - 介護業界特有のテーブル構造
  - あなたの業界に合わせて再設計が必要

- **[プロジェクト総括](./04-プロジェクト総括.md)** ⚠️ 削除推奨
  - 特定プロジェクトの完了報告書
  - テンプレートには不要

## 🎯 あなたが作成すべき技術ドキュメント

### 1. データベース設計
```sql
-- あなたのプロダクト用のテーブル例
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT,
  price DECIMAL,
  -- あなたの業界に必要なカラム
);
```

### 2. API設計
```typescript
// あなたのAPI例
GET    /api/products     // 商品一覧
POST   /api/products     // 商品作成
GET    /api/products/:id // 商品詳細
PUT    /api/products/:id // 商品更新
DELETE /api/products/:id // 商品削除
```

### 3. システムアーキテクチャ
```
あなたのシステム
├── フロントエンド（Next.js）
├── バックエンド（Supabase）
├── データベース（PostgreSQL）
└── 外部サービス（決済、メール等）
```

## 💡 技術ドキュメント作成のヒント

### AIに依頼する例
```
「ECサイトのデータベーススキーマを設計してください」
「商品管理のAPI仕様を作成してください」
「決済システムの技術要件を整理してください」
```

### 必須項目
1. **データモデル**
   - エンティティの定義
   - リレーションシップ
   - 制約条件

2. **API仕様**
   - エンドポイント一覧
   - 認証方式
   - レート制限

3. **セキュリティ要件**
   - アクセス制御
   - データ暗号化
   - 監査ログ

## 🗑️ クリーンアップ推奨

```bash
# CareCheck Assist固有のファイルを削除
rm 04-プロジェクト総括.md

# データベーススキーマを再作成
mv 03-データベーススキーマ.md 03-データベーススキーマ.md.bak
touch 03-データベーススキーマ.md
```

## 📋 技術スタック（テンプレート標準）

### 確定している技術
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Database**: PostgreSQL
- **Hosting**: Vercel
- **Dev Tools**: mise, Docker

### あなたが選択する技術
- **State Management**: Context API / Zustand / Redux
- **UI Library**: Shadcn/ui / MUI / Chakra UI
- **Testing**: Jest / Vitest / Cypress
- **Payment**: Stripe / PayPal / etc.
- **Email**: SendGrid / AWS SES / etc.

---

**注意**: 現在のサンプルは特定業界向けの内容を含みます。あなたのプロジェクトに合わせて、データモデルやAPI設計を完全に見直してください。