# OnClaw Phase 3 M2 Release Record

日期: 2026-04-04
分支: `codex/phase1-windows-portable`

## 1. 范围确认（YAGNI）

仅收口 Setup -> Provider -> Settings 最小闭环与主进程最小验收：

1. Setup 补单一关键动作反馈（`rerun-self-check` / `continue-provider`）。
2. Provider 补最小连通反馈（`unknown/ok/fail`）与切换动作标识。
3. Settings 补运行必需项安全回退与 `apply-settings` 动作反馈。
4. 新增 1 条真实主进程验收：`providerAuthToken` 经主进程链路透传，且前后空白被裁剪后可用。
5. 不新增 Channels/Skills/Cron/Agents，不引入新依赖，不改业务边界。

## 2. 质量闸门结果

执行于本次实现后（同一工作区）：

1. `npm run build`：PASS
2. `npm run test:unit`：PASS（18 files, 66 tests）
3. `npm run test:e2e`：PASS（9 tests）
4. `pwsh ./scripts/smoke-openclaw.ps1`：PASS（mode=official, reason=official_bundled_mjs）

## 3. 自动 Review 与修复闭环

发现并闭环 1 个主进程链路问题：

1. 问题：`providerAuthToken` 带前后空白时，Setup self-check 直接拼接 `Authorization`，导致 provider 可达性误判为 fail。
2. 修复：`src/main/setup-self-check.ts` 在健康检查前先 `trim()` token，仅在非空时设置 `Bearer` 头。
3. 复验：新增 `tests/unit/first-run-main-integration.spec.ts` 真实主进程验收用例，RED->GREEN 后通过。

## 4. 残余风险

1. `runReady: ok` 仍表示“配置归一化后的最小运行就绪”，不代表外部 provider 一定可达。
2. Provider 连通反馈仍是当前最小自检信号，不是每个 provider 的独立实时探测。
