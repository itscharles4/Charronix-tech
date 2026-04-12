import { Page } from '@playwright/test';

export const CREDENTIALS = {
  student: { id: '24BIT0522', password: 'Student@1234', role: 'Student' },
  teacher: { id: '100001', password: 'Teacher@1234', role: 'Teacher' },
  parent: { id: '200006', password: 'Parent@1234', role: 'Parent' },
  principal: { id: '900001', password: 'Admin@1234', role: 'Principal' },
};

export const BASE_URL = 'http://localhost:3000';

/**
 * Navigates past the landing page to reach the portal-selection screen.
 */
export async function goToPortalSelection(page: Page): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // Landing page has: "Start Your Journey" (hero CTA) or "Get Started" (nav CTA)
  const ctaBtn = page.locator('button, a').filter({ hasText: /start your journey|get started/i }).first();
  if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await ctaBtn.click();
  }

  // Wait for the portal-selection heading
  await page.waitForSelector('text=Smart Gateway to Excellence', { timeout: 15000 });
}

/**
 * Full login flow: landing → portal selection → login form → authenticated dashboard.
 */
export async function loginAs(
  page: Page,
  role: keyof typeof CREDENTIALS
): Promise<void> {
  const creds = CREDENTIALS[role];

  // 1. Get to the portal selection screen
  await goToPortalSelection(page);

  // 2. Click the correct role card — match the h3 text exactly
  //    The portal cards have an h3 with the role label and a "Login" button
  const roleCard = page.locator('h3').filter({ hasText: new RegExp(`^${creds.role}$`, 'i') }).first();
  await roleCard.click();

  // 3. Wait for the login form to appear — heading is "{Role} Portal"
  await page.waitForSelector(`text=${creds.role} Portal`, { timeout: 10000 });

  // 4. Fill login form
  await page.locator('#identifier').fill(creds.id);
  await page.locator('#password').fill(creds.password);

  // 5. Submit
  await page.locator('button[type="submit"]').click();

  // 6. Wait for authenticated content (sidebar has "Sign Out", or nav items appear)
  //    Backend bcrypt hash takes ~8s, so we use a generous timeout
  await page.waitForSelector('text=/Dashboard|My Progress|Overview|Sign Out/i', { timeout: 30000 });
}

/**
 * Logs out from the application by clicking the sidebar "Sign Out" button.
 */
export async function logout(page: Page): Promise<void> {
  // Close any modals first
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  const signOutBtn = page.locator('button, a').filter({ hasText: /Sign Out/i }).first();
  if (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await signOutBtn.click({ force: true });
  }
}
