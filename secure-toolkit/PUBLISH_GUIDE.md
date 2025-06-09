# 📦 Secure Toolkit NPMパッケージ公開ガイド

このガイドでは、Secure ToolkitをNPMパッケージとして公開する手順を説明します。

## 📋 公開前チェックリスト

### 1. コード準備
- [ ] すべてのTypeScriptエラーが解決済み
- [ ] ESLintエラーが解決済み
- [ ] テストがすべてパス
- [ ] 不要なconsole.logが削除済み
- [ ] 機密情報（APIキー等）が含まれていない

### 2. ドキュメント
- [ ] README.mdが完成
- [ ] APIドキュメントが最新
- [ ] ライセンスファイルが存在
- [ ] CHANGELOGが更新済み

### 3. パッケージ設定
- [ ] package.jsonの情報が正確
- [ ] バージョン番号が適切
- [ ] 依存関係が最小限
- [ ] ビルド設定が正しい

## 🚀 公開手順

### ステップ1: NPMアカウント作成

```bash
# NPMアカウントがない場合は作成
npm adduser
```

### ステップ2: 組織の作成（オプション）

```bash
# @your-org スコープを使用する場合
# npmjs.comで組織を作成
```

### ステップ3: ローカルでビルド

```bash
cd secure-toolkit

# クリーンビルド
rm -rf dist/
npm run build

# ビルド結果を確認
ls -la dist/
```

### ステップ4: ローカルテスト

```bash
# パッケージをローカルでテスト
npm link

# 別のプロジェクトでテスト
cd ../test-project
npm link @your-org/secure-toolkit

# 動作確認
npm start
```

### ステップ5: パッケージ内容確認

```bash
# 公開されるファイルを確認
npm pack --dry-run

# パッケージサイズを確認
npm pack
ls -lh *.tgz
```

### ステップ6: バージョン更新

```bash
# セマンティックバージョニングに従って更新
# パッチリリース (バグ修正)
npm version patch

# マイナーリリース (機能追加)
npm version minor

# メジャーリリース (破壊的変更)
npm version major
```

### ステップ7: 公開

```bash
# ドライラン（実際には公開しない）
npm publish --dry-run

# 実際に公開
npm publish

# スコープ付きパッケージを公開する場合
npm publish --access public
```

## 📝 package.json設定例

```json
{
  "name": "@your-org/secure-toolkit",
  "version": "1.0.0",
  "description": "包括的なセキュリティツールキット",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/secure-toolkit.git"
  },
  "keywords": [
    "security",
    "authentication",
    "encryption",
    "react",
    "typescript"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/your-org/secure-toolkit/issues"
  },
  "homepage": "https://github.com/your-org/secure-toolkit#readme"
}
```

## 🔄 更新とメンテナンス

### バージョン管理

```bash
# 現在のバージョンを確認
npm version

# プレリリース版
npm version prerelease --preid=beta
# 結果: 1.0.0 → 1.0.1-beta.0

# 正式リリース
npm version patch
# 結果: 1.0.1-beta.0 → 1.0.1
```

### 自動化スクリプト

`package.json`に追加：

```json
{
  "scripts": {
    "prepublishOnly": "npm run test && npm run build",
    "postpublish": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}
```

## 🛡️ セキュリティ考慮事項

### 1. 機密情報の除外

`.npmignore`ファイル：

```
# 開発用ファイル
src/
tests/
examples/
docs/

# 設定ファイル
.env*
.gitignore
.eslintrc*
tsconfig.json
rollup.config.js

# その他
*.log
node_modules/
coverage/
.DS_Store
```

### 2. 依存関係の監査

```bash
# セキュリティ脆弱性をチェック
npm audit

# 自動修正
npm audit fix
```

### 3. 2要素認証

NPMアカウントで2FAを有効化：

```bash
npm profile enable-2fa
```

## 📊 公開後の確認

### 1. NPMレジストリで確認

```bash
# パッケージ情報を確認
npm view @your-org/secure-toolkit

# 特定のバージョンを確認
npm view @your-org/secure-toolkit@1.0.0
```

### 2. インストールテスト

```bash
# 新しいプロジェクトでインストール
mkdir test-install
cd test-install
npm init -y
npm install @your-org/secure-toolkit
```

### 3. 使用統計

```bash
# ダウンロード数を確認
npm view @your-org/secure-toolkit downloads
```

## 🚨 トラブルシューティング

### よくある問題

1. **402 Payment Required**
   - プライベートパッケージとして公開しようとしている
   - 解決: `npm publish --access public`

2. **403 Forbidden**
   - 認証エラーまたは権限不足
   - 解決: `npm login`で再ログイン

3. **E404 Not Found**
   - スコープが存在しない
   - 解決: npmjs.comで組織を作成

4. **Package name too similar**
   - 既存パッケージと名前が似すぎている
   - 解決: より具体的な名前に変更

## 📅 リリースサイクル

### 推奨スケジュール

- **パッチリリース**: バグ修正があれば即座に
- **マイナーリリース**: 2-4週間ごと
- **メジャーリリース**: 3-6ヶ月ごと

### リリースノート例

```markdown
## v1.1.0 (2024-01-15)

### 新機能
- 音声認証サポートを追加
- 新しいプリセット「政府機関向け」を追加

### 改善
- 暗号化パフォーマンスを30%向上
- TypeScript型定義を改善

### バグ修正
- セッションタイムアウトの計算エラーを修正
- 特定の環境でのビルドエラーを修正

### 破壊的変更
- なし
```

## 🎉 公開完了後

1. **アナウンス**
   - GitHubにリリースノートを作成
   - ソーシャルメディアで告知
   - ユーザーコミュニティに通知

2. **モニタリング**
   - GitHub Issuesを監視
   - npm週間ダウンロード数を確認
   - ユーザーフィードバックを収集

3. **次期バージョン計画**
   - 機能リクエストの整理
   - ロードマップの更新
   - 開発スケジュールの策定

---

🚀 Secure Toolkitの公開準備が整いました！
質問がある場合は、GitHubのIssuesでお問い合わせください。