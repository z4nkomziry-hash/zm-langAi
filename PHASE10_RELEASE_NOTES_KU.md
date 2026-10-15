# Ziman AI — Phase 10 Release Notes

## گۆڕانکارییە سەرەکییەکان
- **AI Tutor Proxy:** چاتی AI لە ڕێگەی `POST /api/ai/chat` و بە sessionی هەژماری بەکارهێنەر کار دەکات. کلیل لە bodyی کلایەنت وەردەناگیرێت؛ کلیل لە `OPENAI_API_KEY`ی سێرڤەرەوە دەخوێندرێتەوە.
- **پاراستنی AI:** پشکنینی شێوەزار و جوتە زمانی، ڕۆڵی نامەکان، ژمارەی نامەکان، قەبارەی ناوەڕۆک و rate limitی ١٢ داواکاری لە خولەکێکدا.
- **Learning Analytics:** `GET /api/learning/analytics` ئاماری ٧ ڕۆژ، XP، ڕۆژە چالاکەکان، پێداچوونەوە کراوەکان و وشەی چاوەڕێ پیشان دەدات.
- **Progress UI:** کارتی شیکردنەوەی ٧ ڕۆژی ڕابردوو بە شێوەی RTL و responsive زیادکرا.
- **Static file hardening:** فایلە یارمەتیدەرەکانی سێرڤەر لە ڕێگەی static hosting وەک فایلێ گشتی ناگەیەنرێن.
- **Cache version:** Service Worker بۆ `ziman-v11-20261015` نوێکرایەوە.

## چۆن AI چالاک بکەین
لە ژینگەی سێرڤەرێ production دانە:
- `OPENAI_API_KEY` — کلیلێ API (تەنێ ل سێرڤەرێ؛ مەیخە ناو frontend، ZIP یان Git)
- `OPENAI_MODEL` — ئارەزوومەندانە؛ default: `gpt-4o-mini`

AI proxy پێویستی بە هەژماری چوونەژوورەوە و sessionی دروست هەیە. ئەگەر `OPENAI_API_KEY` نەبێت، endpoint بە 503 وەڵام دەدات.

## پشکنین
- `node --check server.js`
- `node --check app.js`
- `node --check ai-utils.js`
- `node --check sw.js`
- `npm test` — ٢٢/٢٢ تاقیکردنەوە سەرکەوتوو بوون.
- `unzip -t` بۆ پشکنینی ZIP.

## پێش Production
تاقیکردنەوەی PostgreSQL، streaming و AI provider لە staging/production هێشتا پێویستە؛ ئەم قۆناغە بە تەنها پشتڕاستی deploymentی ڕاستەقینە نادات.
