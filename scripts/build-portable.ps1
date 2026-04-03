$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$portableRoot = Join-Path $repoRoot "dist/portable/onclaw"
$runtimeDir = Join-Path $portableRoot "runtime"
$rootRuntimeDir = Join-Path $repoRoot "onclaw/runtime"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
New-Item -ItemType Directory -Force -Path $rootRuntimeDir | Out-Null

Write-Host "Portable layout prepared at $portableRoot"
