# OnClaw Phase 1 Windows Portable - Release Record

## Release Identity
- Repository: https://github.com/Cocoblood9527/OnClaw
- Branch: codex/phase1-windows-portable
- Commit Baseline: 05d0891
- Date: 2026-04-03

## Scope (YAGNI)
- In Scope: Phase 1 minimal viable skeleton for Windows x64 portable
- Out of Scope: Channels, Skills, Cron, Agents, offline model, Phase 2/3 features

## Quality Gates
- `npm run build`: PASS
- `npm run test:unit`: PASS
- `npm run test:e2e`: PASS
- `npm run build:portable`: PASS
- `pwsh ./scripts/smoke-openclaw.ps1`: PASS

## Field Acceptance (Clean Windows x64)
- Rounds: 10
- passRate: 100%
- avgSec: 6.88
- maxSec: 12.1
- Decision: ACCEPT (>=95%)

## Security and Isolation Baseline
- Gateway bind host: `127.0.0.1`
- Token policy: random token by default (no fixed literal)
- Controlled writes: under `onclaw/` only

## Evidence Paths
- `onclaw/logs/acceptance-runs/summary.csv`
- `onclaw/logs/smoke-latest.json`

## Known Non-blocking Behavior
- In fallback health mode, smoke may report:
  - `mode: unknown`
  - `reason: fallback_default_health_port_no_metadata`
- This is accepted when `passed: true`.

## Final Decision
- Phase 1 Windows Portable MVP skeleton is accepted as release candidate.
