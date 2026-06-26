const { test, expect } = require('@playwright/test');

test.describe('Smith AI Technical Interview Flow', () => {
  test('should load the home page, select a role, and start the interview', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');

    // Verify page header (using first to avoid ambiguity)
    await expect(page.locator('text=Smith').first()).toBeVisible();

    // 2. Select a role and level by clicking the corresponding buttons
    await page.click('button:has-text("Frontend Engineer")');
    await page.click('button:has-text("Senior")');

    // 3. Click "Begin Interview"
    const startButton = page.locator('button:has-text("Begin Interview")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 4. Verify transition to interview screen
    // The main screen should show active interview details
    await expect(page.locator('text=Technical Interviewer').first()).toBeVisible();
    await expect(page.locator('text=Frontend Engineer').first()).toBeVisible();
    await expect(page.locator('text=Senior').first()).toBeVisible();
    await expect(page.locator('text=End Interview').first()).toBeVisible();
  });
});
