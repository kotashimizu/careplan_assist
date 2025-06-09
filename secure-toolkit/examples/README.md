# 📚 Secure Toolkit サンプルアプリケーション

このディレクトリには、Secure Toolkitの使用例として3つの異なるタイプのアプリケーションが含まれています。

## 🎯 サンプルアプリケーション一覧

### 1. 📝 ブログアプリ (`blog-app/`)
コンテンツ管理システムの実装例。認証、ロールベースアクセス制御、下書きの暗号化などを実装。

**主な機能:**
- 管理者・著者・読者の3つのロール
- 記事の下書き自動暗号化
- 操作履歴の監査ログ
- セキュアなコンテンツ管理

### 2. 🛒 ECサイト (`ecommerce-app/`)
オンラインショップの実装例。PCI DSS準拠のセキュリティ、決済情報の暗号化などを実装。

**主な機能:**
- 安全な決済処理
- 顧客データの暗号化
- GDPR対応のプライバシー管理
- 購入履歴の監査

### 3. 🎮 ゲームアプリ (`game-app/`)
オンラインゲームの実装例。チート対策、セーブデータの暗号化、スコアボード保護などを実装。

**主な機能:**
- セーブデータの暗号化（チート対策）
- スコアの改ざん防止
- アイテム管理のセキュリティ
- プレイヤー行動の監査

## 🚀 サンプルの実行方法

各サンプルアプリケーションを実行するには：

```bash
# 1. サンプルディレクトリに移動
cd blog-app    # または ecommerce-app、game-app

# 2. 依存関係をインストール
npm install

# 3. 開発サーバーを起動
npm start
```

## 📋 共通の実装パターン

### 初期設定
すべてのアプリで、初回起動時にセットアップウィザードが表示されます：

```javascript
<SetupWizard
  appType="blog"  // または "ecommerce", "game"
  onComplete={(config) => {
    // 設定を保存
    localStorage.setItem('app-config', JSON.stringify(config));
  }}
/>
```

### 認証の実装
```javascript
const { user, login, logout, isAuthenticated } = useAuth();

// ログイン状態に応じた表示
{isAuthenticated ? (
  <UserMenu user={user} onLogout={logout} />
) : (
  <LoginButton onClick={login} />
)}
```

### データの暗号化
```javascript
const { encrypt, decrypt } = useEncryption();

// 機密データを暗号化して保存
const encrypted = await encrypt(sensitiveData);
localStorage.setItem('data', encrypted);

// 復号化して使用
const encrypted = localStorage.getItem('data');
const decrypted = await decrypt(encrypted);
```

### 監査ログの記録
```javascript
const { logAction } = useAuditLog();

// 重要なアクションを記録
await logAction({
  action: 'DATA_MODIFIED',
  target: itemId,
  details: { oldValue, newValue }
});
```

## 🎨 カスタマイズのヒント

### 1. 設定ファイルの活用
各アプリの `config.js` を編集して、セキュリティレベルや機能を調整できます。

### 2. UIテーマの変更
CSSやTailwindのクラスを変更して、独自のデザインに対応できます。

### 3. 機能の追加・削除
`useTenantConfig` フックを使用して、機能の有効/無効を動的に制御できます：

```javascript
const { isFeatureEnabled } = useTenantConfig();

{isFeatureEnabled('advancedFeature') && (
  <AdvancedFeature />
)}
```

## 📚 学習リソース

- **基本概念**: 各サンプルの `README.md` を参照
- **APIリファレンス**: `/docs/API.md` を参照
- **セキュリティガイド**: `/docs/SECURITY.md` を参照

## 🤝 次のステップ

1. **サンプルを動かしてみる**: まずは実際に動作を確認
2. **コードを読む**: 実装方法を理解
3. **カスタマイズ**: 自分のニーズに合わせて調整
4. **本番環境へ**: 学んだパターンを実際のプロジェクトに適用

## ❓ よくある質問

**Q: サンプルアプリのデータはどこに保存されますか？**
A: デモ用にローカルストレージを使用しています。本番環境では適切なバックエンドを使用してください。

**Q: 複数のサンプルを同時に実行できますか？**
A: はい、ポート番号を変えることで同時実行可能です。

**Q: サンプルコードを商用プロジェクトで使用できますか？**
A: はい、MITライセンスの下で自由に使用できます。

---

Happy Coding! 🚀