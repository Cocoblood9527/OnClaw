import { createServer } from "node:http";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderFirstRunFromMain } from "../../src/renderer/main";

async function withRootDir(run: (rootDir: string) => Promise<void>) {
  const rootDir = await mkdtemp(join(tmpdir(), "onclaw-first-run-"));
  try {
    await run(rootDir);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
}

async function withProviderServer(
  statusCode: number,
  run: (providerHealthUrl: string) => Promise<void>
) {
  await new Promise<void>((resolve, reject) => {
    const server = createServer((_, res) => {
      res.statusCode = statusCode;
      res.end("ok");
    });
    server.listen(0, "127.0.0.1", async () => {
      try {
        const address = server.address();
        if (!address || typeof address === "string") {
          throw new Error("provider test server did not expose tcp address");
        }
        await run(`http://127.0.0.1:${address.port}/health`);
        server.close((error) => (error ? reject(error) : resolve()));
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

describe("first run integration", () => {
  it("returns setup view when runtime is missing even if provider is reachable", async () => {
    await withRootDir(async (rootDir) => {
      await withProviderServer(200, async (providerHealthUrl) => {
        const view = await renderFirstRunFromMain({ rootDir, providerHealthUrl });
        expect(view).toContain("Setup");
        expect(view).toContain("runtime: fail");
        expect(view).toContain("ready: fail");
      });
    });
  });

  it("returns chat when runtime exists and provider is reachable", async () => {
    await withRootDir(async (rootDir) => {
      await mkdir(join(rootDir, "runtime"), { recursive: true });
      await withProviderServer(200, async (providerHealthUrl) => {
        const view = await renderFirstRunFromMain({ rootDir, providerHealthUrl });
        expect(view).toBe("Chat");
      });
    });
  });
});
