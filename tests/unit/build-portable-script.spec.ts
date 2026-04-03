import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("build-portable script", () => {
  it("copies managed runtime entry into dist portable layout", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    const distBundledDir = join(
      process.cwd(),
      "dist",
      "portable",
      "onclaw",
      "runtime",
      "node_modules",
      "openclaw"
    );
    await mkdir(runtimeDir, { recursive: true });
    try {
      await rm(distBundledDir, { recursive: true, force: true });
    } catch {
    }

    await execFileAsync("pwsh", ["./scripts/build-portable.ps1"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ONCLAW_SKIP_BUNDLE_DOWNLOAD: "1"
      }
    });
    const distRuntimeEntry = join(process.cwd(), "dist", "portable", "onclaw", "runtime", "openclaw-entry.cjs");
    const content = await readFile(distRuntimeEntry, "utf8");

    expect(content).toContain('const http = require("node:http");');
  }, 30_000);

  it("copies bundled openclaw runtime into dist portable layout", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    const distBundledDir = join(
      process.cwd(),
      "dist",
      "portable",
      "onclaw",
      "runtime",
      "node_modules",
      "openclaw"
    );
    const bundledDir = join(runtimeDir, "node_modules", "openclaw");
    const bundledEntry = join(bundledDir, "openclaw.mjs");
    const fakeBundledContent = 'export const marker = "onclaw-bundled-test";\n';
    let originalBundledContent: string | null = null;
    await mkdir(bundledDir, { recursive: true });
    try {
      originalBundledContent = await readFile(bundledEntry, "utf8");
    } catch {
    }
    await writeFile(bundledEntry, fakeBundledContent, "utf8");
    try {
      await rm(distBundledDir, { recursive: true, force: true });
    } catch {
    }
    try {
      await execFileAsync("pwsh", ["./scripts/build-portable.ps1"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ONCLAW_SKIP_BUNDLE_DOWNLOAD: "1"
        }
      });
      const distBundledEntry = join(
        process.cwd(),
        "dist",
        "portable",
        "onclaw",
        "runtime",
        "node_modules",
        "openclaw",
        "openclaw.mjs"
      );
      const content = await readFile(distBundledEntry, "utf8");
      expect(content).toBe(fakeBundledContent);
    } finally {
      if (originalBundledContent === null) {
        await rm(bundledEntry, { force: true });
      } else {
        await writeFile(bundledEntry, originalBundledContent, "utf8");
      }
    }
  }, 30_000);
});
