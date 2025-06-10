# XSS（クロスサイトスクリプティング）対策ガイド

## 概要
CareCheck AssistにおけるXSS対策の実装方法と使用ガイドです。医療・福祉データを扱うシステムとして、最高レベルのセキュリティを確保します。

## 現在の実装状況

### ✅ 実装済みの対策
1. **ReactのデフォルトXSS保護**
   - JSX内での自動エスケープ
   - dangerouslySetInnerHTMLの不使用

2. **Content Security Policy（CSP）**
   - vercel.jsonで包括的なCSPヘッダー設定
   - X-XSS-Protectionヘッダー有効

3. **基本的な入力検証**
   - authValidator.tsでのメールアドレス検証
   - パスワード長の検証

4. **サニタイザーの実装**
   - secure-toolkit内にサニタイザークラス実装
   - ただし、メインプロジェクトでの活用は限定的

### 🆕 新規実装（本ガイドで追加）
1. **統合XSS保護サービス** (`services/xssProtectionService.ts`)
2. **XSS保護カスタムフック** (`hooks/useXSSProtection.tsx`)
3. **セキュアフォームコンポーネント例** (`components/examples/SecureFormExample.tsx`)
4. **DOMPurifyライブラリの導入**

## XSS保護サービスの使い方

### 1. 基本的な使用方法

```typescript
import { xssProtection } from '@/services/xssProtectionService';

// HTMLエスケープ
const safeText = xssProtection.escapeHtml(userInput);

// URLサニタイズ
const safeUrl = xssProtection.sanitizeUrl(userUrl);

// メールアドレスのサニタイズ
const safeEmail = xssProtection.sanitizeEmail(userEmail);

// ファイル名のサニタイズ
const safeFileName = xssProtection.sanitizeFileName(fileName);
```

### 2. カスタムフックの使用

```typescript
import { useXSSProtection } from '@/hooks/useXSSProtection';

function MyComponent() {
  const [text, setText] = useState('');
  const { sanitizeInput, SafeText, createSafeChangeHandler } = useXSSProtection();

  return (
    <div>
      {/* 自動サニタイズ付き入力 */}
      <input 
        type="text" 
        value={text}
        onChange={createSafeChangeHandler(setText)}
      />
      
      {/* 安全なテキスト表示 */}
      <SafeText>{text}</SafeText>
    </div>
  );
}
```

### 3. フォームでの実装例

```typescript
function SecureForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const xss = useXSSProtection();
  const emailXss = useXSSProtection({ type: 'email' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // サニタイズされたデータ
    const safeData = {
      name: xss.sanitizeInput(formData.name),
      email: emailXss.sanitizeInput(formData.email),
      message: xss.sanitizeInput(formData.message),
      csrfToken: xss.csrfToken
    };
    
    // APIに送信
    submitForm(safeData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム要素 */}
    </form>
  );
}
```

## 実装ガイドライン

### 必須対策

1. **すべてのユーザー入力をサニタイズ**
   ```typescript
   // ❌ 悪い例
   <div>{userInput}</div>
   
   // ✅ 良い例
   <div>{xssProtection.escapeHtml(userInput)}</div>
   // または
   <SafeText>{userInput}</SafeText>
   ```

2. **URLは必ず検証**
   ```typescript
   // ❌ 悪い例
   <a href={userProvidedUrl}>Link</a>
   
   // ✅ 良い例
   <a href={xssProtection.sanitizeUrl(userProvidedUrl)}>Link</a>
   ```

3. **dangerouslySetInnerHTMLの使用禁止**
   ```typescript
   // ❌ 絶対に避ける
   <div dangerouslySetInnerHTML={{__html: userContent}} />
   
   // ✅ どうしても必要な場合
   const safeHtml = xssProtection.sanitizeHtml(userContent, {
     allowedTags: ['b', 'i', 'p', 'br']
   });
   <div dangerouslySetInnerHTML={{__html: safeHtml}} />
   ```

### 推奨事項

