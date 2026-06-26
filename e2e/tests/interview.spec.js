const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Smith AI Technical Interview Flow', () => {
  test('should load the home page, select a role, and start the interview', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');

    // Verify page header
    await expect(page.locator('text=Smith').first()).toBeVisible();

    // Click "Start Interview" on the Dashboard to go to /interview
    await page.click('button:has-text("Start Interview")');

    // 2. Upload the resume file using the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../../DavidEliot_Resume.pdf'));

    // Wait for the analysis to complete (we will see "Resume analyzed successfully!")
    await expect(page.locator('text=Resume analyzed successfully!').first()).toBeVisible({ timeout: 15000 });

    // 3. Click "Start Interview"
    const startButton = page.locator('button:has-text("Start Interview")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 4. Verify transition to interview screen
    await expect(page.locator('text=AI Interviewer').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=End Interview').first()).toBeVisible();
  });
});
