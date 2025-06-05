# 活動記録・ログ管理機能

## 概要

活動記録・ログ管理機能は、システム内のあらゆる活動や操作を記録・追跡・分析するための汎用的な機能モジュールです。ユーザーの操作履歴、システムイベント、業務活動の記録を一元管理し、監査証跡の確保とデータ分析を可能にします。

<!-- 例：ユーザーのログイン履歴、データ変更履歴、API呼び出しログ、業務活動記録など -->

## 主要機能

### 1. 操作履歴記録
- ユーザー操作の自動記録
- CRUD操作の詳細ログ
- セッション情報の保存
- 操作前後のデータ差分記録

<!-- 例：「田中太郎が2024/01/15 14:30に顧客情報を更新」「山田花子が注文#12345を承認」 -->

### 2. 活動ログ管理
- 業務活動の記録と分類
- カスタムイベントの定義
- タグとカテゴリによる整理
- 添付ファイル・画像の保存

<!-- 例：営業活動記録、カスタマーサポート対応履歴、作業日報、点検記録など -->

### 3. 監査証跡
- 改ざん防止機能
- タイムスタンプ認証
- 電子署名対応
- 法的要件への準拠

<!-- 例：金融取引記録、医療行為記録、品質管理記録など、法的に保存が必要な記録 -->

### 4. 検索とレポート
- 高度な検索フィルター
- 期間指定検索
- ユーザー・操作種別での絞り込み
- レポート自動生成

<!-- 例：「先月の全ての削除操作」「特定ユーザーの1年間の活動履歴」など -->

## UI/UX要件

### ログビューアー
- タイムライン形式での表示
- リアルタイム更新
- フィルタリング機能
- 詳細情報の展開表示

<!-- 例：最新の活動が上部に表示され、1秒ごとに自動更新される -->

### 検索インターフェース
- 自然言語検索対応
- 保存済み検索条件
- 検索履歴
- エクスポート機能

### ダッシュボード
- 活動サマリー表示
- 異常検知アラート
- トレンド分析グラフ
- KPIモニタリング

<!-- 例：「本日のログイン数：1,234」「エラー発生率：0.3%」「最もアクティブなユーザー」 -->

### モバイル対応
- レスポンシブデザイン
- オフライン時の一時保存
- 簡易入力フォーム
- 音声入力対応

## データ仕様

### 活動ログテーブル
```sql
-- activity_logs: 活動ログマスター
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    log_type VARCHAR(50) NOT NULL,       -- ログタイプ（system, user, business, audit）
    action VARCHAR(100) NOT NULL,        -- アクション名（login, update, delete, custom）
    entity_type VARCHAR(100),            -- 対象エンティティ種別
    entity_id VARCHAR(255),              -- 対象エンティティID
    user_id UUID,                        -- 実行ユーザーID
    session_id VARCHAR(255),             -- セッションID
    ip_address INET,                     -- IPアドレス
    user_agent TEXT,                     -- ユーザーエージェント
    timestamp TIMESTAMP NOT NULL,        -- 発生日時
    duration_ms INT,                     -- 処理時間（ミリ秒）
    status VARCHAR(20),                  -- ステータス（success, failed, warning）
    error_message TEXT,                  -- エラーメッセージ
    created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- 例：ユーザーログイン、データ更新、API呼び出し、バッチ処理実行など
```

### 詳細データテーブル
```sql
-- activity_log_details: ログ詳細データ
CREATE TABLE activity_log_details (
    id UUID PRIMARY KEY,
    activity_log_id UUID REFERENCES activity_logs(id),
    field_name VARCHAR(255),             -- フィールド名
    old_value TEXT,                      -- 変更前の値
    new_value TEXT,                      -- 変更後の値
    data_type VARCHAR(50),               -- データ型
    metadata JSONB,                      -- その他のメタデータ
    created_at TIMESTAMP DEFAULT NOW()
);

-- 例：「price: 1000 → 1200」「status: pending → approved」など
```

