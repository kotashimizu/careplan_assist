# Secure Toolkit 実装例

## 目次

1. [基本的な実装](#基本的な実装)
2. [医療機関向けの実装](#医療機関向けの実装)
3. [Eコマース向けの実装](#eコマース向けの実装)
4. [企業内システム向けの実装](#企業内システム向けの実装)
5. [モバイルアプリ向けの実装](#モバイルアプリ向けの実装)

## 基本的な実装

### 最小構成でのセットアップ

```tsx
// App.tsx
import React from 'react';
import { SecureProvider } from '@your-org/secure-toolkit';

function App() {
  return (
    <SecureProvider config={{
      securityLevel: 'standard',
      features: ['auth', 'encryption']
    }}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </SecureProvider>
  );
}

// LoginPage.tsx
import { LoginForm } from '@your-org/secure-toolkit';

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm 
        onSuccess={(user) => {
          window.location.href = '/dashboard';
        }}
        onError={(error) => {
          console.error('Login failed:', error);
        }}
      />
    </div>
  );
}

// Dashboard.tsx
import { useAuth, useEncryption } from '@your-org/secure-toolkit';

function Dashboard() {
  const { user, logout } = useAuth();
  const { encrypt, decrypt } = useEncryption();
  
  const [secretData, setSecretData] = useState('');
  
  const handleSaveSecret = async () => {
    const encrypted = await encrypt(secretData);
    localStorage.setItem('userSecret', encrypted);
  };
  
  return (
    <div className="p-4">
      <h1>Welcome, {user?.email}!</h1>
      <button onClick={logout}>Logout</button>
      
      <div className="mt-4">
        <input
          type="text"
          value={secretData}
          onChange={(e) => setSecretData(e.target.value)}
          placeholder="Enter secret data"
        />
        <button onClick={handleSaveSecret}>Save Encrypted</button>
      </div>
    </div>
  );
}
```

## 医療機関向けの実装

### 患者管理システム

```tsx
// MedicalApp.tsx
import { SecureProvider } from '@your-org/secure-toolkit';
import { medicalPreset } from '@your-org/secure-toolkit/presets';

function MedicalApp() {
  return (
    <SecureProvider config={{
      securityLevel: 'maximum',
      preset: medicalPreset,
      customConfig: {
        fhir: {
          enabled: true,
          version: 'R4'
        }
      }
    }}>
      <PatientManagementSystem />
    </SecureProvider>
  );
}

// PatientRecord.tsx
import { 
  useAuth, 
  useEncryption, 
  useAuditLog,
  MaskedDataView,
  fhirService 
} from '@your-org/secure-toolkit';

function PatientRecord({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const { decrypt } = useEncryption();
  const { log } = useAuditLog();
  
  const [patient, setPatient] = useState<any>(null);
  const [showSensitive, setShowSensitive] = useState(false);
  
  useEffect(() => {
    loadPatient();
  }, [patientId]);
  
  const loadPatient = async () => {
    try {
      // 監査ログに記録
      await log({
        action: 'PATIENT_RECORD_ACCESS',
        resourceType: 'patient',
        resourceId: patientId,
        details: {
          reason: 'clinical_care'
        }
      });
      
      // 患者データを取得
      const encryptedData = await fetchPatientData(patientId);
      const decryptedData = await decrypt(encryptedData);
      
      // FHIR形式に変換
      const fhirPatient = await fhirService.convertToFHIRPatient(
        decryptedData,
        { maskSensitiveData: !showSensitive }
      );
      
      setPatient(fhirPatient);
    } catch (error) {
      console.error('Failed to load patient:', error);
    }
  };
  
  return (
    <div className="patient-record">
      <h2>患者情報</h2>
      
      {/* PHI/PIIデータの自動マスキング */}
      <MaskedDataView
        data={patient}
        showToggle={user?.role === 'doctor'}
        allowedRoles={['doctor', 'admin']}
      />
      
      {/* 医療記録の追加 */}
      <MedicalRecordForm 
        patientId={patientId}
        onSubmit={async (record) => {
          // FHIRフォーマットで保存
          const observation = await fhirService.convertToFHIRObservation({
            id: generateId(),
            patientId,
            type: record.type,
            value: record.value,
            unit: record.unit,
            date: new Date().toISOString(),
            performedBy: user?.id
          });
          
          // 暗号化して保存
          await saveObservation(observation);
          
          // 監査ログ
          await log({
            action: 'MEDICAL_RECORD_CREATED',
            resourceType: 'observation',
            resourceId: observation.id,
            details: {
              patientId,
              type: record.type
            }
          });
        }}
      />
    </div>
  );
}

// MedicalRecordForm.tsx
function MedicalRecordForm({ patientId, onSubmit }) {
  const [record, setRecord] = useState({
    type: '',
    value: '',
    unit: '',
    notes: ''
  });
  
  const recordTypes = [
    { value: 'blood_pressure', label: '血圧' },
    { value: 'heart_rate', label: '心拍数' },
    { value: 'temperature', label: '体温' },
    { value: 'weight', label: '体重' }
  ];
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(record);
    }}>
      <select
        value={record.type}
        onChange={(e) => setRecord({ ...record, type: e.target.value })}
      >
        <option value="">記録タイプを選択</option>
        {recordTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      
      <input
        type="number"
        value={record.value}
        onChange={(e) => setRecord({ ...record, value: e.target.value })}
        placeholder="測定値"
      />
      
      <input
        type="text"
        value={record.unit}
        onChange={(e) => setRecord({ ...record, unit: e.target.value })}
        placeholder="単位"
      />
      
      <textarea
        value={record.notes}
        onChange={(e) => setRecord({ ...record, notes: e.target.value })}
        placeholder="備考"
      />
      
      <button type="submit">記録を保存</button>
    </form>
  );
}
```

### 処方箋管理

```tsx
// PrescriptionManager.tsx
import { 
  useAuth,
  useEncryption,
  useAuditLog,
  kmsService,
  MFAVerification
} from '@your-org/secure-toolkit';

function PrescriptionManager() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  
  const createPrescription = async (prescription: any) => {
    // 処方箋作成には追加のMFA検証が必要
    setShowMFAPrompt(true);
  };
  
  const handleMFASuccess = async () => {
    setShowMFAPrompt(false);
    
    // 処方箋データを暗号化
    const encrypted = await kmsService.encrypt(
      JSON.stringify(prescription),
      undefined,
      user?.id
    );
    
    // 保存と監査ログ
    await savePrescription(encrypted);
    await log({
      action: 'PRESCRIPTION_CREATED',
      resourceType: 'prescription',
      resourceId: prescription.id,
      severity: 'high',
      details: {
        medication: prescription.medication,
        dosage: prescription.dosage,
        patientId: prescription.patientId
      }
    });
  };
  
  return (
    <div>
      {showMFAPrompt && (
        <MFAVerification
          method="totp"
          onSuccess={handleMFASuccess}
          onError={(error) => {
            console.error('MFA verification failed:', error);
            setShowMFAPrompt(false);
          }}
        />
      )}
      
      {/* 処方箋フォーム */}
      <PrescriptionForm onSubmit={createPrescription} />
    </div>
  );
}
```

## Eコマース向けの実装

### 決済処理

```tsx
// CheckoutPage.tsx
import {
  SecureProvider,
  useAuth,
  useEncryption,
  useRateLimit,
  EncryptedField,
  SecurityBadge
} from '@your-org/secure-toolkit';

function CheckoutPage() {
  const { user } = useAuth();
  const { encrypt } = useEncryption();
  const { remaining } = useRateLimit('/api/checkout');
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cvv: '',
    expiryDate: ''
  });
  
  const processPayment = async () => {
    // レート制限チェック
    if (remaining <= 0) {
      alert('Too many checkout attempts. Please try again later.');
      return;
    }
    
    // カード情報を暗号化
    const encryptedCard = await encrypt(JSON.stringify({
      number: paymentData.cardNumber,
      cvv: paymentData.cvv,
      expiry: paymentData.expiryDate
    }));
    
    // 決済処理
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.accessToken}`
      },
      body: JSON.stringify({
        encryptedPayment: encryptedCard,
        orderId: order.id
      })
    });
    
    if (response.ok) {
      // 成功処理
    }
  };
  
  return (
    <div className="checkout-page">
      <SecurityBadge level="high" />
      
      <h2>安全な決済</h2>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        processPayment();
      }}>
        {/* 暗号化されたフィールド */}
        <EncryptedField
          placeholder="カード番号"
          value={paymentData.cardNumber}
          onChange={(value) => setPaymentData({
            ...paymentData,
            cardNumber: value
          })}
          autoEncrypt={true}
        />
        
        <EncryptedField
          placeholder="CVV"
          value={paymentData.cvv}
          onChange={(value) => setPaymentData({
            ...paymentData,
            cvv: value
          })}
          autoEncrypt={true}
        />
        
        <input
          type="text"
          placeholder="MM/YY"
          value={paymentData.expiryDate}
          onChange={(e) => setPaymentData({
            ...paymentData,
            expiryDate: e.target.value
          })}
        />
        
        <button type="submit">
          安全に決済する
        </button>
      </form>
      
      <p className="text-sm text-gray-600 mt-4">
        お客様のカード情報は最高レベルの暗号化により保護されています
      </p>
    </div>
  );
}
```

### 不正検知システム

```tsx
// FraudDetection.tsx
import { 
  useSecurityMonitor,
  securityMonitor,
  auditLogService 
} from '@your-org/secure-toolkit';

