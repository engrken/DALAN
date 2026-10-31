# DALAN public UAT release gate

This branch introduces a public feedback collection interface and database-backed API. It is NOT a production release until the following are completed.

1. Provision an independent DALAN PostgreSQL database; do not reuse CLEAR's database.
2. Run db/001_uat_feedback.sql against DALAN's database.
3. Set DATABASE_URL securely in Vercel Production and Preview; never commit credentials.
4. Add edge/WAF rate limiting and bot protection to /api/feedback before opening public submissions. The honeypot alone is insufficient.
5. Establish a feedback retention policy, privacy notice, access controls, and a deletion process.
6. Verify HTTPS, mobile accessibility, form validation, successful database persistence, and error paths.
7. Perform security review and dependency audit; test build and deploy preview before production promotion.
8. Verify that transport data is clearly marked as demonstration-only until local route and fare validation is complete.
9. Configure monitoring, backups, and a process to review and triage UAT feedback.
10. Obtain explicit release approval and ensure production access settings permit public visitors.

Suggested smoke test: submit a 20-character comment and verify one database record; try an invalid category and confirm HTTP 400; disconnect DB and confirm no false success; confirm no user trip data is stored.
