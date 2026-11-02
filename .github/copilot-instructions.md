# RoxasGo development instructions

RoxasGo is the commuter application for Roxas City, Capiz. DALAN is the repository name and former brand.

Use RoxasGo in new user-facing content. The current planner is an early demonstration, not verified navigation. Label route, fare and time estimates explicitly. Require source verification for fares and opt-in permission for location/trip sharing. Do not imply that branding or a successful build constitutes production readiness.

## Working practice

- Read existing code and applicable AGENTS.md files before editing. Keep changes focused and preserve unrelated work.
- Use the repository's existing dependencies and package manager. Do not invent test commands.
- Never print or commit credentials, environment files, personal student/customer data or production database exports.
- Prefer focused local checks. Batch changes to conserve CI and deployment quotas. Do not start cloud builds, deployments or migrations solely to validate documentation or development configuration.
- State what was actually verified and what remains untested. Successful compilation is not proof of live service or hardware correctness.
- GitHub Education entitlements belong to the eligible account/organization; repository configuration does not redeem benefits or supply public SaaS inference credits.

## Setup and validation

Available build check: npm run build. This repository currently has no committed package lock or test script. Review and commit a generated lockfile separately; do not claim reproducible installs before then.

See GITHUB_EDUCATION.md for cloud development and activation steps.
