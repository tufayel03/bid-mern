$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$redisDir = Join-Path $root "tools\redis"
$redisCli = Join-Path $redisDir "redis-cli.exe"
$redisPidFile = Join-Path $redisDir "redis.pid"

$stopped = $false

if (Test-Path $redisCli) {
  try {
    & $redisCli "-p" "6379" "shutdown" "nosave" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
      $stopped = $true
    }
  } catch {
    # fallback to pid stop
  }
}

Start-Sleep -Milliseconds 800

if ((Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue)) {
  $listenerPids = Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pidValue in $listenerPids) {
    try {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction Stop
      $stopped = $true
    } catch {
      # ignore failed process stop
    }
  }
}

$redisProcesses = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
if ($redisProcesses) {
  foreach ($proc in $redisProcesses) {
    try {
      $procPath = $proc.Path
    } catch {
      $procPath = $null
    }
    if ($procPath -and $procPath.StartsWith($redisDir, [System.StringComparison]::InvariantCultureIgnoreCase)) {
      try {
        Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        $stopped = $true
      } catch {
        # ignore failed process stop
      }
    }
  }
}

if (Test-Path $redisPidFile) {
  $pidText = (Get-Content $redisPidFile -Raw).Trim()
  if ($pidText -match "^\d+$") {
    try {
      Stop-Process -Id ([int]$pidText) -Force -ErrorAction Stop
      $stopped = $true
    } catch {
      # ignore if already stopped
    }
  }
  Remove-Item -Path $redisPidFile -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 500
$stillRunning = $null -ne (Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)

if ($stopped -and -not $stillRunning) {
  Write-Output "Redis stopped."
} elseif ($stillRunning) {
  Write-Output "Redis listener is still running on 127.0.0.1:6379."
} else {
  Write-Output "Redis was not running."
}
