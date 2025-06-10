# 環境構成ガイド

## 🌍 環境一覧

### 1. 開発環境（Development）
- **タイプ**: ローカルSupabase
- **URL**: http://127.0.0.1:54321
- **環境変数**: `.env.local`
- **用途**: 個人開発、機能実装、単体テスト
- **起動方法**: `npm run dev`

### 2. ステージング環境（Staging）
- **プロジェクト名**: carecheck-staging
- **タイプ**: クラウドSupabase（MICRO）
- **URL**: https://ddqdjzlqclodiblnmrkn.supabase.co
- **環境変数**: `.env.staging`
- **用途**: 本番前の最終テスト、クライアント確認
- **起動方法**: `npm run dev -- --mode staging`

### 3. 本番環境（Production）
- **プロジェクト名**: care-check-assist
- **タイプ**: クラウドSupabase（NANO）
- **URL**: 本番URL（別途管理）
- **環境変数**: `.env.production`
- **用途**: 実際のクライアント利用
- **デプロイ**: Vercel経由

## 📋 環境の使い分け

| 作業内容 | 使用環境 |
|---------|---------|
| 新機能開発 | 開発環境 |
| バグ修正 | 開発環境 |
| 統合テスト | ステージング環境 |
| クライアントデモ | ステージング環境 |
| 本番リリース | 本番環境 |

## 🔄 開発フロー

```
開発環境 → ステージング環境 → 本番環境
(ローカル)   (クラウド)      (クラウド)
```

## ⚠️ 注意事項

1. **本番環境には直接変更を加えない**
2. **各環境のAPIキーを混同しない**
3. **本番データをローカルにコピーしない**
4. **環境変数ファイルはGitにコミットしない**

## 🚀 コマンド一覧

```bash
# ローカル開発環境
npm run dev

# ステージング環境でテスト
npm run dev -- --mode staging

# ステージング用ビルド
npm run build -- --mode staging

# ローカルSupabase起動
supabase start

# ローカルSupabase停止
supabase stop
```

更新日: 2025-06-10