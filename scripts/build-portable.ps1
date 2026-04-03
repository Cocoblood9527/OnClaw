$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$portableRoot = Join-Path $repoRoot "dist/portable/onclaw"
$runtimeDir = Join-Path $portableRoot "runtime"
$rootRuntimeDir = Join-Path $repoRoot "onclaw/runtime"
$runtimeEntry = Join-Path $rootRuntimeDir "openclaw-entry.cjs"
$portableRuntimeEntry = Join-Path $runtimeDir "openclaw-entry.cjs"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
New-Item -ItemType Directory -Force -Path $rootRuntimeDir | Out-Null
if (Test-Path $runtimeEntry) {
  Copy-Item -Path $runtimeEntry -Destination $portableRuntimeEntry -Force
}

Write-Host "Portable layout prepared at $portableRoot"
