import { describe, it, expect } from "vitest";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

  it("switches active pointer file to incoming snapshot when smoke test passes", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-vm-"));
    const rootDir = join(parent, "onclaw");
    const stateDir = join(rootDir, "state");
    const pointerFile = join(stateDir, "active-runtime.json");
    try {
      await mkdir(stateDir, { recursive: true });
      const out = await applyUpgradePlan({
        current: "snapshots/openclaw/v1",
        incoming: "snapshots/openclaw/v2",
        smokePass: true,
        pointerFile
      });
      const pointer = JSON.parse(await readFile(pointerFile, "utf8")) as { active: string };

      expect(out.active).toBe("snapshots/openclaw/v2");
      expect(pointer.active).toBe("snapshots/openclaw/v2");
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  it("rolls back active pointer file to current snapshot when smoke test fails", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-vm-"));
    const rootDir = join(parent, "onclaw");
    const stateDir = join(rootDir, "state");
    const pointerFile = join(stateDir, "active-runtime.json");
    try {
      await mkdir(stateDir, { recursive: true });
      const out = await applyUpgradePlan({
        current: "snapshots/openclaw/v1",
        incoming: "snapshots/openclaw/v2",
        smokePass: false,
        pointerFile
      });
      const pointer = JSON.parse(await readFile(pointerFile, "utf8")) as { active: string };

      expect(out.active).toBe("snapshots/openclaw/v1");
      expect(pointer.active).toBe("snapshots/openclaw/v1");
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  it("accepts relative managed pointer path under onclaw/state", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-vm-"));
    const previousCwd = process.cwd();
    try {
      process.chdir(parent);
      await mkdir(join("onclaw", "state"), { recursive: true });
      const out = await applyUpgradePlan({
        current: "snapshots/openclaw/v1",
        incoming: "snapshots/openclaw/v2",
        smokePass: true,
        pointerFile: join("onclaw", "state", "active-runtime.json")
      });
      const pointer = JSON.parse(
        await readFile(join("onclaw", "state", "active-runtime.json"), "utf8")
      ) as { active: string };

      expect(out.active).toBe("snapshots/openclaw/v2");
      expect(pointer.active).toBe("snapshots/openclaw/v2");
    } finally {
      process.chdir(previousCwd);
      await rm(parent, { recursive: true, force: true });
    }
  });
});
