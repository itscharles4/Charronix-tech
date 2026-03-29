import { Page } from '@playwright/test';

export const CREDENTIALS = {
  student: { id: '24BIT0522', password: 'Student@1234', role: 'Student' },
  teacher: { id: '100001', password: 'Teacher@1234', role: 'Teacher' },
  parent: { id: '200006', password: 'Parent@1234', role: 'Parent' },
  principal: { id: '900001', password: 'Admin@1234', role: 'Principal' },
};

export const BASE_URL = 'http://localhost:3000';

/**
 * Navigates from landing → portal selection → login form → authenticates.
 */
export async function loginAs(
  page: Page,
  role: keyof typeof CREDENTIALS
): Promise<void> {
  const creds = CREDENTIALS[role];

  // Start at root
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // If on landing page, click "Get Started" or any CTA
  const getStarted = page.locator('button, a').filter({ hasText: /get started|enter|start/i }).first();
  if (await getStarted.isVisible({ timeout: 3000 }).catch(() => false)) {
    await getStarted.click({ force: true });
  }

  // Wait for portal selection page
  await page.waitForSelector('text=Smart Gateway to Excellence', { timeout: 10000 });

  // Click the role card (e.g. "Student", "Teacher", etc.)
  const roleCard = page.locator(`text=${creds.role}`).first();
  await roleCard.click();

  // Fill login form
  await page.locator('#identifier').fill(creds.id);
  await page.locator('#password').fill(creds.password);

  // Submit
  await page.locator('button[type="submit"]').click();

  // Wait for dashboard to appear
  await page.waitForURL(BASE_URL, { timeout: 15000 });
  await page.waitForSelector('text=dashboard, text=Dashboard, text=Welcome', { timeout: 15000 }).catch(() => { });
}

/**
 * Logs out from the application.
 */
export async function logout(page: Page): Promise<void> {
  // Try closing any open modals (like the Notifications panel) before clicking logout
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
  if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutBtn.click({ force: true });
  }
}


