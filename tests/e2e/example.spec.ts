import { test, expect } from '@playwright/test';

/**
 * 基本的なE2Eテストの例
 * 
 * このファイルはサンプルです。
 * あなたのアプリケーションに合わせて、テストを作成してください。
 */

test.describe('ホームページ', () => {
  test('ページが正しく表示される', async ({ page }) => {
    // ホームページに移動
    await page.goto('/');
    
    // タイトルが存在することを確認
    await expect(page).toHaveTitle(/AI駆動開発/);
    
    // 特定のテキストが表示されていることを確認
    // 注: あなたのアプリに合わせて変更してください
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});

test.describe('ナビゲーション', () => {
  test('メインナビゲーションが機能する', async ({ page }) => {
    await page.goto('/');
    
    // ナビゲーションリンクをクリック（例）
    // await page.getByRole('link', { name: 'About' }).click();
    // await expect(page).toHaveURL('/about');
  });
});

test.describe('フォーム操作の例', () => {
  test.skip('ログインフォーム', async ({ page }) => {
    // このテストはスキップされます（実装例として残しています）
    await page.goto('/login');
    
    // フォームに入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    
    // 送信ボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    // 成功後のリダイレクトを確認
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('レスポンシブデザイン', () => {
  test('モバイルビューで正しく表示される', async ({ page }) => {
    // ビューポートをモバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // モバイルメニューが表示されることを確認
    // const mobileMenu = page.getByRole('button', { name: 'メニュー' });
    // await expect(mobileMenu).toBeVisible();
  });
});

test.describe('スクリーンショット', () => {
  test('ページ全体のスクリーンショットを撮影', async ({ page }) => {
    await page.goto('/');
    
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // スクリーンショットを撮影
    await page.screenshot({ 
      path: 'tests/screenshots/homepage.png',
      fullPage: true 
    });
  });
});