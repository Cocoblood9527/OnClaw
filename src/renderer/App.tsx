import { ChatPage } from "./routes/ChatPage";
import { SetupPage } from "./routes/SetupPage";

export default function App() {
  const setupComplete = false;
  return setupComplete ? ChatPage() : SetupPage();
}
