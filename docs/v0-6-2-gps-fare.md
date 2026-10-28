# DALAN v0.6.2 · GPS fare measurement and LTFRB minimum correction

## Jeepney fare correction
September 28, 2026 LTFRB-reported traditional jeepney minimum: ₱14 regular / **₱11.25 discounted**, first 4 km. Additional whole-km guide: ₱2 regular / ₱1.60 discounted. Source: https://ptvnews.ph/ltfrb-releases-new-matrices-for-puv-fare-hikes-effective-sept-28/ . This replaces the provisional ₱11.20 figure in the earlier historical migration. The current read-only reference database now stores 1125 centavos. Tricycle matrix remains unchanged.

## GPS fare meter (foreground-only PWA)
- User opts in explicitly to GPS on the **Fare Guide** tab, then presses Start. Stop, Pause, Resume and Reset controls are present.
- Distance is accumulated from sequential geolocation fixes using Haversine measurements; it is NOT direct start-to-end straight-line distance, but also NOT a verified road-route distance.
- GPS fixes with excessive accuracy error, unrealistic jump, very small movement, or stale timestamps are rejected. Gaps over 45 seconds are NOT bridged.
- Recording pauses when the tab is hidden and stops when leaving Fare Guide. Browsers cannot promise tracking with a locked screen, so missing intervals may underestimate the actual journey.
- Raw GPS positions and route trajectory remain in client component memory only; they are never uploaded, cached as a journey or saved in the database through the GPS fare meter.
- The API GET /api/gps-fare receives numerical distance in meters, passenger category and selected mode. It returns separate adjacent whole-km **hypothetical examples**, not an official price range. Exact fraction-of-kilometer billing is NOT established from the available sources.
- This is an advisory estimate, NOT a fare meter used for payment, overcharging enforcement, official tariff disputes or driver dispatch.
- No special/contracted trip price, modern jeepney fare or unverified route fare is generated.

## Testing and release
- npm run test:fares executes fare and GPS filter tests before build.
- Manual smartphone QA required for permission refusal, stationary GPS jitter, real trip with known distance, app hidden and resumed, GPS quality, expired/revoked permission, and comparison with the legally approved fare chart.
- Do not merge until phone testing and approved partial-kilometer rules have been reviewed.
