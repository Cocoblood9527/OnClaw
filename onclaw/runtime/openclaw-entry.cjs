const http = require("node:http");
const { spawn } = require("node:child_process");
const { existsSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const host = process.env.ONCLAW_HEALTH_HOST || "127.0.0.1";
const healthPort = Number(process.env.ONCLAW_HEALTH_PORT || "18789");
const gatewayPort = Number(process.env.ONCLAW_GATEWAY_PORT || String(healthPort + 1));

const runtimeDir = __dirname;
const onclawRoot = path.resolve(runtimeDir, "..");
const officialMjsPath =
  process.env.ONCLAW_OPENCLAW_MJS || path.join(runtimeDir, "node_modules", "openclaw", "openclaw.mjs");

let mode = "probe";
let officialGatewayProcess = null;

function startOfficialGatewayIfAvailable() {
  if (process.env.ONCLAW_FORCE_PROBE === "1") {
    return;
  }
  if (!existsSync(officialMjsPath)) {
    return;
  }

  const stateDir = path.join(onclawRoot, "data", ".openclaw");
  mkdirSync(stateDir, { recursive: true });
  const configPath = path.join(stateDir, "openclaw.json");

  const child = spawn(process.execPath, [officialMjsPath, "gateway", "--port", String(gatewayPort)], {
    stdio: "ignore",
    env: {
      ...process.env,
      OPENCLAW_STATE_DIR: stateDir,
      OPENCLAW_CONFIG_PATH: configPath
    }
  });

  if (!child.pid) {
    return;
  }

  mode = "official";
  officialGatewayProcess = child;
  child.once("error", () => {
    mode = "probe";
    officialGatewayProcess = null;
  });
  child.once("exit", () => {
    mode = "probe";
    officialGatewayProcess = null;
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: true, mode }));
    return;
  }
  res.statusCode = 404;
  res.end("not-found");
});

startOfficialGatewayIfAvailable();
server.listen(healthPort, host);

const shutdown = () => {
  if (officialGatewayProcess && officialGatewayProcess.exitCode === null) {
    officialGatewayProcess.kill("SIGTERM");
  }
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
