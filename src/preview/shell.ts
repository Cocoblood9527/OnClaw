import { ProviderPage } from "../renderer/routes/ProviderPage.js";
import { SettingsPage } from "../renderer/routes/SettingsPage.js";
import { SetupPage } from "../renderer/routes/SetupPage.js";

export const PREVIEW_HOST = "127.0.0.1";
export const PREVIEW_PORT = 4174;

export interface PreviewInput {
  setupRootWritable?: boolean;
  setupRuntimePresent?: boolean;
  setupProviderReachable?: boolean;
  providerId?: string;
  settingsRootDir?: string;
  settingsTimeoutMs?: number;
  settingsRetryCount?: number;
}

export interface PreviewViews {
  setup: string;
  provider: string;
  settings: string;
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
    })
  };
}
