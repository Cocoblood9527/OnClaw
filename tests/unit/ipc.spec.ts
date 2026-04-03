import { describe, expect, it, vi } from "vitest";
import type { SetupSelfCheckInput } from "../../src/shared/contracts";
import { createIpcHandlers } from "../../src/main/ipc";

describe("createIpcHandlers", () => {
  it("exposes runSetupSelfCheck and forwards input to setup checker", async () => {
    const runSetupSelfCheck = vi.fn().mockResolvedValue({
      rootWritable: true,
      runtimePresent: true,
      providerReachable: true,
      ready: true
    });
    const handlers = createIpcHandlers({ runSetupSelfCheck });
    const input: SetupSelfCheckInput = {
      rootDir: "D:/onclaw",
      providerHealthUrl: "https://provider.test/health"
    };

    const output = await handlers.runSetupSelfCheck(input);

    expect(runSetupSelfCheck).toHaveBeenCalledWith(input);
    expect(output.ready).toBe(true);
  });
});
