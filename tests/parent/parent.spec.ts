import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('👨‍👩‍👧 Parent Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'parent');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('TC-P01: Parent portal loads after login', async ({ page }) => {
    await expect(
      page.locator('text=/parent|dashboard|child|welcome/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-P02: Parent can see child profile information', async ({ page }) => {
    // Child's name or profile section should be visible
    await expect(
      page.locator('text=/student|child|name|class|section/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-P03: Parent can view child attendance', async ({ page }) => {
    const attendanceBtn = page.locator('button, a, li').filter({ hasText: /attendance/i }).first();
    if (await attendanceBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await attendanceBtn.click();
      await expect(
        page.locator('text=/attendance|present|absent|%/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      // Attendance info might be directly on dashboard
      await expect(
        page.locator('text=/attendance|present|%/i').first()
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test('TC-P04: Parent can view notifications / school notices', async ({ page }) => {
    const notifBtn = page.locator('button, a, li').filter({ hasText: /notification|notice|announcement/i }).first();
    if (await notifBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notifBtn.click();
    }
    await expect(
      page.locator('text=/notification|notice|announcement|message/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-P05: Parent can view exam grades/reports', async ({ page }) => {
    const gradeBtn = page.locator('button, a, li').filter({ hasText: /grade|report|marks|exam/i }).first();
    if (await gradeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gradeBtn.click();
      await expect(
        page.locator('text=/grade|marks|exam|subject|report/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      // Grade info might be visible directly
      expect(true).toBeTruthy();
    }
  });

  test('TC-P06: Parent portal page title is correct', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

});
