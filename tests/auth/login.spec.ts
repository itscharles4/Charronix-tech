import { test, expect } from '@playwright/test';
import { BASE_URL, CREDENTIALS, goToPortalSelection } from '../helpers/auth.helper';

test.describe('🔐 Authentication & Login Tests', () => {

  test.beforeEach(async ({ page }) => {
    await goToPortalSelection(page);
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-01: Portal selection screen loads correctly
  // ═══════════════════════════════════════════════════════════════
  test('TC-01: Portal selection page loads with all 4 roles', async ({ page }) => {
    await expect(page.locator('text=Smart Gateway to Excellence')).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Student' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Teacher' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Parent' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Principal' })).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-02: Clicking a role card opens its login form
  // ═══════════════════════════════════════════════════════════════
  test('TC-02: Clicking Student role shows its login form', async ({ page }) => {
    await page.locator('h3').filter({ hasText: 'Student' }).click();
    await expect(page.locator('text=Student Portal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#identifier')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-03: Invalid Student ID format shows validation error
  // ═══════════════════════════════════════════════════════════════
  test('TC-03: Invalid Student ID format shows validation error', async ({ page }) => {
    await page.locator('h3').filter({ hasText: 'Student' }).click();
    await page.locator('#identifier').fill('WRONGID');
    await page.locator('#password').fill('anypassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/Invalid ID format/i')).toBeVisible({ timeout: 5000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-04: Invalid Teacher ID format shows validation error
  // ═══════════════════════════════════════════════════════════════
  test('TC-04: Invalid Teacher ID format shows validation error', async ({ page }) => {
    await page.locator('h3').filter({ hasText: 'Teacher' }).click();
    await page.locator('#identifier').fill('ABCDEF');
    await page.locator('#password').fill('anypassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=/Invalid ID format/i')).toBeVisible({ timeout: 5000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-05: Wrong credentials show login error from backend
  // ═══════════════════════════════════════════════════════════════
  test('TC-05: Wrong credentials show login error', async ({ page }) => {
    await page.locator('h3').filter({ hasText: 'Parent' }).click();
    await page.locator('#identifier').fill('800001');
    await page.locator('#password').fill('WRONG_PASSWORD_999');
    await page.locator('button[type="submit"]').click();
    // Expect error from the backend (e.g., "Login failed" or "Invalid credentials")
    await expect(
      page.locator('text=/login failed|invalid|incorrect|check your credentials|cannot connect/i')
    ).toBeVisible({ timeout: 15000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-06: Parent login with valid credentials succeeds
  // ═══════════════════════════════════════════════════════════════
  test('TC-06: Parent login with valid credentials succeeds', async ({ page }) => {
    const { id, password, role } = CREDENTIALS.parent;
    await page.locator('h3').filter({ hasText: role }).click();
    await page.locator('#identifier').fill(id);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    // After login, should see dashboard content or Sign Out
    await expect(
      page.locator('text=/Overview|Dashboard|Sign Out/i').first()
    ).toBeVisible({ timeout: 20000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-07: Teacher login with valid credentials succeeds
  // ═══════════════════════════════════════════════════════════════
  test('TC-07: Teacher login with valid credentials succeeds', async ({ page }) => {
    const { id, password, role } = CREDENTIALS.teacher;
    await page.locator('h3').filter({ hasText: role }).click();
    await page.locator('#identifier').fill(id);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator('text=/Dashboard|Sign Out/i').first()
    ).toBeVisible({ timeout: 20000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-08: Forgot password link shows reset form
  // ═══════════════════════════════════════════════════════════════
  test('TC-08: Forgot password link navigates to reset page', async ({ page }) => {
    await page.locator('h3').filter({ hasText: 'Student' }).click();
    await expect(page.locator('text=Student Portal')).toBeVisible({ timeout: 5000 });
    // The "Forgot?" button triggers reset-password view
    await page.locator('button').filter({ hasText: /Forgot/i }).click();
    await expect(page.locator('text=Reset Password')).toBeVisible({ timeout: 5000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-09: Back button returns to portal selection
  // ═══════════════════════════════════════════════════════════════
  test('TC-09: Back button returns to portal selection', async ({ page }) => {
    await page.locator('h3').filter({ hasText: 'Student' }).click();
    await expect(page.locator('text=Student Portal')).toBeVisible({ timeout: 5000 });
    // The ArrowLeft back button is the first button in the login header
    const backBtn = page.locator('button').first();
    await backBtn.click();
    await expect(page.locator('text=Smart Gateway to Excellence')).toBeVisible({ timeout: 5000 });
  });

});
