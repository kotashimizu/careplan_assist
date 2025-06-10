# Secure Toolkit セキュリティガイド

## 概要

このガイドでは、Secure Toolkitを使用してアプリケーションのセキュリティを最大化するためのベストプラクティスと実装方法を説明します。

## セキュリティの基本原則

### 1. 多層防御（Defense in Depth）

複数のセキュリティレイヤーを実装し、単一の防御が破られても他の層で保護します。

```
┌─────────────────────────────────────┐
│         アプリケーション層           │
│  ┌─────────────────────────────┐   │
│  │      ビジネスロジック層      │   │
│  │  ┌───────────────────────┐  │   │
│  │  │    データアクセス層    │  │   │
│  │  │  ┌─────────────────┐  │  │   │
│  │  │  │  データベース層  │  │  │   │
│  │  │  └─────────────────┘  │  │   │
│  │  └───────────────────────┘  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 2. 最小権限の原則

ユーザーとプロセスには、タスクを完了するために必要な最小限の権限のみを付与します。

```typescript
// 良い例：必要な権限のみ
const userPermissions = {
  read: ['profile', 'orders'],
  write: ['profile'],
  delete: []
};

// 悪い例：過剰な権限
const userPermissions = {
  read: '*',
  write: '*',
  delete: '*'
};
```

### 3. ゼロトラスト

「決して信頼せず、常に検証する」の原則に基づき、すべてのアクセスを検証します。

## 認証セキュリティ

### パスワードポリシー

強力なパスワードポリシーを実装：

```typescript
const passwordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  preventCommon: true,      // よくあるパスワードを禁止
  preventReuse: 10,         // 過去10個のパスワードの再利用を禁止
  preventSequential: true,  // 連続文字を禁止
  preventRepeat: true       // 同じ文字の繰り返しを禁止
};
```

### セッション管理

セキュアなセッション管理の実装：

```typescript
const sessionConfig = {
  // セッションタイムアウト
  absoluteTimeout: 8 * 60 * 60 * 1000,  // 8時間
  idleTimeout: 15 * 60 * 1000,          // 15分
  
  // セッション固定攻撃対策
  regenerateOnLogin: true,
  regenerateInterval: 30 * 60 * 1000,   // 30分ごと
  
  // セッショントークン設定
  tokenLength: 32,
  secure: true,        // HTTPS必須
  httpOnly: true,      // JavaScript無効
  sameSite: 'strict'   // CSRF対策
};
```

### 多要素認証（MFA）

MFAの強制実装パターン：

```typescript
// 管理者には必須
if (user.role === 'admin' && !user.mfaEnabled) {
  return redirect('/setup-mfa');
}

// センシティブな操作には追加検証
async function performSensitiveAction(userId: string) {
  // 最近のMFA検証を確認
  const lastMFAVerification = await getLastMFAVerification(userId);
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  if (!lastMFAVerification || lastMFAVerification < thirtyMinutesAgo) {
    throw new Error('MFA re-verification required');
  }
  
  // センシティブな操作を実行
}
```

## データ保護

### 暗号化戦略

データの分類に基づいた暗号化：

```typescript
// データ分類
enum DataClassification {
  PUBLIC = 'public',           // 暗号化不要
  INTERNAL = 'internal',       // 転送時暗号化
  CONFIDENTIAL = 'confidential', // 保存時・転送時暗号化
  RESTRICTED = 'restricted'    // 強力な暗号化 + アクセス制御
}

// 分類に基づく暗号化
async function encryptByClassification(
  data: any, 
  classification: DataClassification
): Promise<any> {
  switch (classification) {
    case DataClassification.PUBLIC:
      return data;
      
    case DataClassification.INTERNAL:
      return transportEncryption(data);
      
    case DataClassification.CONFIDENTIAL:
      return await kmsService.encrypt(JSON.stringify(data));
      
    case DataClassification.RESTRICTED:
      const encrypted = await kmsService.encrypt(JSON.stringify(data));
      await auditLogService.log({
        action: 'RESTRICTED_DATA_ACCESS',
        details: { dataType: data.type }
      });
      return encrypted;
  }
}
```

### 鍵管理

セキュアな鍵管理のベストプラクティス：

```typescript
// 1. 鍵の階層化
const keyHierarchy = {
  masterKey: 'AWS_KMS',           // ハードウェアセキュリティモジュール
  keyEncryptionKey: 'ENCRYPTED',  // マスターキーで暗号化
  dataEncryptionKey: 'ENCRYPTED'  // KEKで暗号化
};

