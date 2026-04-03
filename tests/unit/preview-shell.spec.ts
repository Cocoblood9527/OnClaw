import { describe, expect, it } from "vitest";
import { PREVIEW_HOST, buildPreviewViews } from "../../src/preview/shell";

describe("preview shell", () => {
  it("uses localhost-only host", () => {
    expect(PREVIEW_HOST).toBe("127.0.0.1");
  });

  it("renders setup/provider/settings previews with secure defaults", () => {
    const views = buildPreviewViews();

    expect(views.setup).toContain("Setup");
    expect(views.provider).toContain("selected: minimax");
    expect(views.provider).toContain("model: MiniMax-M2.7");
    expect(views.provider).toContain("docs: https://platform.minimaxi.com/docs/api-reference/text-openai-api");
    expect(views.settings).toContain("host: 127.0.0.1");
    expect(views.settings).toContain("token: auto-random");
    expect(views.settings).toContain("root: onclaw");
  });

  it("keeps onclaw root constraint and allows minimal tuning", () => {
    const blocked = buildPreviewViews({ settingsRootDir: "/tmp/outside" });
    const tuned = buildPreviewViews({
      setupRuntimePresent: true,
      setupProviderReachable: true,
      providerId: "openai",
      settingsRootDir: "/tmp/onclaw",
      settingsTimeoutMs: 15_000,
      settingsRetryCount: 1
    });

    expect(blocked.settings).toContain("root: onclaw");
    expect(tuned.setup).toContain("ready: ok");
    expect(tuned.provider).toContain("selected: openai");
    expect(tuned.settings).toContain("root: /tmp/onclaw");
    expect(tuned.settings).toContain("timeoutMs: 15000");
    expect(tuned.settings).toContain("retry: 1");
  });
});
