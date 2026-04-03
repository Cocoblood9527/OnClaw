import { spawn } from "node:child_process";
import { test, expect } from "@playwright/test";

function startPreviewShell() {
  const child = spawn("npm", ["run", "preview:shell"], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  return new Promise<{ stop: () => Promise<void> }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("preview shell did not start in time"));
    }, 20_000);

    const onData = (chunk: Buffer) => {
      if (chunk.toString("utf8").includes("http://127.0.0.1:4174")) {
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
    await page.goto("http://127.0.0.1:4174/?provider=openai&runtimePresent=1");

    await expect(page.getByText("selected: openai")).toBeVisible();
    await expect(page.getByText("ready: ok")).toBeVisible();

    await page.selectOption("select[name='provider']", "minimax");
    await expect(page.getByText("model: MiniMax-M2.7")).toBeVisible();

    await page.fill("input[name='rootDir']", "/tmp/outside");
    await expect(page.getByText("root: onclaw")).toBeVisible();
  });
});
