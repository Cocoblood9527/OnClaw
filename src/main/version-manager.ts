import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface UpgradePlanInput {
  current: string;
  incoming: string;
  smokePass: boolean;
  pointerFile?: string;
}

function isManagedActivePointerFile(pointerFile: string) {
  const normalized = pointerFile.replaceAll("\\", "/").toLowerCase();
  return /(^|\/)onclaw\/state\/active-runtime\.json$/.test(normalized);
}

async function writeActivePointer(pointerFile: string, active: string) {
  if (!isManagedActivePointerFile(pointerFile)) {
    return;
  }
  await mkdir(dirname(pointerFile), { recursive: true });
  const tmpFile = `${pointerFile}.tmp`;
  await writeFile(tmpFile, JSON.stringify({ active }, null, 2), "utf8");
  await rename(tmpFile, pointerFile);
}

export async function applyUpgradePlan(input: UpgradePlanInput) {
  const active = input.smokePass ? input.incoming : input.current;
  if (input.pointerFile) {
    await writeActivePointer(input.pointerFile, active);
  }
  return { active };
}
