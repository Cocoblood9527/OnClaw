import type { GatewayActionResult } from "../main/gateway-actions.js";
import { DashboardPage } from "../renderer/routes/DashboardPage.js";
import { ProviderPage } from "../renderer/routes/ProviderPage.js";
import { SettingsPage } from "../renderer/routes/SettingsPage.js";
import { SetupPage } from "../renderer/routes/SetupPage.js";

export const PREVIEW_HOST = "127.0.0.1";
const DEFAULT_PREVIEW_PORT = 4174;
const configuredPreviewPort = Number(process.env.ONCLAW_PREVIEW_PORT ?? DEFAULT_PREVIEW_PORT);
export const PREVIEW_PORT = Number.isFinite(configuredPreviewPort) && configuredPreviewPort > 0 ? configuredPreviewPort : DEFAULT_PREVIEW_PORT;

export interface PreviewInput {
  setupRootWritable?: boolean;
  setupRuntimePresent?: boolean;
  setupProviderReachable?: boolean;
  providerId?: string;
  settingsRootDir?: string;
  settingsTimeoutMs?: number;
  settingsRetryCount?: number;
  dashboardUrl?: string;
  dashboardToken?: string;
  dashboardStatus?: "running" | "stopped";
  dashboardHealthy?: boolean;
  dashboardLastAction?: GatewayActionResult;
  dashboardLastChatOpen?: {
    ok: boolean;
    message: string;
  };
}

export interface PreviewViews {
  setup: string;
  provider: string;
  settings: string;
  dashboard: string;
}

export function buildPreviewViews(input: PreviewInput = {}): PreviewViews {
  const rootWritable = input.setupRootWritable ?? true;
  const runtimePresent = input.setupRuntimePresent ?? false;
  const providerReachable = input.setupProviderReachable ?? true;

  return {
    setup: SetupPage({
      rootWritable,
      runtimePresent,
      providerReachable,
      ready: rootWritable && runtimePresent && providerReachable
    }),
    provider: ProviderPage(input.providerId ?? "minimax"),
    settings: SettingsPage({
      rootDir: input.settingsRootDir,
      providerTimeoutMs: input.settingsTimeoutMs,
      providerRetryCount: input.settingsRetryCount
    }),
    dashboard: DashboardPage({
      url: input.dashboardUrl ?? "http://127.0.0.1:18790",
      token: input.dashboardToken ?? "auto-random",
      status: input.dashboardStatus ?? (runtimePresent ? "running" : "stopped"),
      healthy: input.dashboardHealthy ?? runtimePresent,
      lastAction: input.dashboardLastAction,
      lastChatOpen: input.dashboardLastChatOpen
    })
  };
}
