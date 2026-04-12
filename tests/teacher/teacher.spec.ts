import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('👨‍🏫 Teacher Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'teacher');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-T01: Teacher dashboard loads after login
  // ═══════════════════════════════════════════════════════════════
  test('TC-T01: Teacher dashboard loads after login', async ({ page }) => {
    await expect(
      page.locator('text=/Dashboard|Welcome|Teacher/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-T02: Teacher sidebar navigation is visible
  // ═══════════════════════════════════════════════════════════════
  test('TC-T02: Teacher can see the sidebar navigation', async ({ page }) => {
    const nav = page.locator('aside, nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-T03: Teacher can navigate to Attendance Marker
  // ═══════════════════════════════════════════════════════════════
  test('TC-T03: Teacher can navigate to Take Attendance', async ({ page }) => {
    // Teacher sidebar label is "Take Attendance"
    const attendanceNav = page.locator('button').filter({ hasText: /Take Attendance|Attendance/i }).first();
    await attendanceNav.click();
    await expect(
      page.locator('text=/attendance|mark|present|absent|class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-T04: Teacher can navigate to Marks Uploader
  // ═══════════════════════════════════════════════════════════════
  test('TC-T04: Teacher can navigate to Upload Marks', async ({ page }) => {
    // Teacher sidebar label is "Upload Marks"
    const marksNav = page.locator('button').filter({ hasText: /Upload Marks|Marks/i }).first();
    await marksNav.click();
    await expect(
      page.locator('text=/marks|grade|upload|subject|exam/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-T05: Teacher can navigate to Assignments
  // ═══════════════════════════════════════════════════════════════
  test('TC-T05: Teacher can navigate to Assignments', async ({ page }) => {
    // Teacher sidebar label is "Assignments"
    const assignNav = page.locator('button').filter({ hasText: /Assignments/i }).first();
    await assignNav.click();
    await expect(
      page.locator('text=/assignment|upload|submit|manage/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-T06: Teacher can access notifications
  // ═══════════════════════════════════════════════════════════════
  test('TC-T06: Teacher can access notifications', async ({ page }) => {
    // For Teachers, clicking Notifications opens the slide-over panel
    const notifNav = page.locator('button').filter({ hasText: /Notifications/i }).first();
    await notifNav.click({ force: true });
    await expect(
      page.locator('text=/notification|message|alert|unread/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

});
