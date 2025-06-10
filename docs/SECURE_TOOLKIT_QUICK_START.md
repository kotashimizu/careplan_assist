# 🔐 Secure Toolkit クイックスタートガイド

## はじめに - セキュリティは怖くない！

「セキュリティ」と聞くと難しそう...と思うかもしれませんが、大丈夫です！
Secure Toolkitは、**セキュリティのことを全く知らなくても**使えるように設計されています。

### 🎯 このガイドで学べること
- 5分でセキュアなアプリを作る方法
- 医療機関レベルのセキュリティを簡単に実装
- よくあるセキュリティの落とし穴を自動で回避

> 💡 **もっと詳しく知りたい方は**: [SECURE_TOOLKIT_GUIDE.md](./SECURE_TOOLKIT_GUIDE.md) をご覧ください

---

## 📦 Secure Toolkitって何？

簡単に言うと、**アプリを安全にする魔法の箱**です！

### こんな機能が自動で使えます
- 🔑 **ログイン機能** - パスワードを安全に管理
- 🛡️ **データ保護** - 大切な情報を暗号化
- 📝 **操作記録** - 誰が何をしたか自動記録
- 🚨 **不正検知** - 怪しい動きを自動ブロック

---

## 🚀 5分で始める！

### ステップ1: インストール（1分）

```bash
# プロジェクトフォルダで実行
npm install ./secure-toolkit
```

> 💡 **コマンドって何？**: 黒い画面（ターミナル）にコピペして、Enterキーを押すだけ！

### ステップ2: 基本設定（2分）

```tsx
// App.tsx ファイルに追加
import { SecureProvider } from './secure-toolkit';

function App() {
  return (
    <SecureProvider config={{
      securityLevel: 'standard'  // まずは標準レベルから！
    }}>
      {/* ここにあなたのアプリ */}
      <div>
        <h1>私の安全なアプリ</h1>
      </div>
    </SecureProvider>
  );
}
```

### ステップ3: ログイン画面を追加（2分）

```tsx
// LoginPage.tsx を新規作成
import { LoginForm } from './secure-toolkit';

function LoginPage() {
  return (
    <div>
      <h1>ログイン</h1>
      <LoginForm 
        onSuccess={() => {
          alert('ログイン成功！');
        }}
      />
    </div>
  );
}
```

**これだけで完成！** 🎉

---

## 🎨 3つのセキュリティレベル

用途に合わせて選べます：

### 1. 🟢 Standard（標準）
**こんなアプリ向け**: ブログ、レシピアプリ、趣味のサイト
```tsx
securityLevel: 'standard'
```
- 基本的なログイン機能
- シンプルなデータ保護
- 使いやすさ重視

### 2. 🟡 High（高度）
**こんなアプリ向け**: ECサイト、会員制サービス、社内システム
```tsx
securityLevel: 'high'
```
- 2段階認証対応
- クレジットカード情報の保護
- 不正アクセス検知

### 3. 🔴 Maximum（最高）
**こんなアプリ向け**: 医療システム、金融サービス、機密情報を扱うアプリ
```tsx
securityLevel: 'maximum'
```
- 医療機関レベルのセキュリティ
- 完全なデータ暗号化
- 厳格なアクセス制御

---

## 💡 よく使う機能

### 1. ユーザー認証（ログイン）

```tsx
import { useAuth } from './secure-toolkit';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  // ログインしているかチェック
  if (!user) {
    return <div>ログインしてください</div>;
  }
  
  return (
    <div>
      <p>こんにちは、{user.email}さん！</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
```

### 2. データの暗号化（大切な情報を守る）

```tsx
import { useEncryption } from './secure-toolkit';

function SecretNote() {
  const { encrypt, decrypt } = useEncryption();
  const [secret, setSecret] = useState('');
  
  const saveSecret = async () => {
    // 自動的に暗号化して保存
    const encrypted = await encrypt(secret);
    localStorage.setItem('mySecret', encrypted);
    alert('安全に保存しました！');
  };
  
  return (
    <div>
      <textarea 
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="秘密のメモ"
      />
      <button onClick={saveSecret}>安全に保存</button>
    </div>
  );
}
```

### 3. アクセス制限（見せたい人だけに）

```tsx
import { ProtectedRoute } from './secure-toolkit';

function App() {
  return (
    <Routes>
      {/* 誰でも見れるページ */}
      <Route path="/" element={<HomePage />} />
      
      {/* ログインが必要なページ */}
      <Route path="/secret" element={
        <ProtectedRoute>
          <SecretPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

---

## 🆘 困ったときは

### エラーが出た！
```
エラー: Cannot find module './secure-toolkit'
```
**解決方法**: 
```bash
# もう一度インストール
npm install ./secure-toolkit
```

### ログインできない！
**チェックポイント**:
- メールアドレスは正しい？
- パスワードは8文字以上？
- Caps Lockはオフ？

### もっと詳しく知りたい！
- 📖 [詳細ガイド](./SECURE_TOOLKIT_GUIDE.md)
- 💬 [よくある質問](./SECURE_TOOLKIT_GUIDE.md#よくある質問)
- 🔧 [トラブルシューティング](./SECURE_TOOLKIT_GUIDE.md#トラブルシューティング)

---

## 🎯 次のステップ

基本的な使い方がわかったら：

1. **セキュリティレベルを選ぶ**
   - まずは `standard` から始めよう
   - 必要に応じて `high` や `maximum` へ

2. **必要な機能を追加**
   - 2段階認証を有効化
   - データマスキングを設定
   - 監査ログを確認

3. **本番環境へ**
   - [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) を確認
   - セキュリティ設定を最終チェック

---

## 📚 関連ドキュメント

- 🌟 [初心者向けガイド](./FOR_BEGINNERS.md) - プログラミング初心者の方へ
- 🔒 [セキュリティ実装ガイド](./SECURITY_IMPLEMENTATION.md) - 既存のセキュリティ設定
- 🚀 [本番環境チェックリスト](./PRODUCTION_CHECKLIST.md) - リリース前の確認事項
- 📖 [Secure Toolkit 詳細ガイド](./SECURE_TOOLKIT_GUIDE.md) - もっと詳しく知りたい方へ

---

## 💬 最後に

セキュリティは難しくありません！Secure Toolkitを使えば、誰でも安全なアプリを作れます。

**覚えておいてほしいこと**:
- 🎯 最初は `standard` レベルで十分
- 📚 わからないことは遠慮なく質問
- 🚀 一歩ずつ進めば必ずできる

頑張ってください！応援しています！ 🎉