import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("phase2 installer scripts", () => {
  it("install.sh creates managed onclaw layout and runtime entry", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-install-sh-"));
    const rootDir = join(parent, "onclaw");
    try {
      await execFileAsync("bash", ["./install/install.sh"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ONCLAW_INSTALL_ROOT: rootDir,
          ONCLAW_INSTALL_SKIP_NPM: "1"
        }
      });
      expect((await stat(join(rootDir, "runtime"))).isDirectory()).toBe(true);
      expect((await stat(join(rootDir, "data"))).isDirectory()).toBe(true);
      const runtimeEntry = await readFile(join(rootDir, "runtime", "openclaw-entry.cjs"), "utf8");
      expect(runtimeEntry).toContain('"127.0.0.1"');
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  }, 30_000);

  it("install.sh rejects root outside managed onclaw directory", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-install-sh-fail-"));
    const rootDir = join(parent, "workspace");
    try {
      await expect(
        execFileAsync("bash", ["./install/install.sh"], {
          cwd: process.cwd(),
          env: {
            ...process.env,
            ONCLAW_INSTALL_ROOT: rootDir,
            ONCLAW_INSTALL_SKIP_NPM: "1"
          }
        })
      ).rejects.toThrow(/onclaw/);
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  }, 30_000);

  it("install.sh accepts case-insensitive OnClaw root suffix", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-install-sh-case-"));
    const rootDir = join(parent, "OnClaw");
    try {
      await execFileAsync("bash", ["./install/install.sh"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ONCLAW_INSTALL_ROOT: rootDir,
          ONCLAW_INSTALL_SKIP_NPM: "1"
        }
      });
      expect((await stat(join(rootDir, "runtime"))).isDirectory()).toBe(true);
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  }, 30_000);

  it("install.ps1 creates managed onclaw layout and runtime entry", async () => {
    const parent = await mkdtemp(join(tmpdir(), "onclaw-install-ps1-"));
    const rootDir = join(parent, "onclaw");
    try {
      await execFileAsync("pwsh", ["./install/install.ps1"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          ONCLAW_INSTALL_ROOT: rootDir,
          ONCLAW_INSTALL_SKIP_NPM: "1"
        }
      });
      expect((await stat(join(rootDir, "runtime"))).isDirectory()).toBe(true);
      expect((await stat(join(rootDir, "logs"))).isDirectory()).toBe(true);
      const runtimeEntry = await readFile(join(rootDir, "runtime", "openclaw-entry.cjs"), "utf8");
      expect(runtimeEntry).toContain('"127.0.0.1"');
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  }, 30_000);
});
