$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$runtimeDir = Join-Path $repoRoot "onclaw/runtime"

Write-Host "Running portable smoke checks..."
if (!(Test-Path $runtimeDir)) { throw "runtime missing" }
Write-Host "Smoke checks passed"
