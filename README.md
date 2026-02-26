# BIDNSTEAL

Professional two-layer structure:

- `client/` -> frontend/admin assets
- `server/` -> backend services, workers, shared contracts, infra scripts

## Final Repository Layout

- `client/`
  - `src/` (React app: `/front`, `/tufayel`, `/tufayel/panel`)
  - `vite.config.js`
  - `package.json`

- `server/`
  - `api/` (lightweight REST API for admin/front local runtime)
  - `worker/` (BullMQ + Mongo background jobs)
  - `shared/` (DTO + validators)
  - `scripts/` (Redis and deploy scripts)
  - `tools/redis/` (local Redis binaries/config)
  - `data/` (runtime data dirs)
  - `docs/api documentation`
  - `package.json`
  - `.env.example`

- root
  - `README.md`
  - `package.json`

## Commands

From root:

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run redis:start
```

These proxy into `server/` scripts.

## Notes

- This repo was cleaned and reorganized to remove duplicated/temporary root files.
- Keep active development inside `client/` and `server/` only.
- `README.md` is intentionally kept at root as requested.
- Admin entry is now `/tufayel/` instead of `/admin`.
- Local dev runs 3 processes: static client (`:5173`), API (`:3001`), worker.
