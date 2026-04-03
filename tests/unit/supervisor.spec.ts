import { createServer } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { pickAvailablePort, startManagedRuntime } from "../../src/main/supervisor";

describe("pickAvailablePort", () => {
  it("keeps preferred port when it is available", async () => {
    const preferredPort = 28795;
    const port = await pickAvailablePort(preferredPort, [preferredPort, 28796]);
    expect(port).toBe(preferredPort);
  });

  it("returns fallback port when preferred is occupied", async () => {
    const preferredPort = 28797;
    const blocker = createServer();
    try {
      await new Promise<void>((resolve, reject) => {
        blocker.once("error", reject);
        blocker.listen(preferredPort, "127.0.0.1", () => resolve());
      });

      const port = await pickAvailablePort(preferredPort, [preferredPort, 28798]);
      expect(port).toBe(28798);
    } finally {
      await new Promise<void>((resolve) => blocker.close(() => resolve()));
    }
  });
});

describe("startManagedRuntime", () => {
  it("starts child runtime on fallback port and passes health check", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-supervisor-"));
    const runtimeEntry = join(parent, "runtime-probe.cjs");
    const preferredPort = 28789;
    const fallbackPort = 28790;
    const blocker = createServer();
    try {
      await writeFile(
        runtimeEntry,
        [
          'const http = require("node:http");',
          'const host = process.env.ONCLAW_GATEWAY_HOST || "127.0.0.1";',
          'const port = Number(process.env.ONCLAW_GATEWAY_PORT || "18789");',
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

      await new Promise<void>((resolve, reject) => {
        blocker.once("error", reject);
        blocker.listen(preferredPort, "127.0.0.1", () => resolve());
      });

      const started = await startManagedRuntime({
        preferredPort,
        candidatePorts: [preferredPort, fallbackPort],
        runtimeEntry
      });

      expect(started.port).toBe(fallbackPort);
      const response = await fetch(started.healthUrl);
      expect(response.status).toBe(200);
      await started.stop();
    } finally {
      await new Promise<void>((resolve) => blocker.close(() => resolve()));
      await rm(parent, { recursive: true, force: true });
    }
  });
});
