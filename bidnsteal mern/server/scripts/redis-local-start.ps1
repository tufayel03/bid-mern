$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$installScript = Join-Path $PSScriptRoot "redis-local-install.ps1"

& $installScript | Out-Host

$redisDir = Join-Path $root "tools\redis"
$redisExe = Join-Path $redisDir "redis-server.exe"
$redisCli = Join-Path $redisDir "redis-cli.exe"
$redisDataDir = Join-Path $redisDir "data"
$redisConfig = Join-Path $redisDir "redis.local.conf"
$redisPidFile = Join-Path $redisDir "redis.pid"

function Test-RedisAlive {
  param(
    [string]$CliPath
  )

  if (!(Test-Path $CliPath)) {
    return $false
  }

  try {
    $pong = & $CliPath "-p" "6379" "ping" 2>$null
    return ($LASTEXITCODE -eq 0 -and (($pong -join "`n") -match "PONG"))
  } catch {
    return $false
  }
}

New-Item -ItemType Directory -Path $redisDataDir -Force | Out-Null

if (!(Test-Path $redisConfig)) {
  $dirForConfig = ($redisDataDir -replace "\\", "/")
  @(
    "bind 127.0.0.1"
    "protected-mode yes"
    "port 6379"
    "tcp-keepalive 300"
    "daemonize no"
    "supervised no"
    "pidfile redis.pid"
    "loglevel warning"
    "databases 16"
    "save 900 1"
    "save 300 100"
    "save 60 1"
    "appendonly yes"
    "dir ""$dirForConfig"""
  ) | Set-Content -Path $redisConfig -Encoding ascii
}

if (Test-RedisAlive -CliPath $redisCli) {
  Write-Output "Redis already running on 127.0.0.1:6379"
  exit 0
}

# Clean up stale listeners or stale local redis processes before starting.
if (Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue) {
  $stalePids = Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pidValue in $stalePids) {
    try {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction Stop
    } catch {
      # ignore if process is protected or already exited
    }
  }
  Start-Sleep -Milliseconds 600
}

Write-Output "Starting Redis..."
& cmd /c start "" /D "$redisDir" redis-server.exe redis.local.conf | Out-Null
Start-Sleep -Seconds 1

for ($attempt = 1; $attempt -le 12; $attempt++) {
  if (Test-RedisAlive -CliPath $redisCli) {
    Write-Output "Redis started successfully on 127.0.0.1:6379"
    exit 0
  }
  Start-Sleep -Milliseconds 500
}

if (Test-Path $redisPidFile) {
  $pidText = (Get-Content $redisPidFile -Raw).Trim()
  if ($pidText -match "^\d+$") {
    throw "Redis started but ping failed. Check process PID $pidText and logs in $redisDir."
  }
}

throw "Redis failed to start."
