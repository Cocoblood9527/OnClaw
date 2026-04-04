import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const GATEWAY_ACTIONS = ["start", "stop", "restart"] as const;
export type GatewayAction = typeof GATEWAY_ACTIONS[number];

export interface GatewayActionResult {
  action: GatewayAction;
  ok: boolean;
  message: string;
}

export interface RunGatewayActionDeps {
  command?: string;
  runCommand?: (file: string, args: string[]) => Promise<{ stdout?: string; stderr?: string }>;
}

async function defaultRunCommand(file: string, args: string[]) {
  return execFileAsync(file, args);
}

export async function runGatewayAction(action: GatewayAction, deps: RunGatewayActionDeps = {}): Promise<GatewayActionResult> {
  const runCommand = deps.runCommand ?? defaultRunCommand;
  const command = deps.command ?? "openclaw";

  try {
    const out = await runCommand(command, ["gateway", action]);
    const message = (out.stdout ?? out.stderr ?? "ok").trim() || "ok";
    return { action, ok: true, message };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { action, ok: false, message };
  }
}
