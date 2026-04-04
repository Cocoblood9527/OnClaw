import { createServer } from "node:http";
import {
  PREVIEW_HOST,
  PREVIEW_PORT,
  buildPreviewViews,
  type PreviewInput
} from "../src/preview/shell";
import { buildDashboardChatUrl } from "../src/renderer/routes/DashboardPage";
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

let dashboardState: {
  url: string;
  token: string;
  status: "running" | "stopped";
  healthy: boolean;
  lastAction?: GatewayActionResult;
  lastChatOpen?: {
    ok: boolean;
    message: string;
  };
} = {
  url: "http://127.0.0.1:18790",
  token: "auto-random",
  status: "stopped",
  healthy: false
};
let dashboardInitialized = false;

function syncDashboardFromSetup(runtimePresent: boolean) {
  if (dashboardInitialized) return;
  dashboardState = {
    url: dashboardState.url,
    token: dashboardState.token,
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
    const gatewayPort = parseNumber(url.searchParams.get("gatewayPort"));
    const gatewayToken = url.searchParams.get("gatewayToken");
    syncDashboardFromSetup(runtimePresent);
    if (gatewayPort && gatewayPort > 0) {
      dashboardState.url = `http://127.0.0.1:${gatewayPort}`;
    }
    if (gatewayToken !== null) {
      dashboardState.token = gatewayToken;
    }

    const views = buildPreviewViews({
      setupRootWritable: parseBoolean(url.searchParams.get("rootWritable"), true),
      setupRuntimePresent: runtimePresent,
      setupProviderReachable: parseBoolean(url.searchParams.get("providerReachable"), true),
      providerId: url.searchParams.get("provider") ?? undefined,
      settingsRootDir: url.searchParams.get("rootDir") ?? undefined,
      settingsTimeoutMs: parseNumber(url.searchParams.get("timeoutMs")),
      settingsRetryCount: parseNumber(url.searchParams.get("retry")),
      dashboardUrl: dashboardState.url,
      dashboardToken: dashboardState.token,
      dashboardStatus: dashboardState.status,
      dashboardHealthy: dashboardState.healthy,
      dashboardLastAction: dashboardState.lastAction,
      dashboardLastChatOpen: dashboardState.lastChatOpen
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

  if (url.pathname === "/api/open-chat") {
    try {
      const chatUrl = buildDashboardChatUrl(dashboardState.url, dashboardState.token);
      dashboardState.lastChatOpen = { ok: true, message: "opened" };
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true, url: chatUrl, message: "opened" }));
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dashboardState.lastChatOpen = { ok: false, message };
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, message }));
      return;
    }
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
    .controls{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))} label{display:grid;gap:4px;font-size:12px;color:var(--muted)} input,select,textarea{padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:#0b1624;color:var(--text)}
    .chat{grid-column:span 12}.chat-status{font-size:12px;color:var(--muted);margin-bottom:8px}.chat-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:8px}.chat-toolbar select{min-width:220px}
    .chat-messages{height:340px;overflow:auto;border:1px solid var(--line);border-radius:10px;background:#0b1624;padding:10px;display:grid;gap:8px}
    .msg{display:grid;gap:4px;padding:8px;border:1px solid var(--line);border-radius:8px;max-width:88%}.msg.user{justify-self:end;background:#153454}.msg.assistant{justify-self:start;background:#122136}.msg.system{justify-self:center;max-width:100%;background:#1d2938}
    .msg-role{font-size:11px;color:var(--muted)}.msg-text{white-space:pre-wrap;line-height:1.4}
    .chat-compose{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:8px}.chat-compose textarea{min-height:64px;resize:vertical}
    .chat-empty{color:var(--muted);font-size:13px;text-align:center;padding:18px 0}
    @media(max-width:960px){.app{grid-template-columns:1fr}.side{border-right:0;border-bottom:1px solid var(--line)}.card,.runtime,.dev{grid-column:span 12}.chat-compose{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="app">
    <aside class="side">
      <div class="brand">OnClaw Control</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px">Phase 3 M1 Preview</div>
      <nav class="nav"><div class="on">Dashboard</div><div>Setup</div><div>Provider</div><div>Settings</div></nav>
    </aside>
    <main class="main">
      <div class="top"><h1 class="title">Gateway Dashboard</h1><div style="display:flex;gap:8px"><span class="tag">Localhost Only</span><span class="tag">M1 Scope</span></div></div>
      <div class="grid">
        <section class="card runtime"><h2>Runtime</h2><pre id="dashboard"></pre><div class="actions"><button type="button" data-action="start">Start</button><button type="button" data-action="stop">Stop</button><button type="button" data-action="restart">Restart</button><button type="button" id="open-chat">进入聊天页</button></div></section>
        <section class="card"><h2>Setup</h2><pre id="setup"></pre></section>
        <section class="card"><h2>Provider</h2><pre id="provider"></pre></section>
        <section class="card"><h2>Settings</h2><pre id="settings"></pre></section>
        <section class="card chat">
          <h2>Chat（ClawX 风格）</h2>
          <div id="chat-sync-status" class="chat-status">chatSync: idle</div>
          <div class="chat-toolbar">
            <select id="chat-session"></select>
            <button type="button" id="chat-refresh">刷新</button>
          </div>
          <div id="chat-messages" class="chat-messages"><div class="chat-empty">等待连接网关...</div></div>
          <div class="chat-compose">
            <textarea id="chat-input" placeholder="输入消息后发送"></textarea>
            <button type="button" id="chat-send">发送</button>
          </div>
        </section>
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
            <label>Gateway port<input name="gatewayPort" type="number" value="18790" /></label>
            <label>Gateway token<input name="gatewayToken" value="auto-random" /></label>
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

    const chatSyncStatus = document.getElementById("chat-sync-status");
    const chatMessages = document.getElementById("chat-messages");
    const chatSession = document.getElementById("chat-session");
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    const chatRefresh = document.getElementById("chat-refresh");

    const chatState = {
      client: null,
      sessionKey: "",
      sessions: [],
      gatewayPort: "",
      gatewayToken: "",
      pollTimer: null,
      loadingHistory: false,
    };

    function setChatStatus(text) {
      chatSyncStatus.textContent = text;
    }

    function stopChatPolling() {
      if (chatState.pollTimer) {
        clearInterval(chatState.pollTimer);
        chatState.pollTimer = null;
      }
    }

    function startChatPolling() {
      stopChatPolling();
      chatState.pollTimer = setInterval(() => {
        void loadChatHistory(true);
      }, 3000);
    }

    function normalizeMessageText(content) {
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .filter((item) => item && item.type === "text" && typeof item.text === "string")
          .map((item) => item.text)
          .join("\\n")
          .trim();
      }
      return "";
    }

    function renderChatMessages(messages) {
      chatMessages.innerHTML = "";
      if (!Array.isArray(messages) || messages.length === 0) {
        const empty = document.createElement("div");
        empty.className = "chat-empty";
        empty.textContent = "暂无消息";
        chatMessages.appendChild(empty);
        return;
      }

      const visible = messages.filter((item) => item && item.role !== "toolresult" && item.role !== "tool_result");
      if (visible.length === 0) {
        const empty = document.createElement("div");
        empty.className = "chat-empty";
        empty.textContent = "暂无可展示消息";
        chatMessages.appendChild(empty);
        return;
      }

      for (const message of visible) {
        const role = typeof message.role === "string" ? message.role : "system";
        const row = document.createElement("div");
        row.className = "msg " + (role === "user" ? "user" : role === "assistant" ? "assistant" : "system");

        const roleLine = document.createElement("div");
        roleLine.className = "msg-role";
        roleLine.textContent = role;

        const body = document.createElement("div");
        body.className = "msg-text";
        const text = normalizeMessageText(message.content);
        body.textContent = text || "[" + role + "]";

        row.appendChild(roleLine);
        row.appendChild(body);
        chatMessages.appendChild(row);
      }

      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    class GatewayWsClient {
      constructor(port, token) {
        this.port = port;
        this.token = token;
        this.ws = null;
        this.pending = new Map();
        this.connectPromise = null;
      }

      connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
        if (this.connectPromise) return this.connectPromise;

        this.connectPromise = new Promise((resolve, reject) => {
          const ws = new WebSocket("ws://127.0.0.1:" + this.port + "/");
          this.ws = ws;
          let connected = false;

          const failAllPending = (error) => {
            for (const [id, item] of this.pending.entries()) {
              clearTimeout(item.timeout);
              item.reject(error);
              this.pending.delete(id);
            }
          };

          ws.onopen = () => setChatStatus("chatSync: challenge");

          ws.onmessage = (event) => {
            let message;
            try {
              message = JSON.parse(String(event.data));
            } catch {
              return;
            }

            if (message && message.type === "event" && message.event === "connect.challenge") {
              const frame = {
                type: "req",
                id: "connect-" + Date.now(),
                method: "connect",
                params: {
                  minProtocol: 3,
                  maxProtocol: 3,
                  client: {
                    id: "onclaw-preview",
                    displayName: "OnClaw Dashboard",
                    version: "0.1.0",
                    platform: navigator.platform,
                    mode: "ui"
                  },
                  auth: { token: this.token },
                  caps: [],
                  role: "operator",
                  scopes: ["operator.admin"]
                }
              };
              ws.send(JSON.stringify(frame));
              return;
            }

            if (message && message.type === "res" && typeof message.id === "string") {
              if (message.id.indexOf("connect-") === 0) {
                if (message.ok === false || message.error) {
                  const errorMessage = typeof message.error === "object" && message.error
                    ? String(message.error.message || JSON.stringify(message.error))
                    : String(message.error || "connect rejected");
                  reject(new Error(errorMessage));
                  return;
                }
                connected = true;
                setChatStatus("chatSync: connected");
                resolve();
                return;
              }

              const pending = this.pending.get(message.id);
              if (!pending) return;
              clearTimeout(pending.timeout);
              this.pending.delete(message.id);
              if (message.ok === false || message.error) {
                const errorMessage = typeof message.error === "object" && message.error
                  ? String(message.error.message || JSON.stringify(message.error))
                  : String(message.error || "gateway rpc failed");
                pending.reject(new Error(errorMessage));
              } else {
                pending.resolve(message.payload || {});
              }
            }
          };

          ws.onerror = () => {
            if (!connected) reject(new Error("websocket error"));
          };

          ws.onclose = () => {
            this.ws = null;
            failAllPending(new Error("gateway websocket closed"));
            if (connected) {
              setChatStatus("chatSync: disconnected");
            }
          };
        }).finally(() => {
          this.connectPromise = null;
        });

        return this.connectPromise;
      }

      async rpc(method, params, timeoutMs) {
        await this.connect();
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          throw new Error("gateway socket disconnected");
        }

        const id = "rpc-" + Date.now() + "-" + Math.random().toString(16).slice(2);
        const payload = {
          type: "req",
          id,
          method,
          params: params || {}
        };

        return await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            this.pending.delete(id);
            reject(new Error("gateway rpc timeout: " + method));
          }, timeoutMs || 30000);

          this.pending.set(id, { resolve, reject, timeout });
          this.ws.send(JSON.stringify(payload));
        });
      }

      close() {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
      }
    }

    function getGatewayConfigFromForm() {
      const rawPort = String(form.elements.namedItem("gatewayPort")?.value || "").trim();
      const rawToken = String(form.elements.namedItem("gatewayToken")?.value || "").trim();
      return { port: rawPort, token: rawToken };
    }

    function disconnectChatClient() {
      stopChatPolling();
      if (chatState.client) {
        chatState.client.close();
      }
      chatState.client = null;
    }

    async function ensureChatClient() {
      const cfg = getGatewayConfigFromForm();
      if (!cfg.port || !cfg.token) {
        disconnectChatClient();
        setChatStatus("chatSync: fail (missing gateway port/token)");
        renderChatMessages([]);
        return null;
      }

      const changed = chatState.gatewayPort !== cfg.port || chatState.gatewayToken !== cfg.token;
      if (changed) {
        disconnectChatClient();
        chatState.gatewayPort = cfg.port;
        chatState.gatewayToken = cfg.token;
      }

      if (!chatState.client) {
        chatState.client = new GatewayWsClient(cfg.port, cfg.token);
      }

      try {
        await chatState.client.connect();
        startChatPolling();
        return chatState.client;
      } catch (error) {
        disconnectChatClient();
        setChatStatus("chatSync: fail (" + (error instanceof Error ? error.message : String(error)) + ")");
        return null;
      }
    }

    async function loadChatSessionsAndHistory() {
      const client = await ensureChatClient();
      if (!client) return;

      try {
        const sessionsResult = await client.rpc("sessions.list", {});
        const sessions = Array.isArray(sessionsResult.sessions) ? sessionsResult.sessions : [];
        const normalized = sessions
          .map((item) => ({
            key: String(item && item.key ? item.key : "").trim(),
            label: String(item && (item.displayName || item.label || item.key) ? (item.displayName || item.label || item.key) : "").trim()
          }))
          .filter((item) => item.key);

        if (normalized.length === 0) {
          normalized.push({ key: "agent:main:main", label: "agent:main:main" });
        }

        chatState.sessions = normalized;
        const existed = normalized.find((item) => item.key === chatState.sessionKey);
        if (!existed) {
          chatState.sessionKey = normalized[0].key;
        }

        chatSession.innerHTML = "";
        for (const item of normalized) {
          const option = document.createElement("option");
          option.value = item.key;
          option.textContent = item.label;
          chatSession.appendChild(option);
        }
        chatSession.value = chatState.sessionKey;

        await loadChatHistory(false);
      } catch (error) {
        setChatStatus("chatSync: fail (" + (error instanceof Error ? error.message : String(error)) + ")");
      }
    }

    async function loadChatHistory(silent) {
      if (chatState.loadingHistory) return;
      if (!chatState.sessionKey) return;

      const client = await ensureChatClient();
      if (!client) return;
      chatState.loadingHistory = true;

      try {
        const history = await client.rpc("chat.history", {
          sessionKey: chatState.sessionKey,
          limit: 80
        });
        const messages = Array.isArray(history.messages) ? history.messages : [];
        renderChatMessages(messages);
        if (!silent) {
          setChatStatus("chatSync: connected");
        }
      } catch (error) {
        if (!silent) {
          setChatStatus("chatSync: fail (" + (error instanceof Error ? error.message : String(error)) + ")");
        }
      } finally {
        chatState.loadingHistory = false;
      }
    }

    async function sendChatMessage() {
      const text = String(chatInput.value || "").trim();
      if (!text) return;
      if (!chatState.sessionKey) {
        await loadChatSessionsAndHistory();
        if (!chatState.sessionKey) return;
      }

      const client = await ensureChatClient();
      if (!client) return;

      chatSend.disabled = true;
      setChatStatus("chatSync: sending");

      try {
        await client.rpc("chat.send", {
          sessionKey: chatState.sessionKey,
          message: text,
          deliver: false,
          idempotencyKey: crypto.randomUUID()
        }, 120000);
        chatInput.value = "";
        await loadChatHistory(false);
        setTimeout(() => { void loadChatHistory(true); }, 1500);
      } catch (error) {
        setChatStatus("chatSync: fail (" + (error instanceof Error ? error.message : String(error)) + ")");
      } finally {
        chatSend.disabled = false;
      }
    }

    async function refresh() {
      const params = new URLSearchParams(new FormData(form));
      const data = await fetch("/api/views?" + params.toString()).then((r) => r.json());
      document.getElementById("dashboard").textContent = data.dashboard;
      document.getElementById("setup").textContent = data.setup;
      document.getElementById("provider").textContent = data.provider;
      document.getElementById("settings").textContent = data.settings;
      await loadChatSessionsAndHistory();
    }

    async function runAction(action) {
      await fetch("/api/gateway-action?action=" + encodeURIComponent(action), { method: "POST" });
      await refresh();
    }

    async function openChat() {
      const result = await fetch("/api/open-chat", { method: "POST" }).then((r) => r.json());
      if (result.ok && result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
      await refresh();
    }

    document.querySelectorAll("button[data-action]").forEach((button) => {
      button.addEventListener("click", () => runAction(button.dataset.action));
    });
    document.getElementById("open-chat").addEventListener("click", openChat);

    chatRefresh.addEventListener("click", () => {
      void loadChatSessionsAndHistory();
    });
    chatSession.addEventListener("change", () => {
      chatState.sessionKey = chatSession.value;
      void loadChatHistory(false);
    });
    chatSend.addEventListener("click", () => {
      void sendChatMessage();
    });
    chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void sendChatMessage();
      }
    });

    form.addEventListener("input", () => { void refresh(); });
    form.addEventListener("change", () => { void refresh(); });
    void refresh();
  </script>
</body>
</html>`);
});

server.listen(PREVIEW_PORT, PREVIEW_HOST, () => {
  process.stdout.write(`OnClaw preview shell running at http://${PREVIEW_HOST}:${PREVIEW_PORT}\n`);
});
