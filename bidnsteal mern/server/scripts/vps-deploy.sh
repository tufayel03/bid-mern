#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[vps-deploy] Starting deployment in $ROOT_DIR"

if [[ ! -f "apps/api/.env" ]]; then
  echo "[vps-deploy] Missing apps/api/.env"
  exit 1
fi

if [[ ! -f "apps/worker/.env" ]]; then
  echo "[vps-deploy] Missing apps/worker/.env"
  exit 1
fi

if [[ ! -f "apps/web/.env.production" ]]; then
  echo "[vps-deploy] Missing apps/web/.env.production"
  exit 1
fi

echo "[vps-deploy] Installing dependencies"
npm ci

echo "[vps-deploy] Building all apps"
npm run build

echo "[vps-deploy] Starting/reloading PM2 processes"
npx pm2 start ecosystem.config.cjs --env production --update-env
npx pm2 save

echo "[vps-deploy] Deployment complete"
echo "[vps-deploy] Check: npx pm2 status"
echo "[vps-deploy] Logs:  npx pm2 logs bidnsteal-api bidnsteal-worker"

