# 個別支援計画書モジュール

医療・福祉施設向けの個別支援計画書作成モジュールです。  
ローカル保存、クラウド保存、ハイブリッドモードに対応し、AI分析機能を搭載しています。

## 特徴

- 🔒 **プライバシーファースト**: ローカルのみでの動作が可能
- ☁️ **クラウド対応**: チーム共有やバックアップ機能
- 🤖 **AI分析**: テキストから自動的に項目を抽出
- 📄 **複数テンプレート**: 厚労省標準様式を含む複数のテンプレート
- 📱 **レスポンシブ**: モバイル・タブレット対応

## インストール

```bash
npm install @carecheck/support-plan-module
```

## 基本的な使い方

### 1. ローカルモード（プライバシー重視）

```typescript
import { createSupportPlanService } from '@carecheck/support-plan-module';

// ローカルのみで動作するサービスを作成
const service = createSupportPlanService({
  mode: 'local',
  ai: {
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY
  }
});

// テンプレートを登録
await service.registerTemplate(MHLW_TEMPLATE);

// テキストをAI分析
const analysisResult = await service.analyze(
  '利用者の田中さんは、日中活動を通じて社会参加を希望しています...',
  'mhlw-standard'
);

// 支援計画書を作成
const plan = await service.create({
  templateId: 'mhlw-standard',
  values: analysisResult.data
});

// ローカルに保存（ブラウザのlocalStorage）
await service.save(plan);
```

### 2. オンラインモード（チーム共有）

```typescript
import { SupportPlanService, SupabaseAdapter } from '@carecheck/support-plan-module';

// オンラインモードで動作
const service = new SupportPlanService({
  mode: 'online',
  storage: {
    adapter: new SupabaseAdapter({
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY
    })
  },
  ai: {
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY
  }
});

// 作成した計画書はクラウドに保存される
const plan = await service.create({
  templateId: 'simple',
  values: { /* ... */ }
});

// チームメンバーも同じ計画書にアクセス可能
const sharedPlan = await service.load(plan.id);
```

### 3. ハイブリッドモード（柔軟な運用）

```typescript
import { 
  SupportPlanService, 
  LocalStorageAdapter,
  SupabaseAdapter,
  HybridStorageAdapter 
} from '@carecheck/support-plan-module';

// ハイブリッドモードの設定
const service = new SupportPlanService({
  mode: 'hybrid',
  storage: {
    adapter: new HybridStorageAdapter(
      new LocalStorageAdapter(),
      new SupabaseAdapter(supabaseConfig)
    )
  }
});

// ユーザーが保存先を選択
const plan = await service.create({
  templateId: 'detailed',
  values: { /* ... */ },
  metadata: {
    storageMode: 'local' // または 'online'
  }
});
```

## React コンポーネントでの使用

```tsx
import React, { useState } from 'react';
import { createSupportPlanService } from '@carecheck/support-plan-module';

const SupportPlanCreator: React.FC = () => {
  const [service] = useState(() => createSupportPlanService({
    mode: 'local'
  }));
  
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await service.analyze(inputText, 'mhlw-standard');
      
      const plan = await service.create({
        templateId: 'mhlw-standard',
        values: result.data
      });
      
      await service.save(plan);
      alert('支援計画書を作成しました');
    } catch (error) {
      console.error('エラー:', error);
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <div>
      <h2>個別支援計画書作成</h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="利用者情報を入力してください..."
        rows={10}
        cols={50}
      />
      <button onClick={handleAnalyze} disabled={analyzing}>
        {analyzing ? '分析中...' : 'AI分析して作成'}
      </button>
    </div>
  );
};
```

## API リファレンス

### SupportPlanService

メインのサービスクラスです。

#### メソッド

- `analyze(text: string, templateId: string): Promise<AnalysisResult>`  
  テキストをAI分析して、テンプレートに合わせたデータを抽出

- `create(data: CreatePlanData): Promise<SupportPlanData>`  
  新しい支援計画書を作成

- `save(data: SupportPlanData): Promise<void>`  
  支援計画書を保存

- `load(id: string): Promise<SupportPlanRecord | null>`  
  支援計画書を読み込み

- `list(): Promise<SupportPlanData[]>`  
  保存された支援計画書の一覧を取得

- `export(id: string, options: ExportOptions): Promise<Blob>`  
  支援計画書をエクスポート（PDF、Excel等）

### 設定オプション

```typescript
interface ModuleConfig {
  // 動作モード
  mode: 'local' | 'online' | 'hybrid';
  
  // ストレージ設定
  storage?: {
    adapter?: StorageAdapter;
    encryption?: boolean;
    autoSync?: boolean;
    retentionDays?: number;
  };
  
  // AI設定
  ai?: {
    provider: 'gemini' | 'openai' | 'anthropic';
    apiKey?: string;
    model?: string;
    temperature?: number;
  };
  
  // セキュリティ設定
  security?: {
    allowExport?: boolean;
    allowSharing?: boolean;
    requireAuth?: boolean;
  };
  
  // UI設定
  ui?: {
    theme?: 'light' | 'dark';
    language?: 'ja' | 'en';
    autoSave?: boolean;
  };
}
```

## テンプレートのカスタマイズ

独自のテンプレートを作成できます：

```typescript
const customTemplate: SupportPlanTemplate = {
  id: 'my-custom-template',
  name: 'カスタムテンプレート',
  description: '独自の項目を含むテンプレート',
  version: '1.0.0',
  fields: [
    {
      id: 'specialNeeds',
      name: 'specialNeeds',
      label: '特別な配慮事項',
      type: 'longtext',
      required: true,
      description: '特に配慮が必要な事項',
      tooltip: '医療的ケア、アレルギー等'
    }
    // ... その他のフィールド
  ]
};

await service.registerTemplate(customTemplate);
```

## プライバシーとセキュリティ

### ローカルモード
- データは**ブラウザのlocalStorageにのみ保存**
- 外部サーバーへの送信なし（AI分析時のテキストを除く）
- 設定した保持期間後に自動削除

### データの暗号化
```typescript
const service = createSupportPlanService({
  mode: 'local',
  storage: {
    encryption: true,
    encryptionKey: 'user-provided-key'
  }
});
```

### 監査ログ
```typescript
service.addEventListener((event) => {
  if (event.type === 'save' || event.type === 'export') {
    console.log('監査ログ:', event);
  }
});
```

## トラブルシューティング

### AI分析が動作しない
- APIキーが正しく設定されているか確認
- ネットワーク接続を確認
- フォールバックモードが有効になっているか確認

### ローカルストレージの容量不足
```typescript
// ストレージ情報の確認
const adapter = new LocalStorageAdapter();
const info = await adapter.getStorageInfo();
console.log(`使用量: ${info.percentage}%`);

// 古いデータのクリーンアップ
await service.cleanup();
```

## ライセンス

MIT License

## サポート

- GitHub Issues: https://github.com/carecheck/support-plan-module/issues
- Email: support@carecheck.com