1. **入力タイプに応じたサニタイズ**
   ```typescript
   const { sanitizeInput } = useXSSProtection({ type: 'email' });
   const { sanitizeInput: sanitizeUrl } = useXSSProtection({ type: 'url' });
   ```

2. **XSS攻撃のログ記録**
   ```typescript
   const xss = useXSSProtection({ 
     logAttempts: true // 攻撃試行を自動ログ
   });
   ```

3. **CSRFトークンの使用**
   ```typescript
   const { csrfToken } = useXSSProtection();
   // フォーム送信時にトークンを含める
   ```

## チェックリスト

### 新規コンポーネント作成時
- [ ] ユーザー入力を受け取る箇所をすべて特定
- [ ] 適切なサニタイズ方法を選択
- [ ] useXSSProtectionフックを使用
- [ ] XSS攻撃パターンでテスト

### コードレビュー時
- [ ] dangerouslySetInnerHTMLが使われていないか
- [ ] すべてのユーザー入力がサニタイズされているか
- [ ] URLやメールアドレスが適切に検証されているか
- [ ] CSRFトークンが実装されているか

### デプロイ前
- [ ] CSPヘッダーが正しく設定されているか
- [ ] XSS保護のテストが実施されているか
- [ ] ログ記録が有効になっているか

## テスト方法

### 手動テスト用のXSSペイロード
```html
<!-- 基本的なスクリプトインジェクション -->
<script>alert('XSS')</script>

<!-- イベントハンドラー -->
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>

<!-- URLインジェクション -->
javascript:alert('XSS')

<!-- HTMLエンティティ -->
&lt;script&gt;alert('XSS')&lt;/script&gt;

<!-- Unicode エスケープ -->
\u003cscript\u003ealert('XSS')\u003c/script\u003e
```

### 自動テスト
```typescript
import { xssProtection } from '@/services/xssProtectionService';

describe('XSS Protection', () => {
  it('should sanitize script tags', () => {
    const malicious = '<script>alert("XSS")</script>';
    const safe = xssProtection.escapeHtml(malicious);
    expect(safe).not.toContain('<script>');
  });
  
  it('should detect XSS patterns', () => {
    const patterns = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)'
    ];
    
    patterns.forEach(pattern => {
      expect(xssProtection.detectXSSPattern(pattern)).toBe(true);
    });
  });
});
```

## トラブルシューティング

### 問題: テキストが二重エスケープされる
**原因**: Reactの自動エスケープとカスタムエスケープの重複
**解決**: SafeTextコンポーネントを使用するか、片方のエスケープのみ適用

### 問題: 改行が表示されない
**原因**: HTMLエスケープで改行文字も変換される
**解決**: SafeTextWithBreaksコンポーネントを使用

### 問題: URLが機能しない
**原因**: 過度なサニタイズ
**解決**: sanitizeUrl()を使用し、許可されたプロトコルのみ通過させる

## セキュリティベストプラクティス

1. **最小権限の原則**
   - 必要最小限のHTMLタグのみ許可
   - 不要な属性は削除

2. **多層防御**
   - クライアントサイドとサーバーサイドの両方で検証
   - CSPヘッダーとサニタイズの併用

3. **定期的な更新**
   - DOMPurifyライブラリの定期更新
   - 新しいXSSパターンへの対応

4. **監査とログ**
   - すべてのXSS攻撃試行をログ記録
   - 定期的なセキュリティ監査

## 今後の改善計画

1. **CSPの強化**
   - `unsafe-inline`と`unsafe-eval`の削除
   - nonceベースのCSPへの移行

2. **サーバーサイド検証**
   - APIレベルでの入力検証強化
   - Supabase RLSとの連携

3. **自動テストの拡充**
   - XSSペイロードのテストスイート
   - CIでの自動セキュリティテスト

4. **開発者教育**
   - XSS対策のワークショップ
   - セキュアコーディングガイドライン

---

このガイドは定期的に更新し、最新のセキュリティ脅威に対応してください。