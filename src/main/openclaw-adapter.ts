export interface OpenClawStartResult {
  pid: number;
}

export async function startOpenClaw(port: number): Promise<OpenClawStartResult> {
  return { pid: port };
}
