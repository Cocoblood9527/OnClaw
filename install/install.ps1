$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$installRoot = if ($env:ONCLAW_INSTALL_ROOT) { $env:ONCLAW_INSTALL_ROOT } else { Join-Path $repoRoot "onclaw" }
$skipNpm = $env:ONCLAW_INSTALL_SKIP_NPM

$normalizedRoot = $installRoot.TrimEnd("\", "/")
if (-not ($normalizedRoot -match "(^|[\\/])onclaw$")) {
  throw "ONCLAW_INSTALL_ROOT must end with /onclaw"
}

$managedDirs = @(
  "runtime",
  "data",
  "logs",
  "cache",
  "downloads",
  "tmp"
)

foreach ($dir in $managedDirs) {
  New-Item -ItemType Directory -Force -Path (Join-Path $normalizedRoot $dir) | Out-Null
}

$templateEntry = Join-Path $repoRoot "onclaw/runtime/openclaw-entry.cjs"
if (!(Test-Path $templateEntry)) {
  throw "runtime entry template missing: $templateEntry"
}
Copy-Item -Path $templateEntry -Destination (Join-Path $normalizedRoot "runtime/openclaw-entry.cjs") -Force

if ($skipNpm -ne "1") {
  npm --prefix (Join-Path $normalizedRoot "runtime") install --no-save openclaw@latest
}

Write-Host "OnClaw installed at $normalizedRoot"
