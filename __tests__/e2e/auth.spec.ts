import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('sign-in page loads with form', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should show error message (not redirect)
    await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible({ timeout: 10000 });
  });

  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to auth page
    await page.waitForURL(/auth/, { timeout: 10000 });
  });
});
