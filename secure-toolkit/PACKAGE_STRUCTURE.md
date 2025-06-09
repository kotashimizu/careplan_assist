# 📦 Secure Toolkit パッケージ構造

## ディレクトリ構造

```
secure-toolkit/
├── src/                      # ソースコード
│   ├── index.ts             # メインエクスポート
│   ├── providers/           # Reactプロバイダー
│   │   ├── SecureProvider.tsx
│   │   ├── AuthProvider.tsx
│   │   └── TenantProvider.tsx
│   │
│   ├── hooks/               # React Hooks
│   │   ├── useAuth.ts
│   │   ├── useEncryption.ts
│   │   ├── useTenantConfig.ts
│   │   └── useAuditLog.ts
│   │
│   ├── components/          # UIコンポーネント
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── security/
│   │   │   ├── SecurityBadge.tsx
│   │   │   └── PasswordStrengthIndicator.tsx
│   │   ├── tenant/
│   │   │   ├── TenantConfigPanel.tsx
│   │   │   └── SetupWizard.tsx
│   │   └── privacy/
│   │       ├── ConsentBanner.tsx
│   │       └── DataPrivacySettings.tsx
│   │
│   ├── services/            # ビジネスロジック
│   │   ├── authService.ts
│   │   ├── cryptoService.ts
│   │   ├── tenantConfigManager.ts
│   │   ├── auditLogService.ts
│   │   └── configConflictChecker.ts
│   │
│   ├── types/               # TypeScript型定義
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── tenant.ts
│   │   ├── encryption.ts
│   │   └── audit.ts
│   │
│   ├── utils/               # ユーティリティ
│   │   ├── secureStorage.ts
│   │   ├── passwordValidator.ts
│   │   ├── sanitizer.ts
│   │   └── ipValidator.ts
│   │
│   ├── constants/           # 定数
│   │   ├── security.ts
│   │   ├── errorMessages.ts
│   │   └── compliance.ts
│   │
│   └── config/              # 設定
│       └── presets.ts
│
├── dist/                    # ビルド後のファイル
│   ├── index.js            # CommonJS
│   ├── index.esm.js        # ES Modules
│   └── index.d.ts          # TypeScript定義
│
├── examples/                # 使用例
│   ├── basic-app/          # 基本的な使い方
│   ├── blog-app/           # ブログアプリ
│   ├── game-app/           # ゲームアプリ
│   └── ecommerce-app/      # ECサイト
│
├── docs/                    # ドキュメント
│   ├── GUIDE.md            # 詳細ガイド
│   ├── API.md              # APIリファレンス
│   ├── MIGRATION.md        # 移行ガイド
│   └── SECURITY.md         # セキュリティガイド
│
├── tests/                   # テスト
│   ├── unit/               # ユニットテスト
│   ├── integration/        # 統合テスト
│   └── e2e/                # E2Eテスト
│
├── package.json            # パッケージ設定
├── tsconfig.json           # TypeScript設定
├── rollup.config.js        # ビルド設定
├── jest.config.js          # テスト設定
├── .eslintrc.js            # Lint設定
├── .gitignore              # Git除外設定
├── LICENSE                 # ライセンス
└── README.md               # メインドキュメント
```

## 各ディレクトリの役割

### `/src/providers/`
Reactアプリケーション全体を包むプロバイダーコンポーネント。認証状態、テナント設定、セキュリティコンテキストを提供。

### `/src/hooks/`
React Hooksの集まり。各機能に簡単にアクセスできるインターフェース。

### `/src/components/`
再利用可能なUIコンポーネント。認証フォーム、セキュリティ表示、設定パネルなど。

### `/src/services/`
ビジネスロジックとAPI通信を担当。UIから独立して使用可能。

### `/src/types/`
TypeScriptの型定義。型安全な開発をサポート。

### `/src/utils/`
汎用的なユーティリティ関数。バリデーション、サニタイズ、ストレージ操作など。

### `/src/constants/`
アプリケーション全体で使用する定数。エラーメッセージ、セキュリティレベル、コンプライアンス基準など。

### `/src/config/`
設定関連のファイル。業界別プリセットなど。

## モジュールの依存関係

```
components
    ↓
  hooks
    ↓
 services
    ↓
  utils
```

- **components**: hooksを使用
- **hooks**: servicesを使用
- **services**: utilsを使用
- **utils**: 他に依存しない

## ビルドとパブリッシュ

### ビルド
```bash
npm run build
```

### ローカルテスト
```bash
npm link
# 別のプロジェクトで
npm link @your-org/secure-toolkit
```

### パブリッシュ
```bash
npm publish
```

## 使用者向けの構造

パッケージをインストールした開発者は、以下のように使用できます：

```javascript
// 名前付きインポート
import { useAuth, useEncryption } from '@your-org/secure-toolkit';

// デフォルトインポート
import SecureToolkit from '@your-org/secure-toolkit';
const { useAuth, useEncryption } = SecureToolkit;

// 個別インポート（Tree-shaking対応）
import { useAuth } from '@your-org/secure-toolkit/hooks';
import { cryptoService } from '@your-org/secure-toolkit/services';
```