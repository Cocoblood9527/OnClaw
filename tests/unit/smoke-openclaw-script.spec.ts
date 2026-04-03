import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

function fakeOfficialGatewayScript() {
  return [
    'import http from "node:http";',
    'const host = "127.0.0.1";',
    'const args = process.argv.slice(2);',
    'const portIndex = args.indexOf("--port");',
    "const port = portIndex >= 0 ? Number(args[portIndex + 1]) : 18789;",
    "const server = http.createServer((req, res) => {",
    "  res.statusCode = 200;",
    '  res.end("ok");',
    "});",
    "server.listen(port, host);",
    "const shutdown = () => server.close(() => process.exit(0));",
    'process.on("SIGTERM", shutdown);',
    'process.on("SIGINT", shutdown);'
  ].join("\n");
}

function fakeFixedHealthRuntimeScript(port: number) {
  return [
    'const http = require("node:http");',
    `const server = http.createServer((req, res) => {`,
    '  if (req.url === "/health") {',
    "    res.statusCode = 200;",
    '    res.setHeader("Content-Type", "application/json; charset=utf-8");',
    '    res.end(JSON.stringify({ ok: true, mode: "probe", reason: "forced_probe" }));',
    "    return;",
    "  }",
    "  res.statusCode = 404;",
    '  res.end("not-found");',
    "});",
    `server.listen(${port}, "127.0.0.1");`,
    "const shutdown = () => server.close(() => process.exit(0));",
    'process.on("SIGTERM", shutdown);',
    'process.on("SIGINT", shutdown);'
  ].join("\n");
}

function fakeFixedHealthRuntimeWithoutMetadata(port: number) {
  return [
    'const http = require("node:http");',
    "const server = http.createServer((req, res) => {",
    '  if (req.url === "/health") {',
    "    res.statusCode = 200;",
    '    res.setHeader("Content-Type", "text/plain; charset=utf-8");',
    '    res.end("ok");',
    "    return;",
    "  }",
    "  res.statusCode = 404;",
    '  res.end("not-found");',
    "});",
    `server.listen(${port}, "127.0.0.1");`,
    "const shutdown = () => server.close(() => process.exit(0));",
    'process.on("SIGTERM", shutdown);',
    'process.on("SIGINT", shutdown);'
  ].join("\n");
}

describe("smoke-openclaw script", () => {
  it("marks fallback reason when default health port has no mode metadata", async () => {
    const runtimeEntry = join(process.cwd(), "onclaw", "runtime", "openclaw-entry.cjs");
    const originalRuntimeEntry = await readFile(runtimeEntry, "utf8");
    const smokeReport = join(process.cwd(), "onclaw", "logs", "smoke-latest.json");
    await writeFile(runtimeEntry, fakeFixedHealthRuntimeWithoutMetadata(18789), "utf8");
    try {
      const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
        cwd: process.cwd()
      });
      const reportRaw = await readFile(smokeReport, "utf8");
      const report = JSON.parse(reportRaw) as Record<string, unknown>;
      expect(stdout).toContain("Runtime mode: unknown");
      expect(stdout).toContain("Runtime reason: fallback_default_health_port_no_metadata");
      expect(report.reason).toBe("fallback_default_health_port_no_metadata");
    } finally {
      await writeFile(runtimeEntry, originalRuntimeEntry, "utf8");
    }
  }, 30_000);

  it("falls back to default health port when runtime ignores randomized health port", async () => {
    const runtimeEntry = join(process.cwd(), "onclaw", "runtime", "openclaw-entry.cjs");
    const originalRuntimeEntry = await readFile(runtimeEntry, "utf8");
    await writeFile(runtimeEntry, fakeFixedHealthRuntimeScript(18789), "utf8");
    try {
      const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
        cwd: process.cwd()
      });
      expect(stdout).toContain("Gateway health check passed at http://127.0.0.1:18789/health");
      expect(stdout).toContain("Smoke checks passed");
    } finally {
      await writeFile(runtimeEntry, originalRuntimeEntry, "utf8");
    }
  }, 30_000);

  it("writes smoke acceptance evidence to onclaw/logs/smoke-latest.json", async () => {
    const logsDir = join(process.cwd(), "onclaw", "logs");
    const smokeReport = join(logsDir, "smoke-latest.json");
    await mkdir(logsDir, { recursive: true });
    await rm(smokeReport, { force: true });

    const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ONCLAW_FORCE_PROBE: "1"
      }
    });
    const reportRaw = await readFile(smokeReport, "utf8");
    const report = JSON.parse(reportRaw) as Record<string, unknown>;

    expect(stdout).toContain("Smoke checks passed");
    expect(report.passed).toBe(true);
    expect(report.mode).toBe("probe");
    expect(report.reason).toBe("forced_probe");
    expect(report.healthUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/health$/);
  }, 30_000);

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
      fakeOfficialGatewayScript(),
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

  it("prefers bundled openclaw.mjs over npx fallback", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    const bundledPath = join(runtimeDir, "node_modules", "openclaw", "openclaw.mjs");
    let originalBundled: string | null = null;

    try {
      originalBundled = await readFile(bundledPath, "utf8");
    } catch {
      originalBundled = null;
    }

    await mkdir(join(runtimeDir, "node_modules", "openclaw"), { recursive: true });
    await writeFile(
      bundledPath,
      fakeOfficialGatewayScript(),
      "utf8"
    );

    try {
      const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ONCLAW_DISABLE_NPX_OFFICIAL: "1"
        }
      });
      expect(stdout).toContain("Runtime mode: official");
      expect(stdout).toContain("Runtime reason: official_bundled_mjs");
    } finally {
      if (originalBundled === null) {
        await rm(bundledPath, { force: true });
      } else {
        await writeFile(bundledPath, originalBundled, "utf8");
      }
    }
  });

  it("uses npx fallback when bundled openclaw.mjs is missing", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    const bundledPath = join(runtimeDir, "node_modules", "openclaw", "openclaw.mjs");
    let originalBundled: string | null = null;

    try {
      originalBundled = await readFile(bundledPath, "utf8");
      await rm(bundledPath, { force: true });
    } catch {
      originalBundled = null;
    }

    try {
      const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
        cwd: process.cwd()
      });
      expect(stdout).toContain("Runtime mode: official");
      expect(stdout).toContain("Runtime reason: official_npx_latest");
    } finally {
      if (originalBundled !== null) {
        await mkdir(join(runtimeDir, "node_modules", "openclaw"), { recursive: true });
        await writeFile(bundledPath, originalBundled, "utf8");
      }
    }
  });
});
