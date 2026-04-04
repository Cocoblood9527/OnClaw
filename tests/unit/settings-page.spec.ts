import { describe, expect, it } from "vitest";
import { SettingsPage, normalizeAdvancedSettings } from "../../src/renderer/routes/SettingsPage";

describe("SettingsPage", () => {
  it("keeps secure defaults for host/token and managed root", () => {
    const view = SettingsPage();

    expect(view).toContain("host: 127.0.0.1");
    expect(view).toContain("token: auto-random");
    expect(view).toContain("root: onclaw");
  });

  it("rejects non-onclaw root and non-localhost host input", () => {
    const settings = normalizeAdvancedSettings({
      rootDir: "/tmp/workspace",
      host: "0.0.0.0"
    });

    expect(settings.rootDir).toBe("onclaw");
    expect(settings.host).toBe("127.0.0.1");
  });

  it("accepts minimal advanced tuning values", () => {
    const view = SettingsPage({
      rootDir: "/tmp/onclaw",
      providerTimeoutMs: 15_000,
      providerRetryCount: 1
    });

    expect(view).toContain("timeoutMs: 15000");
    expect(view).toContain("retry: 1");
    expect(view).toContain("root: /tmp/onclaw");
  });

  it("falls back to secure runtime defaults when tuning is invalid", () => {
    const settings = normalizeAdvancedSettings({
      providerTimeoutMs: 0,
      providerRetryCount: -1
    });

    expect(settings.providerTimeoutMs).toBe(10_000);
    expect(settings.providerRetryCount).toBe(2);
  });

  it("shows run-ready state after normalization", () => {
    const view = SettingsPage({
      rootDir: "/tmp/outside",
      providerTimeoutMs: -10,
      providerRetryCount: 99
    });

    expect(view).toContain("runReady: ok");
    expect(view).toContain("root: onclaw");
    expect(view).toContain("timeoutMs: 10000");
    expect(view).toContain("retry: 2");
  });
});