### カスタムイベントテーブル
```sql
-- custom_events: カスタムイベント定義
CREATE TABLE custom_events (
    id UUID PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,    -- イベント名
    category VARCHAR(100),               -- カテゴリ
    description TEXT,                    -- 説明
    schema JSONB,                        -- データスキーマ定義
    retention_days INT DEFAULT 365,      -- 保存期間（日数）
    is_active BOOLEAN DEFAULT true,      -- 有効フラグ
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 例：「顧客訪問記録」「機器点検実施」「在庫棚卸し」などの業務固有イベント
```

### 監査ログテーブル
```sql
-- audit_trails: 監査証跡
CREATE TABLE audit_trails (
    id UUID PRIMARY KEY,
    activity_log_id UUID REFERENCES activity_logs(id),
    hash_value VARCHAR(64) NOT NULL,     -- ハッシュ値（SHA-256）
    previous_hash VARCHAR(64),           -- 前のレコードのハッシュ値
    signature TEXT,                      -- 電子署名
    timestamp_token TEXT,                -- タイムスタンプトークン
    is_verified BOOLEAN DEFAULT false,   -- 検証済みフラグ
    created_at TIMESTAMP DEFAULT NOW()
);

-- 例：ブロックチェーン的な連鎖構造で改ざん防止
```

### API仕様

```typescript
// 活動ログ記録
POST /api/activity-logs
{
  "action": "update_customer",
  "entityType": "customer",
  "entityId": "cust_12345",
  "details": {
    "fields": [
      {
        "name": "email",
        "oldValue": "old@example.com",
        "newValue": "new@example.com"
      }
    ]
  },
  "metadata": {
    "source": "web_app",
    "version": "1.2.3"
  }
}

// ログ検索
GET /api/activity-logs/search
{
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "userId": "user_123",
    "action": ["login", "logout"],
    "status": "success"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  },
  "sort": {
    "field": "timestamp",
    "order": "desc"
  }
}

// カスタムイベント記録
POST /api/custom-events/record
{
  "eventName": "equipment_inspection",
  "data": {
    "equipmentId": "eq_789",
    "inspectorId": "user_456",
    "result": "passed",
    "notes": "定期点検実施、異常なし",
    "photos": ["photo_url_1", "photo_url_2"]
  }
}
```

## 設定項目

### ログ設定
- ログレベル設定（DEBUG, INFO, WARN, ERROR）
- 保存期間設定
- 自動アーカイブ設定
- ログローテーション設定

<!-- 例：本番環境ではINFO以上、開発環境ではDEBUG以上を記録 -->

### プライバシー設定
- 個人情報のマスキング
- センシティブデータの除外
- アクセス権限設定
- データ匿名化ルール

<!-- 例：クレジットカード番号は下4桁のみ表示、パスワードは記録しない -->

### 通知設定
- 異常検知アラート
- しきい値設定
- 通知先設定
- エスカレーションルール

<!-- 例：5分間に10回以上のログイン失敗で管理者に通知 -->

## 分析機能

### リアルタイム分析
- アクセス統計
- エラー率モニタリング
- パフォーマンス分析
- 異常パターン検知

### レポート生成
- 定期レポート自動生成
- カスタムレポート作成
- グラフ・チャート表示
- CSV/PDF出力

<!-- 例：月次セキュリティレポート、週次パフォーマンスレポート -->

### 予測分析
- トレンド予測
- 異常予測
- キャパシティプランニング
- ユーザー行動分析

## 連携機能

### SIEM連携
- セキュリティ情報の共有
- インシデント対応
- 脅威インテリジェンス
- 相関分析

<!-- 例：Splunk、Elasticsearch、QRadar等との連携 -->

### 外部ストレージ
- クラウドストレージ連携
- アーカイブ自動化
- バックアップ設定
- データレプリケーション

### API連携
- Webhook通知
- ストリーミングAPI
- バッチエクスポート
- リアルタイムフィード

## パフォーマンス要件

- 10,000件/秒のログ書き込み性能
- 1秒以内の検索レスポンス
- 99.99%のデータ完全性
- 5年以上のデータ保持

## セキュリティ要件

- ログの改ざん防止
- アクセス制御（ロールベース）
- 暗号化（保存時・転送時）
- 定期的な整合性チェック
- 法令準拠（GDPR、個人情報保護法等）