# DALAN — Mobile + Administration Pilot (v0.2)

## Scope

- Mobile-first, installable progressive web application (PWA) for Android and supported smartphone browsers.
- Explicit on-tap permission requests for device geolocation and local camera preview.
- Native Web Share API when available. No automatic transmission of device GPS.
- External Google Maps directions by user action; DALAN does not claim verified local transport routes or fares.
- Anonymous commuter report submission; all submissions remain pending until admin review.
- Server-side PostgreSQL persistence in **DALAN's own** Neon database.
- DALAN Control at `/admin`: temporary single-passphrase authentication with signed, HTTP-only 8-hour cookie; moderation of pilot reports.
- Vercel Authentication protection retained at project level.
- PWA manifest and service worker with an offline warning page; protected admin and API responses are not cached.

## Boundaries

- This is **not** ready for open public deployment. It lacks verified transport data, rate limiting, staff role-based access, formal audit logs, privacy impact assessment, and operational incident support.
- **Reviewed** reports are not official alerts or verified facts.
- Never add personal information to report text.
- Camera footage is never captured, scanned, uploaded or stored in v0.2.
- Location in a report is coarse-grained on the server to two decimal places, only after separate consent.
- No background location tracking or push notifications.

## Environment (server only)

- `DALAN_DATABASE_URL` — Neon marketplace value, do not expose to client.
- `DALAN_ADMIN_PASSWORD_HASH` — `hexSalt:hexScryptHash` (scrypt N=16384,r=8,p=1,64 bytes).
- `DALAN_ADMIN_SESSION_SECRET` — 32-byte random secret hex.
- `DALAN_APP_MODE=prelaunch`.
- Next.js Node runtime + `pg` connection pool.

## Preflight

1. Verify `/api/health` returns `database: connected`.
2. Verify `/api/reports` returns no verified routes/fares and review count.
3. Check the homepage in an Android browser with denied and granted permissions.
4. Submit a **non-sensitive test report** and confirm it appears in DALAN Control.
5. Verify moderation status changes and admin logout/login.
6. Confirm admin routes require valid app session; Vercel deployment remains protected.
7. Confirm service worker does not cache `/admin` or `/api` requests.
8. Confirm CLEAR's own Vercel/Neon projects are unaffected.

## Next phase

Verified Roxas City routes & fare ordinances, authenticated staff roles, abuse prevention, privacy assessment, operator access, monitoring and public release readiness.
