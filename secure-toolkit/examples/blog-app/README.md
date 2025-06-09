# 📝 ブログアプリ サンプル

Secure Toolkitを使用したブログアプリケーションの実装例です。

## 🎯 デモする機能

- ✅ 認証（管理者・著者・読者）
- ✅ ロールベースアクセス制御
- ✅ 下書きの暗号化保存
- ✅ 監査ログ（記事の作成・編集・削除）
- ✅ プライバシー設定

## 🚀 実行方法

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm start
```

## 🏗️ プロジェクト構造

```
blog-app/
├── src/
│   ├── App.js           # メインアプリケーション
│   ├── components/      # UIコンポーネント
│   │   ├── Header.js    # ヘッダー（ログイン状態表示）
│   │   ├── Editor.js    # 記事エディター
│   │   ├── PostList.js  # 記事一覧
│   │   └── Post.js      # 記事表示
│   ├── pages/          # ページコンポーネント
│   │   ├── Home.js     # ホームページ
│   │   ├── Dashboard.js # 管理ダッシュボード
│   │   └── Settings.js  # 設定ページ
│   └── config.js       # セキュリティ設定
├── package.json
└── README.md
```

## 💡 主な実装ポイント

### 1. 認証とロール管理

```javascript
// 管理者のみアクセス可能
<ProtectedRoute role="admin">
  <AdminDashboard />
</ProtectedRoute>

// 著者以上のロールでアクセス可能
<ProtectedRoute role={['author', 'admin']}>
  <Editor />
</ProtectedRoute>
```

### 2. 下書きの暗号化

```javascript
const { encrypt, decrypt } = useEncryption();

// 自動保存時に暗号化
const saveDraft = async (content) => {
  const encrypted = await encrypt(content);
  localStorage.setItem(`draft-${postId}`, encrypted);
};
```

### 3. 監査ログ

```javascript
const { logAction } = useAuditLog();

// 記事の公開を記録
await logAction({
  action: 'PUBLISH_POST',
  target: postId,
  details: { title: post.title }
});
```

## 🎨 カスタマイズ

`src/config.js`を編集して、セキュリティレベルや機能を調整できます。

```javascript
export const blogConfig = {
  security: {
    sessionTimeout: 3600,      // 1時間
    requireMFA: false,         // 二要素認証
    encryptDrafts: true        // 下書き暗号化
  },
  features: {
    comments: true,            // コメント機能
    socialSharing: true,       // SNSシェア
    analytics: false           // アナリティクス
  }
};
```