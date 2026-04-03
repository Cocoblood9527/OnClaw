import { describe, expect, it } from "vitest";
import App from "../../src/renderer/App";

describe("setup gating", () => {
  it("redirects to setup when setup is incomplete", () => {
    expect(App()).toBe("Setup");
  });
});
