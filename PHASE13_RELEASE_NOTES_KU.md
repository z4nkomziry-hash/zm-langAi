# Ziman AI — Phase 13 Release Notes

## Added
- Six server-directed AI learning modes: Tutor, Conversation, Speaking Practice, Grammar, Vocabulary, and Writing Coach.
- Server-side mode allowlist and dedicated instructions for each learning mode.
- UI mode selector in the AI Teacher page; the selected mode is included in the authenticated server request.
- Removed browser-direct OpenAI API fallback and localStorage API-key entry flow, so provider keys are not sent from the browser.
- Updated service-worker cache version to v12.

## Security notes
- Configure `GEMINI_API_KEY` or `OPENAI_API_KEY` only in server environment secrets. Do not put the key in `app.js`, HTML, ZIP release files, or browser storage.
- Speaking Practice provides text-based coaching only; it does not claim to analyze audio unless a future audio-processing feature is explicitly integrated.
- Daily usage quota and authentication remain enforced by the server.

## Verification
- `node --check app.js`, `node --check server.js`, and `node --check ai-utils.js` pass.
- Unit tests cover the allowed AI modes and invalid mode rejection.
- Live provider and PostgreSQL integration testing still needs to be performed in the deployment environment.