// 2. 自動ローテーション
const rotationSchedule = {
  masterKey: 365,        // 年次
  keyEncryptionKey: 90,  // 四半期
  dataEncryptionKey: 30  // 月次
};

// 3. 鍵の使用制限
const keyUsagePolicy = {
  maxEncryptions: 1000000,
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90日
  allowedIPs: ['10.0.0.0/8'],
  requireMFA: true
};
```

### データマスキング

センシティブデータの適切なマスキング：

```typescript
// コンテキストに応じたマスキング
function maskByContext(data: any, context: UserContext): any {
  // 開発環境では完全マスク
  if (context.environment === 'development') {
    return fullMask(data);
  }
  
  // ロールベースマスキング
  if (context.role === 'support') {
    return partialMask(data, ['email', 'phone']);
  }
  
  // 監査ログでは最小限の情報のみ
  if (context.purpose === 'audit') {
    return minimalMask(data, ['id', 'timestamp']);
  }
  
  return data;
}
```

## アクセス制御

### ロールベースアクセス制御（RBAC）

階層的なロール設計：

```typescript
const roleHierarchy = {
  superAdmin: {
    inherits: ['admin'],
    permissions: ['system:*']
  },
  admin: {
    inherits: ['manager'],
    permissions: ['users:*', 'config:*']
  },
  manager: {
    inherits: ['user'],
    permissions: ['reports:read', 'team:manage']
  },
  user: {
    inherits: [],
    permissions: ['profile:read', 'profile:update']
  }
};

// 権限チェック
function hasPermission(user: User, permission: string): boolean {
  const permissions = getAllPermissions(user.role);
  return permissions.some(p => 
    p === permission || 
    p.endsWith(':*') && permission.startsWith(p.slice(0, -2))
  );
}
```

### 属性ベースアクセス制御（ABAC）

より細かい制御のためのABAC：

```typescript
interface AccessPolicy {
  resource: string;
  action: string;
  conditions: Condition[];
}

interface Condition {
  attribute: string;
  operator: 'equals' | 'contains' | 'greater' | 'less';
  value: any;
}

// アクセス評価
async function evaluateAccess(
  user: User,
  resource: Resource,
  action: string
): Promise<boolean> {
  const policies = await getPoliciesForUser(user);
  
  return policies.some(policy => {
    if (policy.resource !== resource.type) return false;
    if (policy.action !== action) return false;
    
    return policy.conditions.every(condition => {
      const userValue = user[condition.attribute];
      const resourceValue = resource[condition.attribute];
      
      switch (condition.operator) {
        case 'equals':
          return userValue === condition.value;
        case 'contains':
          return userValue.includes(condition.value);
        // ... 他の演算子
      }
    });
  });
}
```

## API セキュリティ

### レート制限

エンドポイント別の詳細なレート制限：

```typescript
const rateLimitConfig = {
  // グローバル設定
  global: {
    windowMs: 15 * 60 * 1000,
    max: 1000
  },
  
  // エンドポイント別設定
  endpoints: {
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000,
      max: 5,
      skipSuccessfulRequests: false,
      keyGenerator: (req) => req.ip + req.body.email
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000,
      max: 3,
      skipFailedRequests: false
    },
    '/api/data/export': {
      windowMs: 24 * 60 * 60 * 1000,
      max: 10,
      costFunction: (req) => req.body.recordCount / 1000
    }
  }
};
```

### 入力検証

包括的な入力検証：

```typescript
const validationRules = {
  email: {
    type: 'string',
    format: 'email',
    maxLength: 255,
    transform: (val) => val.toLowerCase().trim(),
    sanitize: true
  },
  
  phone: {
    type: 'string',
    pattern: /^\+?[1-9]\d{1,14}$/,
    transform: (val) => val.replace(/\D/g, '')
  },
  
  ssn: {
    type: 'string',
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    mask: true,
    encrypt: true
  },
  
  htmlContent: {
    type: 'string',
    sanitize: {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        'a': ['href']
      },
      allowedSchemes: ['http', 'https']
    }
  }
};
```

### CORS設定

セキュアなCORS設定：

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    // 許可されたオリジンのリスト
    const allowedOrigins = [
      'https://app.example.com',
      'https://admin.example.com'
    ];
    
    // 開発環境でのみlocalhost許可
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Remaining'],
  maxAge: 86400 // 24時間
};
```

