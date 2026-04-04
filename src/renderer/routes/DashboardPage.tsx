import type { GatewayActionResult } from "../../main/gateway-actions";

export type DashboardStatus = "running" | "stopped";

export interface DashboardViewModel {
  url: string;
  token: string;
  status: DashboardStatus;
  healthy: boolean;
  lastAction?: GatewayActionResult;
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

export function DashboardPage(input: DashboardViewModel) {
  return [
    "Dashboard",
    `url: ${input.url}`,
    `token: ${input.token}`,
    `status: ${input.status}`,
    `health: ${healthLabel(input.healthy)}`,
    "actions: start stop restart",
    actionState(input.lastAction)
  ].join("\n");
}
