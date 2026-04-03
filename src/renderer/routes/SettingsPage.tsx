import type { AdvancedSettings } from "../../shared/contracts";
import { isOnclawRoot } from "../../main/paths";

const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  rootDir: "onclaw",
  host: "127.0.0.1",
  tokenMode: "auto-random",
  providerTimeoutMs: 10_000,
  providerRetryCount: 2
};

export function normalizeAdvancedSettings(input: Partial<Omit<AdvancedSettings, "tokenMode">> = {}): AdvancedSettings {
  const rootDir = input.rootDir && isOnclawRoot(input.rootDir) ? input.rootDir : DEFAULT_ADVANCED_SETTINGS.rootDir;
  const timeoutMs = input.providerTimeoutMs ?? DEFAULT_ADVANCED_SETTINGS.providerTimeoutMs;
  const retryCount = input.providerRetryCount ?? DEFAULT_ADVANCED_SETTINGS.providerRetryCount;

  return {
    rootDir,
    host: "127.0.0.1",
    tokenMode: "auto-random",
    providerTimeoutMs: timeoutMs,
    providerRetryCount: retryCount
  };
}

export function SettingsPage(input: Partial<Omit<AdvancedSettings, "tokenMode">> = {}) {
  const settings = normalizeAdvancedSettings(input);
  return [
    "Settings",
    `root: ${settings.rootDir}`,
    `host: ${settings.host}`,
    `token: ${settings.tokenMode}`,
    `timeoutMs: ${settings.providerTimeoutMs}`,
    `retry: ${settings.providerRetryCount}`
  ].join("\n");
}
