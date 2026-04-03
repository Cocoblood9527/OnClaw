import { startOpenClaw } from "./openclaw-adapter";
import { createServer } from "node:net";

export async function pickAvailablePort(preferred: number, candidates: number[]) {
  if (await isPortAvailable(preferred)) {
    return preferred;
  }

  for (const port of candidates) {
    if (port === preferred) {
      continue;
    }
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return preferred;
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

function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

export async function startManagedRuntime(input: StartManagedRuntimeInput) {
  const host = "127.0.0.1";
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
