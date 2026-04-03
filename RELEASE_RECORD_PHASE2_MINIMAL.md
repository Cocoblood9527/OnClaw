# OnClaw Phase 2 Minimal - Release Record

## Release Identity
- Branch: `codex/phase1-windows-portable`
- Date: 2026-04-04
- Scope Baseline Commits:
  - `ce19990` multi-provider minimal
  - `489ceb9` advanced settings minimal guardrails
  - `6b410aa` installer minimal scripts
  - `ea96aa3` installer root-case fix
  - `53ca87e` installer managed dirs fix

## Scope (YAGNI)
- In Scope: `install/` + minimal multi-provider + minimal advanced settings
- Out of Scope: Channels / Skills / Cron / Agents / offline model / Tauri / bootable

## Security & Isolation Baseline
- Gateway bind host: `127.0.0.1`
- Token policy: `auto-random` (no fixed literal)
- Install root policy: must end with managed `onclaw` suffix
- Controlled write paths: managed `onclaw/` directories only

## Quality Gates
- `npm run build`: PASS
- `npm run test:unit`: PASS
- `npm run test:e2e`: PASS
- `pwsh ./scripts/smoke-openclaw.ps1`: PASS

## Installer Evidence
- `tests/unit/install-script.spec.ts`: PASS
- Coverage points:
  - create managed layout
  - reject invalid install root
  - accept case-insensitive `OnClaw` suffix
  - ensure `snapshots/state` presence

## Review Loop Closure
- Blocking issue 1: install root case-sensitive check in `install.sh`
  - Fix: normalize root for case-insensitive suffix validation
- Blocking issue 2: missing `snapshots/state` directories
  - Fix: add both directories in `install.sh` and `install.ps1`
- Final status: no blocking issues

## Final Decision
- Phase 2 minimal scope is accepted as closed, ready to open Phase 3 planning.
