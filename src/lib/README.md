# 📚 ライブラリ抽象化レイヤー

このディレクトリは、外部ライブラリへの依存を抽象化し、プロジェクトのスパゲッティ化を防ぐための重要な層です。

## 🎯 目的

1. **疎結合の実現** - ライブラリの変更が全体に影響しない
2. **統一インターフェース** - 一貫性のあるAPI提供
3. **テスタビリティ** - モックしやすい設計

## 📁 ディレクトリ構造

```
lib/
├── dependencies.ts    # 依存関係の一元管理
├── date-utils/       # 日付処理の抽象化
├── http-client/      # HTTPクライアントの抽象化
├── auth/            # 認証の抽象化
├── storage/         # ストレージの抽象化
└── validation/      # バリデーションの抽象化
```

## 🚀 使用例

### ❌ 悪い例（直接import）
```typescript
import { format } from 'date-fns'
import axios from 'axios'

const formattedDate = format(new Date(), 'yyyy-MM-dd')
const response = await axios.get('/api/users')
```

### ✅ 良い例（抽象化レイヤー経由）
```typescript
import { DateUtils } from '@/lib/date-utils'
import { httpClient } from '@/lib/http-client'

const formattedDate = DateUtils.format(new Date(), 'yyyy-MM-dd')
const response = await httpClient.get('/api/users')
```

## 📋 新しい抽象化レイヤーの追加方法

1. **インターフェースの定義**
```typescript
// lib/new-feature/types.ts
export interface NewFeatureAdapter {
  method1(param: string): Promise<Result>
  method2(options: Options): void
}
```

2. **実装の作成**
```typescript
// lib/new-feature/implementation.ts
import { ExternalLibrary } from 'external-library'

export class ExternalLibraryAdapter implements NewFeatureAdapter {
  method1(param: string): Promise<Result> {
    return ExternalLibrary.doSomething(param)
  }
}
```

3. **エクスポート**
```typescript
// lib/new-feature/index.ts
export * from './types'
export { adapter as newFeature } from './implementation'
```

## 🔍 健全性チェック

定期的に以下を確認してください：

```bash
# 依存関係の健全性チェック
npm run check:dependencies

# 未使用のexportを確認
npm run check:exports

# 循環依存をチェック
npm run check:circular
```

## ⚠️ 注意事項

1. **ライブラリ固有の型を漏らさない**
2. **過度な抽象化を避ける（YAGNI原則）**
3. **パフォーマンスを考慮する**