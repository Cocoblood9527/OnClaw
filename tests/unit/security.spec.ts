import { describe, it, expect } from "vitest";
import { buildDefaultGatewayConfig } from "../../src/main/security";

describe("buildDefaultGatewayConfig", () => {
  it("binds gateway to 127.0.0.1", () => {
    expect(buildDefaultGatewayConfig().host).toBe("127.0.0.1");
  });

  it("uses random token, never fixed literal", () => {
    expect(buildDefaultGatewayConfig().token).not.toBe("uclaw");
  });
});
