# OnClaw Phase 2 最小收口设计

日期: 2026-04-04  
状态: 已实现并收口  
范围: Phase 2 最小能力（不扩功能面）

## 1. 目标

在不进入 Phase 3 的前提下，完成并固化 Phase 2 最小范围：

1. `install/` 一键在线安装最小实现。
2. 多 Provider 最小集合。
3. 进阶设置最小必要项。

## 2. 范围边界（YAGNI）

### 2.1 In Scope

1. 安装脚本：`install/install.sh`、`install/install.ps1`。
2. Provider 最小集合：OpenAI / Anthropic / OpenRouter。
3. 进阶设置最小项：受管根目录、localhost 监听、token 自动随机策略展示。

### 2.2 Out of Scope

1. Channels / Skills / Cron / Agents 管理。
2. 离线模型与本地模型运行能力。
3. Tauri / bootable / 跨平台扩展。
4. Provider 持久化编排与高级路由能力。

## 3. 关键约束

1. 安全默认不退化：
   - 监听地址固定为 `127.0.0.1`。
   - token 不能是固定值（展示为 `auto-random`）。
2. 目录写入仅在受管 `onclaw/` 目录。
3. 安装器必须校验安装根目录后缀为 `onclaw`（大小写兼容）。

## 4. 已落地最小实现

1. 安装器
   - 创建受管目录：`runtime/snapshots/state/data/logs/cache/downloads/tmp`。
   - 复制 `onclaw/runtime/openclaw-entry.cjs` 到目标 `runtime/`。
   - 可选执行 `openclaw@latest` 在线安装（`ONCLAW_INSTALL_SKIP_NPM=1` 可跳过）。
2. Provider 页面
   - 提供 3 个最小在线 Provider 列表。
   - 默认选择 `openai`，未知选择回退到 `openai`。
3. 设置页面
   - 对高级设置做最小归一化：
     - `host` 强制 `127.0.0.1`
     - 非 `onclaw` 根目录回退到 `onclaw`
     - `tokenMode` 固定为 `auto-random`

## 5. 验收方式

1. 单元测试覆盖新增行为：
   - `tests/unit/provider-page.spec.ts`
   - `tests/unit/settings-page.spec.ts`
   - `tests/unit/install-script.spec.ts`
2. 全量质量闸门通过：
   - `npm run build`
   - `npm run test:unit`
   - `npm run test:e2e`
   - `pwsh ./scripts/smoke-openclaw.ps1`
