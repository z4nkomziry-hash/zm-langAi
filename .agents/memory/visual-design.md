---
name: Visual design system
description: Phase 2 visual polish — new CSS components and JS page transition pattern.
---

# Visual Design System — Phase 2 Polish

## Page transitions
`navigateTo()` removes `.page-enter` class, forces a reflow (`void main.offsetWidth`), then re-adds it. The `@keyframes pageEnter` animation runs on every navigation.

**Why:** This pattern reliably retriggers the animation without cloning the element.

## Hero card (home screen)
`.hero-card.gradient-primary` — flex row with `.hero-left` (text) and `.hero-right` (SVG XP ring). The SVG ring uses `stroke-dasharray` to show XP progress; animates via `.xp-ring-fill` keyframe on load.

## Stat strip
`.stat-strip` — 4-column grid of `.stat-chip` cards below the hero. Contains icon + value + label.

## Quick actions grid
`.quick-grid` — 3-column grid of `.quick-card` buttons. Each has a colored `.quick-icon` box and `.quick-label`.

## Achievement cards
`.achievement-card` — shows progress bar toward locked badges. `.achievement-card.earned` has colored border and hover lift.

## Leaderboard
`.leaderboard-row` inside a `.card` with `padding:0;overflow:hidden`. Top 3 rows get podium background tints. `.leaderboard-me` highlights the current user's row.

## Design tokens
All values use CSS custom properties from `:root`. Never hardcode colors — use `var(--primary)`, `var(--success)`, etc. Dark/AMOLED modes inherit automatically via the override blocks.
