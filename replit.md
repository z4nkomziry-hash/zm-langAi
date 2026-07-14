# Ziman — Language Learning App

A Kurdish-language learning platform (similar to Duolingo). The frontend is a **static web app** (HTML + CSS + JavaScript, no framework, no build step); it is now backed by a secure **Node.js/Express + PostgreSQL** server for admin control, real user accounts, and cloud-synced progress.

## Project Overview

| Feature | Details |
|---|---|
| Frontend | Vanilla HTML5, CSS3, ES6+ JavaScript (unchanged, still offline-first) |
| Backend | Express server (`server.js`), session auth (`express-session` + `connect-pg-simple`), `bcryptjs` password hashing |
| Database | Replit PostgreSQL — `users`, `user_progress`, `vocabulary`, `lessons`, `teacher_applications`, `admins`, `session` |
| Languages | Central Kurdish (Sorani) UI with 11 language pairs |
| PWA | Full service worker + manifest (offline support — app still works with no backend reachable) |
| Storage | `localStorage` for guests/offline; PostgreSQL for logged-in users (progress synced, last-write-wins merged by "take the higher value") |

## Running Locally

```bash
node server.js
```

The Replit workflow (`Start application`) runs this automatically on port 5000.

## File Structure

```
index.html    — App shell (header, side menu, bottom nav, main content slot)
style.css     — Design system (CSS custom properties, mobile-first)
app.js        — All application logic (state, routing, page renderers, cloud sync)
config.js     — Frontend-only config (payment info, contact — no secrets)
server.js     — Express backend: admin auth, user auth, vocabulary/lessons/users/teacher-application APIs
db.js         — PostgreSQL connection pool
admin.html    — Super Admin Control Panel (server-session protected, at /admin)
manifest.json — PWA manifest
sw.js         — Service worker (cache-first, offline support)
data/vocabulary.js — Original seed vocabulary (also migrated into the `vocabulary` DB table)
```

## Backend & Security

- **Super Admin login** (`/admin`): email + password, checked against the `admins` table (bcrypt hash). The account is auto-seeded on server boot from the `ADMIN_EMAIL` / `ADMIN_PASSWORD` Replit Secrets — **never hardcode admin credentials in source**. Change the password by updating the `ADMIN_PASSWORD` secret and restarting the server.
- **Admin panel** (`admin.html`) lets the Super Admin: add/edit/delete vocabulary, add/edit/delete lessons, view/delete registered users, and approve/reject teacher applications. All admin API routes (`/api/admin/*`) require `req.session.isAdmin`.
- **Regular user accounts**: real email/password registration (`/api/auth/register`, `/api/auth/login`), bcrypt-hashed, session-based. Used only for cross-device progress sync — the existing client-side license-key "premium" system in `auth.js` is untouched.
- **Progress sync**: on login, the client pulls `/api/progress` and merges (keeps the higher of local vs. server XP/streak/etc.); every `save()` call debounces a push to `/api/progress`. If the backend is unreachable the app falls back to `localStorage` only — no functionality is lost offline.
- Session store lives in Postgres (`session` table, via `connect-pg-simple`) using the `SESSION_SECRET` secret.

## Vocabulary Data

- All 726 original entries were migrated from `data/vocabulary.js` into the `vocabulary` table, manageable from `/admin`.
- The Badini (`badini` column) field was converted from Latin-script Kurmanji to **Perso-Arabic script** via a systematic letter-transliteration table (see project history) so the app never shows Latin script for Badini. This is a mechanical conversion — spot-check recommended before treating it as publish-ready, native-reviewed content.
- A small set of additional entries (numbers 20–1,000,000) was added directly in Arabic script.
- Further large-scale vocabulary/lesson expansion should go through native-speaker review before bulk-inserting — see follow-up tasks.

## Key Conventions

- **No frameworks** — plain HTML/CSS/JS only; keep it that way
- **Mobile-first CSS** — 375px base, breakpoints at 768px (tablet/desktop)
- **RTL layout** — `dir="rtl"` on `<html>`; all flex/grid must respect RTL
- **`escHtml()` everywhere** — all user/data strings inserted into `innerHTML` must be escaped
- **`_trackTimeout()` / `_trackInterval()`** — register all timers so `navigateTo()` clears them
- **`lsGet()` / `lsGetJSON()`** — always use these wrappers (never raw `localStorage.getItem` with `JSON.parse`)
- **`data-nav` attribute** — used for active-state matching in side menu and bottom nav
- **Font** — `Noto Kufi Arabic` (Google Fonts) for Kurdish script; loaded in `<head>`

## Security Notes

- `config.js` contains the admin password in plain text — this is client-side only and intentional for this architecture, but be aware it's visible in source
- Payment data is stored in `localStorage` — no server-side validation

## Phase History

- **Phase 1 (2026-07-12)** — Foundation & Bug Fixes: updateUI fix, timer leak fix, side-menu close fix, AudioContext fix, desktop layout, iOS safe-area, Kurdish font, accessible nav, ARIA improvements, XSS escaping

## User Preferences

- Never break existing functionality when making changes
- Keep HTML + CSS + JavaScript only (no frameworks)
- Mobile-first, iPhone and Android priority
- Preserve existing branding and design language
- Stop and wait for approval after each phase
- Explain every important change made
