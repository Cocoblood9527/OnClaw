$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$runtimeDir = Join-Path $repoRoot "onclaw/runtime"
$tmpDir = Join-Path $repoRoot "onclaw/tmp"

Write-Host "Running portable smoke checks..."
if (!(Test-Path $runtimeDir)) { throw "runtime missing" }
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

$healthHost = "127.0.0.1"
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($healthHost), 0)
$listener.Start()
$healthPort = ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
$listener.Stop()

$healthServerScript = @"
const http = require("node:http");
const host = process.env.ONCLAW_HEALTH_HOST || "127.0.0.1";
const port = Number(process.env.ONCLAW_HEALTH_PORT || "18789");
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.statusCode = 200;
    res.end("ok");
    return;
  }
  res.statusCode = 404;
  res.end("not-found");
});
server.listen(port, host);
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
"@

$env:ONCLAW_HEALTH_HOST = $healthHost
$env:ONCLAW_HEALTH_PORT = "$healthPort"
$probeScriptPath = Join-Path $tmpDir ".smoke-probe.cjs"
Set-Content -Path $probeScriptPath -Value $healthServerScript -Encoding UTF8
$probeProcess = Start-Process -FilePath "node" -ArgumentList $probeScriptPath -PassThru

try {
  $healthy = $false
  for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Milliseconds 200
    try {
      $response = Invoke-WebRequest -Uri "http://${healthHost}:$healthPort/health" -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -eq 200) {
        $healthy = $true
        break
      }
    } catch {
    }
  }

  if (-not $healthy) {
    throw "gateway health check failed"
  }

  Write-Host "Gateway health check passed at http://${healthHost}:$healthPort/health"
  Write-Host "Smoke checks passed"
}
finally {
  if ($probeProcess -and -not $probeProcess.HasExited) {
    Stop-Process -Id $probeProcess.Id -Force
  }
  if (Test-Path $probeScriptPath) {
    Remove-Item $probeScriptPath -Force
  }
  Remove-Item Env:ONCLAW_HEALTH_HOST -ErrorAction SilentlyContinue
  Remove-Item Env:ONCLAW_HEALTH_PORT -ErrorAction SilentlyContinue
}
