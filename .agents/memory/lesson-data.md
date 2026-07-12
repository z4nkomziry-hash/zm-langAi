---
name: Lesson data format
description: Structure and coverage of the lessons object in app.js; word encoding and all 11 language pairs.
---

# Lesson Data Format

## Word encoding
Each word in a topic is a string: `"sourceWord=کوردیTranslation"`. Split on `=` to get `[source, target]`. Always call `escHtml()` before inserting into `innerHTML`.

## Coverage (as of Phase 1–3)
All 11 language pairs each have **7 topics**: greetings, numbers, colors, family, food, travel, daily phrases. Each topic has 8–10 words.

Language pairs: `en-ku`, `ar-ku`, `tr-ku`, `fa-ku`, `de-ku`, `fr-ku`, `es-ku`, `ru-ku`, `zh-ku`, `ja-ku`, `ko-ku`.

**Why:** Only `en-ku` had full content at launch; the other 10 had 1 stub topic each. Expanded in Phase 3 with real vocabulary.

## How to apply
- When adding a new language pair, add it to the `lessons` object with at least 5 topics.
- `getAllWords()` flattens all topics for the current language — used by quiz, flashcards, speed-quiz.
- The `langSelect` dropdown auto-populates from `Object.keys(lessons)`.
