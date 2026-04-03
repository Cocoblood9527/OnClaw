import { describe, expect, it } from "vitest";
import App from "../../src/renderer/App";
import { renderApp } from "../../src/renderer/main";

describe("setup gating", () => {
  it("redirects to setup when setup is incomplete", () => {
    expect(App()).toBe("Setup");
  });

  it("renderer entry returns setup shell on first run", () => {
    expect(renderApp()).toBe("Setup");
  });
});
