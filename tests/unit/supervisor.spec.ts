import { describe, it, expect } from "vitest";
import { pickAvailablePort } from "../../src/main/supervisor";

describe("pickAvailablePort", () => {
  it("returns fallback port when preferred is occupied", async () => {
    const port = await pickAvailablePort(18789, [18789, 18790]);
    expect(port).toBe(18790);
  });
});
