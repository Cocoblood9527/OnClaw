import type { GatewayActionResult } from "../../main/gateway-actions";

export type DashboardStatus = "running" | "stopped";

export interface DashboardViewModel {
  url: string;
  token: string;
  status: DashboardStatus;
  healthy: boolean;
  lastAction?: GatewayActionResult;
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
