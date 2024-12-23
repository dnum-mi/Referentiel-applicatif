// client/tests/search.spec.ts
import { test, expect, Page, BrowserContext } from '@playwright/test';

async function login(page: Page, context: BrowserContext, username: string, password: string) {
  await page.locator('a.fr-btn', { hasText: 'Se connecter' }).click();

  const newPage = await context.waitForEvent('page');

  // Remplissez le formulaire de connexion
  await newPage.fill('#username', username);
  await newPage.fill('#password', password); 
  await newPage.check('#rememberMe'); 
  await newPage.click('#kc-login');
  console.log('Form submitted.');

  await page.waitForURL('http://localhost:5173/**');
  console.log('Redirected to main page.');
}
test.describe('Search Application Page', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('/'); 
    await login(page, context, 'user', 'password');

  test('should redirect to the search application page when clicking "Rechercher une application"', async ({ page }) => {
    await page.getByRole('link', { name: 'Rechercher une application' }).click();
    await expect(page).toHaveURL(/\/recherche-application$/);
  });

  test('should display search results when a valid search term is entered', async ({ page }) => {
    await page.getByRole('link', { name: 'Rechercher une application' }).click();
    await expect(page).toHaveURL(/\/recherche-application$/);

    await page.fill('input[placeholder="Rechercher une application"]', 'basegun');
    await expect(page.locator('.card-container .fixed-card')).toHaveCountGreaterThan(0);
  });

  test('should navigate to application details when clicking on a search result tile', async ({ page }) => {
    await page.getByRole('link', { name: 'Rechercher une application' }).click();
    await expect(page).toHaveURL(/\/recherche-application$/);

    await page.fill('input[placeholder="Rechercher une application"]', 'basegun');
    const firstResult = page.locator('.card-container .fixed-card').first();
    await expect(firstResult).toBeVisible();
    await firstResult.click();
    await expect(page).toHaveURL(/\/application-details\//);
  });
});