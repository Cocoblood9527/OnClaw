import type { SetupSelfCheckInput, SetupSelfCheckReport } from "../shared/contracts";
import { createIpcHandlers } from "./ipc";

export async function runFirstRunSetupCheck(input: SetupSelfCheckInput): Promise<SetupSelfCheckReport> {
  const handlers = createIpcHandlers();
  return handlers.runSetupSelfCheck(input);
}
