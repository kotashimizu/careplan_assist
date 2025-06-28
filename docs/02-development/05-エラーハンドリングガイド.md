# エラーハンドリングガイド

## 概要
このドキュメントは、CareCheck Assistアプリケーションにおける統一的なエラーハンドリングの実装ガイドです。

## エラーハンドリングの原則

### 1. ユーザーフレンドリーなメッセージ
- 技術的なエラーメッセージをユーザーに直接表示しない
- 分かりやすい日本語でエラー内容を説明
- 可能な限り解決方法を提示

### 2. 一貫性のある処理
- `errorService`を使用した統一的なエラーハンドリング
- `console.error`の直接使用を避ける
- `alert()`の使用を禁止

### 3. 適切なログ記録
- すべてのエラーをログに記録
- 開発環境では詳細情報を出力
- 本番環境ではセキュリティに配慮

## 実装方法

### 基本的なエラーハンドリング

```typescript
import { errorService } from '@/services/errorService';

// ❌ 悪い例
try {
  await someAsyncOperation();
} catch (error) {
  console.error('エラーが発生しました:', error);
  alert('エラーが発生しました');
}

// ✅ 良い例
try {
  await someAsyncOperation();
} catch (error) {
  errorService.handleError(error, '操作名');
}
```

### 操作別のエラーハンドリング

```typescript
// ユーザー作成エラー
try {
  await createUser(userData);
} catch (error) {
  errorService.handleOperationError(error, 'USER_CREATE');
}

// API呼び出しエラー
try {
  const data = await fetchData();
} catch (error) {
  errorService.handleApiError(error, 'データ取得');
}

// フォーム送信エラー
try {
  await submitForm(formData);
} catch (error) {
  errorService.handleFormError(error, 'ユーザー登録フォーム');
}
```

### React Hooksでの使用

```typescript
import { useErrorHandler } from '@/services/errorService';

function MyComponent() {
  const { handleError, handleOperationError } = useErrorHandler();
  
  const handleSubmit = async () => {
    try {
      await saveData();
    } catch (error) {
      handleOperationError(error, 'USER_UPDATE');
    }
  };
}
```

### エラーラッピング

```typescript
// 非同期関数のラッピング
const safeFetchUsers = errorService.withApiErrorHandling(
  fetchUsers,
  'ユーザー一覧取得'
);

// 使用例
const users = await safeFetchUsers();
if (users) {
  // 成功時の処理
}
```

## エラーメッセージのカスタマイズ

### エラーコードの使用

```typescript
import { ErrorCode, getErrorMessage } from '@/constants/errorMessages';

// 特定のエラーメッセージを取得
const message = getErrorMessage(ErrorCode.AUTH_SESSION_EXPIRED);

// カスタムメッセージでフォールバック
const message = getErrorMessage(
  ErrorCode.DATA_NOT_FOUND,
  'ユーザーが見つかりません'
);
```

### 技術的メッセージの変換

```typescript
import { translateErrorMessage } from '@/constants/errorMessages';

// 技術的なエラーメッセージをユーザーフレンドリーに変換
const userMessage = translateErrorMessage('Failed to fetch');
// → "サーバーへの接続に失敗しました。インターネット接続を確認してください。"
```

## バリデーションエラー

```typescript
// フィールド別のバリデーションエラー
const fieldErrors = {
  email: 'メールアドレスの形式が正しくありません',
  password: 'パスワードは8文字以上必要です'
};

errorService.handleValidationError(fieldErrors, 'ログインフォーム');
```

## グローバルエラーハンドリング

グローバルエラーハンドラーは自動的に以下をキャッチします：
- 未処理の例外
- 未処理のPromiseリジェクション
- ネットワークエラー
- スクリプトエラー

```typescript
// 手動でグローバルエラーを報告
import { globalErrorHandler } from '@/services/globalErrorHandler';

globalErrorHandler.reportError(
  new Error('カスタムエラー'),
  {
    component: 'UserList',
    action: 'データ取得',
    userId: currentUser.id
  }
);
```

## エラー統計の確認（開発環境）

```typescript
// コンソールで実行
__globalErrorHandler.getErrorStats();

// エラー履歴の確認
__globalErrorHandler.getErrorHistory();
```

## ベストプラクティス

### DO ✅
- エラーハンドリングを最初から実装する
- ユーザーに適切なフィードバックを提供する
- エラーの文脈（コンテキスト）を記録する
- 可能な限りエラーから回復する方法を実装する

### DON'T ❌
- エラーを握りつぶさない（catch して何もしない）
- 技術的な詳細をユーザーに表示しない
- `console.error`を直接使用しない
- `alert()`でエラーを表示しない
- エラーメッセージに個人情報を含めない

## トラブルシューティング

### エラーが表示されない場合
1. NotificationProviderがアプリケーションをラップしているか確認
2. ErrorServiceInitializerが初期化されているか確認
3. エラーハンドラーの設定が正しいか確認

### エラーが二重に表示される場合
1. エラーハンドリングが複数の場所で実行されていないか確認
2. グローバルエラーハンドラーとローカルハンドリングの競合を確認

## 今後の改善予定
- [ ] エラーレポートの外部サービス連携（Sentry等）
- [ ] エラー発生時の自動リトライ機能
- [ ] オフライン時のエラーキューイング
- [ ] より詳細なエラー分析ダッシュボード