# Launch Checklist

## Environment & Build
- [ ] API `.env` configured for production values (`PORT`, `MONGODB_URI`, `REDIS_URL`, JWT secrets, cookie/domain settings, feature flags).
- [ ] Worker `.env` configured for production values (`MONGODB_URI`, `REDIS_URL`, feature flags).
- [ ] Web `.env.production` configured with `VITE_API_BASE_URL=/api` (or full API URL if cross-domain).
- [ ] `npm --workspace @hotwheels/web run typecheck` passes.
- [ ] `npm --workspace @hotwheels/web run build` passes.
- [ ] `npm --workspace @hotwheels/api run build` passes.
- [ ] `npm --workspace @hotwheels/worker run build` passes.

## Full User Flow (Guest)
- [ ] Open `/shop`; products load from API with pagination.
- [ ] Apply filters (`search`, `condition`, `saleMode`, `inStock`, `sort`) and confirm results update.
- [ ] Open product detail by slug.
- [ ] Add fixed/hybrid item to cart.
- [ ] Update quantity and remove item from cart.
- [ ] Create checkout intent with `Idempotency-Key`; totals and expiry are shown.
- [ ] Place COD order with separate `Idempotency-Key`.
- [ ] Redirect to order success and show order summary from API/cache.

## Full User Flow (Authenticated)
- [ ] Register/login works and signed auth cookies are issued (`access_token`, `refresh_token`).
- [ ] Protected requests authenticate via cookies and succeed after refresh/reopen.
- [ ] Logout clears local auth and protected routes redirect to login.
- [ ] `cart_session` cookie preserved; guest cart merges on login.
- [ ] `/my-orders` list loads.
- [ ] `/my-orders/:id` detail loads for owner.

## Admin Flow
- [ ] `/admin` is blocked for non-admin users.
- [ ] `/admin/products` creates products successfully.
- [ ] Product list search and stock quick update works.
- [ ] `/admin/orders` list works with `status`, `paymentStatus`, `page`, `limit`.
- [ ] `/admin/orders/:id` loads and status patch works.
- [ ] `/admin/auctions` create form validates `startAt > now`, `endAt > startAt`.

## Auction Flow
- [ ] Scheduled auction cannot accept bids.
- [ ] Live auction accepts valid bids and rejects invalid increments.
- [ ] Ended auction disables bid controls.
- [ ] Winner sees `Claim Win` and can create reservation.
- [ ] Claimed reservation opens checkout and can place COD order.
- [ ] Auction-disabled environments (`FEATURE_AUCTIONS=false`) hide/handle auction UI gracefully.

## Reservation & Stock Safety
- [ ] Two users competing for last stock: only one order succeeds.
- [ ] Active reservations reduce available stock for checkout intent.
- [ ] Expired reservation no longer usable for order creation.
- [ ] Reservation consumption decrements stock exactly once.
- [ ] Repeating same idempotency keys replays prior checkout/order response.

## Email & Notifications
- [ ] Order confirmation email trigger executes (provider or fallback logger).
- [ ] Auction winner email trigger executes.
- [ ] Worker process is running and consuming Redis queue `bidnsteal:email:*`.
- [ ] Campaign send from admin enqueues jobs and dispatches through worker.
- [ ] Email failures do not break checkout/order flow.

## Mobile QA
- [ ] Shop grid is usable at 360px width.
- [ ] Cart page and drawer controls usable on touch devices.
- [ ] Checkout form inputs and buttons are visible and tappable.
- [ ] Auction bid panel fits mobile width without overflow.
- [ ] Header nav/search/cart badge remains accessible.

## Performance & Stability
- [ ] Route-level lazy loading works (no blank screens).
- [ ] Query caching prevents duplicate fetch storms.
- [ ] No uncaught promise rejections in browser console.
- [ ] No runtime console errors during key flows.
- [ ] Buttons are disabled during active mutations to prevent double-submit.

## Deployment (CloudPanel + PM2)
- [ ] API running under PM2 with graceful shutdown on `SIGINT`/`SIGTERM`.
- [ ] Worker running under PM2 with graceful shutdown on `SIGINT`/`SIGTERM`.
- [ ] CloudPanel reverse proxy routes `/` to web and `/api` to API.
- [ ] Redis queue prefix configured (`bidnsteal`) to avoid cross-app collisions.
- [ ] Static web build deployed and cache headers configured.
- [ ] Final smoke test executed on production domain.
