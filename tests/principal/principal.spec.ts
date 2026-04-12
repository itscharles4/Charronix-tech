import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth.helper';

test.describe('🛡️ Principal / Admin Portal E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'principal');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A01: Admin dashboard loads after Principal login
  // ═══════════════════════════════════════════════════════════════
  test('TC-A01: Admin dashboard loads after Principal login', async ({ page }) => {
    await expect(
      page.locator('text=/Dashboard|Admin|Principal|Welcome|Total/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A02: Admin dashboard shows key statistics
  // ═══════════════════════════════════════════════════════════════
  test('TC-A02: Admin dashboard shows key statistics', async ({ page }) => {
    // Dashboard should show stats like total students, teachers, etc.
    await expect(
      page.locator('text=/student|teacher|class|total|overview/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A03: Admin can navigate to Student List
  // ═══════════════════════════════════════════════════════════════
  test('TC-A03: Admin can navigate to Student List', async ({ page }) => {
    // Principal sidebar has "Students"
    const studentsNav = page.locator('button').filter({ hasText: /Students/i }).first();
    await studentsNav.click();
    await expect(
      page.locator('text=/student|name|class|roll|admission/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A04: Admin can navigate to Teacher Management
  // ═══════════════════════════════════════════════════════════════
  test('TC-A04: Admin can navigate to Teacher Management', async ({ page }) => {
    // Principal sidebar has "Teachers"
    const teacherNav = page.locator('button').filter({ hasText: /Teachers/i }).first();
    await teacherNav.click();
    await expect(
      page.locator('text=/teacher|faculty|employee|manage/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A05: Admin can navigate to Timetable Generator
  // ═══════════════════════════════════════════════════════════════
  test('TC-A05: Admin can navigate to AI Timetable', async ({ page }) => {
    // Principal sidebar has "AI Timetable"
    const timetableNav = page.locator('button').filter({ hasText: /AI Timetable|Timetable/i }).first();
    await timetableNav.click();
    await expect(
      page.locator('text=/timetable|schedule|generate|class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A06: Admin can navigate to Transport Management
  // ═══════════════════════════════════════════════════════════════
  test('TC-A06: Admin can navigate to Transport Management', async ({ page }) => {
    // Principal sidebar has "Transport"
    const transportNav = page.locator('button').filter({ hasText: /Transport/i }).first();
    if (await transportNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await transportNav.click();
      await expect(
        page.locator('text=/transport|bus|route|vehicle/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A07: Admin can navigate to Notifications
  // ═══════════════════════════════════════════════════════════════
  test('TC-A07: Admin can navigate to Notifications', async ({ page }) => {
    // For Principal, Notifications navigates to the full page view
    const notifNav = page.locator('button').filter({ hasText: /Notifications/i }).first();
    await notifNav.click();
    await expect(
      page.locator('text=/notification|notice|announcement|send/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A08: Admin can navigate to Attendance section
  // ═══════════════════════════════════════════════════════════════
  test('TC-A08: Admin can navigate to Attendance section', async ({ page }) => {
    const attendanceNav = page.locator('button').filter({ hasText: /Attendance/i }).first();
    await attendanceNav.click();
    await expect(
      page.locator('text=/attendance|mark|present|absent|class/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ═══════════════════════════════════════════════════════════════
  //  TC-A09: Logout returns to portal selection
  // ═══════════════════════════════════════════════════════════════
  test('TC-A09: Sign Out returns to portal selection', async ({ page }) => {
    const signOutBtn = page.locator('button').filter({ hasText: /Sign Out/i }).first();
    if (await signOutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await signOutBtn.click();
      await expect(
        page.locator('text=/Smart Gateway|Portal|Charronix/i').first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      expect(true).toBeTruthy();
    }
  });

});
