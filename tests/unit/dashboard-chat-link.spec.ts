import { describe, expect, it } from "vitest";
import { buildDashboardChatUrl } from "../../src/renderer/routes/DashboardPage";

describe("dashboard chat link", () => {
  it("builds localhost chat url with gateway port and token", () => {
    const url = buildDashboardChatUrl("http://0.0.0.0:18790", "tok_abc 123");
    expect(url).toBe("http://127.0.0.1:18790/chat?token=tok_abc+123");
  });

  it("throws when token is empty", () => {
    expect(() => buildDashboardChatUrl("http://127.0.0.1:18790", "   ")).toThrow("missing token");
  });
});
