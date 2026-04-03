import { describe, expect, it } from "vitest";
import { ProviderPage, listMinimalProviders } from "../../src/renderer/routes/ProviderPage";

describe("ProviderPage", () => {
  it("lists minimal online providers", () => {
    const providers = listMinimalProviders();

    expect(providers.map((provider) => provider.id)).toEqual(["openai", "anthropic", "openrouter", "minimax"]);
    expect(providers.every((provider) => provider.healthUrl.startsWith("https://"))).toBe(true);
    const minimax = providers.find((provider) => provider.id === "minimax");
    expect(minimax?.defaultModel).toBe("MiniMax-M2.7");
    expect(minimax?.docUrl).toBe("https://platform.minimaxi.com/docs/api-reference/text-openai-api");
  });

  it("uses openai by default and falls back to openai when selection is unknown", () => {
    const defaultView = ProviderPage();
    const fallbackView = ProviderPage("unknown");

    expect(defaultView).toContain("selected: openai");
    expect(defaultView).toContain("health: https://api.openai.com/v1/models");
    expect(fallbackView).toContain("selected: openai");
  });

  it("switches to selected provider", () => {
    const view = ProviderPage("anthropic");

    expect(view).toContain("selected: anthropic");
    expect(view).toContain("health: https://api.anthropic.com/v1/messages");
  });

  it("shows minimax model and doc link when selected", () => {
    const view = ProviderPage("minimax");

    expect(view).toContain("selected: minimax");
    expect(view).toContain("model: MiniMax-M2.7");
    expect(view).toContain("docs: https://platform.minimaxi.com/docs/api-reference/text-openai-api");
  });
});
