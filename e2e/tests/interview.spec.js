const { test, expect } = require('@playwright/test');

test.describe('Smith AI Technical Interview Flow', () => {
  test('should load the home page, select a role, and start the interview', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');

    // Verify page header logo
    await expect(page.locator('.dashboard-sidebar').getByText('Smith AI')).toBeVisible();

    // Click "Start Interview" on the Dashboard to go to /interview launcher
    await page.click('button:has-text("Start Interview")');

    // 2. Click "Start AI Mock Interview" on Setup Screen
    const startButton = page.locator('button:has-text("Start AI Mock Interview")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 3. Verify transition to active interview screen
    await expect(page.locator('.conversation-status-bar__name').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("End Interview")').first()).toBeVisible();
  });
});
