import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isOnclawRoot, resolveOnclawPaths } from "./paths";

export interface SetupSelfCheckReport {
  rootWritable: boolean;
  runtimePresent: boolean;
  providerReachable: boolean;
  ready: boolean;
}

export interface RunSetupSelfCheckInput {
  rootDir: string;
  providerHealthUrl: string;
  providerAuthToken?: string;
  fetcher?: typeof fetch;
}

async function checkRootWritable(rootDir: string): Promise<boolean> {
  const tmpDir = resolveOnclawPaths(rootDir).tmp;
  const probeFile = join(tmpDir, ".setup-write-probe");

  try {
    await mkdir(tmpDir, { recursive: true });
    await writeFile(probeFile, "ok", "utf8");
    await rm(probeFile, { force: true });
    return true;
  } catch {
    return false;
  }
}

async function checkRuntimePresent(rootDir: string): Promise<boolean> {
  try {
    const runtimeStat = await stat(resolveOnclawPaths(rootDir).runtime);
    return runtimeStat.isDirectory();
  } catch {
    return false;
  }
}

async function checkProviderReachable(
  providerHealthUrl: string,
  providerAuthToken: string | undefined,
  fetcher: typeof fetch
): Promise<boolean> {
  const headers: Record<string, string> = {};
  const token = providerAuthToken?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    const response = await fetcher(providerHealthUrl, { method: "GET", headers });
    return response.ok;
  } catch {
    return false;
  }
}

export async function runSetupSelfCheck(input: RunSetupSelfCheckInput): Promise<SetupSelfCheckReport> {
  const fetcher = input.fetcher ?? fetch;
  if (!isOnclawRoot(input.rootDir)) {
    const providerReachable = await checkProviderReachable(
      input.providerHealthUrl,
      input.providerAuthToken,
      fetcher
    );
    return {
      rootWritable: false,
      runtimePresent: false,
      providerReachable,
      ready: false
    };
  }

  const rootWritable = await checkRootWritable(input.rootDir);
  const runtimePresent = await checkRuntimePresent(input.rootDir);
  const providerReachable = await checkProviderReachable(
    input.providerHealthUrl,
    input.providerAuthToken,
    fetcher
  );
  return {
    rootWritable,
    runtimePresent,
    providerReachable,
    ready: rootWritable && runtimePresent && providerReachable
  };
}
