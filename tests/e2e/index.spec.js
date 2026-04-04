// @ts-check
import { test, expect } from '@playwright/test';

let app = 'http://localhost:3000';

test('has title', async ({ page }) => {
  await page.goto(app);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SOS2526-20/);
});



test('spices has title', async ({ page }) => {
  await page.goto(app);

  await page.getByRole('link', { name: 'Página web sobre especias' }).click();

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Picantes/);
});
