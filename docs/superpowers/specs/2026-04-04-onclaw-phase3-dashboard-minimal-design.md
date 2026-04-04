# OnClaw Phase 3 Dashboard 最小设计（M0）

日期: 2026-04-04  
状态: 待实现（已解禁进入 Phase 3）  
目标: 在不扩功能面的前提下交付可用 Dashboard 最小闭环

## 1. 目标

在现有 Phase 2 基线上，交付最小 Dashboard 操作闭环：

1. 能看到 Gateway 基础运行状态。
2. 能执行最小运行控制（start/stop/restart）。
3. 能在同一界面完成连接信息确认（URL/token 可见）。

## 2. 范围边界（YAGNI）

### 2.1 In Scope（M0）

1. Dashboard 单页最小信息区：
   - Gateway URL
   - 运行状态（running/stopped）
   - 健康探测结果
2. 最小操作区：
   - Start
   - Stop
   - Restart
3. 保持本地安全默认：
   - 监听地址仍为 `127.0.0.1`
   - token 不退化为固定弱值

### 2.2 Out of Scope（本阶段不做）

1. Channels/Skills/Cron/Agents 完整面板。
2. 离线模型、本地模型编排、复杂 provider 路由。
3. Tauri/bootable/跨平台安装器扩展。
4. 大规模 UI 重构与视觉重设计。

## 3. 复用策略（不重写业务）

1. 页面逻辑优先复用现有实现：
   - `src/renderer/routes/SetupPage.tsx`
   - `src/renderer/routes/ProviderPage.tsx`
   - `src/renderer/routes/SettingsPage.tsx`
2. Gateway 运行/状态能力优先复用现有 CLI 与脚本契约，不复制一套流程。
3. 保持最小胶水层：只做必要数据装配与动作触发。

## 4. 验收标准（M0）

1. 打开 Dashboard 能看到状态与连接信息。
2. Start/Stop/Restart 操作可用且有明确结果反馈。
3. 质量闸门保持通过：
   - `npm run build`
   - `npm run test:unit`
   - `npm run test:e2e`
   - `pwsh ./scripts/smoke-openclaw.ps1`

## 5. 风险与控制

1. 风险: 本机插件/扩展噪音影响日志判读。  
   控制: Phase 3 实施中将插件错误视为环境噪音，不纳入 Dashboard M0 功能范围。
2. 风险: 过早扩展面板导致范围失控。  
   控制: 只交付 M0 单页与 3 个操作按钮。
