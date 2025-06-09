# 🛒 ECサイト サンプル

Secure Toolkitを使用したECサイトの実装例です。

## 🎯 デモする機能

- ✅ 顧客認証とアカウント管理
- ✅ 決済情報の暗号化
- ✅ PCI DSS準拠のセキュリティ
- ✅ 購入履歴の監査ログ
- ✅ GDPR対応のプライバシー管理

## 🚀 実行方法

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

## 🏗️ プロジェクト構造

```
ecommerce-app/
├── src/
│   ├── App.js              # メインアプリケーション
│   ├── components/         # UIコンポーネント
│   │   ├── ProductCard.js  # 商品カード
│   │   ├── Cart.js         # ショッピングカート
│   │   ├── Checkout.js     # チェックアウト
│   │   └── OrderHistory.js # 注文履歴
│   ├── pages/             # ページコンポーネント
│   │   ├── Shop.js        # ショップページ
│   │   ├── Account.js     # アカウントページ
│   │   └── Admin.js       # 管理画面
│   └── config.js          # セキュリティ設定
├── package.json
└── README.md
```

## 💡 主な実装ポイント

### 1. 決済情報の暗号化

```javascript
const { encrypt } = useEncryption();

// クレジットカード情報を暗号化
const processPayment = async (cardInfo) => {
  const encryptedCard = await encrypt(cardInfo);
  // 暗号化された情報のみをサーバーに送信
  await api.processPayment(encryptedCard);
};
```

### 2. PCI DSS準拠

```javascript
// カード番号のマスキング
const maskCardNumber = (number) => {
  return number.replace(/\d(?=\d{4})/g, '*');
};

// セキュアな入力フィールド
<EncryptedField
  type="creditcard"
  onChange={handleCardChange}
  placeholder="カード番号"
/>
```

### 3. 購入監査

```javascript
const { logAction } = useAuditLog();

// 購入を記録
await logAction({
  action: 'PURCHASE_COMPLETE',
  target: orderId,
  details: {
    items: cart.items.length,
    total: cart.total,
    paymentMethod: 'card'
  }
});
```

### 4. GDPR対応

```javascript
// データエクスポート
const exportUserData = async () => {
  const data = await getUserData();
  const encrypted = await encrypt(JSON.stringify(data));
  downloadFile('my-data.json', encrypted);
};

// アカウント削除
<DataPrivacySettings
  onDeleteAccount={handleAccountDeletion}
  onExportData={exportUserData}
/>
```

## 🎨 カスタマイズ

`src/config.js`でECサイト向けの設定を調整：

```javascript
export const ecommerceConfig = {
  security: {
    level: 'high',              // ECサイトは高セキュリティ
    pciCompliance: true,        // PCI DSS準拠モード
    fraudDetection: true        // 不正検知
  },
  features: {
    guestCheckout: true,        // ゲスト購入
    savedCards: true,           // カード情報保存
    wishlist: true,             // お気に入り
    reviews: true               // レビュー機能
  }
};
```