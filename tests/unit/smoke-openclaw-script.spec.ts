import { mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("smoke-openclaw script", () => {
  it("verifies runtime health endpoint before reporting success", async () => {
    await mkdir(join(process.cwd(), "onclaw", "runtime"), { recursive: true });
    const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
      cwd: process.cwd()
    });

    expect(stdout).toContain("Running portable smoke checks...");
    expect(stdout).toContain("Gateway health check passed");
    expect(stdout).toContain("Smoke checks passed");
  });
});
