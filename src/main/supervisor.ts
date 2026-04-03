import { startOpenClaw } from "./openclaw-adapter";

export async function pickAvailablePort(preferred: number, candidates: number[]) {
  if (!candidates.includes(preferred)) {
    return preferred;
  }

  const fallback = candidates.find((port) => port !== preferred);
  return fallback ?? preferred;
}

export interface StartManagedRuntimeInput {
  preferredPort: number;
  candidatePorts: number[];
  runtimeEntry: string;
  host?: string;
}

async function waitForHealth(healthUrl: string) {
  for (let i = 0; i < 25; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        return;
      }
    } catch {
    }
  }
  throw new Error(`managed runtime health check failed: ${healthUrl}`);
}

export async function startManagedRuntime(input: StartManagedRuntimeInput) {
  const host = input.host ?? "127.0.0.1";
  const port = await pickAvailablePort(input.preferredPort, input.candidatePorts);
  const started = await startOpenClaw({
    runtimeEntry: input.runtimeEntry,
    host,
    port
  });
  const healthUrl = `http://${host}:${port}/health`;

  try {
    await waitForHealth(healthUrl);
  } catch (error) {
    await started.stop();
    throw error;
  }

  return {
    pid: started.pid,
    port,
    healthUrl,
    stop: started.stop
  };
}
