import type { ProviderDefinition, ProviderId } from "../../shared/contracts";

const MINIMAL_PROVIDERS: ProviderDefinition[] = [
  {
    id: "openai",
    label: "OpenAI",
    healthUrl: "https://api.openai.com/v1/models",
    defaultModel: "gpt-4.1",
    docUrl: "https://platform.openai.com/docs/overview"
  },
  {
    id: "anthropic",
    label: "Anthropic",
    healthUrl: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-3-7-sonnet-latest",
    docUrl: "https://docs.anthropic.com/en/api/messages"
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    healthUrl: "https://openrouter.ai/api/v1/models",
    defaultModel: "openrouter/auto",
    docUrl: "https://openrouter.ai/docs/api-reference/overview"
  },
  {
    id: "minimax",
    label: "MiniMax",
    healthUrl: "https://api.minimaxi.com/v1/models",
    defaultModel: "MiniMax-M2.7",
    docUrl: "https://platform.minimaxi.com/docs/api-reference/text-openai-api"
  }
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
    `health: ${selected.healthUrl}`,
    `model: ${selected.defaultModel}`,
    `docs: ${selected.docUrl}`
  ].join("\n");
}
