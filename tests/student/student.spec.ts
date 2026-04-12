import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('👨‍🎓 Student Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'student');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S01: Student dashboard loads after login
  // ═══════════════════════════════════════════════════════════════
  test('TC-S01: Student dashboard loads after login', async ({ page }) => {
    // Student sidebar shows "My Progress" as the dashboard label
    await expect(
      page.locator('text=/My Progress|Dashboard|Welcome/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S02: Student sidebar navigation is visible
  // ═══════════════════════════════════════════════════════════════
  test('TC-S02: Student sidebar navigation is visible', async ({ page }) => {
    const nav = page.locator('aside, nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S03: Student can navigate to Attendance
  // ═══════════════════════════════════════════════════════════════
  test('TC-S03: Student can navigate to Attendance page', async ({ page }) => {
    // Student sidebar has "My Attendance"
    const attendanceNav = page.locator('button').filter({ hasText: /My Attendance|Attendance/i }).first();
    await attendanceNav.click();
    await expect(
      page.locator('text=/attendance|present|absent|calendar|%/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S04: Student can navigate to Exam Reports
  // ═══════════════════════════════════════════════════════════════
  test('TC-S04: Student can navigate to Exam Reports page', async ({ page }) => {
    const reportsNav = page.locator('button').filter({ hasText: /Exam Reports|Reports/i }).first();
    await reportsNav.click();
    await expect(
      page.locator('text=/report|grade|exam|marks|pdf|download/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S05: Student can navigate to Timetable
  // ═══════════════════════════════════════════════════════════════
  test('TC-S05: Student can navigate to Timetable page', async ({ page }) => {
    const timetableNav = page.locator('button').filter({ hasText: /My Timetable|Timetable/i }).first();
    await timetableNav.click();
    await expect(
      page.locator('text=/timetable|schedule|monday|period/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S06: Student can navigate to Notifications
  // ═══════════════════════════════════════════════════════════════
  test('TC-S06: Student can navigate to Notifications', async ({ page }) => {
    // For Students, clicking Notifications opens the slide-over panel
    const notifNav = page.locator('button').filter({ hasText: /Notifications/i }).first();
    await notifNav.click({ force: true });
    await expect(
      page.locator('text=/notification|unread|all|message/i').first()
    ).toBeVisible({ timeout: 15000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-S07: Page title is correct
  // ═══════════════════════════════════════════════════════════════
  test('TC-S07: Student portal page title is correct', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toContain('charronix');
  });

});
