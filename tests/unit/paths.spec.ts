import { describe, it, expect } from "vitest";
import { resolveOnclawPaths } from "../../src/main/paths";

describe("resolveOnclawPaths", () => {
  it("returns root-scoped directories", () => {
    const out = resolveOnclawPaths("D:/onclaw");
    expect(out.root).toBe("D:/onclaw");
  });
});
