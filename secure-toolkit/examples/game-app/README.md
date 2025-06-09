# 🎮 ゲームアプリ サンプル

Secure Toolkitを使用したゲームアプリケーションの実装例です。

## 🎯 デモする機能

- ✅ プレイヤー認証とプロフィール管理
- ✅ セーブデータの暗号化（チート対策）
- ✅ スコアボードの改ざん防止
- ✅ ゲーム内アイテムの安全な管理
- ✅ プレイヤー行動の監査ログ

## 🚀 実行方法

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

## 🏗️ プロジェクト構造

```
game-app/
├── src/
│   ├── App.js              # メインアプリケーション
│   ├── components/         # UIコンポーネント
│   │   ├── Game.js         # ゲーム本体
│   │   ├── Leaderboard.js  # リーダーボード
│   │   ├── Profile.js      # プレイヤープロフィール
│   │   └── Shop.js         # アイテムショップ
│   ├── pages/             # ページコンポーネント
│   │   ├── Home.js        # ホーム画面
│   │   ├── Play.js        # ゲームプレイ
│   │   └── Settings.js    # 設定画面
│   ├── game/             # ゲームロジック
│   │   ├── GameEngine.js  # ゲームエンジン
│   │   └── SaveManager.js # セーブ管理
│   └── config.js          # セキュリティ設定
├── package.json
└── README.md
```

## 💡 主な実装ポイント

### 1. セーブデータの暗号化

```javascript
const { encrypt, decrypt } = useEncryption();

// セーブデータをチート対策として暗号化
const saveGame = async (gameState) => {
  // チェックサムを追加
  const saveData = {
    ...gameState,
    checksum: calculateChecksum(gameState),
    timestamp: Date.now()
  };
  
  const encrypted = await encrypt(JSON.stringify(saveData));
  localStorage.setItem('gamesave', encrypted);
};
```

### 2. スコアの改ざん防止

```javascript
// スコア送信時に検証データを含める
const submitScore = async (score) => {
  const verificationData = {
    score,
    playTime: getPlayTime(),
    actions: getActionLog(),
    checksum: generateScoreChecksum(score)
  };
  
  await api.submitScore(verificationData);
};
```

### 3. アイテム管理

```javascript
// アイテム購入の安全な処理
const purchaseItem = async (itemId, price) => {
  await logAction({
    action: 'ITEM_PURCHASE',
    target: itemId,
    details: { price, currency: 'coins' }
  });
  
  // アイテムデータを暗号化して保存
  const inventory = await getEncryptedInventory();
  inventory.push(itemId);
  await saveEncryptedInventory(inventory);
};
```

### 4. アンチチート

```javascript
// ゲームステートの整合性チェック
const validateGameState = (state) => {
  const expectedChecksum = calculateChecksum(state);
  return state.checksum === expectedChecksum;
};

// 不正な操作を検知
if (!validateGameState(loadedState)) {
  await logAction({
    action: 'CHEAT_DETECTED',
    severity: 'high',
    details: { type: 'save_tampering' }
  });
}
```

## 🎨 カスタマイズ

`src/config.js`でゲーム向けの設定：

```javascript
export const gameConfig = {
  security: {
    antiCheat: true,           // アンチチート有効
    encryptSaves: true,        // セーブ暗号化
    validateScores: true       // スコア検証
  },
  features: {
    multiplayer: true,         // マルチプレイヤー
    leaderboards: true,        // リーダーボード
    achievements: true,        // 実績システム
    inAppPurchase: false       // アプリ内課金
  },
  game: {
    maxLevel: 100,            // 最大レベル
    startingLives: 3,         // 初期ライフ
    difficultyModes: ['easy', 'normal', 'hard']
  }
};
```