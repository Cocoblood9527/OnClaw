import { test, expect } from "@playwright/test";

test("first run reaches setup within 60 seconds", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173");
  await expect(page.getByText("Setup")).toBeVisible();
});
