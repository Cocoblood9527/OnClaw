import type { SetupIpcHandlers, SetupSelfCheckInput, SetupSelfCheckReport } from "../shared/contracts";
import { runSetupSelfCheck } from "./setup-self-check";

export interface CreateIpcHandlersDeps {
  runSetupSelfCheck?: (input: SetupSelfCheckInput) => Promise<SetupSelfCheckReport>;
}

export function createIpcHandlers(deps: CreateIpcHandlersDeps = {}): SetupIpcHandlers {
  const check = deps.runSetupSelfCheck ?? runSetupSelfCheck;
  return {
    runSetupSelfCheck(input: SetupSelfCheckInput) {
      return check(input);
    }
  };
}
