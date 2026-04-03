import { createServer } from "node:http";
import { PREVIEW_HOST, PREVIEW_PORT, buildPreviewViews } from "../src/preview/shell";

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

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/api/views") {
    const views = buildPreviewViews({
      setupRootWritable: parseBoolean(url.searchParams.get("rootWritable"), true),
      setupRuntimePresent: parseBoolean(url.searchParams.get("runtimePresent"), false),
      setupProviderReachable: parseBoolean(url.searchParams.get("providerReachable"), true),
      providerId: url.searchParams.get("provider") ?? undefined,
      settingsRootDir: url.searchParams.get("rootDir") ?? undefined,
      settingsTimeoutMs: parseNumber(url.searchParams.get("timeoutMs")),
      settingsRetryCount: parseNumber(url.searchParams.get("retry"))
    });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(views));
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OnClaw Preview Shell</title>
    <style>
      body { font-family: monospace; margin: 16px; }
      .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
      pre { background: #f7f7f7; border: 1px solid #ddd; padding: 12px; white-space: pre-wrap; }
      form { display: grid; gap: 8px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-bottom: 12px; }
      label { display: grid; gap: 4px; font-size: 12px; }
      input, select { padding: 4px 6px; }
    </style>
  </head>
  <body>
    <h1>OnClaw Preview Shell (dev-only)</h1>
    <form id="controls">
      <label>Setup rootWritable<select name="rootWritable"><option value="1" selected>ok</option><option value="0">fail</option></select></label>
      <label>Setup runtimePresent<select name="runtimePresent"><option value="0" selected>fail</option><option value="1">ok</option></select></label>
      <label>Setup providerReachable<select name="providerReachable"><option value="1" selected>ok</option><option value="0">fail</option></select></label>
      <label>Provider<select name="provider"><option value="minimax" selected>minimax</option><option value="openai">openai</option><option value="anthropic">anthropic</option><option value="openrouter">openrouter</option></select></label>
      <label>Settings rootDir<input name="rootDir" value="onclaw" /></label>
      <label>Timeout ms<input name="timeoutMs" type="number" value="10000" /></label>
      <label>Retry<input name="retry" type="number" value="2" /></label>
    </form>
    <div class="grid">
      <pre id="setup"></pre>
      <pre id="provider"></pre>
      <pre id="settings"></pre>
    </div>
    <script>
      const form = document.getElementById("controls");
      const initialParams = new URLSearchParams(window.location.search);
      for (const [key, value] of initialParams.entries()) {
        const field = form.elements.namedItem(key);
        if (field && "value" in field) {
          field.value = value;
        }
      }
      async function refresh() {
        const params = new URLSearchParams(new FormData(form));
        const data = await fetch("/api/views?" + params.toString()).then((res) => res.json());
        document.getElementById("setup").textContent = data.setup;
        document.getElementById("provider").textContent = data.provider;
        document.getElementById("settings").textContent = data.settings;
      }
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
