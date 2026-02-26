$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$redisCli = Join-Path $root "tools\redis\redis-cli.exe"

if (!(Test-Path $redisCli)) {
  throw "redis-cli.exe not found. Run: npm run redis:local:start"
}

for ($attempt = 1; $attempt -le 10; $attempt++) {
  try {
    $pong = & $redisCli "-p" "6379" "ping" 2>$null
    if ($LASTEXITCODE -eq 0 -and (($pong -join "`n") -match "PONG")) {
      Write-Output ($pong -join "`n")
      exit 0
    }
  } catch {
    # retry until timeout
  }
  Start-Sleep -Milliseconds 350
}

throw "Redis is not reachable on 127.0.0.1:6379"
