# 🎭 Playwright MCP 設定ガイド

## 📌 Playwright MCPとは？

**Playwright MCP**（Model Context Protocol）は、AIがブラウザを自動操作できるようにするツールです。

### できること
- 🌐 Webページの自動操作
- 📸 スクリーンショット撮影
- 🧪 E2Eテストの自動生成
- 📊 データの自動収集
- 📝 フォームの自動入力

## 🚀 セットアップ方法

### 1. VS Code / Windsurf の場合

#### 設定ファイルの作成
`.vscode/mcp.json` または Windsurf の MCP設定に追加：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "env": {
        "BROWSER": "chromium",
        "HEADLESS": "false"
      }
    }
  }
}
```

#### オプション設定
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"],
      "env": {
        "BROWSER": "chromium",  // chromium, firefox, webkit, msedge
        "HEADLESS": "true",     // ヘッドレスモード
        "PERSISTENT": "true"    // 永続プロファイル
      }
    }
  }
}
```

### 2. Claude Desktop の場合

#### 自動インストール（推奨）
```bash
npx @michaellatman/mcp-get@latest install @executeautomation/playwright-mcp-server
```

#### 手動設定
Claude Desktop の設定ファイルに追加：
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@executeautomation/playwright-mcp-server"]
    }
  }
}
```

## 💡 使い方の例

### 基本的な操作

```typescript
// AIへの指示例
「Playwrightを使って、Googleで'AI駆動開発'を検索してスクリーンショットを撮ってください」

「次のE2Eテストを作成してください：
1. ログインページを開く
2. メールとパスワードを入力
3. ログインボタンをクリック
4. ダッシュボードが表示されることを確認」
```

### 実装例

#### 1. スクリーンショット撮影
```typescript
import { chromium } from 'playwright';

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
}
```

#### 2. E2Eテスト
```typescript
import { test, expect } from '@playwright/test';

test('ユーザーログイン', async ({ page }) => {
  // ログインページに移動
  await page.goto('/login');
  
  // フォーム入力
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  
  // ログインボタンをクリック
  await page.click('button[type="submit"]');
  
  // ダッシュボードへのリダイレクトを確認
  await expect(page).toHaveURL('/dashboard');
});
```

#### 3. データ収集（スクレイピング）
```typescript
async function scrapeData() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://example.com/products');
  
  // 商品情報を取得
  const products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.product')).map(el => ({
      name: el.querySelector('.name')?.textContent,
      price: el.querySelector('.price')?.textContent,
      image: el.querySelector('img')?.src
    }));
  });
  
  console.log(products);
  await browser.close();
}
```

## 🎯 プロジェクトでの活用

### 1. テスト自動化
```bash
# テストディレクトリ作成
mkdir -p tests/e2e

# Playwrightをプロジェクトに追加
npm install -D @playwright/test

# テスト実行
npx playwright test
```

### 2. mise タスクとして追加
`.mise.toml` に追加：
```toml
[tasks.test-e2e]
description = "E2Eテストを実行"
run = "npx playwright test"

[tasks.test-ui]
description = "UIモードでテストを実行"
run = "npx playwright test --ui"

[tasks.test-debug]
description = "デバッグモードでテストを実行"
run = "npx playwright test --debug"
```

### 3. CI/CDでの利用
`.github/workflows/e2e-test.yml`:
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

## 🔧 トラブルシューティング

### ブラウザが起動しない
```bash
# 必要な依存関係をインストール
npx playwright install --with-deps
```

### ヘッドレスモードの切り替え
```typescript
// ヘッドレスモード（バックグラウンド実行）
const browser = await chromium.launch({ headless: true });

// ヘッドフルモード（ブラウザ表示）
const browser = await chromium.launch({ headless: false });
```

### セレクタが見つからない
```typescript
// より堅牢なセレクタを使用
await page.getByRole('button', { name: 'ログイン' }).click();
await page.getByLabel('メールアドレス').fill('test@example.com');
await page.getByTestId('submit-button').click();
```

## 📚 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Execute Automation Playwright MCP](https://github.com/executeautomation/mcp-playwright)

## 💡 AIへの指示例

```
「Playwrightを使って、ログイン機能のE2Eテストを作成してください」

「商品一覧ページから価格情報を自動収集するスクリプトを作成してください」

「フォーム送信の自動テストを作成して、エラーメッセージが正しく表示されることを確認してください」

「モバイルビューでのスクリーンショットを撮影してください」
```

---

**注意**: Playwright MCPを使用する際は、対象サイトの利用規約を確認し、適切に使用してください。