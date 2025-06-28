# コーディングルール

## 命名規則
- ファイル名：kebab-case（例：user-profile.tsx）
- コンポーネント：PascalCase（例：UserProfile）
- 変数・関数：camelCase（例：getUserData）
- 型定義：PascalCase（例：UserData）

## ディレクトリ構造
- src/app/ - App Router用ページ
- src/components/ - 再利用可能コンポーネント
- src/lib/ - ユーティリティ・設定
- src/utils/ - ヘルパー関数
- src/config/ - 設定ファイル

## コメント規約
- JSDocを使用
- 複雑なロジックには日本語コメント
- **ただし、コメントは必要最小限に**

## ハードコーディングの禁止（最重要）

**絶対に値を直接コードに書かない**

### ❌ 禁止
```typescript
const apiUrl = "https://api.example.com";
const maxRetries = 3;
```

### ✅ 必須
```typescript
import { appConfig } from '@/config/app.config';
import { API } from '@/config/constants';
const apiUrl = appConfig.api.baseUrl;
const maxRetries = API.RETRY_COUNT;
```

## 設定ファイルの活用
1. **環境依存の値** → `.env.local` と `app.config.ts`
2. **定数** → `constants.ts`
3. **機能フラグ** → `app.config.ts` の `features`

## エラーハンドリング
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API呼び出しエラー:', error);
  // ユーザーに分かりやすいエラーメッセージを表示
  throw new Error('データの取得に失敗しました');
}
```

## 型安全性の確保
```typescript
// 型定義を必ず行う
interface User {
  id: string;
  name: string;
  email: string;
}

// APIレスポンスの型チェック
const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  const data: User = await response.json();
  return data;
};
```

## セキュリティ要件
- すべての入力値はサニタイズ必須
- XSS対策の徹底（dangerouslySetInnerHTMLは使用禁止）
- CSRFトークンの実装
- SQLインジェクション対策（プリペアドステートメント使用）