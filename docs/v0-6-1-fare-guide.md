# DALAN v0.6.1 — Provided tricycle and jeepney fare matrices

## Reference data
- Roxas City Ordinance No. 024-2024, effective according to contemporary reporting on 2024-08-27: first 2 km ₱15 regular, ₱10 student/PWD/senior, succeeding whole kilometers ₱5 for either class.
- Traditional jeepney rate from 2026-09-28: ₱14 for first 4 km, ₱2 per additional whole km regular; user-provided student/PWD/senior ₱11.20 for first 4 km, ₱1.60 per extra whole km.
- **Discrepancy:** Government television PTV reports a **₱11.25** initial discounted fare for traditional jeepneys, while 20% arithmetic gives ₱11.20. DALAN retains the exact user-supplied figure provisionally and prominently shows the discrepancy. Confirm the current official printed fare matrix before approving fare verification.
- Student discount applies on weekends/holidays while enrolled per Republic Act No. 11314.
- Ordinance overcharging penalty tiers: ₱1,500 (first), ₱3,000 (second), ₱5,000 (third), three-month franchise suspension for fourth/succeeding as supplied by user. Full signed ordinance text has not been checked, so legal enforcement display is qualified.

## Why whole-kilometer only?
Neither data source in hand defines precise fraction-of-a-kilometer charging and final coin rounding unambiguously. Pilot API refuses 2.3km instead of silently rounding upward (which could overstate a fare). This is **not a real journey fare quote** from GPS; the traveler enters a hypothetical whole-kilometer distance.

## Calculations
- Tricycle regular: ₱15 + max(0, km - 2) × ₱5
- Tricycle discounted: ₱10 + max(0, km - 2) × ₱5
- Traditional PUJ regular: ₱14 + max(0, km - 4) × ₱2
- Traditional PUJ discounted (provisional provided base): ₱11.20 + max(0, km - 4) × ₱1.60
- Alternative PUJ discounted government-reported base: ₱11.25 (provisional until actual posted matrix reviewed).
- Special/contracted trips: **no supplied rates**, therefore no computational value is returned.
- No other fares or modern jeepney fares are automatically assumed.

## Security and operations
- Rates live in independent DALAN Neon DB table `dalan_fare_schedules`; status is provisional.
- API `/api/fare-guide?mode=tricycle&distanceKm=3&passenger=student`; only validated enumerated inputs and whole-km bounds.
- No GPS or other commuter PII is sent to estimate a fare.
- System tests: `npm run test:fares`.
- Signed ordinance copy, LTFRB posted fare chart, official fractional-km rule, current effective dates and discounts must be verified before public launch.
