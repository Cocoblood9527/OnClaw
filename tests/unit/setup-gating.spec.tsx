import { describe, expect, it } from "vitest";
import App from "../../src/renderer/App";
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
    expect(setupView).toContain("root:ok");
    expect(setupView).toContain("runtime:fail");
    expect(setupView).toContain("provider:ok");
  });
});
