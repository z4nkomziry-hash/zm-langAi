# Ziman AI — Phase 14 Release Notes

## Limited / Premium AI access
- Speaking and Writing AI modes are now enforced as premium-only on the server.
- The entitlement policy exposes feature flags for premium AI, cloud sync, and offline lessons.
- `/api/subscription/status` returns the allowed premium AI mode names alongside the user's active entitlement and remaining daily quota.
- Requests denied by the server return HTTP 403 with `code: PREMIUM_REQUIRED`; the frontend shows a localized upgrade message.
- The gate runs before daily AI usage is charged, so denied premium-mode requests do not consume the free quota.

## Validation
- Unit tests cover free entitlement, expired packages, package priority, premium mode gating, and quota bounds.
- Run `npm test` before deployment.
- PostgreSQL integration and live Gemini calls must still be verified in a staging environment before production release.
