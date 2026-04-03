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
});
