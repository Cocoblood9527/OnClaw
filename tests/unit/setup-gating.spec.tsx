import { describe, expect, it } from "vitest";
import App, { renderFirstRunApp } from "../../src/renderer/App";
import { renderApp } from "../../src/renderer/main";
import { SetupPage } from "../../src/renderer/routes/SetupPage";

describe("setup gating", () => {
  it("redirects to setup when setup is incomplete", () => {
    expect(App()).toBe("Setup");
  });

  it("renderer entry returns setup shell on first run", () => {
    expect(renderApp()).toBe("Setup");
  });

  it("shows minimal self-check summary on setup page", () => {
    const setupView = SetupPage({
      rootWritable: true,
      runtimePresent: false,
      providerReachable: true,
      ready: false
    });
    expect(setupView).toContain("root: ok");
    expect(setupView).toContain("runtime: fail");
    expect(setupView).toContain("provider: ok");
    expect(setupView).toContain("\n");
  });

  it("keeps setup gate when self-check is not ready", async () => {
    const view = await renderFirstRunApp({
      runSetupSelfCheck: async () => ({
        rootWritable: true,
        runtimePresent: false,
        providerReachable: true,
        ready: false
      })
    }, {
      rootDir: "D:/onclaw",
      providerHealthUrl: "https://provider.test/health"
    });

    expect(view).toContain("Setup");
    expect(view).toContain("runtime: fail");
    expect(view).toContain("ready: fail");
  });

  it("enters chat when self-check is ready", async () => {
    const view = await renderFirstRunApp({
      runSetupSelfCheck: async () => ({
        rootWritable: true,
        runtimePresent: true,
        providerReachable: true,
        ready: true
      })
    }, {
      rootDir: "D:/onclaw",
      providerHealthUrl: "https://provider.test/health"
    });

    expect(view).toBe("Chat");
  });
});
