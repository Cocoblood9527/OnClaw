import type { SetupSelfCheckReport } from "../../main/setup-self-check";

function flag(ok: boolean) {
  return ok ? "ok" : "fail";
}

export function SetupPage(report?: SetupSelfCheckReport) {
  if (!report) {
    return "Setup";
  }
  return `Setup|root:${flag(report.rootWritable)}|runtime:${flag(report.runtimePresent)}|provider:${flag(report.providerReachable)}`;
}
