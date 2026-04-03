import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runSetupSelfCheck } from "../../src/main/setup-self-check";

async function withRootDir(run: (rootDir: string) => Promise<void>) {
  const parent = await mkdtemp(join(tmpdir(), "onclaw-setup-"));
  const rootDir = join(parent, "onclaw");
  await mkdir(rootDir, { recursive: true });
  try {
    await run(rootDir);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
}

describe("runSetupSelfCheck", () => {
  it("refuses write/runtime checks when root is outside managed onclaw directory", async () => {
    const fetcher: typeof fetch = async () => new Response("ok", { status: 200 });
    const report = await runSetupSelfCheck({
      rootDir: join(tmpdir(), "outside-root"),
      providerHealthUrl: "https://provider.test/health",
      fetcher
    });

    expect(report.rootWritable).toBe(false);
    expect(report.runtimePresent).toBe(false);
    expect(report.providerReachable).toBe(true);
    expect(report.ready).toBe(false);
  });

  it("passes when root is writable, runtime exists, and provider is reachable", async () => {
    await withRootDir(async (rootDir) => {
      await mkdir(join(rootDir, "runtime"), { recursive: true });
      const fetcher: typeof fetch = async () => new Response("ok", { status: 200 });
      const report = await runSetupSelfCheck({
        rootDir,
        providerHealthUrl: "https://provider.test/health",
        fetcher
      });

      expect(report.rootWritable).toBe(true);
      expect(report.runtimePresent).toBe(true);
      expect(report.providerReachable).toBe(true);
      expect(report.ready).toBe(true);
    });
  });

  it("fails runtime check when runtime directory is missing", async () => {
    await withRootDir(async (rootDir) => {
      const fetcher: typeof fetch = async () => new Response("ok", { status: 200 });
      const report = await runSetupSelfCheck({
        rootDir,
        providerHealthUrl: "https://provider.test/health",
        fetcher
      });

      expect(report.rootWritable).toBe(true);
      expect(report.runtimePresent).toBe(false);
      expect(report.providerReachable).toBe(true);
      expect(report.ready).toBe(false);
    });
  });

  it("fails provider check on non-ok response", async () => {
    await withRootDir(async (rootDir) => {
      await mkdir(join(rootDir, "runtime"), { recursive: true });
      const fetcher: typeof fetch = async () => new Response("down", { status: 503 });
      const report = await runSetupSelfCheck({
        rootDir,
        providerHealthUrl: "https://provider.test/health",
        fetcher
      });

      expect(report.rootWritable).toBe(true);
      expect(report.runtimePresent).toBe(true);
      expect(report.providerReachable).toBe(false);
      expect(report.ready).toBe(false);
    });
  });
});
