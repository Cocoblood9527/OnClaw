import { spawn } from "node:child_process";
import { test, expect } from "@playwright/test";

const DASHBOARD_PREVIEW_PORT = 4175;

function startPreviewShell() {
  const child = spawn("npm", ["run", "preview:shell"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ONCLAW_PREVIEW_PORT: String(DASHBOARD_PREVIEW_PORT)
    }
  });

  return new Promise<{ stop: () => Promise<void> }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("preview shell did not start in time"));
    }, 20_000);

    const onData = (chunk: Buffer) => {
      if (chunk.toString("utf8").includes(`http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}`)) {
        clearTimeout(timeout);
        child.stdout.off("data", onData);
        resolve({
          stop: async () => {
            child.kill("SIGTERM");
            await new Promise<void>((done) => child.once("exit", () => done()));
          }
        });
      }
    };

    child.stdout.on("data", onData);
    child.once("error", reject);
  });
}

test.describe("dashboard m0", () => {
  let stopper: { stop: () => Promise<void> };

  test.beforeAll(async () => {
    stopper = await startPreviewShell();
  });

  test.afterAll(async () => {
    await stopper.stop();
  });

  test("shows status and supports start/stop/restart", async ({ page }) => {
    await page.goto(`http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}/?runtimePresent=1`);

    await expect(page.locator("#dashboard")).toContainText("Dashboard");
    await expect(page.getByText("status: running")).toBeVisible();
    await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Stop", exact: true }).click();
    await expect(page.getByText("status: stopped")).toBeVisible();
    await expect(page.getByText("health: fail")).toBeVisible();

    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByText("status: running")).toBeVisible();

    await page.getByRole("button", { name: "Restart", exact: true }).click();
    await expect(page.getByText("lastAction: restart ok")).toBeVisible();
  });

  test("opens chat with localhost gateway port and token", async ({ page }) => {
    await page.goto(`http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}/?runtimePresent=1&gatewayPort=18791&gatewayToken=tok_m1`);

    const openChatResponsePromise = page.waitForResponse((response) => response.url().includes("/api/open-chat"));
    await page.getByRole("button", { name: "进入聊天页", exact: true }).click();
    const openChatResponse = await openChatResponsePromise;
    const openChatResult = await openChatResponse.json();

    await expect(page.getByText("openChat: ok (opened)")).toBeVisible();
    await expect(page.getByText("enterChat: http://127.0.0.1:18791/chat?token=tok_m1")).toBeVisible();
    expect(openChatResult.url).toBe("http://127.0.0.1:18791/chat?token=tok_m1");
  });

  test("shows fail feedback when token is missing", async ({ page }) => {
    await page.goto(`http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}/?runtimePresent=1&gatewayPort=18791&gatewayToken=`);

    await page.getByRole("button", { name: "进入聊天页", exact: true }).click();
    await expect(page.getByText("openChat: fail")).toBeVisible();
  });

  test("shows native chat panel and no iframe embedding", async ({ page }) => {
    await page.goto(`http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}/?runtimePresent=1&gatewayPort=18793&gatewayToken=tok_sync`);

    await expect(page.getByText("Chat（ClawX 风格）")).toBeVisible();
    await expect(page.locator("#chat-messages")).toBeVisible();
    await expect(page.locator("#chat-frame")).toHaveCount(0);
    await expect(page.locator("#chat-sync-status")).toContainText("chatSync:");

    await page.fill("input[name='gatewayToken']", "");
    await expect(page.locator("#chat-sync-status")).toContainText("missing gateway port/token");
  });
});
