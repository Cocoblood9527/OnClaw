# OnClaw Pre-Phase3 Readiness Record

日期: 2026-04-04  
状态: Ready for Phase 3 (M0 Dashboard)

## 1. 前置条件核对

1. 进入 Phase 3 许可: 已获得用户显式同意。
2. Phase 3 最小设计: 已落地 `docs/superpowers/specs/2026-04-04-onclaw-phase3-dashboard-minimal-design.md`。
3. Phase 3 最小计划: 已落地 `docs/superpowers/plans/2026-04-04-onclaw-phase3-dashboard-minimal-implementation.md`。
4. 当前分支: `codex/phase1-windows-portable`。
5. 当前代码基线提交: `21aa949`。

## 2. 本机运行基线

1. OpenClaw 版本: `2026.4.2`。
2. Gateway 监听: `127.0.0.1:18790`。
3. Dashboard: `http://127.0.0.1:18790/` 可达。

## 3. 质量闸门（进入 Phase 3 前复验）

执行结果（2026-04-04）：

1. `npm run build`：PASS
2. `npm run test:unit`：PASS（15 files, 51 tests）
3. `npm run test:e2e`：PASS（3 tests）
4. `pwsh ./scripts/smoke-openclaw.ps1`：PASS（official_bundled_mjs）

## 4. 非阻塞项（不影响进入）

1. 本机 `~/.openclaw/extensions` 中存在历史扩展告警（噪音级），不属于 Dashboard M0 范围。
2. 进入 Phase 3 实施时可按需收敛 `plugins.allow` 白名单。
