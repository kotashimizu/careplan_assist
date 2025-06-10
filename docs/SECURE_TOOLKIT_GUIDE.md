# 🔐 Secure Toolkit 詳細ガイド

## 目次

1. [Secure Toolkitとは](#secure-toolkitとは)
2. [インストールと初期設定](#インストールと初期設定)
3. [主要機能の使い方](#主要機能の使い方)
4. [セキュリティレベルの詳細](#セキュリティレベルの詳細)
5. [実践的な実装例](#実践的な実装例)
6. [よくある質問](#よくある質問)
7. [トラブルシューティング](#トラブルシューティング)
8. [用語集](#用語集)

---

## 🎯 Secure Toolkitとは

### 概要
Secure Toolkitは、**医療機関レベルのセキュリティ（9.5/10）**を誰でも簡単に実装できるようにしたセキュリティフレームワークです。

### 特徴
- 🚀 **簡単導入**: 3行のコードで開始
- 🛡️ **自動保護**: セキュリティのベストプラクティスを自動適用
- 📊 **柔軟な設定**: 用途に応じて3段階のセキュリティレベル
- 🌍 **国際標準準拠**: HIPAA、GDPR、個人情報保護法に対応

---

## 📦 インストールと初期設定

### 1. インストール

```bash
# npmを使う場合
npm install ./secure-toolkit

# yarnを使う場合
yarn add ./secure-toolkit
```

### 2. 基本的なセットアップ

```tsx
// App.tsx
import React from 'react';
import { SecureProvider } from './secure-toolkit';

function App() {
  return (
    <SecureProvider config={{
      securityLevel: 'standard',
      features: ['auth', 'encryption'] // 使いたい機能を選択
    }}>
      <YourApp />
    </SecureProvider>
  );
}
```

### 3. 環境別の設定

```tsx
// 開発環境と本番環境で設定を分ける
const securityConfig = {
  securityLevel: process.env.NODE_ENV === 'production' ? 'high' : 'standard',
  features: ['auth', 'encryption', 'audit'],
  customConfig: {
    auth: {
      sessionTimeout: 30, // 30分でセッションタイムアウト
      enableMFA: process.env.NODE_ENV === 'production'
    }
  }
};
```

---

## 🔧 主要機能の使い方

### 1. 認証機能（ログイン・ログアウト）

#### 基本的な使い方

```tsx
import { useAuth, LoginForm } from './secure-toolkit';

// ログインコンポーネント
function LoginPage() {
  return (
    <LoginForm 
      onSuccess={(user) => {
        console.log('ログイン成功:', user.email);
        // ダッシュボードへ遷移など
      }}
      onError={(error) => {
        console.error('ログイン失敗:', error.message);
      }}
    />
  );
}

// ユーザー情報の取得
function UserProfile() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return <div>ログインしてください</div>;
  }
  
  return (
    <div>
      <h2>ようこそ、{user.email}さん</h2>
      <p>権限: {user.role}</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
```

#### 2段階認証（MFA）の設定

```tsx
import { MFASetup, MFAVerification } from './secure-toolkit';

// MFA設定画面
function SetupMFA() {
  const { user } = useAuth();
  
  return (
    <MFASetup 
      user={user}
      methods={['totp', 'sms']} // Google認証とSMS認証を有効化
      onComplete={(result) => {
        console.log('MFA設定完了:', result);
        // バックアップコードを表示
        alert(`バックアップコード: ${result.backupCodes.join(', ')}`);
      }}
    />
  );
}

// MFA検証画面
function VerifyMFA() {
  return (
    <MFAVerification
      method="totp"
      onSuccess={() => {
        console.log('認証成功！');
        // ダッシュボードへ
      }}
    />
  );
}
```

### 2. データ暗号化

#### 基本的な暗号化

```tsx
import { useEncryption } from './secure-toolkit';

function SecureDataForm() {
  const { encrypt, decrypt } = useEncryption();
  const [data, setData] = useState('');
  
  const handleSave = async () => {
    // データを暗号化
    const encrypted = await encrypt(data);
    
    // 暗号化されたデータを保存（例：APIに送信）
    await fetch('/api/save-data', {
      method: 'POST',
      body: JSON.stringify({ data: encrypted })
    });
  };
  
  const handleLoad = async () => {
    // 暗号化されたデータを取得
    const response = await fetch('/api/get-data');
    const { data: encrypted } = await response.json();
    
    // 復号化
    const decrypted = await decrypt(encrypted);
    setData(decrypted);
  };
  
  return (
    <div>
      <textarea 
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="機密情報を入力"
      />
      <button onClick={handleSave}>安全に保存</button>
      <button onClick={handleLoad}>データを読み込み</button>
    </div>
  );
}
```

#### 自動暗号化フィールド

```tsx
import { EncryptedField } from './secure-toolkit';

function CreditCardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  
  return (
    <form>
      {/* 自動的に暗号化されるフィールド */}
      <EncryptedField
        placeholder="カード番号"
        value={cardNumber}
        onChange={setCardNumber}
        autoEncrypt={true}
      />
      
      <EncryptedField
        placeholder="CVV"
        value={cvv}
        onChange={setCvv}
        autoEncrypt={true}
      />
      
      <button type="submit">決済する</button>
    </form>
  );
}
```

### 3. アクセス制御

#### ページレベルの保護

```tsx
import { ProtectedRoute } from './secure-toolkit';

function AppRoutes() {
  return (
    <Routes>
      {/* 公開ページ */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* ログインが必要なページ */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* 特定の権限が必要なページ */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminPanel />
        </ProtectedRoute>
      } />
      
      {/* 複数の権限のいずれかが必要 */}
      <Route path="/reports" element={
        <ProtectedRoute requiredRoles={['admin', 'manager']}>
          <ReportsPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

#### コンポーネントレベルの制御

```tsx
import { useAuth } from './secure-toolkit';

function FeaturePanel() {
  const { user, hasPermission } = useAuth();
  
  return (
    <div>
      {/* 基本機能は全員 */}
      <BasicFeatures />
      
      {/* 管理者のみ表示 */}
      {user?.role === 'admin' && (
        <AdminFeatures />
      )}
      
      {/* 特定の権限をチェック */}
      {hasPermission('reports:view') && (
        <ReportsSection />
      )}
      
      {/* 条件付き表示 */}
      {(user?.role === 'manager' || user?.role === 'admin') && (
        <TeamManagement />
      )}
    </div>
  );
}
```

### 4. 監査ログ（操作履歴）

```tsx
import { useAuditLog, AuditLogViewer } from './secure-toolkit';

// ログを記録
function SensitiveAction() {
  const { log } = useAuditLog();
  
  const handleDelete = async (id: string) => {
    // 削除操作を記録
    await log({
      action: 'DELETE_USER',
      resourceType: 'user',
      resourceId: id,
      severity: 'high',
      details: {
        reason: '退職処理'
      }
    });
    
    // 実際の削除処理
    await deleteUser(id);
  };
  
  return <button onClick={() => handleDelete('123')}>ユーザー削除</button>;
}

// ログを表示
function AuditDashboard() {
  return (
    <AuditLogViewer 
      filters={{
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 過去7日間
        severity: 'high' // 重要度の高いログのみ
      }}
      pageSize={50}
      exportEnabled={true} // エクスポート機能を有効化
    />
  );
}
```

### 5. データマスキング（個人情報の保護）

```tsx
import { MaskedDataView, dataMaskingService } from './secure-toolkit';

// 自動マスキング表示
function PatientInfo({ patient }) {
  return (
    <MaskedDataView 
      data={patient}
      showToggle={true} // マスク解除ボタンを表示
      allowedRoles={['doctor', 'admin']} // これらの役割のみマスク解除可能
    />
  );
}

// 手動マスキング
function DataExport() {
  const { user } = useAuth();
  
  const exportData = async () => {
    const data = await fetchSensitiveData();
    
    // ユーザーの権限に応じてマスキング
    const maskedData = dataMaskingService.maskData(data, user.role);
    
    // マスクされたデータをエクスポート
    downloadAsJSON(maskedData);
  };
  
  return <button onClick={exportData}>データをエクスポート</button>;
}
```

---

## 📊 セキュリティレベルの詳細

### Standard（標準）レベル

**適用場面**: 個人プロジェクト、ブログ、一般的なWebサイト

```tsx
const standardConfig = {
  securityLevel: 'standard',
  features: ['auth', 'encryption'],
  customConfig: {
    auth: {
      passwordPolicy: {
        minLength: 8,
        requireNumbers: true
      },
      sessionTimeout: 60 // 60分
    }
  }
};
```

**含まれる機能**:
- ✅ 基本的な認証（ログイン/ログアウト）
- ✅ パスワードの安全な保存
- ✅ セッション管理
- ✅ 基本的な暗号化

### High（高度）レベル

**適用場面**: ECサイト、会員制サービス、企業システム

```tsx
const highConfig = {
  securityLevel: 'high',
  features: ['auth', 'encryption', 'audit', 'mfa'],
  customConfig: {
    auth: {
      enableMFA: true,
      passwordPolicy: {
        minLength: 10,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true
      },
      sessionTimeout: 30 // 30分
    },
    rateLimit: {
      enabled: true,
      max: 100 // 1分間に100リクエストまで
    }
  }
};
```

**含まれる機能**:
- ✅ Standardレベルの全機能
- ✅ 2段階認証（MFA）
- ✅ 監査ログ
- ✅ レート制限
- ✅ 強化されたパスワードポリシー

### Maximum（最高）レベル

**適用場面**: 医療システム、金融システム、政府系システム

```tsx
const maximumConfig = {
  securityLevel: 'maximum',
  features: ['all'], // 全機能を有効化
  customConfig: {
    auth: {
      enableMFA: true,
      mfaMethods: ['totp', 'sms', 'biometric'],
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: true,
        preventReuse: 10 // 過去10個のパスワード再利用禁止
      },
      sessionTimeout: 15, // 15分
      requireReauthentication: ['delete', 'export'] // 重要操作で再認証
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      enableFieldLevel: true,
      autoEncryptSensitive: true
    },
    audit: {
      retentionDays: 2555, // 7年間保持
      includeReadOperations: true
    },
    compliance: {
      standards: ['HIPAA', 'GDPR', 'PCI-DSS']
    }
  }
};
```

**含まれる機能**:
- ✅ Highレベルの全機能
- ✅ 医療データ標準（FHIR）対応
- ✅ 完全なデータ暗号化
- ✅ 鍵管理システム（KMS）
- ✅ リアルタイムセキュリティ監視
- ✅ 自動脅威検知
- ✅ コンプライアンス報告

---

## 💼 実践的な実装例

### 1. 医療クリニックの予約システム

```tsx
// 医療機関向けの設定
const clinicConfig = {
  securityLevel: 'maximum',
  features: ['all'],
  customConfig: {
    compliance: {
      standards: ['HIPAA'],
      dataRetention: {
        medicalRecords: 7 * 365, // 7年
        appointmentData: 3 * 365  // 3年
      }
    }
  }
};

// 患者情報の表示（自動マスキング付き）
function PatientRecord({ patientId }) {
  const [patient, setPatient] = useState(null);
  const { user } = useAuth();
  const { log } = useAuditLog();
  
  useEffect(() => {
    // アクセスログを記録
    log({
      action: 'VIEW_PATIENT_RECORD',
      resourceType: 'patient',
      resourceId: patientId,
      details: { reason: 'appointment' }
    });
    
    // データ取得
    fetchPatient(patientId).then(setPatient);
  }, [patientId]);
  
  return (
    <div>
      <h2>患者情報</h2>
      {/* 権限に応じて自動的にマスキング */}
      <MaskedDataView 
        data={patient}
        showToggle={user.role === 'doctor'}
      />
    </div>
  );
}
```

### 2. ECサイトの決済画面

```tsx
// ECサイト向けの設定
const ecommerceConfig = {
  securityLevel: 'high',
  features: ['auth', 'encryption', 'audit', 'rateLimit'],
  customConfig: {
    rateLimit: {
      checkout: { max: 5, window: 3600000 } // 1時間に5回まで
    },
    encryption: {
      autoEncryptFields: ['creditCard', 'cvv']
    }
  }
};

// 安全な決済フォーム
function CheckoutForm() {
  const { encrypt } = useEncryption();
  const { remaining } = useRateLimit('/api/checkout');
  const [paymentData, setPaymentData] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // レート制限チェック
    if (remaining <= 0) {
      alert('しばらく時間をおいてから再度お試しください');
      return;
    }
    
    // カード情報を暗号化
    const encryptedData = await encrypt(JSON.stringify(paymentData));
    
    // 決済処理
    await processPayment(encryptedData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <SecurityBadge level="high" />
      <h3>安全な決済</h3>
      
      <EncryptedField
        placeholder="カード番号"
        onChange={(value) => setPaymentData({...paymentData, cardNumber: value})}
      />
      
      <EncryptedField
        placeholder="CVV"
        onChange={(value) => setPaymentData({...paymentData, cvv: value})}
      />
      
      <button type="submit">
        決済する（残り{remaining}回）
      </button>
    </form>
  );
}
```

### 3. 社内システムのファイル共有

```tsx
// 企業向けの設定
const enterpriseConfig = {
  securityLevel: 'high',
  features: ['auth', 'encryption', 'audit', 'mfa'],
  customConfig: {
    auth: {
      sso: {
        enabled: true,
        provider: 'azure-ad'
      }
    }
  }
};

// セキュアなファイルアップロード
function FileUpload() {
  const { user } = useAuth();
  const { encrypt } = useEncryption();
  const { log } = useAuditLog();
  
  const handleFileUpload = async (file) => {
    // ファイルを暗号化
    const fileContent = await readFile(file);
    const encrypted = await encrypt(fileContent);
    
    // アップロード
    const result = await uploadFile({
      name: file.name,
      content: encrypted,
      uploadedBy: user.id
    });
    
    // 監査ログ
    await log({
      action: 'FILE_UPLOAD',
      resourceType: 'file',
      resourceId: result.fileId,
      details: {
        fileName: file.name,
        fileSize: file.size,
        encrypted: true
      }
    });
  };
  
  return (
    <div>
      <h3>セキュアファイルアップロード</h3>
      <input 
        type="file" 
        onChange={(e) => handleFileUpload(e.target.files[0])}
      />
      <p>すべてのファイルは自動的に暗号化されます</p>
    </div>
  );
}
```

---

## ❓ よくある質問

### Q: Secure Toolkitは本当に無料ですか？
**A**: はい、完全に無料です。オープンソースプロジェクトとして提供されています。

### Q: 既存のプロジェクトに追加できますか？
**A**: はい、既存のReactプロジェクトに簡単に追加できます。段階的な導入も可能です。

### Q: パフォーマンスへの影響は？
**A**: 
- Standard: ほぼ影響なし（<1ms）
- High: わずかな影響（5-10ms）
- Maximum: 暗号化処理で10-20ms程度

### Q: どのセキュリティレベルを選べばいい？
**A**: 
- 個人情報を扱わない → Standard
- クレジットカードや住所を扱う → High
- 医療情報や機密データを扱う → Maximum

### Q: MFAは必須ですか？
**A**: いいえ、オプションです。ただし、Highレベル以上では推奨されます。

### Q: データはどこに保存されますか？
**A**: Secure Toolkit自体はデータを保存しません。暗号化したデータをあなたのデータベースやストレージに保存します。

---

## 🔧 トラブルシューティング

### インストールエラー

```
エラー: Module not found: './secure-toolkit'
```

**解決方法**:
```bash
# パスを確認
ls secure-toolkit

# 正しいパスでインストール
npm install ./secure-toolkit
```

### 認証エラー

```
エラー: Authentication failed
```

**チェックポイント**:
1. SecureProviderでアプリをラップしているか
2. 環境変数が正しく設定されているか
3. ユーザーが正しく登録されているか

```tsx
// 正しい実装
<SecureProvider config={config}>
  <App />
</SecureProvider>
```

### 暗号化エラー

```
エラー: Encryption failed
```

**解決方法**:
- ブラウザがWeb Crypto APIをサポートしているか確認
- HTTPSで実行されているか確認（localhostは例外）

### パフォーマンス問題

**症状**: アプリが遅い

**対策**:
1. 必要な機能のみ有効化
```tsx
features: ['auth', 'encryption'] // 'all'ではなく必要なもののみ
```

2. 暗号化を選択的に使用
```tsx
// 全データではなく、センシティブなデータのみ暗号化
if (isSensitive(data)) {
  data = await encrypt(data);
}
```

3. Web Workerを使用（大量データの場合）

---

## 📚 用語集

### 認証（Authentication）
「あなたが誰か」を確認すること。ログインがこれにあたります。

### 認可（Authorization）
「何ができるか」を決めること。権限管理がこれにあたります。

### 暗号化（Encryption）
データを特殊な方法で変換し、鍵を持つ人だけが読めるようにすること。

### MFA（Multi-Factor Authentication）
2段階認証。パスワード＋別の方法（SMSなど）で本人確認すること。

### HTTPS
安全な通信方式。URLが`https://`で始まるサイトはこれを使っています。

### トークン（Token）
一時的な認証チケット。ログイン後、このチケットを使って認証します。

### セッション（Session）
ログインしてからログアウトするまでの期間。

### 監査ログ（Audit Log）
誰が、いつ、何をしたかの記録。

### レート制限（Rate Limit）
短時間に大量のリクエストを防ぐ仕組み。

### HIPAA
アメリカの医療情報保護法。日本の個人情報保護法の医療版。

### GDPR
ヨーロッパのプライバシー保護法。世界で最も厳しいとされる。

---

## 🎉 まとめ

Secure Toolkitを使えば、セキュリティの専門知識がなくても、安全なアプリケーションを作ることができます。

**次のステップ**:
1. [クイックスタート](./SECURE_TOOLKIT_QUICK_START.md)で基本を学ぶ
2. 必要な機能を選んで実装
3. わからないことは遠慮なく質問

セキュリティは難しくありません。一緒に安全なアプリを作りましょう！