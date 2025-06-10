# テナント設定システム開発ガイド

## 概要
CareCheck Assistのテナント設定システムは、開発者がクライアントごとに機能や設定を簡単にカスタマイズできる仕組みです。

## クイックスタート

### 1. 基本的な使い方

```typescript
import { useTenantConfig } from '../hooks/useTenantConfig';

const MyComponent = () => {
  const { isFeatureEnabled, config } = useTenantConfig();
  
  // 機能の有効/無効をチェック
  if (!isFeatureEnabled('audioProcessing')) {
    return null; // 機能が無効なら表示しない
  }
  
  return <div>音声処理機能が有効です</div>;
};
```

### 2. 特定機能の設定を取得

```typescript
import { useAudioConfig } from '../hooks/useTenantConfig';

const AudioComponent = () => {
  const { isEnabled, maxFileSizeMB, retentionHours } = useAudioConfig();
  
  return (
    <div>
      最大ファイルサイズ: {maxFileSizeMB}MB
      保存期間: {retentionHours}時間
    </div>
  );
};
```

## 設定構造

### 主要な設定カテゴリ

1. **features** - 機能フラグ
   - authentication（認証）
   - encryption（暗号化）
   - audioProcessing（音声処理）
   - notifications（通知）
   - reporting（レポート）

2. **security** - セキュリティ設定
   - passwordPolicy（パスワードポリシー）
   - sessionTimeout（セッションタイムアウト）
   - rateLimit（レート制限）

3. **branding** - ブランディング
   - appName（アプリ名）
   - logo（ロゴ）
   - colors（カラー設定）

4. **ui** - UI/UX設定
   - theme（テーマ）
   - language（言語）
   - layout（レイアウト）

## 設定方法

### 方法1: 管理画面から設定（推奠）

1. 管理者ダッシュボードにアクセス
2. 「テナント設定」メニューを開く
3. GUI上で設定を変更
4. 「保存」ボタンをクリック

### 方法2: JSONファイルで設定

```json
// config/tenants/clinic-a.json
{
  "tenantId": "clinic-a",
  "tenantName": "○○クリニック",
  "industry": "healthcare",
  "features": {
    "audioProcessing": {
      "enabled": true,
      "whisperApiEnabled": true,
      "retentionHours": 48
    }
  }
}
```

### 方法3: 環境変数で設定

```bash
# .env.local
VITE_TENANT_CONFIG_MODE=env
VITE_FEATURE_AUDIO_PROCESSING=true
VITE_FEATURE_ENCRYPTION_LEVEL=maximum
```

### 方法4: プリセットを使用

```typescript
// 管理画面またはコードから
await tenantConfigManager.applyPreset('medical-clinic');
```

## 利用可能なプリセット

### 医療・介護系
- `medical-clinic` - 診療所・クリニック向け
- `care-facility` - 介護施設向け
- `home-care` - 訪問介護事業所向け

### その他の業界
- `school` - 学校・教育機関向け
- `financial` - 金融機関向け
- `general-business` - 一般企業向け
- `development` - 開発環境向け

## 実装パターン

### パターン1: 機能の条件付き表示

```typescript
const FeatureComponent = () => {
  const { isFeatureEnabled } = useTenantConfig();
  
  if (!isFeatureEnabled('reports.customReports')) {
    return <div>この機能は利用できません</div>;
  }
  
  return <CustomReportsComponent />;
};
```

### パターン2: 設定値の動的適用

```typescript
const ThemedComponent = () => {
  const { branding } = useTenantConfig();
  
  return (
    <div style={{ 
      backgroundColor: branding.primaryColor,
      color: branding.textColor 
    }}>
      {branding.appName}
    </div>
  );
};
```

### パターン3: セキュリティ要件の適用

```typescript
const SecureForm = () => {
  const { security } = useTenantConfig();
  
  const validatePassword = (password: string) => {
    if (password.length < security.passwordMinLength) {
      return `パスワードは${security.passwordMinLength}文字以上必要です`;
    }
    // その他の検証...
  };
};
```

## カスタムフック

### useAuthConfig
認証関連の設定を取得

```typescript
const { isMFAEnabled, providers, sessionTimeout } = useAuthConfig();
```

### useAudioConfig
音声処理関連の設定を取得

```typescript
const { isWhisperEnabled, maxFileSizeMB, retentionHours } = useAudioConfig();
```

### useEncryptionConfig
暗号化関連の設定を取得

```typescript
const { level, shouldEncryptPII, shouldEncryptFiles } = useEncryptionConfig();
```

### useComplianceConfig
コンプライアンス関連の設定を取得

```typescript
const { isHIPAAEnabled, requiresConsent, supportsRightToErasure } = useComplianceConfig();
```

## API リファレンス

### useTenantConfig

```typescript
const {
  // 設定データ
  config: TenantConfig,
  isLoading: boolean,
  error: string | null,
  
  // 機能チェック
  isFeatureEnabled: (featurePath: string) => boolean,
  getFeatureConfig: <T>(featurePath: string) => T | null,
  
  // 設定更新
  updateConfig: (updates: Partial<TenantConfig>) => Promise<void>,
  applyPreset: (presetId: string) => Promise<void>,
  
  // エクスポート/インポート
  exportConfig: () => string,
  importConfig: (configJson: string) => Promise<void>
} = useTenantConfig();
```

## ベストプラクティス

### 1. 機能フラグは細かく設定
```typescript
// ❌ 悪い例
if (config.features.enabled) { }

// ✅ 良い例
if (isFeatureEnabled('audioProcessing.whisperApiEnabled')) { }
```

### 2. デフォルト値を設定
```typescript
// ✅ 常にデフォルト値を用意
const maxSize = getFeatureConfig('audioProcessing.maxFileSizeMB') || 100;
```

### 3. 型安全性を保つ
```typescript
// ✅ ジェネリクスで型を指定
const authConfig = getFeatureConfig<AuthConfig>('authentication');
```

### 4. エラーハンドリング
```typescript
try {
  await updateConfig(newConfig);
} catch (error) {
  console.error('設定の更新に失敗しました', error);
}
```

## トラブルシューティング

### 設定が反映されない
1. ブラウザのキャッシュをクリア
2. LocalStorageを確認
3. 設定ソース（env/file/db）を確認

### 機能が表示されない
1. `isFeatureEnabled`の戻り値を確認
2. 設定のパスが正しいか確認
3. 親機能が有効になっているか確認

### プリセットが適用されない
1. プリセットIDが正しいか確認
2. 設定の検証エラーがないか確認
3. コンソールログを確認

## セキュリティ考慮事項

1. **APIキーは設定に含めない**
   - APIキーは環境変数で管理
   - テナント設定には含めない

2. **機密情報の扱い**
   - パスワードやトークンは保存しない
   - 個人情報は暗号化設定に従う

3. **権限チェック**
   - 管理者のみ設定変更可能
   - 適切なロールベースアクセス制御

## まとめ

テナント設定システムを使用することで：
- クライアントごとのカスタマイズが簡単
- 機能の有効/無効を柔軟に制御
- セキュリティ要件に応じた設定
- ブランディングの一元管理

詳細な実装例は `/components/examples/TenantAwareComponent.tsx` を参照してください。