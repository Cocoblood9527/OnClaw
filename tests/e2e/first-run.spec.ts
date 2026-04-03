import { test, expect } from "@playwright/test";

test("first run stays in setup and shows self-check summary when not ready", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173?ready=0");
  await expect(page.getByText("Setup")).toBeVisible();
  await expect(page.getByText("runtime:fail")).toBeVisible();
  await expect(page.getByText("ready:fail")).toBeVisible();
});

test("first run enters chat when self-check is ready", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173?ready=1");
  await expect(page.getByText("Chat")).toBeVisible();
});
