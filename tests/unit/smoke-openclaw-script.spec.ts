import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("smoke-openclaw script", () => {
  it("uses managed runtime entry under onclaw/runtime and verifies health endpoint", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    const runtimeEntry = join(runtimeDir, "openclaw-entry.cjs");
    await mkdir(runtimeDir, { recursive: true });
    await writeFile(
      runtimeEntry,
      [
        'const http = require("node:http");',
        'const host = process.env.ONCLAW_HEALTH_HOST || "127.0.0.1";',
        'const port = Number(process.env.ONCLAW_HEALTH_PORT || "18789");',
        "const server = http.createServer((req, res) => {",
        '  if (req.url === "/health") {',
        "    res.statusCode = 200;",
        '    res.end("ok");',
        "    return;",
        "  }",
        "  res.statusCode = 404;",
        '  res.end("not-found");',
        "});",
        "server.listen(port, host);",
        "const shutdown = () => server.close(() => process.exit(0));",
        'process.on("SIGTERM", shutdown);',
        'process.on("SIGINT", shutdown);'
      ].join("\n"),
      "utf8"
    );
    const { stdout } = await execFileAsync("pwsh", ["./scripts/smoke-openclaw.ps1"], {
      cwd: process.cwd()
    });

    expect(stdout).toContain("Running portable smoke checks...");
    expect(stdout).toContain("Runtime entry:");
    expect(stdout).toContain("onclaw/runtime/openclaw-entry.cjs");
    expect(stdout).toContain("Gateway health check passed");
    expect(stdout).toContain("Smoke checks passed");
  });
});
