---
name: AI Teacher architecture
description: How the AI Teacher works in the static site — no backend, key in localStorage, OpenAI fetch from browser.
---

# AI Teacher — Static Site Pattern

## The rule
The AI Teacher calls `https://api.openai.com/v1/chat/completions` directly from the browser using `fetch()`. The user enters their own OpenAI API key, which is stored under `zm_ai_key` in `localStorage`. No backend, no proxy.

**Why:** Ziman is a purely static HTML/CSS/JS site served by `python3 -m http.server`. There is no server-side code to proxy API calls. Storing the key client-side is the same trade-off already accepted for the admin password in `config.js`.

## How to apply
- The `renderAITeacher()` function checks `lsGet('zm_ai_key')` on every render.
- If a key exists → real API call with `AI_SYSTEM_PROMPT` (Kurdish tutor system prompt in `app.js`).
- If no key → simulated response that prompts the user to add their key.
- `saveAIKey()` validates that the key starts with `sk-` before saving.
- `removeAIKey()` clears `zm_ai_key` from localStorage.
- Model: `gpt-4o-mini`, max_tokens: 400. Adjust in `askAI()`.
- +10 XP for real AI response, +2 XP for simulated.
