import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";

export interface StartOpenClawInput {
  runtimeEntry: string;
  host: string;
  port: number;
  cwd?: string;
}

export interface OpenClawStartResult {
  pid: number;
  stop: () => Promise<void>;
}

function waitExit(child: ChildProcess) {
  return new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
  });
}

export async function startOpenClaw(input: StartOpenClawInput): Promise<OpenClawStartResult> {
  const host = "127.0.0.1";
  const child = spawn(process.execPath, [input.runtimeEntry], {
    cwd: input.cwd,
    stdio: "ignore",
    env: {
      ...process.env,
      ONCLAW_GATEWAY_HOST: host,
      ONCLAW_GATEWAY_PORT: String(input.port)
    }
  });

  if (!child.pid) {
    throw new Error("failed to start managed runtime process");
  }

  return {
    pid: child.pid,
    stop: async () => {
      if (child.exitCode !== null) {
        return;
      }
      child.kill("SIGTERM");
      const timeout = setTimeout(() => {
        if (child.exitCode === null) {
          child.kill("SIGKILL");
        }
      }, 1000);
      await waitExit(child);
      clearTimeout(timeout);
    }
  };
}
