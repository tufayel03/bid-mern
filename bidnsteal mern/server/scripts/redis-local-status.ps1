$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$redisCli = Join-Path $root "tools\redis\redis-cli.exe"

$listener = Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

if (!$listener) {
  Write-Output "Redis status: stopped (no listener on 127.0.0.1:6379)"
  exit 0
}

$pong = ""
if (Test-Path $redisCli) {
  try {
    $pongRaw = & $redisCli "-h" "127.0.0.1" "-p" "6379" "ping" 2>$null
    if ($LASTEXITCODE -eq 0) {
      $pong = ($pongRaw -join "`n")
    } else {
      $pong = ""
    }
  } catch {
    $pong = ""
  }
}

$health = if ($pong -match "PONG") { "healthy" } else { "listener_only" }
Write-Output "Redis status: running ($health)"
Write-Output ("Address: {0}:{1}" -f $listener.LocalAddress, $listener.LocalPort)
Write-Output ("PID: {0}" -f $listener.OwningProcess)
