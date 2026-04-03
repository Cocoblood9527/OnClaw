import { describe, it, expect } from "vitest";
import { resolveOnclawPaths } from "../../src/main/paths";

describe("resolveOnclawPaths", () => {
  it("returns root-scoped directories", () => {
    const out = resolveOnclawPaths("D:/onclaw");
    expect(out.root).toBe("D:/onclaw");
  });

  it("creates only allowed directories under root", () => {
    const p = resolveOnclawPaths("D:/onclaw");
    expect(Object.values(p)).toEqual([
      "D:/onclaw",
      "D:/onclaw/runtime",
      "D:/onclaw/snapshots",
      "D:/onclaw/state",
      "D:/onclaw/data",
      "D:/onclaw/logs",
      "D:/onclaw/cache",
      "D:/onclaw/downloads",
      "D:/onclaw/tmp"
    ]);
  });
});
