# Server

## Modules

- `api/`
  - Local API runtime on `http://127.0.0.1:3001`.
  - Serves admin auth/session endpoints and admin/dashboard/report API routes.
- `worker/`
  - BullMQ worker runtime (Redis + Mongo).
- `shared/`
  - Shared DTOs and validators.
- `scripts/`
  - Env bootstrap + local Redis scripts.

## Scripts

- `npm run dev:api`
- `npm run dev:worker`
- `npm run start:api`
- `npm run start:worker`

## Env

Uses `server/.env` (auto-created from `.env.example` by `scripts/ensure-env.js`).
