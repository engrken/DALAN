# DALAN

**Digital Assistance for Local Access and Navigation**

DALAN is an independent smart mobility platform planned for an initial pilot in Roxas City, Capiz, Philippines.

## Status
Early development setup only. No verified commuter routes, current fares, live public transport schedules, or real-time safety alerts have been integrated. The current UI is a demonstration, **not for navigation**.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Requires a supported Node.js version.

## Hosting
Vercel project: `dalan` (separate from CLEAR and ASPECT). The initial preview should remain under Vercel Authentication until launch approval.

## Data and safety
Transport routes, fare schedules and travel time estimates must be validated against official sources and local field surveys before commuter use. No personal location tracking is enabled in this starter. Never commit connection strings or secrets.

## Roadmap
1. Pilot transport data validation and verified city landmarks
2. Commuter route planner, fares and accessibility
3. Moderated service reports and operations console
4. Operator partnerships, GPS (opt-in), alerts and citywide expansion
