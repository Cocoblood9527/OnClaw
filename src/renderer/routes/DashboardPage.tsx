import type { GatewayActionResult } from "../../main/gateway-actions";

export type DashboardStatus = "running" | "stopped";

export interface DashboardViewModel {
  url: string;
  token: string;
  status: DashboardStatus;
  healthy: boolean;
  lastAction?: GatewayActionResult;
  lastChatOpen?: {
    ok: boolean;
    message: string;
  };
}

export function buildDashboardChatUrl(gatewayUrl: string, token: string) {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new Error("missing token");
  }

  const parsedGatewayUrl = new URL(gatewayUrl);
  const port = parsedGatewayUrl.port || (parsedGatewayUrl.protocol === "https:" ? "443" : "80");
  const chatUrl = new URL(`${parsedGatewayUrl.protocol}//127.0.0.1:${port}/chat`);
  chatUrl.searchParams.set("token", trimmedToken);
  return chatUrl.toString();
}

function healthLabel(healthy: boolean) {
  return healthy ? "ok" : "fail";
}

function actionState(lastAction?: GatewayActionResult) {
  if (!lastAction) {
    return "lastAction: none";
  }
  const status = lastAction.ok ? "ok" : "fail";
  return `lastAction: ${lastAction.action} ${status} (${lastAction.message})`;
}

function chatOpenState(lastChatOpen?: { ok: boolean; message: string }) {
  if (!lastChatOpen) {
    return "openChat: none";
  }
  const status = lastChatOpen.ok ? "ok" : "fail";
  return `openChat: ${status} (${lastChatOpen.message})`;
}

function chatEntryState(gatewayUrl: string, token: string) {
  try {
    return `enterChat: ${buildDashboardChatUrl(gatewayUrl, token)}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `enterChat: unavailable (${message})`;
  }
}

export function DashboardPage(input: DashboardViewModel) {
  return [
    "Dashboard",
    `url: ${input.url}`,
    `token: ${input.token}`,
    `status: ${input.status}`,
    `health: ${healthLabel(input.healthy)}`,
    "actions: start stop restart",
    chatEntryState(input.url, input.token),
    actionState(input.lastAction),
    chatOpenState(input.lastChatOpen)
  ].join("\n");
}
