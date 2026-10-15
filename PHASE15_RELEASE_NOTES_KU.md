# Ziman AI — Phase 15 Release Candidate

## Release hardening
- Added `GET /api/health` for a minimal service/database readiness check. It does not expose secrets or database error details.
- Added `npm run verify` to check required release files, syntax of key JavaScript files, accidental secret patterns, and the existing unit test suite.
- Added a Kurdish deployment checklist for environment secrets, schema readiness, staging smoke tests, and rollback preparation.
- Kept provider keys out of frontend code and did not package a real `.env` file.

## Local verification
- JavaScript syntax checks passed for all configured core files.
- Unit tests passed: 31/31.
- ZIP integrity checked after packaging.

## Release status
This is a **release candidate**, not a guarantee of zero defects. Live PostgreSQL, Gemini provider, payment processing, browser/device compatibility, and production deployment tests must be run in the target staging environment before public launch.
