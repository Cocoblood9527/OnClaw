export function StatusBar(status: "running" | "degraded" | "failed", port: number) {
  return `${status} | ${port} | 日志入口`;
}
