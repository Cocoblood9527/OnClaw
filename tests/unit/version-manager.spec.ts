import { describe, it, expect } from "vitest";
import { applyUpgradePlan } from "../../src/main/version-manager";

describe("applyUpgradePlan", () => {
  it("keeps active snapshot when smoke test fails", async () => {
    const out = await applyUpgradePlan({
      current: "snapshots/openclaw/v1",
      incoming: "snapshots/openclaw/v2",
      smokePass: false
    });

    expect(out.active).toBe("snapshots/openclaw/v1");
  });
});
