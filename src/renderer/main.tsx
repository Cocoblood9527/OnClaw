import App from "./App";
import { runFirstRunSetupCheck } from "../main";
import { renderFirstRunApp } from "./App";
import type { SetupSelfCheckInput } from "../shared/contracts";

export function renderApp() {
  return App();
}

export async function renderFirstRunFromMain(input: SetupSelfCheckInput) {
  return renderFirstRunApp(
    {
      runSetupSelfCheck: runFirstRunSetupCheck
    },
    input
  );
}
