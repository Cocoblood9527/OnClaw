import { ChatPage } from "./routes/ChatPage";
import { SetupPage } from "./routes/SetupPage";
import type { SetupIpcHandlers, SetupSelfCheckInput } from "../shared/contracts";

export default function App() {
  const setupComplete = false;
  return setupComplete ? ChatPage() : SetupPage();
}

export async function renderFirstRunApp(ipc: SetupIpcHandlers, input: SetupSelfCheckInput) {
  const report = await ipc.runSetupSelfCheck(input);
  return report.ready ? ChatPage() : SetupPage(report);
}
