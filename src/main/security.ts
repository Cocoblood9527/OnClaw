import { randomBytes } from "node:crypto";
import type { GatewayConfig } from "../shared/contracts";

export function buildDefaultGatewayConfig(): GatewayConfig {
  return {
    host: "127.0.0.1",
    token: randomBytes(24).toString("base64url")
  };
}
