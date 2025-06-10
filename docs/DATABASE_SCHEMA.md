# データベース設計

## テーブル一覧

### 1. users
認証ユーザー情報を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | ユーザーID |
| email | text | UNIQUE NOT NULL | メールアドレス |
| name | text | NOT NULL | 氏名 |
| role | text | NOT NULL | 権限 (admin, staff, user) |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 2. care_users
利用者情報を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | 利用者ID |
| name | text | NOT NULL | 氏名 |
| kana_name | text | NOT NULL | かな氏名 |
| gender | text | NOT NULL | 性別 |
| birth_date | date | NOT NULL | 生年月日 |
| care_level | text | NOT NULL | 介護度 |
| address | text | | 住所 |
| phone | text | | 電話番号 |
| emergency_contact | text | | 緊急連絡先 |
| medical_history | text | | 既往症 |
| allergies | text | | アレルギー情報 |
| photo_url | text | | 顔写真URL |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 3. service_records
サービス記録を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | 記録ID |
| care_user_id | uuid | FOREIGN KEY | 利用者ID |
| service_date | date | NOT NULL | サービス提供日 |
| breakfast | text | | 朝食状況 |
| lunch | text | | 昼食状況 |
| dinner | text | | 夕食状況 |
| bath | text | | 入浴状況 |
| medication_morning | text | | 朝の服薬状況 |
| medication_noon | text | | 昼の服薬状況 |
| medication_evening | text | | 夕の服薬状況 |
| activity | text | | 活動・レクリエーション |
| transport_to | text | | 送迎（往路） |
| transport_from | text | | 送迎（復路） |
| temperature | numeric | | 体温 |
| blood_pressure_high | integer | | 血圧（上） |
| blood_pressure_low | integer | | 血圧（下） |
| pulse | integer | | 脈拍 |
| notes | text | | 備考・特記事項 |
| created_by | uuid | FOREIGN KEY | 記録者ID |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 4. assessments
アセスメント情報を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | アセスメントID |
| care_user_id | uuid | FOREIGN KEY | 利用者ID |
| assessment_date | date | NOT NULL | アセスメント日 |
| interview_text | text | | 面談テキスト |
| interview_audio_url | text | | 面談音声URL |
| assessment_content | jsonb | | アセスメント内容 |
| ai_analysis | jsonb | | AI分析結果 |
| created_by | uuid | FOREIGN KEY | 作成者ID |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 5. care_plans
個別支援計画を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | 計画ID |
| care_user_id | uuid | FOREIGN KEY | 利用者ID |
| assessment_id | uuid | FOREIGN KEY | アセスメントID |
| plan_date | date | NOT NULL | 計画作成日 |
| plan_period_start | date | NOT NULL | 計画期間開始日 |
| plan_period_end | date | NOT NULL | 計画期間終了日 |
| long_term_goals | jsonb | | 長期目標 |
| short_term_goals | jsonb | | 短期目標 |
| support_details | jsonb | | 具体的支援内容 |
| created_by | uuid | FOREIGN KEY | 作成者ID |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 6. monitoring_records
モニタリング記録を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | モニタリングID |
| care_plan_id | uuid | FOREIGN KEY | 計画ID |
| monitoring_date | date | NOT NULL | モニタリング日 |
| achievement_level | jsonb | | 目標達成度 |
| changes | jsonb | | 変更点 |
| report_content | text | | 報告内容 |
| created_by | uuid | FOREIGN KEY | 作成者ID |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 7. meeting_minutes
担当者会議議事録を管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | 議事録ID |
| care_user_id | uuid | FOREIGN KEY | 利用者ID |
| meeting_date | date | NOT NULL | 会議日 |
| attendees | jsonb | | 出席者 |
| meeting_audio_url | text | | 会議音声URL |
| minutes_text | text | | 議事録テキスト |
| decisions | jsonb | | 決定事項 |
| action_items | jsonb | | アクションアイテム |
| next_issues | jsonb | | 次回課題 |
| created_by | uuid | FOREIGN KEY | 作成者ID |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |

### 8. billing_data
請求データを管理するテーブル
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | uuid | PRIMARY KEY | 請求データID |
| billing_month | date | NOT NULL | 請求月 |
| care_user_id | uuid | FOREIGN KEY | 利用者ID |
| service_summary | jsonb | | サービス利用実績 |
| additional_items | jsonb | | 加算項目 |
| billing_amount | numeric | | 請求金額 |
| csv_export_date | timestamp | | CSVエクスポート日時 |
| export_status | text | | エクスポート状態 |
| created_by | uuid | FOREIGN KEY | 作成者ID |
| created_at | timestamp | NOT NULL DEFAULT now() | 作成日時 |
| updated_at | timestamp | | 更新日時 |
