// tests/homePage.spec.js
import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173"); // URL de votre application
  });

  test("should display the header elements", async ({ page }) => {
    const headerLogo = page.locator('[data-testid="header-logo"]');
    await expect(headerLogo).toBeVisible();
    await expect(headerLogo).toContainText("Ministère");

    const serviceTitle = page.locator(".fr-header__service-title");
    await expect(serviceTitle).toBeVisible();
    await expect(serviceTitle).toContainText("Référentiel des Applications");

    const serviceTagline = page.locator(".fr-header__service-tagline");
    await expect(serviceTagline).toBeVisible();
    await expect(serviceTagline).toContainText("Une application pour les réunir toutes");
  });
});
