# DALAN v0.3 — Maps & Consensual Trip Sharing

Features: MapLibre GL JS and OpenFreeMap public style, map centered near Roxas City, opted-in on-device geolocation, explicit live sharing consent, 60-minute viewer link, manual transport identification, optional plate/body number and operator description, GPS-based walking/motorized hint only. **No detection of tricycle versus jeepney from GPS**. Fares and route polylines stay **UNVERIFIED** pending government matrices and mapping.

## Privacy and operating limitations
- Travelers grant permission directly; GPS never starts on page load.
- A location-sharing session requires a separate explicit checkbox; link recipients can see the latest coordinates for 60 minutes and the traveler can revoke the link. Only the latest fix is stored, not travel history.
- The viewer link is a bearer secret and should only be sent to trusted contacts. Vercel Authentication currently blocks most family members who are not pilot team members.
- GPS watches are paused when DALAN is backgrounded; no OS-native background tracking is promised. A stale warning appears after 45 seconds.
- Plate/body number is unverified and may be personal data. Driver/operator description is optional; do not add identifying third-party information without an appropriate lawful basis and privacy review.
- Both access tokens are SHA-256 hashed in the database; owner and viewer tokens are separate. Trip expiration enforced on read/write, deletion on traveler stop, and best-effort expired-record purge on the next new share. **Before public rollout, add guaranteed scheduled deletion/retention jobs, rate limits, abuse protections, access logging policies, privacy notice and an incident response plan.**
- No automated SOS, emergency service dispatch, vehicle verification, fare calculation, navigation routing engine, or live ETA.
- OpenFreeMap's free public instance has no SLA; evaluate a contracted or self-hosted option for citywide reliability.

## Tests
1. Load Map & live trip on Android/desktop; confirm MapLibre tiles and attribution display.
2. Deny GPS; verify no session creation; grant GPS, observe accuracy.
3. Ensure mode hint does NOT claim tricycle/jeepney identification.
4. Confirm no location updates before checking consent and pressing Start.
5. Share link to an authorized pilot tester, confirm location/timestamp after at least 12 seconds; note Vercel login limitation.
6. Pause browser/app, ensure updates stop, viewer becomes stale, Resume button available.
7. Stop & revoke, verify link returns 404 and DB row removed; expiry after one hour returns 410.
8. Verify viewer cannot update location using only viewer token, and anonymous admin routes still require auth.
9. Validate mobile page build and DB connection; keep CLEAR entirely separate.
