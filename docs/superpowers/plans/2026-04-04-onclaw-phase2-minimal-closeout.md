# OnClaw Phase 2 Minimal Closeout Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 收口并固化 Phase 2 最小能力，确保边界清晰、证据完整、无额外功能扩张。  
**Architecture:** 仅记录已实现模块（install/provider/settings）与验收证据，不新增业务能力。  
**Tech Stack:** Markdown, Git, Vitest, Playwright, PowerShell

---

## Spec Reference

- 设计规格: `docs/superpowers/specs/2026-04-04-onclaw-phase2-minimal-design.md`

## Task 1: 固化 Phase 2 范围与边界

**Files:**
- Create: `docs/superpowers/specs/2026-04-04-onclaw-phase2-minimal-design.md`

- [x] 明确 In/Out Scope（禁止提前进入 Phase 3）。
- [x] 明确安全默认与目录隔离约束。
- [x] 列出已落地最小实现，不添加新需求。

## Task 2: 固化实现与测试证据映射

**Files:**
- Modify: `docs/superpowers/specs/2026-04-04-onclaw-phase2-minimal-design.md`

- [x] 映射实现文件：`install/*`、`ProviderPage`、`SettingsPage`。
- [x] 映射测试文件：`provider-page/settings-page/install-script`。
- [x] 记录质量闸门命令。

## Task 3: 产出发布收口记录

**Files:**
- Create: `RELEASE_RECORD_PHASE2_MINIMAL.md`

- [x] 记录分支、关键提交、日期。
- [x] 记录质量闸门通过状态。
- [x] 记录 review 闭环与剩余非阻塞风险。

## Completion Criteria

- [x] 文档只描述已实现事实，不设计未来功能。
- [x] 交付后可直接作为 Phase 3 前的范围基线。
