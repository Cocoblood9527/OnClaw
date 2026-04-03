$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$portableRoot = Join-Path $repoRoot "dist/portable/onclaw"
$runtimeDir = Join-Path $portableRoot "runtime"
$rootRuntimeDir = Join-Path $repoRoot "onclaw/runtime"
$runtimeEntry = Join-Path $rootRuntimeDir "openclaw-entry.cjs"
$portableRuntimeEntry = Join-Path $runtimeDir "openclaw-entry.cjs"
$bundledOpenClawDir = Join-Path $rootRuntimeDir "node_modules/openclaw"
$bundledOpenClawEntry = Join-Path $bundledOpenClawDir "openclaw.mjs"
$portableBundledOpenClawDir = Join-Path $runtimeDir "node_modules/openclaw"
$portableBundledOpenClawEntry = Join-Path $portableBundledOpenClawDir "openclaw.mjs"
$bundleWorkDir = Join-Path $repoRoot "onclaw/tmp/build-portable"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
New-Item -ItemType Directory -Force -Path $rootRuntimeDir | Out-Null

if (!(Test-Path $bundledOpenClawEntry)) {
  if ($env:ONCLAW_SKIP_BUNDLE_DOWNLOAD -eq "1") {
    Write-Host "Skip bundling official openclaw@latest (ONCLAW_SKIP_BUNDLE_DOWNLOAD=1)"
  } else {
    New-Item -ItemType Directory -Force -Path $bundleWorkDir | Out-Null
    Push-Location $bundleWorkDir
    try {
      $packFile = (npm pack openclaw@latest --silent).Trim()
      if ([string]::IsNullOrWhiteSpace($packFile)) { throw "failed to bundle openclaw@latest" }

      $packPath = Join-Path $bundleWorkDir $packFile
      $extractDir = Join-Path $bundleWorkDir "openclaw-extract"
      if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }
      New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
      tar -xzf $packPath -C $extractDir

      $packageDir = Join-Path $extractDir "package"
      if (!(Test-Path $packageDir)) { throw "bundled package missing extracted 'package/' directory" }
      if (Test-Path $bundledOpenClawDir) { Remove-Item -Recurse -Force $bundledOpenClawDir }
      New-Item -ItemType Directory -Force -Path (Split-Path $bundledOpenClawDir -Parent) | Out-Null
      Copy-Item -Path $packageDir -Destination $bundledOpenClawDir -Recurse -Force
    }
    finally {
      Pop-Location
    }
  }
}

$bundledDepsSentinel = Join-Path $bundledOpenClawDir "node_modules/tslog/package.json"
if ((Test-Path $bundledOpenClawEntry) -and ($env:ONCLAW_SKIP_BUNDLE_DOWNLOAD -ne "1") -and !(Test-Path $bundledDepsSentinel)) {
  Push-Location $bundledOpenClawDir
  try {
    npm install --omit=dev --ignore-scripts --no-fund --no-audit | Out-Null
  }
  finally {
    Pop-Location
  }
}

if (Test-Path $runtimeEntry) {
  Copy-Item -Path $runtimeEntry -Destination $portableRuntimeEntry -Force
}
if (Test-Path $bundledOpenClawDir) {
  New-Item -ItemType Directory -Force -Path $portableBundledOpenClawDir | Out-Null
  if ($env:ONCLAW_SKIP_BUNDLE_DOWNLOAD -eq "1") {
    if (Test-Path $bundledOpenClawEntry) {
      Copy-Item -Path $bundledOpenClawEntry -Destination $portableBundledOpenClawEntry -Force
    }
  } else {
    Copy-Item -Path (Join-Path $bundledOpenClawDir "*") -Destination $portableBundledOpenClawDir -Recurse -Force
  }
}

Write-Host "Portable layout prepared at $portableRoot"
