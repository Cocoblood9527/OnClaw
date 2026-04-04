export type DashboardStatus = "running" | "stopped";

export interface DashboardViewModel {
  url: string;
  token: string;
  status: DashboardStatus;
  healthy: boolean;
}

function healthLabel(healthy: boolean) {
  return healthy ? "ok" : "fail";
}

export function DashboardPage(input: DashboardViewModel) {
  return [
    "Dashboard",
    `url: ${input.url}`,
    `token: ${input.token}`,
    `status: ${input.status}`,
    `health: ${healthLabel(input.healthy)}`
  ].join("\n");
}
