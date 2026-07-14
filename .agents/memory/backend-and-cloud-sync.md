---
name: Backend and cloud sync architecture
description: Durable decisions behind the Express/Postgres backend bolted onto the originally-static Ziman app.
---

- Admin credentials are always seeded from secrets at boot, never hardcoded, so rotating the password is just "update the secret + restart."
  **Why:** avoids leaking credentials into source/history. **How to apply:** any new privileged account should follow the same seed-from-secret-on-boot pattern, not a checked-in password.
- Real cloud accounts are a separate system from any pre-existing client-side/local-only "premium" or license simulation — don't merge the two without being asked.
  **Why:** the user wanted zero risk of breaking the existing offline-first experience while adding real accounts.
- Progress/points sync between local and server always takes the max of the two values, never overwrites downward.
  **Why:** silently regressing a user's XP/streak/progress on sync is a trust-breaking bug in a gamified app.
- Session secrets must fail closed at startup (crash if unset) rather than falling back to a hardcoded default.
  **Why:** a shared/predictable session secret lets an attacker forge session cookies.
- Badini (Kurmanji dialect) must always render in Perso-Arabic script, never Latin — this is an explicit, repeated user requirement across this project, not a one-off preference.
- Any one-off data migration/transliteration must be committed as an idempotent script (not just run ad hoc), so a fresh environment or a re-run doesn't lose or duplicate the work.
  **Why:** a code-review pass rejected ad-hoc unsaved DB changes as "not actually part of the codebase" — schema and data migrations need to be reproducible artifacts.