function FraudDetectionDashboard() {
  const { events, alerts } = useSecurityMonitor();
  
  useEffect(() => {
    // カスタム不正検知ルールを設定
    setupFraudDetectionRules();
  }, []);
  
  const setupFraudDetectionRules = async () => {
    // 異常な購入パターン
    await securityMonitor.configureRule({
      name: 'unusual_purchase_pattern',
      description: '異常な購入パターンの検出',
      condition: (events) => {
        const purchases = events.filter(e => 
          e.type === 'PURCHASE_COMPLETED' &&
          e.timestamp > Date.now() - 60 * 60 * 1000
        );
        
        // 1時間に10回以上の購入
        if (purchases.length > 10) return true;
        
        // 合計金額が異常に高い
        const total = purchases.reduce((sum, p) => sum + p.metadata.amount, 0);
        if (total > 10000) return true;
        
        return false;
      },
      action: 'alert',
      severity: 'high'
    });
    
    // 複数の配送先
    await securityMonitor.configureRule({
      name: 'multiple_shipping_addresses',
      description: '複数の配送先への注文',
      condition: (events) => {
        const orders = events.filter(e => 
          e.type === 'ORDER_PLACED' &&
          e.timestamp > Date.now() - 24 * 60 * 60 * 1000
        );
        
        const addresses = new Set(orders.map(o => o.metadata.shippingAddress));
        return addresses.size > 3;
      },
      action: 'review',
      severity: 'medium'
    });
  };
  
  return (
    <div className="fraud-detection">
      <h2>不正検知ダッシュボード</h2>
      
      {/* アクティブなアラート */}
      <div className="alerts">
        <h3>アクティブなアラート</h3>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            alert={alert}
            onAcknowledge={async () => {
              await securityMonitor.acknowledgeAlert(alert.id);
            }}
          />
        ))}
      </div>
      
      {/* 最近のイベント */}
      <div className="recent-events">
        <h3>最近のセキュリティイベント</h3>
        {events.slice(0, 10).map(event => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

## 企業内システム向けの実装

### シングルサインオン（SSO）

```tsx
// SSOProvider.tsx
import { 
  SecureProvider,
  authService,
  jwtService 
} from '@your-org/secure-toolkit';

function CorporateApp() {
  return (
    <SecureProvider config={{
      securityLevel: 'high',
      customConfig: {
        auth: {
          sso: {
            enabled: true,
            provider: 'okta',
            clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
            domain: process.env.REACT_APP_OKTA_DOMAIN
          }
        }
      }
    }}>
      <App />
    </SecureProvider>
  );
}

// SSOLogin.tsx
function SSOLogin() {
  const handleSSOLogin = async () => {
    try {
      // Okta認証
      const oktaResponse = await authenticateWithOkta();
      
      // JWTトークンの生成
      const tokenPair = await jwtService.generateTokenPair({
        id: oktaResponse.userId,
        email: oktaResponse.email,
        role: oktaResponse.role,
        permissions: oktaResponse.permissions
      });
      
      // セッション確立
      await authService.establishSession(tokenPair);
      
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('SSO login failed:', error);
    }
  };
  
  return (
    <div className="sso-login">
      <h2>企業ログイン</h2>
      <button onClick={handleSSOLogin}>
        Oktaでログイン
      </button>
    </div>
  );
}
```

### 役職別アクセス制御

```tsx
// RoleBasedDashboard.tsx
import { 
  useAuth,
  ProtectedRoute,
  useAuditLog 
} from '@your-org/secure-toolkit';

function CorporateDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="dashboard">
      <h1>ダッシュボード</h1>
      
      {/* 一般社員向け */}
      <ProtectedRoute requiredRoles={['employee']}>
        <EmployeeView />
      </ProtectedRoute>
      
      {/* マネージャー向け */}
      <ProtectedRoute requiredRoles={['manager', 'director']}>
        <ManagerView />
      </ProtectedRoute>
      
      {/* 経営層向け */}
      <ProtectedRoute requiredRoles={['executive', 'ceo']}>
        <ExecutiveView />
      </ProtectedRoute>
      
      {/* IT管理者向け */}
      <ProtectedRoute requiredRoles={['it_admin']}>
        <SecurityDashboard />
      </ProtectedRoute>
    </div>
  );
}

// ManagerView.tsx
function ManagerView() {
  const { log } = useAuditLog();
  const [teamData, setTeamData] = useState(null);
  
  useEffect(() => {
    loadTeamData();
  }, []);
  
  const loadTeamData = async () => {
    // 部下のデータアクセスを記録
    await log({
      action: 'TEAM_DATA_ACCESS',
      resourceType: 'employee_data',
      resourceId: 'team_overview',
      details: {
        purpose: 'performance_review'
      }
    });
    
    const data = await fetchTeamData();
    setTeamData(data);
  };
  
  const exportReport = async () => {
    // データエクスポートには追加の権限チェック
    const hasExportPermission = await checkPermission('data:export');
    if (!hasExportPermission) {
      alert('データエクスポート権限がありません');
      return;
    }
    
    // エクスポート実行と記録
    const report = await generateTeamReport(teamData);
    await log({
      action: 'DATA_EXPORTED',
      resourceType: 'team_report',
      severity: 'medium',
      details: {
        format: 'xlsx',
        recordCount: report.recordCount
      }
    });
    
    downloadFile(report);
  };
  
  return (
    <div className="manager-view">
      <h2>チーム管理</h2>
      {teamData && <TeamMetrics data={teamData} />}
      <button onClick={exportReport}>
        レポートをエクスポート
      </button>
    </div>
  );
}
```

## モバイルアプリ向けの実装

### React Native統合

```tsx
// MobileApp.tsx
import { 
  SecureProvider,
  useAuth,
  useEncryption,
  secureStorage 
} from '@your-org/secure-toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

function MobileApp() {
  return (
    <SecureProvider config={{
      securityLevel: 'high',
      customConfig: {
        storage: {
          adapter: AsyncStorage
        },
        auth: {
          biometric: {
            enabled: true,
            fallbackToPasscode: true
          }
        }
      }
    }}>
      <AppNavigator />
    </SecureProvider>
  );
}

// BiometricLogin.tsx
function BiometricLogin() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState(null);
  
  useEffect(() => {
    checkBiometricAvailability();
  }, []);
  
  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      // 保存された認証情報を取得
      const saved = await secureStorage.getItem('biometric_credentials');
      if (saved) {
        setCredentials(saved);
      }
    }
  };
  
  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'ログインするには認証してください',
      fallbackLabel: 'パスコードを使用'
    });
    
    if (result.success && credentials) {
      await login(credentials);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBiometricLogin}>
        <Text>Face ID / Touch IDでログイン</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('PasswordLogin')}>
        <Text>パスワードでログイン</Text>
      </TouchableOpacity>
    </View>
  );
}

// SecureDataSync.tsx
function SecureDataSync() {
  const { encrypt, decrypt } = useEncryption();
  const [syncStatus, setSyncStatus] = useState('idle');
  
  const syncData = async () => {
    setSyncStatus('syncing');
    
    try {
      // ローカルデータを取得
      const localData = await getLocalData();
      
      // 暗号化
      const encrypted = await encrypt(JSON.stringify(localData));
      
      // サーバーと同期
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': await getDeviceId()
        },
        body: JSON.stringify({ data: encrypted })
      });
      
      if (response.ok) {
        const serverData = await response.json();
        const decrypted = await decrypt(serverData.data);
        await mergeData(JSON.parse(decrypted));
        setSyncStatus('success');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };
  
  return (
    <View>
      <Text>同期状態: {syncStatus}</Text>
      <Button title="データを同期" onPress={syncData} />
    </View>
  );
}
```

## パフォーマンス最適化の実装例

### 大量データの暗号化

```tsx
// BulkEncryption.tsx
import { kmsService } from '@your-org/secure-toolkit';

function BulkDataProcessor() {
  const processLargeDataset = async (records: any[]) => {
    const BATCH_SIZE = 100;
    const results = [];
    
    // バッチ処理で暗号化
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      
      // 並列処理
      const encryptedBatch = await Promise.all(
        batch.map(record => kmsService.encrypt(JSON.stringify(record)))
      );
      
      results.push(...encryptedBatch);
      
      // 進捗表示
      const progress = Math.min(100, (i + BATCH_SIZE) / records.length * 100);
      updateProgress(progress);
    }
    
    return results;
  };
  
  // Web Worker使用例
  const processInWorker = async (data: any[]) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker('/encryption.worker.js');
      
      worker.postMessage({ 
        action: 'encrypt',
        data 
      });
      
      worker.onmessage = (e) => {
        if (e.data.error) {
          reject(e.data.error);
        } else {
          resolve(e.data.result);
        }
      };
    });
  };
}
```

これらの実装例は、Secure Toolkitの主要な機能を活用して、さまざまなユースケースに対応する方法を示しています。各例は本番環境での使用を想定し、セキュリティとパフォーマンスの両方を考慮した設計となっています。