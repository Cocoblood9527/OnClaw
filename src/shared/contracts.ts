export interface GatewayConfig {
  host: string;
  token: string;
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
