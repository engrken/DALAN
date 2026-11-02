# RoxasGo

**Your City. Your Route. Your Ride.**

RoxasGo is a commuter-first web application planned for **Roxas City, Capiz, Philippines**. It restores the project's original name (previous working name: DALAN — Digital Assistance for Local Access and Navigation) and narrows its focus to helping residents, students, and visitors understand local tricycle and jeepney trips.

## Current status

**Early development preview only — not for actual navigation.** The current trip planner is a demonstration. No verified commuter routes, legally confirmed live fares, accurate trip times, transit schedules, GPS tracking, or emergency alerts are integrated. Do not rely on demonstration results for actual travel.

## Product goals

1. **Commute planning:** Search origins and destinations, discover verified tricycle/jeepney routes, boarding and drop-off points, and transfers.
2. **Fare transparency:** Show published fare rules with eligibility-based student, senior-citizen, and PWD discounts. Clearly indicate effective dates and source verification.
3. **Accessible local mapping:** Use open-source maps; request location permission only if the user opts in.
4. **Safer commuter assistance:** Enable opt-in trip sharing and moderated reports of transport concerns, with clear privacy controls.
5. **Verified information:** Separate official/field-verified routes and fares, modeled estimates, and unverified community reports.
6. **Operations and UAT:** Provide an admin console for route/fare verification, user feedback moderation, and staged public user acceptance testing.

**Initial focus:** Roxas City, Capiz. Later expansion may cover other municipalities without changing the commuter-first scope.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Requires a supported Node.js version.

## Hosting and rollout

The existing Vercel project originated as `dalan`. Branding changes do **not** themselves constitute launch approval. Keep the pilot protected until critical route/fare verification, privacy safeguards, accessibility checks, and production UAT readiness are completed. Avoid unnecessary deployment builds.

## Data and safety

Validate transit routes, fare schedules and travel-time estimates against official sources and field surveys before advising commuters. Clearly label any inferred or estimated outputs. No personal location tracking or trip storage is enabled in the starter. Never commit secrets, connection strings, or personal data.

## Release milestones

1. Verified Roxas City locations, transport routes, and fare ordinances
2. Real route/fare engine and accessible commuter-facing UX
3. Opt-in location/trip-sharing features and moderation safeguards
4. Admin content controls, reliability/performance validation, and limited UAT
5. Public launch with monitored feedback and gradual expansion
