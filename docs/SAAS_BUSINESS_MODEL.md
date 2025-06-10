# CareCheck Assist SaaSビジネスモデル設計書

## 概要
このドキュメントは、CareCheck AssistをB2B SaaSプラットフォームとして運用するために必要なビジネス管理機能の設計を定義します。

## データモデル設計

### 1. 契約プラン (subscription_plans)
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 例: "スタンダード", "プレミアム", "エンタープライズ"
  price_monthly INTEGER NOT NULL, -- 月額料金（円）
  price_yearly INTEGER, -- 年額料金（円）
  max_users INTEGER, -- 最大ユーザー数
  max_records INTEGER, -- 最大記録数/月
  features JSONB, -- 機能フラグ
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 顧客契約 (customer_subscriptions)
```sql
CREATE TABLE customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT NOT NULL, -- 'trial', 'active', 'suspended', 'cancelled'
  billing_cycle TEXT, -- 'monthly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  trial_end_date DATE,
  next_billing_date DATE,
  amount INTEGER NOT NULL, -- 請求額
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 支払い履歴 (payment_history)
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES customer_subscriptions(id),
  amount INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT, -- 'credit_card', 'bank_transfer', 'invoice'
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 使用状況統計 (usage_statistics)
```sql
CREATE TABLE usage_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  date DATE NOT NULL,
  active_users INTEGER,
  total_records INTEGER,
  storage_used_mb INTEGER,
  api_calls INTEGER,
  feature_usage JSONB, -- 機能別使用状況
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. サポートチケット (support_tickets)
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT, -- 'low', 'medium', 'high', 'urgent'
  status TEXT, -- 'open', 'in_progress', 'resolved', 'closed'
  assigned_to UUID,
  created_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 機能要件

### 1. 顧客管理ダッシュボード
- **顧客一覧**
  - 組織名、契約プラン、契約状況、月額料金
  - アクティブユーザー数、使用容量
  - 最終ログイン日時
  - 検索・フィルター機能

- **顧客詳細ページ**
  - 基本情報（組織名、連絡先、担当者）
  - 契約情報（プラン、開始日、更新日）
  - 支払い履歴
  - 使用状況グラフ
  - サポート履歴

### 2. 収益管理
- **収益ダッシュボード**
  - MRR（月間定期収益）
  - ARR（年間定期収益）
  - チャーンレート
  - 新規契約/解約推移
  - プラン別収益分析

- **請求管理**
  - 請求書一覧・発行
  - 支払い状況確認
  - 未払い通知
  - 自動請求設定

### 3. システム監視
- **使用状況モニタリング**
  - システム全体の負荷状況
  - API使用状況
  - ストレージ使用量
  - エラー発生状況

- **アラート設定**
  - 使用量上限アラート
  - 支払い遅延アラート
  - システムエラーアラート

### 4. 顧客サポート
- **サポートチケット管理**
  - チケット一覧・詳細
  - 優先度設定
  - 担当者アサイン
  - 対応履歴

- **FAQ・ドキュメント管理**
  - ヘルプドキュメント作成
  - よくある質問管理
  - アップデート通知

## 実装優先順位

### Phase 1: 基盤構築（1-2週間）
1. データベーステーブルの作成
2. 基本的なCRUD APIの実装
3. 認証・権限の拡張

### Phase 2: 顧客管理（1週間）
1. 顧客一覧画面
2. 顧客詳細画面
3. 契約管理機能

### Phase 3: 収益管理（1週間）
1. 収益ダッシュボード
2. 支払い履歴管理
3. 請求書機能

### Phase 4: 監視・分析（1週間）
1. 使用状況ダッシュボード
2. システムモニタリング
3. レポート生成

### Phase 5: サポート機能（1週間）
1. チケット管理システム
2. コミュニケーション機能
3. ドキュメント管理

## セキュリティ考慮事項

1. **データ分離**
   - 顧客データの完全な分離
   - マルチテナントアーキテクチャ

2. **アクセス制御**
   - スーパー管理者のみアクセス可能
   - 監査ログの記録

3. **データ保護**
   - 支払い情報の暗号化
   - PCI DSS準拠（将来的に）

## 技術スタック

- **フロントエンド**: React + TypeScript
- **バックエンド**: Supabase (PostgreSQL + RLS)
- **決済**: Stripe API（将来的に統合）
- **分析**: Chart.js / Recharts
- **通知**: SendGrid / Twilio

## KPI（重要業績評価指標）

1. **ビジネス指標**
   - MRR/ARR
   - 顧客獲得コスト（CAC）
   - 顧客生涯価値（LTV）
   - チャーンレート

2. **運用指標**
   - システム稼働率
   - 平均応答時間
   - サポート解決時間
   - 顧客満足度（CSAT）