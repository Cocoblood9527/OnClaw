# OnClaw Phase 3 M1 Release Record

日期: 2026-04-04  
分支: `codex/phase1-windows-portable`

## 1. 范围确认（YAGNI）

仅交付 M1（Dashboard 联通聊天入口）：

1. Dashboard 提供单一“进入聊天”入口。
2. 聊天链接按 `127.0.0.1 + 当前网关端口 + token` 构建。
3. 提供最小可见反馈：`openChat: ok/fail`。
4. 不扩展 Channels/Skills/Cron/Agents 与 provider 编排面。

## 2. 质量闸门结果

执行于本次实现后（同一工作区）：

1. `npm run build`：PASS
2. `npm run test:unit`：PASS（18 files, 61 tests）
3. `npm run test:e2e`：PASS（6 tests）
4. `pwsh ./scripts/smoke-openclaw.ps1`：PASS（mode=official, reason=official_bundled_mjs）

## 3. 自动 Review 与修复闭环

发现并修复 1 个阻塞问题：

1. 问题：当 token 为空时，`DashboardPage` 渲染阶段直接构建 chat URL，导致异常抛出并使 preview-shell 进程退出。
2. 修复：渲染层对 chat URL 构建失败做降级展示（`enterChat: unavailable (...)`），保持页面可用；打开动作继续走 `openChat: fail` 反馈。
3. 复验：重跑 `tests/unit/dashboard-page.spec.ts` 与 `tests/e2e/dashboard.spec.ts` 后全绿，再跑全量闸门全绿。

## 4. 残余风险

1. 预览壳中的“打开聊天”成功语义为“URL 构建成功并发起打开请求”，不保证目标 chat 页可达（取决于本机对应端口服务状态）。
2. 真实主进程与系统浏览器打开行为仍需后续阶段接入 IPC 完整链路，但不影响本次 M1 最小闭环验收。

## 5. 后续收敛（独立 Chat 页面）

日期: 2026-04-04

为贴合 ClawX 使用方式，已做最小收敛：

1. Dashboard 不再内嵌聊天面板，仅保留“进入聊天页”入口。
2. 点击入口跳转到独立 `/chat` 页面（透传 `gatewayPort/gatewayToken`）。
3. Chat 页面仍为原生 UI（非 iframe），并保持与 OpenClaw 会话同步。

最小验收清单（已实测）：

1. 打开 `http://127.0.0.1:4174/` 不显示 chat 卡片。
2. 点击“进入聊天页”后 URL 进入 `/chat?...`。
3. 在 `/chat` 发送消息后，`openclaw gateway call chat.history` 可查到同一条消息。

质量闸门复验：

1. `npm run build`：PASS
2. `npm run test:unit`：PASS
3. `npm run test:e2e`：PASS
4. `pwsh ./scripts/smoke-openclaw.ps1`：PASS
