# 📜 AI開発詳細ルール

## 🎯 このドキュメントの目的
Claude.mdと.ai-guide.mdに加えて、より詳細な実装ルールを定義します。

## 📊 実装の優先順位

### 1. 必須実装（P0）
- [ ] エラーハンドリング
- [ ] 入力値検証
- [ ] ローディング状態
- [ ] アクセシビリティ基本対応

### 2. 推奨実装（P1）
- [ ] キャッシュ処理
- [ ] 最適化処理
- [ ] アニメーション
- [ ] キーボードショートカット

### 3. 余裕があれば（P2）
- [ ] 高度なアニメーション
- [ ] オフライン対応
- [ ] PWA機能

## 🔨 実装パターン

### APIコール
```typescript
// 必ずこのパターンを使用
const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    setData(data);
  } catch (err) {
    setError(err.message);
    // ユーザーへの通知
  } finally {
    setLoading(false);
  }
};
```

### フォーム処理
```typescript
// バリデーション付きフォーム
const handleSubmit = async (formData) => {
  // 1. クライアントサイド検証
  const errors = validate(formData);
  if (errors.length > 0) return;
  
  // 2. 送信処理
  setSubmitting(true);
  try {
    await submitForm(formData);
    // 成功通知
  } catch (err) {
    // エラー通知
  } finally {
    setSubmitting(false);
  }
};
```

## 🧪 テスト実装ルール

### 必須テスト
1. **ハッピーパス**: 正常系の動作
2. **エラーケース**: 異常系の動作
3. **境界値**: 限界値での動作

### テストファイル命名
```
- ComponentName.test.tsx
- functionName.test.ts
- apiEndpoint.test.ts
```

## 📝 コメント規則

### 必須コメント
```typescript
/**
 * ユーザー認証を行う関数
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns 認証トークン
 * @throws AuthError - 認証失敗時
 */
```

### 複雑なロジックの説明
```typescript
// なぜこの処理が必要なのかを説明
// 例: iOS Safariでの特殊な挙動に対応するため
```

## 🚫 アンチパターン集

### 1. 無限ループの危険
```typescript
// ❌ 危険
useEffect(() => {
  setCount(count + 1);
}, [count]);

// ✅ 安全
useEffect(() => {
  const timer = setTimeout(() => {
    setCount(c => c + 1);
  }, 1000);
  return () => clearTimeout(timer);
}, []);
```

### 2. メモリリーク
```typescript
// ❌ 危険
useEffect(() => {
  window.addEventListener('resize', handler);
  // クリーンアップ忘れ
});

// ✅ 安全
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

## 🔄 状態管理ルール

### ローカル状態
- 1コンポーネント内: useState
- 親子間: props
- 2-3階層: Context API

### グローバル状態
- 認証情報: Context + localStorage
- アプリ設定: Context
- キャッシュ: 専用ライブラリ検討

## 🎨 スタイリングルール

### クラス命名
```css
/* BEM記法を推奨 */
.block__element--modifier

/* 例 */
.card__title--highlighted
.button--primary
.form__input--error
```

### レスポンシブ対応
```typescript
// モバイルファースト
<div className="w-full md:w-1/2 lg:w-1/3">
```

## 📱 プログレッシブエンハンスメント

### 基本方針
1. **コア機能**: JavaScriptなしでも動作
2. **拡張機能**: JavaScriptで強化
3. **装飾**: CSSで美しく

### 実装例
```html
<!-- フォームは基本的にサーバーサイドでも処理可能に -->
<form action="/api/submit" method="POST">
  <!-- JavaScript有効時は非同期処理 -->
</form>
```

## 🔐 セキュリティチェックリスト

### 実装時確認
- [ ] XSS対策（dangerouslySetInnerHTML不使用）
- [ ] CSRF対策（トークン実装）
- [ ] SQLインジェクション対策（プリペアドステートメント）
- [ ] 入力値検証（型、長さ、形式）
- [ ] 認証・認可の確認
- [ ] エラーメッセージの情報漏洩チェック

## 📈 パフォーマンスチェックリスト

### 実装時確認
- [ ] 画像の最適化（WebP、適切なサイズ）
- [ ] 遅延読み込み（画像、コンポーネント）
- [ ] バンドルサイズの確認
- [ ] 不要な再レンダリングの防止
- [ ] APIコールの最適化（バッチ処理、キャッシュ）

---

**更新履歴**
- 2024/XX/XX: 初版作成
- 2024/XX/XX: セキュリティセクション追加