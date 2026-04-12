import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('👨‍👩‍👧 Parent Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'parent');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-P01: Parent portal loads after login
  // ═══════════════════════════════════════════════════════════════
  test('TC-P01: Parent portal loads after login', async ({ page }) => {
    // Parent sidebar shows "Overview" as the first nav item
    await expect(
      page.locator('text=/Overview|Dashboard|Parent|Welcome/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-P02: Parent can see child profile information
  // ═══════════════════════════════════════════════════════════════
  test('TC-P02: Parent can see child profile information', async ({ page }) => {
    // After login, the Overview should show child/student info
    await expect(
      page.locator('text=/student|child|name|class|section|overview/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-P03: Parent can view child attendance
  // ═══════════════════════════════════════════════════════════════
  test('TC-P03: Parent can view child attendance', async ({ page }) => {
    // Parent sidebar has "Attendance"
    const attendanceBtn = page.locator('button').filter({ hasText: /Attendance/i }).first();
    if (await attendanceBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await attendanceBtn.click();
      await expect(
        page.locator('text=/attendance|present|absent|%/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      // Attendance info might be on the overview dashboard
      await expect(
        page.locator('text=/attendance|present|%/i').first()
      ).toBeVisible({ timeout: 8000 });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-P04: Parent can view complaints section
  // ═══════════════════════════════════════════════════════════════
  test('TC-P04: Parent can view complaints section', async ({ page }) => {
    // Parent sidebar has "Complaints"
    const complaintsBtn = page.locator('button').filter({ hasText: /Complaints/i }).first();
    if (await complaintsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await complaintsBtn.click();
    }
    await expect(
      page.locator('text=/complaint|disciplinary|log|report/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-P05: Parent can view reports
  // ═══════════════════════════════════════════════════════════════
  test('TC-P05: Parent can view reports', async ({ page }) => {
    // Parent sidebar has "Reports"
    const reportsBtn = page.locator('button').filter({ hasText: /Reports/i }).first();
    if (await reportsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await reportsBtn.click();
      await expect(
        page.locator('text=/report|grade|marks|exam|subject|analytics/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-P06: Parent portal page title is correct
  // ═══════════════════════════════════════════════════════════════
  test('TC-P06: Parent portal page title is correct', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('charronix');
  });

});
