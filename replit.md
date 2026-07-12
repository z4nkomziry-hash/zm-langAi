# Ziman — Language Learning App

A Kurdish-language learning platform (similar to Duolingo) built as a pure **static web app** (HTML + CSS + JavaScript, no framework, no build step).

## Project Overview

| Feature | Details |
|---|---|
| Stack | Vanilla HTML5, CSS3, ES6+ JavaScript |
| Languages | Central Kurdish (Sorani) UI with 11 language pairs |
| PWA | Full service worker + manifest (offline support) |
| Storage | `localStorage` only (no backend) |

## Running Locally

```bash
python3 -m http.server 5000
```

Then open `http://localhost:5000` in your browser. The Replit workflow does this automatically.

## File Structure

```
index.html   — App shell (header, side menu, bottom nav, main content slot)
style.css    — Design system (CSS custom properties, mobile-first)
app.js       — All application logic (state, routing, page renderers)
config.js    — App configuration (payment info, contact, admin password)
admin.html   — Payment management panel (password protected, client-side)
manifest.json — PWA manifest
sw.js        — Service worker (cache-first, offline support)
```

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
