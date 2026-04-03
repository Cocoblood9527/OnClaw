export interface GatewayConfig {
  host: string;
  token: string;
}

export type ProviderId = "openai" | "anthropic" | "openrouter" | "minimax";

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  healthUrl: string;
  defaultModel: string;
  docUrl: string;
}

export interface AdvancedSettings {
  rootDir: string;
  host: string;
  tokenMode: "auto-random";
  providerTimeoutMs: number;
  providerRetryCount: number;
}

export interface SetupSelfCheckInput {
  rootDir: string;
  providerHealthUrl: string;
  providerAuthToken?: string;
}

export interface SetupSelfCheckReport {
  rootWritable: boolean;
  runtimePresent: boolean;
  providerReachable: boolean;
  ready: boolean;
}

export interface SetupIpcHandlers {
  runSetupSelfCheck(input: SetupSelfCheckInput): Promise<SetupSelfCheckReport>;
}
