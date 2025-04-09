/**
 * アプリケーションのE2Eテスト
 */

import { test, expect } from '@playwright/test';

test.describe('キーワード自動提案Webアプリ E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });
  
  test('ログインページが表示される', async ({ page }) => {
    await expect(page.locator('h2:has-text("ログイン")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible();
  });
  
  test('ログイン後に施設一覧ページに遷移する', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');
    
    await expect(page.locator('h1:has-text("施設一覧")')).toBeVisible();
  });
  
  test('新規施設を登録する', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');
    
    await page.click('a:has-text("新規施設登録")');
    
    await page.fill('input[name="facility_name"]', 'E2Eテスト施設');
    await page.fill('input[name="business_type"]', 'レストラン');
    await page.fill('input[name="address"]', '東京都渋谷区');
    await page.fill('input[name="phone"]', '03-1234-5678');
    await page.fill('input[name="email"]', 'e2e@example.com');
    
    await page.click('button:has-text("登録する")');
    
    await expect(page.locator('h1:has-text("施設一覧")')).toBeVisible();
    
    await expect(page.locator('td:has-text("E2Eテスト施設")')).toBeVisible();
  });
  
  test('キーワード生成ページでキーワードを生成する', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');
    
    await page.click('td:has-text("E2Eテスト施設")');
    
    await page.click('a:has-text("キーワード生成")');
    
    await expect(page.locator('h1:has-text("キーワード生成")')).toBeVisible();
    
    await page.click('button:has-text("キーワードを生成")');
    
    await expect(page.locator('.keyword-list')).toBeVisible();
    
    await page.click('button:has-text("保存")');
    
    await expect(page.locator('text=キーワードが保存されました')).toBeVisible();
  });
  
  test('CSVエクスポート機能を使用する', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("ログイン")');
    
    await page.click('td:has-text("E2Eテスト施設")');
    
    await page.click('a:has-text("キーワード生成")');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("CSVエクスポート")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('keywords_');
  });
});
