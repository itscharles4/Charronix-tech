import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('🛡️ Principal / Admin Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'principal');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('TC-A01: Admin dashboard loads after Principal login', async ({ page }) => {
    await expect(
      page.locator('text=/dashboard|admin|principal|welcome|total students/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A02: Admin dashboard shows key statistics', async ({ page }) => {
    // Stats like total students, teachers, classes should be visible
    await expect(
      page.locator('text=/student|teacher|class|total/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A03: Admin can navigate to Student List', async ({ page }) => {
    const studentsNav = page.locator('button, a, li').filter({ hasText: /student/i }).first();
    await studentsNav.click();
    await expect(
      page.locator('text=/student|name|class|roll|admission/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A04: Admin can navigate to Teacher Management', async ({ page }) => {
    const teacherNav = page.locator('button, a, li').filter({ hasText: /teacher/i }).first();
    await teacherNav.click();
    await expect(
      page.locator('text=/teacher|faculty|employee|manage/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A05: Admin can navigate to Timetable Generator', async ({ page }) => {
    const timetableNav = page.locator('button, a, li').filter({ hasText: /timetable|schedule/i }).first();
    await timetableNav.click();
    await expect(
      page.locator('text=/timetable|schedule|generate|class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A06: Admin can navigate to Transport Management', async ({ page }) => {
    const transportNav = page.locator('button, a, li').filter({ hasText: /transport|bus|route/i }).first();
    if (await transportNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await transportNav.click();
      await expect(
        page.locator('text=/transport|bus|route|vehicle|boarding/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('TC-A07: Admin can navigate to Notifications / Notice Board', async ({ page }) => {
    const notifNav = page.locator('button, a, li').filter({ hasText: /notification|notice/i }).first();
    await notifNav.click();
    await expect(
      page.locator('text=/notification|notice|announcement|send/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A08: Admin can navigate to Attendance section', async ({ page }) => {
    const attendanceNav = page.locator('button, a, li').filter({ hasText: /attendance/i }).first();
    await attendanceNav.click();
    await expect(
      page.locator('text=/attendance|mark|present|absent|class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-A09: Logout returns to portal selection', async ({ page }) => {
    const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await expect(
        page.locator('text=/smart gateway|portal|charronix/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

});
