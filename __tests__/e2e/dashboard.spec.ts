import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('dashboard redirects if not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/auth|login/, { timeout: 10000 });
  });
});

test.describe('Admin Panel', () => {
  test('admin page redirects unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to auth or show forbidden
    const url = page.url();
    const content = await page.textContent('body');
    const isRedirected = url.includes('auth') || url.includes('login');
    const isForbidden = content?.match(/forbidden|unauthorized|403/i);
    expect(isRedirected || isForbidden).toBeTruthy();
  });
});
