import { describe, expect, it } from "vitest";
import { DashboardPage } from "../../src/renderer/routes/DashboardPage";

describe("DashboardPage", () => {
  it("renders minimal gateway status and connection info", () => {
    const view = DashboardPage({
      url: "http://127.0.0.1:18790",
      token: "tok_abc123",
      status: "running",
      healthy: true
    });

    expect(view).toContain("Dashboard");
    expect(view).toContain("url: http://127.0.0.1:18790");
    expect(view).toContain("token: tok_abc123");
    expect(view).toContain("status: running");
    expect(view).toContain("health: ok");
  });

  it("shows unhealthy state when gateway is stopped", () => {
    const view = DashboardPage({
      url: "http://127.0.0.1:18790",
      token: "tok_abc123",
      status: "stopped",
      healthy: false
    });

    expect(view).toContain("status: stopped");
    expect(view).toContain("health: fail");
  });

  it("shows minimal actions and latest action feedback", () => {
    const view = DashboardPage({
      url: "http://127.0.0.1:18790",
      token: "tok_abc123",
      status: "running",
      healthy: true,
      lastAction: {
        action: "restart",
        ok: true,
        message: "ok"
      }
    });

    expect(view).toContain("actions: start stop restart");
    expect(view).toContain("lastAction: restart ok");
  });
});
