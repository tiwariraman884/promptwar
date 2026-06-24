import { test, expect } from '@playwright/test';

test.describe('Calculator Page', () => {
  test('calculator page loads', async ({ page }) => {
    await page.goto('/calculator');
    await expect(page).toHaveTitle(/Calculator|GreenStep/i);
  });

  test('has category tabs or sections', async ({ page }) => {
    await page.goto('/calculator');
    // Look for transport/energy/diet text
    const content = await page.textContent('body');
    expect(content).toMatch(/transport|travel|energy|diet/i);
  });

  test('displays CO2 total', async ({ page }) => {
    await page.goto('/calculator');
    // Should show kg or CO₂ somewhere
    const content = await page.textContent('body');
    expect(content).toMatch(/kg|CO₂|co2/i);
  });
});
