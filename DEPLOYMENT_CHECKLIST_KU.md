# Ziman AI — پشکنینا پێش بڵاوکرنەوە

## پێش بڵاوکرنەوە
- [ ] کلیلی APIی ئاشکرا بووی ل Google AI Studio باطل بکە و کلیلی نوو دروست بکە.
- [ ] `SESSION_SECRET` وەک secretێ درێژ و تایبەت دابنێ.
- [ ] `DATABASE_URL` ب داتابەیسی PostgreSQLی دروست پەیوەست بکە.
- [ ] `GEMINI_API_KEY` تەنێ ل ژینگەی سێرڤەر دابنێ؛ نە ل `app.js` یان `index.html`.
- [ ] migration/schemaی پێویست ل داتابەیسی ژینگەی deployment جێبەجێ بکە. ل Replit deployment، دڵنیابە schemaی production هەمان گۆڕانکارییێن development وەردەگرێت.
- [ ] `npm ci` جێبەجێ بکە.
- [ ] `npm run verify` جێبەجێ بکە.
- [ ] سێرڤەر هەڵبکە و `GET /api/health` تاقی بکەرەوە؛ دێ `200` و `database: connected` بدەت کاتێک داتابەیس بەردەستە.
- [ ] تۆماربوون، چوونەژوورەوە، چوونەدەرەوە، Cloud Progress، XP، پێداچوونەوەی وشە و AI Tutor ل ژینگەی staging تاقی بکەرەوە.
- [ ] هەژماری Limited و Premium جیاواز تاقی بکەرەوە و دڵنیابە مافەکان ل سێرڤەر دەچێنە کار.
- [ ] پەیوەندی Gemini، quota، و هەڵەی API بە کلیلی نوو تاقی بکەرەوە.
- [ ] backupی داتابەیس و ڕێگای rollback ئامادە بکە پێش production.

## تێبینی
`npm run verify` تەنێ پشکنینی syntax، فایلە پێویستەکان و unit testەکانە. ئەمە جێگرەوەی تاقیکردنەوەی live بۆ PostgreSQL، Gemini، پارەدان یان هەموو وەشان و ئامێرەکان نییە.
