# DALAN v0.4 → v0.6 pilot release

## Supported audiences
- **Commuters**: maps, optional active-location sharing, trusted-contact links, self check-ins, internal assistance requests and optional staff monitoring consent.
- **Drivers and operators**: restricted pilot partner-application portal (not a validated operator account or dispatch system).
- **Staff**: individual DALAN Control accounts with super_admin / safety_officer / transport_admin / operator_manager / viewer roles.
- **Family and friends**: temporary viewer links, currently limited by Vercel Authentication to authorized testers.

## v0.4: staff identity and location controls
- One-time owner bootstrap code (SHA-256 hash is stored only as sensitive Vercel Preview env). Access at /admin/login, first-time setup.
- Named staff login, scrypt password hashes, 8-hour DB-backed sessions, staff role guards, per-email lockout after 5 bad passwords.
- Retired shared-password /api/admin/session and deprecated legacy administrative authorization for report moderation.
- Explicit separate commuter choice to let DALAN safety officers view an active trip. Exact staff location lookups are audited.
- Commuter can revoke staff access; during an active assistance request the user must cancel assistance to revoke.

## v0.5: transport data and partner pilot
- Draft vs source-verified route register; no invented routes populated.
- Fare rule register with mode, passenger type, fare kind, amount, source, validity; special fare estimates remain drafts only.
- Operator interest application and restricted operator_manager review; no official vehicle accreditation implied.

## v0.6: safety & guardians
- Browser foreground-only location tracking (no guaranteed background updates).
- Family temporary trip link displays last GPS fix and stale age, confirmed vehicle mode and optional vehicle details.
- Commuter check-in updates the next due time and shows overdue indicator to viewer; overdue does not imply emergency.
- Commuter can submit/cancel an internal assistance request; DALAN safety officers can acknowledge/resolve, without police/medical response integration.
- Automatic daily cleanup via authenticated Vercel Cron configuration when the project has a production deployment. Cleanup implementation also runs at trip creation.

## Data/operational restrictions
- Privacy Impact Assessment, privacy notice, retention plan and formal policy approval are outstanding.
- Staff creation and logins require user acceptance and real-device QA before external pilots.
- Rate limiting for public trip-sharing, abuse prevention, staff MFA, password resets, incident response, mandatory assistance operations staffing and delivery guarantees are **not complete**.
- Human-facing emergency instructions must not suggest guaranteed dispatch.
- A real driver/operator portal with independently verified credentials and official transport data has not been implemented.
- Fare matrix entries must be based on user's supplied current sources; do not invent prices or routes.
- Main remains unchanged. Draft PRs remain unmerged until verification.

## Test workflow
1. Sign into authorized Vercel preview, go to DALAN Control. First owner uses unique setup token to register email + 14+ character passphrase. Thereafter old shared admin login must not work.
2. Create separate safety_officer, transport_admin and operator_manager accounts. Verify role partitioning and data visibility.
3. Create a test trip from a device with location access, first with admin visibility off. Safety staff should not see it.
4. Explicitly grant admin monitoring, verify safety staff sees trip ID. Open precise GPS and confirm audit row; other staff roles must be rejected.
5. Test I'm OK check-in. Viewer sees the next check-in time. Do not interpret late check-ins as emergency.
6. Request assistance explicitly, acknowledge in Control, cancel on commuter screen and verify location access stops.
7. Test Stop & revoke, stale GPS and expiry, and confirm no location history is stored.
8. Test operator application and review. Add route/fare **drafts only** pending official matrices.
9. Confirm /api/health database connected, NEXT build, protected deployment, no CLEAR data accessed.
