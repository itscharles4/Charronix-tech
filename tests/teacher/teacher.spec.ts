import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('👨‍🏫 Teacher Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'teacher');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('TC-T01: Teacher dashboard loads after login', async ({ page }) => {
    await expect(
      page.locator('text=/dashboard|teacher|welcome|my class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-T02: Teacher can see the sidebar navigation', async ({ page }) => {
    // Sidebar/nav should be visible after login
    const nav = page.locator('nav, aside, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 8000 });
  });

  test('TC-T03: Teacher can navigate to Attendance Marker', async ({ page }) => {
    const attendanceNav = page.locator('button, a, li').filter({ hasText: /attendance|mark/i }).first();
    await attendanceNav.click();
    await expect(
      page.locator('text=/attendance|mark|present|absent|class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-T04: Teacher can navigate to Marks Uploader', async ({ page }) => {
    const marksNav = page.locator('button, a, li').filter({ hasText: /marks|grade|upload|exam/i }).first();
    await marksNav.click();
    await expect(
      page.locator('text=/marks|grade|upload|subject|exam/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-T05: Teacher can navigate to Assignments', async ({ page }) => {
    const assignNav = page.locator('button, a, li').filter({ hasText: /assignment/i }).first();
    await assignNav.click();
    await expect(
      page.locator('text=/assignment|upload|submit|manage/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('TC-T06: Teacher can access notifications', async ({ page }) => {
    const notifNav = page.locator('button, a, li').filter({ hasText: /notification/i }).first();
    await notifNav.click();
    await expect(
      page.locator('text=/notification|message|alert/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

});
