/**
 * アプリケーションのE2Eテスト
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

const TEST_FACILITY = {
  facility_name: 'E2Eテスト施設',
  business_type: 'レストラン',
  address: '東京都渋谷区',
  phone: '03-1234-5678',
  business_hours: '10:00-22:00',
  closed_days: '月曜日',
  official_site_url: 'https://example.com',
  gbp_url: 'https://maps.google.com/example',
  additional_info: '駐車場あり'
};

test.describe('キーワード自動提案Webアプリ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });
  
  test('ログインページが表示されること', async ({ page }) => {
    await expect(page).toHaveTitle(/キーワード自動提案/);
    await expect(page.getByRole('heading', { name: /ログイン/ })).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
    await expect(page.getByRole('button', { name: /ログイン/ })).toBeVisible();
  });
  
  test('ログインが成功すること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/ようこそ/)).toBeVisible();
  });
  
  test('施設一覧が表示されること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('link', { name: /施設一覧/ }).click();
    
    await expect(page).toHaveURL(/\/facilities/);
    await expect(page.getByRole('heading', { name: /施設一覧/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /新規施設登録/ })).toBeVisible();
  });
  
  test('施設を新規登録できること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('link', { name: /施設一覧/ }).click();
    
    await page.getByRole('button', { name: /新規施設登録/ }).click();
    
    await expect(page).toHaveURL(/\/facilities\/new/);
    await expect(page.getByRole('heading', { name: /新規施設登録/ })).toBeVisible();
    
    await page.getByLabel(/施設名/).fill(TEST_FACILITY.facility_name);
    await page.getByLabel(/業種/).fill(TEST_FACILITY.business_type);
    await page.getByLabel(/住所/).fill(TEST_FACILITY.address);
    await page.getByLabel(/電話番号/).fill(TEST_FACILITY.phone);
    await page.getByLabel(/営業時間/).fill(TEST_FACILITY.business_hours);
    await page.getByLabel(/定休日/).fill(TEST_FACILITY.closed_days);
    await page.getByLabel(/公式サイトURL/).fill(TEST_FACILITY.official_site_url);
    await page.getByLabel(/Google Business ProfileのURL/).fill(TEST_FACILITY.gbp_url);
    await page.getByLabel(/追加情報/).fill(TEST_FACILITY.additional_info);
    
    await page.getByRole('button', { name: /保存/ }).click();
    
    await expect(page).toHaveURL(/\/facilities/);
    
    await expect(page.getByText(TEST_FACILITY.facility_name)).toBeVisible();
  });
  
  test('施設を編集できること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('link', { name: /施設一覧/ }).click();
    
    await page.getByText(TEST_FACILITY.facility_name)
      .locator('..')
      .locator('..')
      .getByRole('button', { name: /編集/ })
      .click();
    
    await expect(page.getByRole('heading', { name: /施設編集/ })).toBeVisible();
    
    const updatedName = `${TEST_FACILITY.facility_name} (更新)`;
    await page.getByLabel(/施設名/).fill(updatedName);
    
    await page.getByRole('button', { name: /保存/ }).click();
    
    await expect(page).toHaveURL(/\/facilities/);
    
    await expect(page.getByText(updatedName)).toBeVisible();
  });
  
  test('キーワードを生成できること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('link', { name: /キーワード生成/ }).click();
    
    await expect(page).toHaveURL(/\/keywords/);
    await expect(page.getByRole('heading', { name: /キーワード生成/ })).toBeVisible();
    
    const updatedName = `${TEST_FACILITY.facility_name} (更新)`;
    await page.getByLabel(/施設を選択/).selectOption({ label: updatedName });
    
    await page.getByRole('button', { name: /キーワード生成/ }).click();
    
    await expect(page.getByText(/生成中/)).toBeVisible();
    
    await expect(page.getByText(/メニュー・サービス/)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/環境・設備/)).toBeVisible();
    await expect(page.getByText(/おすすめシーン/)).toBeVisible();
    
    await expect(page.locator('.keyword-item')).toHaveCount({ min: 1 });
  });
  
  test('キーワードを編集して保存できること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('link', { name: /キーワード生成/ }).click();
    
    const updatedName = `${TEST_FACILITY.facility_name} (更新)`;
    await page.getByLabel(/施設を選択/).selectOption({ label: updatedName });
    
    await expect(page.getByText(/メニュー・サービス/)).toBeVisible({ timeout: 10000 });
    
    await page.getByText(/メニュー・サービス/).locator('..').getByRole('button', { name: /追加/ }).click();
    await page.getByPlaceholder(/新しいキーワード/).fill('E2Eテスト用キーワード');
    await page.getByRole('button', { name: /確定/ }).click();
    
    await expect(page.getByText('E2Eテスト用キーワード')).toBeVisible();
    
    await page.getByRole('button', { name: /保存/ }).click();
    
    await expect(page.getByText(/保存しました/)).toBeVisible();
    
    await page.reload();
    
    await page.getByLabel(/施設を選択/).selectOption({ label: updatedName });
    
    await expect(page.getByText('E2Eテスト用キーワード')).toBeVisible({ timeout: 10000 });
  });
  
  test('キーワードをエクスポートできること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('link', { name: /キーワード生成/ }).click();
    
    const updatedName = `${TEST_FACILITY.facility_name} (更新)`;
    await page.getByLabel(/施設を選択/).selectOption({ label: updatedName });
    
    await expect(page.getByText(/メニュー・サービス/)).toBeVisible({ timeout: 10000 });
    
    await page.getByRole('button', { name: /CSVエクスポート/ }).click();
    
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('.csv');
    
    await page.getByRole('button', { name: /JSONエクスポート/ }).click();
    
    const jsonDownload = await page.waitForEvent('download');
    expect(jsonDownload.suggestedFilename()).toContain('.json');
  });
  
  test('ログアウトができること', async ({ page }) => {
    await page.getByLabel(/メールアドレス/).fill(TEST_EMAIL);
    await page.getByLabel(/パスワード/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ログイン/ }).click();
    
    await page.getByRole('button', { name: /ログアウト/ }).click();
    
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /ログイン/ })).toBeVisible();
  });
});
