import { test, expect } from '@playwright/test';
import { BASE_URL, CREDENTIALS } from '../helpers/auth.helper';

test.describe('🔐 Authentication & Login Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // Skip landing page if present
    const getStarted = page.locator('button').filter({ hasText: /get started|enter|start/i }).first();
    if (await getStarted.isVisible({ timeout: 3000 }).catch(() => false)) {
      await getStarted.click();
    }
    await page.waitForSelector('text=Smart Gateway to Excellence', { timeout: 10000 });
  });

  test('TC-01: Landing / Portal selection page loads correctly', async ({ page }) => {
    await expect(page.locator('text=Smart Gateway to Excellence')).toBeVisible();
    await expect(page.locator('text=Student')).toBeVisible();
    await expect(page.locator('text=Teacher')).toBeVisible();
    await expect(page.locator('text=Parent')).toBeVisible();
    await expect(page.locator('text=Principal')).toBeVisible();
  });

  test('TC-02: Clicking a role shows its login form', async ({ page }) => {
    await page.locator('text=Student').first().click();
    await expect(page.locator('text=Student Portal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#identifier')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('TC-03: Invalid Student ID format shows validation error', async ({ page }) => {
    await page.locator('text=Student').first().click();
    await page.locator('#identifier').fill('WRONGID');
    await page.locator('#password').fill('anypassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/invalid id format/i')).toBeVisible({ timeout: 5000 });
  });

  test('TC-04: Invalid Teacher ID format shows validation error', async ({ page }) => {
    await page.locator('text=Teacher').first().click();
    await page.locator('#identifier').fill('ABCDEF');
    await page.locator('#password').fill('anypassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/invalid id format/i')).toBeVisible({ timeout: 5000 });
  });

  test('TC-05: Wrong credentials show login error', async ({ page }) => {
    await page.locator('text=Parent').first().click();
    await page.locator('#identifier').fill('800001');
    await page.locator('#password').fill('WRONG_PASSWORD_999');
    await page.locator('button[type="submit"]').click();
    // Expect error message from backend
    await expect(
      page.locator('text=/login failed|invalid|incorrect|check your credentials/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-06: Parent login with valid credentials succeeds', async ({ page }) => {
    const { id, password, role } = CREDENTIALS.parent;
    await page.locator(`text=${role}`).first().click();
    await page.locator('#identifier').fill(id);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    // After login, should see authenticated content
    await expect(page.locator('text=/dashboard|portal|welcome|logout|sign out/i').first())
      .toBeVisible({ timeout: 15000 });
  });

  test('TC-07: Teacher login with valid credentials succeeds', async ({ page }) => {
    const { id, password, role } = CREDENTIALS.teacher;
    await page.locator(`text=${role}`).first().click();
    await page.locator('#identifier').fill(id);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/dashboard|portal|welcome|logout|sign out/i').first())
      .toBeVisible({ timeout: 15000 });
  });

  test('TC-08: Forgot password link navigates to reset page', async ({ page }) => {
    await page.locator('text=Student').first().click();
    await page.locator('button', { hasText: /forgot/i }).click();
    await expect(page.locator('text=Reset Password')).toBeVisible({ timeout: 5000 });
  });

  test('TC-09: Back button returns to portal selection', async ({ page }) => {
    await page.locator('text=Student').first().click();
    await page.locator('button[aria-label*="back"], button').filter({ hasText: /back|arrow/i }).first().click().catch(async () => {
      // Try clicking the back arrow icon area
      await page.locator('button').first().click();
    });
    await expect(page.locator('text=Smart Gateway to Excellence')).toBeVisible({ timeout: 5000 });
  });

});
