import { describe, it, expect } from "vitest";
import { redactSecrets } from "../../src/main/diagnostics";

describe("redactSecrets", () => {
  it("removes token values from exported payload", () => {
    const out = redactSecrets({ token: "secret-value" });
    expect(out.token).toBe("[REDACTED]");
  });
});
