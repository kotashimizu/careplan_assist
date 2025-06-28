# 🔐 Secure Toolkit

> **注**: このツールキットの使い方は [docs/03-セキュリティ](../docs/03-セキュリティ/) をご覧ください。

どんなWebアプリケーションにも使える、包括的なセキュリティツールキットです。

## 🌟 特徴

- ✅ **簡単導入** - 3ステップで導入完了
- ✅ **業界標準準拠** - HIPAA、GDPR、個人情報保護法対応
- ✅ **カスタマイズ可能** - 必要な機能だけを選択
- ✅ **TypeScript対応** - 型安全な開発
- ✅ **React対応** - Hooks とコンポーネント提供

## 📦 インストール

```bash
npm install @your-org/secure-toolkit
# または
yarn add @your-org/secure-toolkit
```

## 🚀 クイックスタート

### 1. 基本的な使い方

```javascript
import { SecureProvider, useAuth } from '@your-org/secure-toolkit';

function App() {
  return (
    <SecureProvider>
      <MyApp />
    </SecureProvider>
  );
}

function MyApp() {
  const { login, logout, user } = useAuth();
  
  return (
    <div>
      {user ? (
        <p>ようこそ、{user.name}さん！</p>
      ) : (
        <button onClick={() => login()}>ログイン</button>
      )}
    </div>
  );
}
```

### 2. セットアップウィザードを使う

```javascript
import { SetupWizard } from '@your-org/secure-toolkit';

function InitialSetup() {
  return (
    <SetupWizard
      onComplete={(config) => {
        console.log('設定完了！', config);
      }}
    />
  );
}
```

## 🔧 主な機能

### 認証システム
```javascript
import { useAuth, ProtectedRoute } from '@your-org/secure-toolkit';

// ログイン状態の管理
const { user, login, logout, isAuthenticated } = useAuth();

// 保護されたルート
<ProtectedRoute role="admin">
  <AdminPanel />
</ProtectedRoute>
```

### 暗号化
```javascript
import { useEncryption } from '@your-org/secure-toolkit';

const { encrypt, decrypt } = useEncryption();

// データの暗号化
const encrypted = await encrypt(sensitiveData);
const decrypted = await decrypt(encrypted);
```

### テナント設定
```javascript
import { useTenantConfig } from '@your-org/secure-toolkit';

const { 
  isFeatureEnabled, 
  getConfig, 
  updateConfig 
} = useTenantConfig();

// 機能の有効/無効チェック
if (isFeatureEnabled('audioRecording')) {
  return <AudioRecorder />;
}
```

### 監査ログ
```javascript
import { useAuditLog } from '@your-org/secure-toolkit';

const { logAction } = useAuditLog();

// アクション記録
await logAction({
  action: 'DELETE_USER',
  target: userId,
  details: 'ユーザーを削除しました'
});
```

## 🎨 UI コンポーネント

### セキュリティバッジ
```javascript
import { SecurityBadge } from '@your-org/secure-toolkit';

<SecurityBadge /> // 現在のセキュリティレベルを表示
```

### 設定パネル
```javascript
import { TenantConfigPanel } from '@your-org/secure-toolkit';

<TenantConfigPanel /> // 管理者用の設定画面
```

## 🎯 実装例

### 例1: ブログシステム
```javascript
import { SecureProvider, useAuth, useEncryption } from '@your-org/secure-toolkit';

function BlogApp() {
  const { user } = useAuth();
  const { encrypt } = useEncryption();
  
  const saveDraft = async (content) => {
    // 下書きを暗号化して保存
    const encrypted = await encrypt(content);
    localStorage.setItem('draft', encrypted);
  };
  
  return (
    <div>
      {user?.role === 'author' && (
        <Editor onSave={saveDraft} />
      )}
    </div>
  );
}
```

### 例2: ECサイト
```javascript
import { 
  SecureProvider, 
  useAuth, 
  useTenantConfig,
  ProtectedRoute 
} from '@your-org/secure-toolkit';

function ECommerceApp() {
  const { isFeatureEnabled } = useTenantConfig();
  
  return (
    <div>
      {/* 決済機能が有効な場合のみ表示 */}
      {isFeatureEnabled('payment') && (
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      )}
    </div>
  );
}
```

### 例3: ゲームアプリ
```javascript
import { 
  SecureProvider,
  useAuth,
  useEncryption,
  useAuditLog
} from '@your-org/secure-toolkit';

function GameApp() {
  const { user } = useAuth();
  const { encrypt, decrypt } = useEncryption();
  const { logAction } = useAuditLog();
  
  const saveGameData = async (gameState) => {
    // セーブデータを暗号化（チート対策）
    const encrypted = await encrypt(gameState);
    
    // 保存アクションを記録
    await logAction({
      action: 'SAVE_GAME',
      details: { level: gameState.level }
    });
    
    return encrypted;
  };
  
  return <Game onSave={saveGameData} />;
}
```

## 📋 設定オプション

```javascript
const config = {
  // 基本設定
  app: {
    name: 'My Awesome App',
    logo: '/logo.png'
  },
  
  // 認証設定
  auth: {
    providers: ['email', 'google', 'github'],
    sessionTimeout: 3600, // 1時間
    multiFactorAuth: true
  },
  
  // セキュリティ設定
  security: {
    encryption: {
      algorithm: 'AES-256',
      autoEncryptPII: true
    },
    passwordPolicy: {
      minLength: 10,
      requireSpecialChars: true
    }
  },
  
  // 機能フラグ
  features: {
    audioRecording: true,
    fileUpload: true,
    notifications: true
  }
};
```

## 🏭 プリセット

業界別の推奨設定をワンクリックで適用：

- 🏥 **医療機関向け** - HIPAA準拠、高度な暗号化
- 🏫 **教育機関向け** - FERPA準拠、保護者同意管理
- 🏦 **金融機関向け** - PCI-DSS準拠、多要素認証
- 🏢 **一般企業向け** - バランス型設定
- 🎮 **ゲーム向け** - チート対策、セーブデータ保護

## 🛠️ カスタマイズ

### テーマのカスタマイズ
```css
/* your-app.css */
.secure-toolkit-theme {
  --primary-color: #FF6B6B;
  --secondary-color: #4ECDC4;
  --font-family: 'Comic Sans MS';
}
```

### 独自の認証プロバイダー
```javascript
import { addAuthProvider } from '@your-org/secure-toolkit';

addAuthProvider({
  name: 'custom-oauth',
  authenticate: async (credentials) => {
    // カスタム認証ロジック
  }
});
```

## 📚 ドキュメント

- [詳細ガイド](./docs/GUIDE.md)
- [APIリファレンス](./docs/API.md)
- [マイグレーションガイド](./docs/MIGRATION.md)
- [セキュリティベストプラクティス](./docs/SECURITY.md)

## 🤝 コントリビューション

バグ報告や機能リクエストは [GitHub Issues](https://github.com/your-org/secure-toolkit) まで！

## 📄 ライセンス

MIT License - 商用利用も可能です。

---

Made with ❤️ by Your Organization