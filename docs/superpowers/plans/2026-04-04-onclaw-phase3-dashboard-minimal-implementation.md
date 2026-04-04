# OnClaw Phase 3 Dashboard Minimal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 Dashboard M0（状态可见 + start/stop/restart 可操作）的最小闭环，不扩功能面。

**Architecture:** 复用现有 renderer 路由与 gateway CLI 契约，新增最小胶水层聚合状态和动作调用。保持 `127.0.0.1` 与 token 安全默认，不引入额外依赖。

**Tech Stack:** TypeScript, Vitest, Playwright, PowerShell, OpenClaw CLI

---

## Spec Reference

- 设计规格: `docs/superpowers/specs/2026-04-04-onclaw-phase3-dashboard-minimal-design.md`
- 执行原则: DRY / YAGNI / TDD / Frequent Commits
- 建议技能: @test-driven-development @verification-before-completion

### Task 1: Dashboard M0 状态聚合层

**Files:**
- Create: `src/renderer/routes/DashboardPage.tsx`
- Create: `tests/unit/dashboard-page.spec.ts`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify RED** (`npm run test:unit -- tests/unit/dashboard-page.spec.ts`)
- [ ] **Step 3: Implement minimal status rendering**
- [ ] **Step 4: Run unit test to verify GREEN**
- [ ] **Step 5: Commit** (`feat: add minimal dashboard status page`)

### Task 2: Dashboard M0 最小操作（start/stop/restart）

**Files:**
- Modify: `src/renderer/routes/DashboardPage.tsx`
- Create: `src/main/gateway-actions.ts`
- Create: `tests/unit/gateway-actions.spec.ts`

- [ ] **Step 1: Write failing action tests (RED)**
- [ ] **Step 2: Verify RED** (`npm run test:unit -- tests/unit/gateway-actions.spec.ts`)
- [ ] **Step 3: Implement minimal action wrappers**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit** (`feat: wire dashboard start stop restart actions`)

### Task 3: Dashboard 最小端到端验证

**Files:**
- Create: `tests/e2e/dashboard.spec.ts`
- Modify: `playwright.config.ts` (only if needed for route serving)

- [ ] **Step 1: Write failing e2e case (RED)**
- [ ] **Step 2: Verify RED** (`npm run test:e2e -- tests/e2e/dashboard.spec.ts`)
- [ ] **Step 3: Implement minimal fixes for pass**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit** (`test: add dashboard m0 e2e flow`)

### Task 4: 验收与收口

**Files:**
- Modify: `RELEASE_RECORD_PHASE2_MINIMAL.md` (append Phase 3 M0 entry) or Create: `RELEASE_RECORD_PHASE3_M0.md`

- [ ] **Step 1: Run full gates**
  - `npm run build`
  - `npm run test:unit`
  - `npm run test:e2e`
  - `pwsh ./scripts/smoke-openclaw.ps1`
- [ ] **Step 2: Record evidence and residual risks**
- [ ] **Step 3: Commit** (`docs: record phase3 m0 acceptance evidence`)

## Completion Criteria

- [ ] Dashboard M0 页面可见状态信息。
- [ ] Start/Stop/Restart 可执行且反馈明确。
- [ ] 不引入 Phase 3 以外功能。
- [ ] 全量质量闸门通过。
