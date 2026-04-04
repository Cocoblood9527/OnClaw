import type { AdvancedSettings } from "../../shared/contracts";
import { isOnclawRoot } from "../../main/paths";

const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  rootDir: "onclaw",
  host: "127.0.0.1",
  tokenMode: "auto-random",
  providerTimeoutMs: 10_000,
  providerRetryCount: 2
};

function normalizeTimeoutMs(timeoutMs?: number) {
  if (timeoutMs === undefined) {
    return DEFAULT_ADVANCED_SETTINGS.providerTimeoutMs;
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 120_000) {
    return DEFAULT_ADVANCED_SETTINGS.providerTimeoutMs;
  }
  return Math.floor(timeoutMs);
}

function normalizeRetryCount(retryCount?: number) {
  if (retryCount === undefined) {
    return DEFAULT_ADVANCED_SETTINGS.providerRetryCount;
  }
  if (!Number.isInteger(retryCount) || retryCount < 0 || retryCount > 5) {
    return DEFAULT_ADVANCED_SETTINGS.providerRetryCount;
  }
  return retryCount;
}

export function normalizeAdvancedSettings(input: Partial<Omit<AdvancedSettings, "tokenMode">> = {}): AdvancedSettings {
  const rootDir = input.rootDir && isOnclawRoot(input.rootDir) ? input.rootDir : DEFAULT_ADVANCED_SETTINGS.rootDir;
  const timeoutMs = normalizeTimeoutMs(input.providerTimeoutMs);
  const retryCount = normalizeRetryCount(input.providerRetryCount);

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
    `retry: ${settings.providerRetryCount}`,
    "runReady: ok"
  ].join("\n");
}
