$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$runtimeDir = Join-Path $repoRoot "onclaw/runtime"
$runtimeEntry = Join-Path $runtimeDir "openclaw-entry.cjs"
$logsDir = Join-Path $repoRoot "onclaw/logs"
$smokeReportPath = Join-Path $logsDir "smoke-latest.json"

Write-Host "Running portable smoke checks..."
if (!(Test-Path $runtimeDir)) { throw "runtime missing" }
if (!(Test-Path $runtimeEntry)) { throw "runtime entry missing: $runtimeEntry" }

$healthHost = "127.0.0.1"
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($healthHost), 0)
$listener.Start()
$healthPort = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
$listener.Stop()

$env:ONCLAW_HEALTH_HOST = $healthHost
$env:ONCLAW_HEALTH_PORT = "$healthPort"
$runtimeMode = "unknown"
$runtimeReason = "unknown"
$healthUrl = "http://${healthHost}:$healthPort/health"
$fallbackHealthUrl = "http://${healthHost}:18789/health"

function Test-HealthUrl {
  param(
    [string]$Url,
    [ref]$ModeRef,
    [ref]$ReasonRef
  )

  for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Milliseconds 200
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -eq 200) {
        try {
          $healthPayload = $response.Content | ConvertFrom-Json
          if ($healthPayload.mode) {
            $ModeRef.Value = "$($healthPayload.mode)"
          }
          if ($healthPayload.reason) {
            $ReasonRef.Value = "$($healthPayload.reason)"
          }
        } catch {
        }
        return $true
      }
    } catch {
    }
  }

  return $false
}

Write-Host "Runtime entry: $runtimeEntry"
$probeProcess = Start-Process -FilePath "node" -ArgumentList $runtimeEntry -PassThru

try {
  $healthy = Test-HealthUrl -Url $healthUrl -ModeRef ([ref]$runtimeMode) -ReasonRef ([ref]$runtimeReason)
  if (-not $healthy -and $healthPort -ne 18789) {
    $healthy = Test-HealthUrl -Url $fallbackHealthUrl -ModeRef ([ref]$runtimeMode) -ReasonRef ([ref]$runtimeReason)
    if ($healthy) {
      $healthUrl = $fallbackHealthUrl
      if ($runtimeMode -eq "unknown" -and $runtimeReason -eq "unknown") {
        $runtimeReason = "fallback_default_health_port_no_metadata"
      }
    }
  }

  if (-not $healthy) {
    throw "gateway health check failed"
  }

  Write-Host "Runtime mode: $runtimeMode"
  Write-Host "Runtime reason: $runtimeReason"
  Write-Host "Gateway health check passed at $healthUrl"
  New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
  @{
    timestamp = [DateTimeOffset]::UtcNow.ToString("o")
    passed = $true
    mode = $runtimeMode
    reason = $runtimeReason
    healthUrl = $healthUrl
    runtimeEntry = "$runtimeEntry"
  } | ConvertTo-Json | Set-Content -Path $smokeReportPath -Encoding utf8
  Write-Host "Smoke checks passed"
}
finally {
  if ($probeProcess -and -not $probeProcess.HasExited) {
    Stop-Process -Id $probeProcess.Id -Force
  }
  Remove-Item Env:ONCLAW_HEALTH_HOST -ErrorAction SilentlyContinue
  Remove-Item Env:ONCLAW_HEALTH_PORT -ErrorAction SilentlyContinue
}
