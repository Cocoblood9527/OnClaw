import { mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("smoke-openclaw script", () => {
  it("uses managed runtime entry under onclaw/runtime and reports probe mode by default", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    await mkdir(runtimeDir, { recursive: true });

    const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ONCLAW_FORCE_PROBE: "1"
      }
    });

    expect(stdout).toContain("Running portable smoke checks...");
    expect(stdout).toContain("Runtime entry:");
    expect(stdout).toContain("onclaw/runtime/openclaw-entry.cjs");
    expect(stdout).toContain("Runtime mode: probe");
    expect(stdout).toContain("Runtime reason: forced_probe");
    expect(stdout).toContain("Gateway health check passed");
    expect(stdout).toContain("Smoke checks passed");
  });

  it("reports official mode when ONCLAW_OPENCLAW_MJS points to a valid gateway script", async () => {
    const tmpDir = join(process.cwd(), "onclaw", "tmp");
    const fakeOpenClaw = join(tmpDir, "fake-openclaw.mjs");
    await mkdir(tmpDir, { recursive: true });
    await writeFile(
      fakeOpenClaw,
      [
        "const hold = setInterval(() => {}, 1000);",
        "const shutdown = () => { clearInterval(hold); process.exit(0); };",
        'process.on("SIGTERM", shutdown);',
        'process.on("SIGINT", shutdown);'
      ].join("\n"),
      "utf8"
    );

    try {
      const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ONCLAW_OPENCLAW_MJS: fakeOpenClaw,
          ONCLAW_DISABLE_NPX_OFFICIAL: "1"
        }
      });
      expect(stdout).toContain("Runtime mode: official");
      expect(stdout).toContain("Runtime reason: official_env_path");
    } finally {
      await rm(fakeOpenClaw, { force: true });
    }
  });

  it("falls back to probe with explicit reason when official path is missing", async () => {
    const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ONCLAW_OPENCLAW_MJS: join(process.cwd(), "onclaw", "runtime", "missing-openclaw.mjs"),
        ONCLAW_DISABLE_NPX_OFFICIAL: "1"
      }
    });
    expect(stdout).toContain("Runtime mode: probe");
    expect(stdout).toContain("Runtime reason: official_env_path_missing");
  });
});
