# APIキー設定ガイド

## 🎯 本番環境でのAPIキー設定（推奨）

### Vercel環境変数での設定

#### 1. Vercel Dashboardにアクセス
1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクトを選択
3. **Settings** タブをクリック
4. **Environment Variables** セクションを選択

#### 2. Gemini APIキーの追加
- **Name**: `VITE_GEMINI_API_KEY`
- **Value**: あなたのGoogle Gemini APIキー
- **Environments**: 
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

#### 3. 設定完了後
- **Redeploy** を実行して環境変数を反映
- アプリケーションでAI分析機能が自動的に利用可能になります

## 🔑 APIキー取得方法

### Google Gemini APIキーの取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. **Create API Key** をクリック
4. 生成されたAPIキーをコピー

### APIキーの利用制限設定（推奨）
Google Cloud Consoleで以下の制限を設定することを推奨：
- **IP制限**: Vercelのデプロイメント地域のみ許可
- **リファラー制限**: あなたのドメインのみ許可  
- **使用量制限**: 1日あたりのリクエスト数制限

## 💰 コストと責任

### APIキー所有者のメリット
✅ **完全なコスト管理**
- 使用量とコストを直接管理
- 予算上限の設定が可能
- 詳細な使用状況分析

✅ **セキュリティ管理**
- キーの無効化・再生成が可能
- 不正使用時の即座の対応
- アクセス制限の細かい設定

✅ **クライアント保護**
- クライアントは追加費用なし
- API障害時の責任は提供者側
- データ使用ポリシーの統一管理

### コスト目安（参考）
```
Gemini Pro API:
- 入力: $0.50 / 1M tokens
- 出力: $1.50 / 1M tokens

想定使用量（月間）:
- アセスメント分析: 50回
- 1回あたり: 約2,000 tokens
- 月間コスト: 約$3-5
```

## 🔧 環境別設定

### Production（本番環境）
```bash
VITE_GEMINI_API_KEY=actual_production_key
```
- 本番用のAPIキー
- 使用量制限あり
- 監視とアラート設定

### Preview（プレビュー環境）
```bash
VITE_GEMINI_API_KEY=staging_key
```
- テスト用のAPIキー
- 本番と同じ機能をテスト

### Development（開発環境）
```bash
VITE_GEMINI_API_KEY=development_key
```
- 開発用のAPIキー
- より緩い制限設定

## 🛡️ セキュリティベストプラクティス

### 1. APIキーの保護
- ✅ Vercel環境変数での管理
- ✅ GitHub等のパブリックリポジトリにコミットしない
- ✅ 定期的なキーローテーション

### 2. 使用量監視
- ✅ Google Cloud Consoleでの監視設定
- ✅ 異常な使用量のアラート
- ✅ 月間予算上限の設定

### 3. アクセス制限
- ✅ IP制限（Vercelのデプロイメント地域）
- ✅ リファラー制限（許可ドメインのみ）
- ✅ 時間制限（必要に応じて）

## 🚨 緊急時対応

### APIキー漏洩時
1. **即座にキーを無効化**
   - Google Cloud Consoleでキーを削除
   - 新しいキーを生成

2. **新しいキーで更新**
   - Vercel環境変数を更新
   - アプリケーションを再デプロイ

3. **影響調査**
   - 使用ログの確認
   - 不正使用の有無確認

### サービス障害時
1. **フォールバック機能**
   - キーワードベース分析に自動切り替え
   - ユーザーへの適切な通知

2. **復旧作業**
   - APIサービスの状況確認
   - 代替キーでの復旧

## 📞 サポート

### 技術サポート
- API障害: Google Cloud Support
- デプロイ問題: Vercel Support
- アプリケーション: 開発チーム

### 運用サポート
- 使用量管理: 管理者ダッシュボード
- コスト最適化: 月次レビュー
- セキュリティ監査: 四半期レビュー

---

**この設定により、クライアントは追加の設定なしでAI分析機能を利用でき、全ての技術的責任は提供者側で管理されます。**