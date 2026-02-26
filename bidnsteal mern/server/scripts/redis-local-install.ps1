$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$redisDir = Join-Path $root "tools\redis"
$redisExe = Join-Path $redisDir "redis-server.exe"

if (Test-Path $redisExe) {
  Write-Output "Redis already installed: $redisExe"
  exit 0
}

New-Item -ItemType Directory -Path $redisDir -Force | Out-Null

$zipPath = Join-Path $redisDir "redis.zip"
$downloadUrl = "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip"

Write-Output "Downloading Redis from $downloadUrl"
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

Write-Output "Extracting Redis..."
Expand-Archive -Path $zipPath -DestinationPath $redisDir -Force
Remove-Item -Path $zipPath -Force

if (!(Test-Path $redisExe)) {
  throw "Redis installation failed: redis-server.exe not found at $redisExe"
}

Write-Output "Redis installed successfully at $redisDir"
