# 技術要件仕様書

## コーディング規約
- TypeScript strict mode 必須
- 関数コンポーネント使用（クラスコンポーネント禁止）
- カスタムフックでロジック分離
- エラーバウンダリ実装必須

## 命名規則
- コンポーネント: PascalCase
- 関数: camelCase
- 定数: UPPER_SNAKE_CASE
- 型/インターフェース: PascalCase with I/T prefix

## ディレクトリ構造規則
src/
  components/   # UIコンポーネント
  hooks/        # カスタムフック
  services/     # API通信
  stores/       # Zustand stores
  types/        # 型定義
  utils/        # ユーティリティ

## パフォーマンス要件
- LCP: 2.5秒以内
- FID: 100ms以内
- CLS: 0.1以内
