const http = require("node:http");
const { spawn } = require("node:child_process");
const { existsSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const host = "127.0.0.1";
const healthPort = Number(process.env.ONCLAW_HEALTH_PORT || "18789");
const gatewayPort = Number(process.env.ONCLAW_GATEWAY_PORT || String(healthPort + 1));

const runtimeDir = __dirname;
const onclawRoot = path.resolve(runtimeDir, "..");
const bundledOpenClawMjsPath = path.join(runtimeDir, "node_modules", "openclaw", "openclaw.mjs");
const envOpenClawMjsPath = process.env.ONCLAW_OPENCLAW_MJS;

let mode = "probe";
let reason = "probe_default";
let officialGatewayProcess = null;

function startOfficialGatewayIfAvailable() {
  if (process.env.ONCLAW_FORCE_PROBE === "1") {
    reason = "forced_probe";
    return;
  }

  const stateDir = path.join(onclawRoot, "data", ".openclaw");
  mkdirSync(stateDir, { recursive: true });
  const configPath = path.join(stateDir, "openclaw.json");

  let child = null;
  if (envOpenClawMjsPath) {
    if (!existsSync(envOpenClawMjsPath)) {
      reason = "official_env_path_missing";
      return;
    }
    child = spawn(process.execPath, [envOpenClawMjsPath, "gateway", "--port", String(gatewayPort)], {
      stdio: "ignore",
      env: {
        ...process.env,
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_CONFIG_PATH: configPath
      }
    });
    reason = "official_env_path";
  } else if (existsSync(bundledOpenClawMjsPath)) {
    child = spawn(process.execPath, [bundledOpenClawMjsPath, "gateway", "--port", String(gatewayPort)], {
      stdio: "ignore",
      env: {
        ...process.env,
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_CONFIG_PATH: configPath
      }
    });
    reason = "official_bundled_mjs";
  } else if (process.env.ONCLAW_DISABLE_NPX_OFFICIAL === "1") {
    reason = "official_disabled";
    return;
  } else {
    child = spawn("npx", ["--yes", "openclaw@latest", "gateway", "--port", String(gatewayPort)], {
      stdio: "ignore",
      env: {
        ...process.env,
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_CONFIG_PATH: configPath
      }
    });
    reason = "official_npx_latest";
  }

  if (!child || !child.pid) {
    mode = "probe";
    reason = "official_spawn_failed";
    officialGatewayProcess = null;
    return;
  }

  mode = "official";
  officialGatewayProcess = child;
  child.once("error", () => {
    mode = "probe";
    reason = "official_spawn_error";
    officialGatewayProcess = null;
  });
  child.once("exit", () => {
    mode = "probe";
    reason = "official_process_exited";
    officialGatewayProcess = null;
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: true, mode, reason }));
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