## 監視とインシデント対応

### セキュリティイベントの検出

異常パターンの検出ルール：

```typescript
const securityRules = [
  {
    name: 'brute_force_attack',
    condition: (events) => {
      const failedLogins = events.filter(e => 
        e.action === 'LOGIN_FAILED' &&
        e.timestamp > Date.now() - 15 * 60 * 1000
      );
      return failedLogins.length > 5;
    },
    severity: 'high',
    response: 'block_ip'
  },
  
  {
    name: 'data_exfiltration',
    condition: (events) => {
      const exports = events.filter(e =>
        e.action === 'DATA_EXPORT' &&
        e.timestamp > Date.now() - 60 * 60 * 1000
      );
      const totalSize = exports.reduce((sum, e) => sum + e.size, 0);
      return totalSize > 1000000000; // 1GB
    },
    severity: 'critical',
    response: 'alert_and_suspend'
  },
  
  {
    name: 'privilege_escalation',
    condition: (events) => {
      return events.some(e =>
        e.action === 'PERMISSION_CHANGED' &&
        e.details.newRole === 'admin' &&
        e.userId !== e.targetUserId
      );
    },
    severity: 'critical',
    response: 'immediate_alert'
  }
];
```

### インシデント対応計画

自動化されたインシデント対応：

```typescript
class IncidentResponse {
  async handleIncident(incident: SecurityIncident) {
    // 1. 即座の封じ込め
    await this.contain(incident);
    
    // 2. 証拠の保全
    await this.preserveEvidence(incident);
    
    // 3. 影響範囲の特定
    const impact = await this.assessImpact(incident);
    
    // 4. 通知
    await this.notify(incident, impact);
    
    // 5. 修復
    await this.remediate(incident);
    
    // 6. 事後分析
    await this.postmortem(incident);
  }
  
  private async contain(incident: SecurityIncident) {
    switch (incident.type) {
      case 'account_compromise':
        await this.suspendAccount(incident.userId);
        await this.revokeAllSessions(incident.userId);
        break;
        
      case 'data_breach':
        await this.blockDataAccess(incident.affectedResources);
        await this.rotateAffectedKeys();
        break;
        
      case 'ddos_attack':
        await this.enableDDoSProtection();
        await this.scaleResources();
        break;
    }
  }
}
```

## コンプライアンス

### HIPAA準拠

医療データ保護のための実装：

```typescript
const hipaaCompliance = {
  // アクセス制御
  accessControl: {
    uniqueUserIdentification: true,
    automaticLogoff: 15 * 60 * 1000,
    encryptionDecryption: true
  },
  
  // 監査ログ
  auditControls: {
    logUserActivity: true,
    logFileAccess: true,
    examineActivityLogs: true,
    retentionPeriod: 6 * 365 * 24 * 60 * 60 * 1000 // 6年
  },
  
  // 完全性
  integrity: {
    phiAlteration: 'prevent',
    transmissionSecurity: 'encrypt'
  },
  
  // 暗号化
  encryption: {
    atRest: true,
    inTransit: true,
    algorithm: 'AES-256-GCM'
  }
};
```

### GDPR準拠

個人データ保護の実装：

```typescript
const gdprCompliance = {
  // データ主体の権利
  dataSubjectRights: {
    access: async (userId) => {
      return await exportUserData(userId);
    },
    
    rectification: async (userId, updates) => {
      return await updateUserData(userId, updates);
    },
    
    erasure: async (userId) => {
      return await deleteUserData(userId, {
        preserveAnonymized: true
      });
    },
    
    portability: async (userId) => {
      return await exportUserData(userId, {
        format: 'json',
        machineReadable: true
      });
    }
  },
  
  // 同意管理
  consentManagement: {
    recordConsent: true,
    granularOptions: true,
    easyWithdrawal: true,
    ageVerification: true
  },
  
  // データ保護
  dataProtection: {
    privacyByDesign: true,
    dataMinimization: true,
    purposeLimitation: true,
    storageL