import { createServer } from "node:http";
import {
  PREVIEW_HOST,
  PREVIEW_PORT,
  buildPreviewViews,
  type PreviewInput
} from "../src/preview/shell";
import {
  GATEWAY_ACTIONS,
  runGatewayAction,
  type GatewayAction,
  type GatewayActionResult
} from "../src/main/gateway-actions";

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === "1") return true;
  if (value === "0") return false;
  return fallback;
}

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseGatewayAction(value: string | null): GatewayAction | null {
  if (!value) return null;
  return GATEWAY_ACTIONS.find((item) => item === value) ?? null;
}

let dashboardState: { status: "running" | "stopped"; healthy: boolean; lastAction?: GatewayActionResult } = {
  status: "stopped",
  healthy: false
};
let dashboardInitialized = false;

function syncDashboardFromSetup(runtimePresent: boolean) {
  if (dashboardInitialized) return;
  dashboardState = {
    status: runtimePresent ? "running" : "stopped",
    healthy: runtimePresent
  };
  dashboardInitialized = true;
}

function applyDashboardAction(result: GatewayActionResult) {
  if (result.ok) {
    if (result.action === "stop") {
      dashboardState.status = "stopped";
      dashboardState.healthy = false;
    } else {
      dashboardState.status = "running";
      dashboardState.healthy = true;
    }
  }
  dashboardState.lastAction = result;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/api/views") {
    const runtimePresent = parseBoolean(url.searchParams.get("runtimePresent"), false);
    syncDashboardFromSetup(runtimePresent);

    const views = buildPreviewViews({
      setupRootWritable: parseBoolean(url.searchParams.get("rootWritable"), true),
      setupRuntimePresent: runtimePresent,
      setupProviderReachable: parseBoolean(url.searchParams.get("providerReachable"), true),
      providerId: url.searchParams.get("provider") ?? undefined,
      settingsRootDir: url.searchParams.get("rootDir") ?? undefined,
      settingsTimeoutMs: parseNumber(url.searchParams.get("timeoutMs")),
      settingsRetryCount: parseNumber(url.searchParams.get("retry")),
      dashboardStatus: dashboardState.status,
      dashboardHealthy: dashboardState.healthy,
      dashboardLastAction: dashboardState.lastAction
    } satisfies PreviewInput);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(views));
    return;
  }

  if (url.pathname === "/api/gateway-action") {
    const action = parseGatewayAction(url.searchParams.get("action"));
    if (!action) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, message: "invalid action" }));
      return;
    }

    const result = await runGatewayAction(action, {
      runCommand: async () => ({ stdout: "ok" })
    });
    applyDashboardAction(result);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(result));
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OnClaw Dashboard Preview</title>
  <style>
    :root{--bg:#0a121d;--panel:#111c2b;--line:#263a53;--text:#dce8f8;--muted:#8aa1bb;--accent:#4ea4ff}
    *{box-sizing:border-box} body{margin:0;font-family:"Segoe UI",sans-serif;color:var(--text);background:radial-gradient(circle at 0 0,#17365a,transparent 35%),var(--bg)}
    .app{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
    .side{padding:18px 14px;border-right:1px solid var(--line);background:#0c1725}
    .brand{font-weight:700}.nav{margin-top:18px;display:grid;gap:8px}.nav div{padding:9px 10px;border-radius:10px;color:var(--muted);border:1px solid transparent}.nav .on{color:#f2f7ff;background:#13263d;border-color:#2d4f75}
    .main{padding:18px}.top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}.title{margin:0;font-size:22px}
    .tag{font-size:12px;padding:5px 9px;border:1px solid var(--line);border-radius:999px;background:#102235}
    .grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}.card{grid-column:span 4;border:1px solid var(--line);background:var(--panel);padding:12px;border-radius:12px}
    .runtime{grid-column:span 8}.dev{grid-column:span 12} h2{margin:0 0 8px;font-size:15px} pre{margin:0;white-space:pre-wrap;font-family:ui-monospace,monospace;line-height:1.45}
    .actions{display:flex;gap:8px;margin-top:10px} button{padding:7px 11px;border-radius:8px;border:1px solid #33587f;background:#18406a;color:#eaf4ff;cursor:pointer}
    .controls{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))} label{display:grid;gap:4px;font-size:12px;color:var(--muted)} input,select{padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:#0b1624;color:var(--text)}
    @media(max-width:960px){.app{grid-template-columns:1fr}.side{border-right:0;border-bottom:1px solid var(--line)}.card,.runtime,.dev{grid-column:span 12}}
  </style>
</head>
<body>
  <div class="app">
    <aside class="side">
      <div class="brand">OnClaw Control</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px">Phase 3 M0 Preview</div>
      <nav class="nav"><div class="on">Dashboard</div><div>Setup</div><div>Provider</div><div>Settings</div></nav>
    </aside>
    <main class="main">
      <div class="top"><h1 class="title">Gateway Dashboard</h1><div style="display:flex;gap:8px"><span class="tag">Localhost Only</span><span class="tag">M0 Scope</span></div></div>
      <div class="grid">
        <section class="card runtime"><h2>Runtime</h2><pre id="dashboard"></pre><div class="actions"><button type="button" data-action="start">Start</button><button type="button" data-action="stop">Stop</button><button type="button" data-action="restart">Restart</button></div></section>
        <section class="card"><h2>Setup</h2><pre id="setup"></pre></section>
        <section class="card"><h2>Provider</h2><pre id="provider"></pre></section>
        <section class="card"><h2>Settings</h2><pre id="settings"></pre></section>
        <section class="card dev">
          <h2>Dev Controls</h2>
          <form id="controls" class="controls">
            <label>Setup rootWritable<select name="rootWritable"><option value="1" selected>ok</option><option value="0">fail</option></select></label>
            <label>Setup runtimePresent<select name="runtimePresent"><option value="0" selected>fail</option><option value="1">ok</option></select></label>
            <label>Setup providerReachable<select name="providerReachable"><option value="1" selected>ok</option><option value="0">fail</option></select></label>
            <label>Provider<select name="provider"><option value="minimax" selected>minimax</option><option value="openai">openai</option><option value="anthropic">anthropic</option><option value="openrouter">openrouter</option></select></label>
            <label>Settings rootDir<input name="rootDir" value="onclaw" /></label>
            <label>Timeout ms<input name="timeoutMs" type="number" value="10000" /></label>
            <label>Retry<input name="retry" type="number" value="2" /></label>
          </form>
        </section>
      </div>
    </main>
  </div>
  <script>
    const form = document.getElementById("controls");
    const initialParams = new URLSearchParams(window.location.search);
    for (const [key, value] of initialParams.entries()) {
      const field = form.elements.namedItem(key);
      if (field && "value" in field) field.value = value;
    }
    async function refresh() {
      const params = new URLSearchParams(new FormData(form));
      const data = await fetch("/api/views?" + params.toString()).then((r) => r.json());
      document.getElementById("dashboard").textContent = data.dashboard;
      document.getElementById("setup").textContent = data.setup;
      document.getElementById("provider").textContent = data.provider;
      document.getElementById("settings").textContent = data.settings;
    }
    async function runAction(action) {
      await fetch("/api/gateway-action?action=" + encodeURIComponent(action), { method: "POST" });
      await refresh();
    }
    document.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", () => runAction(button.dataset.action));
    });
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    refresh();
  </script>
</body>
</html>`);
});

server.listen(PREVIEW_PORT, PREVIEW_HOST, () => {
  process.stdout.write(`OnClaw preview shell running at http://${PREVIEW_HOST}:${PREVIEW_PORT}\n`);
});
