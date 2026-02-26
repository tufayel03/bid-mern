$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$installScript = Join-Path $PSScriptRoot "redis-local-install.ps1"
$redisPort = if ([string]::IsNullOrWhiteSpace($env:REDIS_LOCAL_PORT)) { 6380 } else { [int]$env:REDIS_LOCAL_PORT }

& $installScript | Out-Host

$redisDir = Join-Path $root "tools\redis"
$redisExe = Join-Path $redisDir "redis-server.exe"
$redisCli = Join-Path $redisDir "redis-cli.exe"
$redisDataDir = Join-Path $redisDir "data"
$redisConfig = Join-Path $redisDir "redis.local.conf"
$redisPidFile = Join-Path $redisDir "redis.pid"

function Test-RedisAlive {
  param(
    [string]$CliPath,
    [int]$Port
  )

  if (!(Test-Path $CliPath)) {
    return $false
  }

  try {
    $pong = & $CliPath "-h" "127.0.0.1" "-p" "$Port" "ping" 2>$null
    return ($LASTEXITCODE -eq 0 -and (($pong -join "`n") -match "PONG"))
  } catch {
    return $false
  }
}

New-Item -ItemType Directory -Path $redisDataDir -Force | Out-Null

$dirForConfig = ($redisDataDir -replace "\\", "/")
@(
  "bind 127.0.0.1"
  "protected-mode yes"
  "port $redisPort"
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

if (Test-RedisAlive -CliPath $redisCli -Port $redisPort) {
  Write-Output "Redis already running on 127.0.0.1:$redisPort"
  exit 0
}

# Clean up stale listeners or stale local redis processes before starting.
if (Get-NetTCPConnection -LocalPort $redisPort -State Listen -ErrorAction SilentlyContinue) {
  $stalePids = Get-NetTCPConnection -LocalPort $redisPort -State Listen -ErrorAction SilentlyContinue |
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

Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | ForEach-Object {
  try {
    $procPath = $_.Path
  } catch {
    $procPath = $null
  }
  if ($procPath -and $procPath.StartsWith($redisDir, [System.StringComparison]::InvariantCultureIgnoreCase)) {
    try {
      Stop-Process -Id $_.Id -Force -ErrorAction Stop
    } catch {
      # ignore if already exited
    }
  }
}

Write-Output "Starting Redis..."
Start-Process -FilePath $redisExe -ArgumentList "redis.local.conf" -WorkingDirectory $redisDir | Out-Null
Start-Sleep -Seconds 2

for ($attempt = 1; $attempt -le 30; $attempt++) {
  if (Test-RedisAlive -CliPath $redisCli -Port $redisPort) {
    Write-Output "Redis started successfully on 127.0.0.1:$redisPort"
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
