// Example 2: Playwright e2e on phone devices with a mocked /api/forecast, role-based locators,
// web-first assertions, Florida time zone, and an error state.
// Service workers are blocked so page/context routing is reliable (see docs/playwright.md).
// Run: npx playwright test --config playwright.config.ts --trace off
import { test, expect } from "@playwright/test";

test.use({ timezoneId: "America/New_York", locale: "en-US", serviceWorkers: "block" });

test.beforeEach(async ({ context }) => {
  await context.route("**/api/forecast?beach=*", async (route) => {
    const beach = new URL(route.request().url()).searchParams.get("beach");
    if (beach === "haulover") return route.fulfill({ status: 502, json: { error: "forecast unavailable" } });
    await route.fulfill({ json: { beach, verdict: "Great", window: "9 am – 1 pm", generatedAt: "2026-11-26T14:40:00Z" } });
  });
});

test("shows today's verdict and best window", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("south-beach: Great — best 9 am – 1 pm");
  await expect(page.getByText("Updated 9:40 AM")).toBeVisible();          // 14:40Z rendered in Florida time
});

test("explains a failed load and keeps the picker usable", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Beach").selectOption("haulover");
  await expect(page.getByRole("status")).toHaveText("Couldn't load the forecast. Try again.");
  await expect(page.getByLabel("Beach")).toBeEnabled();
});
