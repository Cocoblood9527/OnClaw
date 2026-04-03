import { describe, it, expect } from "vitest";
import { isOnclawRoot, resolveOnclawPaths } from "../../src/main/paths";

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

  it("accepts onclaw root path with any path separator style", () => {
    expect(isOnclawRoot("D:/portable/onclaw")).toBe(true);
    expect(isOnclawRoot("D:\\portable\\onclaw\\")).toBe(true);
  });

  it("rejects non-onclaw root path", () => {
    expect(isOnclawRoot("D:/portable/workspace")).toBe(false);
  });
});
