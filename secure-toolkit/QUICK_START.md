# 🚀 Secure Toolkit クイックスタートガイド

## 📋 目次
1. [5分で始める](#5分で始める)
2. [基本的な実装](#基本的な実装)
3. [よくある実装パターン](#よくある実装パターン)
4. [トラブルシューティング](#トラブルシューティング)

---

## 5分で始める

### 1. インストール（30秒）

```bash
npm install @your-org/secure-toolkit
# または
yarn add @your-org/secure-toolkit
```

### 2. 基本セットアップ（2分）

```javascript
// App.js
import React from 'react';
import { SecureProvider } from '@your-org/secure-toolkit';

function App() {
  return (
    <SecureProvider>
      <YourApp />
    </SecureProvider>
  );
}

export default App;
```

### 3. 認証機能を追加（1分）

```javascript
// components/Header.js
import { useAuth } from '@your-org/secure-toolkit';

function Header() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>こんにちは、{user.name}さん</span>
          <button onClick={logout}>ログアウト</button>
        </>
      ) : (
        <button onClick={login}>ログイン</button>
      )}
    </header>
  );
}
```

### 4. 保護されたページを作成（1分）

```javascript
// pages/Dashboard.js
import { ProtectedRoute } from '@your-org/secure-toolkit';

function Dashboard() {
  return (
    <ProtectedRoute>
      <h1>ダッシュボード</h1>
      <p>ログインユーザーのみ表示されます</p>
    </ProtectedRoute>
  );
}
```

### 5. 実行して確認（30秒）

```bash
npm start
```

完了！🎉 基本的なセキュリティ機能が実装されました。

---

## 基本的な実装

### セットアップウィザードを使う

初回セットアップを簡単に行いたい場合：

```javascript
import { SetupWizard } from '@your-org/secure-toolkit';

function InitialSetup() {
  const [showWizard, setShowWizard] = useState(true);

  if (showWizard) {
    return (
      <SetupWizard
        onComplete={(config) => {
          console.log('設定完了:', config);
          setShowWizard(false);
          // 設定を保存
          localStorage.setItem('app-config', JSON.stringify(config));
        }}
      />
    );
  }

  return <YourApp />;
}
```

### 暗号化を使う

機密データを保護する：

```javascript
import { useEncryption } from '@your-org/secure-toolkit';

function SecretNotes() {
  const { encrypt, decrypt } = useEncryption();
  const [note, setNote] = useState('');

  const saveNote = async () => {
    const encrypted = await encrypt(note);
    localStorage.setItem('secret-note', encrypted);
  };

  const loadNote = async () => {
    const encrypted = localStorage.getItem('secret-note');
    if (encrypted) {
      const decrypted = await decrypt(encrypted);
      setNote(decrypted);
    }
  };

  return (
    <div>
      <textarea 
        value={note} 
        onChange={(e) => setNote(e.target.value)}
        placeholder="秘密のメモ"
      />
      <button onClick={saveNote}>保存（暗号化）</button>
      <button onClick={loadNote}>読み込み</button>
    </div>
  );
}
```

### 機能の有効/無効を制御

```javascript
import { useTenantConfig } from '@your-org/secure-toolkit';

function Features() {
  const { isFeatureEnabled } = useTenantConfig();

  return (
    <div>
      {isFeatureEnabled('chat') && <ChatWidget />}
      {isFeatureEnabled('videoCall') && <VideoCallButton />}
      {isFeatureEnabled('fileUpload') && <FileUploader />}
    </div>
  );
}
```

---

## よくある実装パターン

### パターン1: ブログサイト

```javascript
import { 
  SecureProvider, 
  useAuth, 
  ProtectedRoute,
  useEncryption 
} from '@your-org/secure-toolkit';

function BlogApp() {
  return (
    <SecureProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </SecureProvider>
  );
}

function AdminPanel() {
  const { encrypt } = useEncryption();

  const saveDraft = async (content) => {
    // 下書きを暗号化して保存
    const encrypted = await encrypt(content);
    await api.post('/drafts', { content: encrypted });
  };

  return <Editor onSave={saveDraft} />;
}
```

### パターン2: ECサイト

```javascript
import { 
  SecureProvider,
  useAuth,
  useTenantConfig,
  useAuditLog
} from '@your-org/secure-toolkit';

function EcommerceApp() {
  const { isFeatureEnabled } = useTenantConfig();
  const { logAction } = useAuditLog();

  const handlePurchase = async (items) => {
    // 購入アクションを記録
    await logAction({
      action: 'PURCHASE',
      details: { items, total: calculateTotal(items) }
    });

    // 決済処理
    if (isFeatureEnabled('stripPayment')) {
      await processStripePayment(items);
    } else {
      await processDefaultPayment(items);
    }
  };

  return (
    <SecureProvider>
      <ShoppingCart onCheckout={handlePurchase} />
    </SecureProvider>
  );
}
```

### パターン3: ゲームアプリ

```javascript
import { 
  SecureProvider,
  useAuth,
  useEncryption,
  SecurityBadge
} from '@your-org/secure-toolkit';

function GameApp() {
  const { user } = useAuth();
  const { encrypt, decrypt } = useEncryption();

  // セーブデータの暗号化（チート対策）
  const saveGame = async (gameState) => {
    const encrypted = await encrypt({
      ...gameState,
      checksum: calculateChecksum(gameState)
    });
    localStorage.setItem(`save-${user.id}`, encrypted);
  };

  const loadGame = async () => {
    const encrypted = localStorage.getItem(`save-${user.id}`);
    if (!encrypted) return null;

    const decrypted = await decrypt(encrypted);
    
    // チェックサム検証
    if (calculateChecksum(decrypted) !== decrypted.checksum) {
      alert('セーブデータが改ざんされています！');
      return null;
    }

    return decrypted;
  };

  return (
    <SecureProvider>
      <div className="game-container">
        <SecurityBadge /> {/* セキュリティレベル表示 */}
        <Game onSave={saveGame} onLoad={loadGame} />
      </div>
    </SecureProvider>
  );
}
```

---

## トラブルシューティング

### よくある問題と解決法

#### 1. "SecureProvider is not defined" エラー

```javascript
// ❌ 間違い
import SecureProvider from '@your-org/secure-toolkit';

// ✅ 正しい
import { SecureProvider } from '@your-org/secure-toolkit';
```

#### 2. ログイン状態が保持されない

```javascript
// SecureProviderに永続化設定を追加
<SecureProvider
  persistAuth={true}
  storageKey="my-app-auth"
>
  <App />
</SecureProvider>
```

#### 3. 暗号化でエラーが発生する

```javascript
// 暗号化前にデータを文字列化
const { encrypt } = useEncryption();

// ❌ オブジェクトを直接暗号化
const encrypted = await encrypt({ name: 'John' });

// ✅ JSON文字列に変換してから暗号化
const encrypted = await encrypt(JSON.stringify({ name: 'John' }));
```

#### 4. TypeScriptの型エラー

```typescript
// types.d.tsを作成
declare module '@your-org/secure-toolkit' {
  // カスタム型定義
}

// またはtsconfig.jsonに追加
{
  "compilerOptions": {
    "types": ["@your-org/secure-toolkit"]
  }
}
```

### デバッグモード

開発中の問題を特定するため：

```javascript
<SecureProvider debug={true}>
  <App />
</SecureProvider>

// コンソールに詳細なログが出力されます
```

### サポート

- 📧 Email: support@your-org.com
- 💬 Discord: https://discord.gg/your-org
- 📚 Docs: https://docs.your-org.com/secure-toolkit
- 🐛 Issues: https://github.com/your-org/secure-toolkit/issues

---

次のステップ：
- [詳細ガイド](./docs/GUIDE.md) - より高度な実装方法
- [APIリファレンス](./docs/API.md) - 全APIの詳細
- [サンプルアプリ](./examples/) - 実装例