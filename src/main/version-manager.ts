export interface UpgradePlanInput {
  current: string;
  incoming: string;
  smokePass: boolean;
}

export async function applyUpgradePlan(input: UpgradePlanInput) {
  return {
    active: input.smokePass ? input.incoming : input.current
  };
}
