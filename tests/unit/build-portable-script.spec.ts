import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("build-portable script", () => {
  it("copies managed runtime entry into dist portable layout", async () => {
    const runtimeDir = join(process.cwd(), "onclaw", "runtime");
    await mkdir(runtimeDir, { recursive: true });

    await execFileAsync("pwsh", ["./scripts/build-portable.ps1"], { cwd: process.cwd() });
    const distRuntimeEntry = join(process.cwd(), "dist", "portable", "onclaw", "runtime", "openclaw-entry.cjs");
    const content = await readFile(distRuntimeEntry, "utf8");

    expect(content).toContain('const http = require("node:http");');
  });
});
