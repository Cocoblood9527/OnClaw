import type { ProviderDefinition, ProviderId } from "../../shared/contracts";

const MINIMAL_PROVIDERS: ProviderDefinition[] = [
  { id: "openai", label: "OpenAI", healthUrl: "https://api.openai.com/v1/models" },
  { id: "anthropic", label: "Anthropic", healthUrl: "https://api.anthropic.com/v1/messages" },
  { id: "openrouter", label: "OpenRouter", healthUrl: "https://openrouter.ai/api/v1/models" }
];

export function listMinimalProviders(): ProviderDefinition[] {
  return [...MINIMAL_PROVIDERS];
}

function pickSelectedProvider(selectedProviderId?: string): ProviderDefinition {
  if (!selectedProviderId) {
    return MINIMAL_PROVIDERS[0];
  }
  const provider = MINIMAL_PROVIDERS.find((item) => item.id === selectedProviderId as ProviderId);
  return provider ?? MINIMAL_PROVIDERS[0];
}

export function ProviderPage(selectedProviderId?: string) {
  const selected = pickSelectedProvider(selectedProviderId);
  return [
    "Provider",
    ...MINIMAL_PROVIDERS.map((provider) => `${provider.id}: ${provider.label}`),
    `selected: ${selected.id}`,
    `health: ${selected.healthUrl}`
  ].join("\n");
}
