# OnClaw Phase 3 M0 Release Record

日期: 2026-04-04  
分支: `codex/phase1-windows-portable`

## 1. 范围确认（YAGNI）

仅交付 Dashboard M0：

1. 状态可见：URL / 运行状态 / 健康状态 / token。
2. 最小操作：start / stop / restart。
3. 不包含 Channels/Skills/Cron/Agents 完整面板与跨平台扩展。

## 2. 质量闸门结果

执行于本次实现后（同一工作区）：

1. `npm run build`：PASS
2. `npm run test:unit`：PASS（17 files, 57 tests）
3. `npm run test:e2e`：PASS（4 tests）
4. `pwsh ./scripts/smoke-openclaw.ps1`：PASS（mode=official, reason=official_bundled_mjs）

## 3. 自动 Review 与修复闭环

发现并修复 1 个阻塞回归：

1. 问题：`tests/e2e/dashboard.spec.ts` 与 `tests/e2e/preview-shell.spec.ts` 并行执行时同时占用 `4174`，导致 Dashboard e2e 启动超时。
2. 修复：为 preview shell 增加 `ONCLAW_PREVIEW_PORT` 环境变量覆盖；Dashboard e2e 改为独立端口 `4175`。
3. 复验：修复后重跑 `npm run test:e2e`，4/4 通过。

## 4. 残余风险

1. `scripts/preview-shell.ts` 仍属于 dev-only 预览壳，动作执行目前通过注入 runner 返回 `ok`，不直接驱动真实网关进程。
2. 真实桌面主进程 IPC 动作联动在后续阶段可继续收敛，但不影响本次 M0 验收闭环。
