# 保護対象ファイル・機能リスト

## このファイルについて
ユーザーが「完成・確定」と明示した機能やデザインを記録するファイルです。
AIは変更前に必ずこのリストを確認し、保護対象は変更しません。

## 使い方

### 保護する場合
AIに以下のように伝えてください：
```
「この機能/デザインは完成なので、保護リストに追加してください」
```

### 保護を解除する場合
変更したくなったら：
```
「○○機能の保護を解除して、変更してください」
「一時的に○○デザインを変更したいです。完了したら再度保護してください」
```

## 保護対象リスト

### 完成機能
<!-- 例：
- ログイン機能（src/components/Auth/Login.jsx）- 2024/XX/XX確定
- TODOリスト機能（src/components/Todo/）- 2024/XX/XX確定
-->

### 確定デザイン
<!-- 例：
- ヘッダーデザイン（src/components/Header.jsx）- 2024/XX/XX確定
- ダッシュボードレイアウト（src/pages/Dashboard.jsx）- 2024/XX/XX確定
-->

### 保護ファイル
<!-- 例：
- config/database.js - 設定完了
- public/logo.png - 確定ロゴ
-->

---

## 保護マークの使い方

コードに直接保護マークを付ける場合：

```html
<!-- PROTECTED: ユーザー確定済み - 変更禁止 -->
<header class="main-header">
  <!-- 確定したヘッダーデザイン -->
</header>
<!-- /PROTECTED -->
```

```javascript
// PROTECTED: ユーザー確定済み - 変更禁止
function loginUser(credentials) {
  // 完成したログイン機能
}
// /PROTECTED
```