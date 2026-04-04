import { describe, expect, it, vi } from "vitest";
import {
  GATEWAY_ACTIONS,
  runGatewayAction,
  type GatewayAction
} from "../../src/main/gateway-actions";

describe("gateway actions", () => {
  it("supports minimal dashboard actions", () => {
    expect(GATEWAY_ACTIONS).toEqual(["start", "stop", "restart"]);
  });

  it("runs openclaw gateway action and returns success feedback", async () => {
    const runCommand = vi.fn().mockResolvedValue({ stdout: "ok" });

    const result = await runGatewayAction("restart", { runCommand });

    expect(runCommand).toHaveBeenCalledWith("openclaw", ["gateway", "restart"]);
    expect(result.ok).toBe(true);
    expect(result.action).toBe("restart");
    expect(result.message).toBe("ok");
  });

  it("returns fail feedback when command throws", async () => {
    const runCommand = vi.fn().mockRejectedValue(new Error("permission denied"));

    const result = await runGatewayAction("stop" as GatewayAction, { runCommand });

    expect(result.ok).toBe(false);
    expect(result.action).toBe("stop");
    expect(result.message).toContain("permission denied");
  });
});
