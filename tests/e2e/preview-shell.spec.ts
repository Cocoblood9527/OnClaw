import { spawn } from "node:child_process";
import { test, expect } from "@playwright/test";

const PREVIEW_SHELL_PORT = 4176;

function startPreviewShell() {
  const child = spawn("npm", ["run", "preview:shell"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ONCLAW_PREVIEW_PORT: String(PREVIEW_SHELL_PORT)
    }
  });

  return new Promise<{ stop: () => Promise<void> }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("preview shell did not start in time"));
    }, 20_000);

    const onData = (chunk: Buffer) => {
      if (chunk.toString("utf8").includes(`http://127.0.0.1:${PREVIEW_SHELL_PORT}`)) {
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

test.describe("preview shell", () => {
  let stopper: { stop: () => Promise<void> };

  test.beforeAll(async () => {
    stopper = await startPreviewShell();
  });

  test.afterAll(async () => {
    await stopper.stop();
  });

  test("hydrates initial state from url and updates in real time", async ({ page }) => {
    await page.goto(`http://127.0.0.1:${PREVIEW_SHELL_PORT}/?provider=openai&runtimePresent=1`);

    await expect(page.locator("#provider")).toContainText("selected: openai");
    await expect(page.locator("#setup")).toContainText("ready: ok");

    await page.selectOption("select[name='provider']", "minimax");
    await expect(page.locator("#provider")).toContainText("model: MiniMax-M2.7");

    await page.fill("input[name='rootDir']", "/tmp/outside");
    await expect(page.locator("#settings")).toContainText("root: onclaw");
  });

  test("covers setup-provider-settings minimal chain", async ({ page }) => {
    await page.goto(`http://127.0.0.1:${PREVIEW_SHELL_PORT}/?runtimePresent=0&providerReachable=1&provider=minimax`);

    await expect(page.locator("#setup")).toContainText("action: rerun-self-check");

    await page.selectOption("select[name='runtimePresent']", "1");
    await expect(page.locator("#setup")).toContainText("ready: ok");
    await expect(page.locator("#setup")).toContainText("action: continue-provider");

    await page.selectOption("select[name='providerReachable']", "0");
    await expect(page.locator("#provider")).toContainText("connectivity: fail");
    await expect(page.locator("#provider")).toContainText("action: switch-provider");

    await page.selectOption("select[name='providerReachable']", "1");
    await page.fill("input[name='timeoutMs']", "-10");
    await page.fill("input[name='retry']", "99");
    await expect(page.locator("#settings")).toContainText("timeoutMs: 10000");
    await expect(page.locator("#settings")).toContainText("retry: 2");
    await expect(page.locator("#settings")).toContainText("runReady: ok");
    await expect(page.locator("#settings")).toContainText("action: apply-settings");
  });
});
