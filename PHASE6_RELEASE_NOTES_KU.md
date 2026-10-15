# Ziman AI — Phase 6 Release Notes

### پێشکەوتنە سەرەکییەکان
1. چاککردنی Register بۆ فۆڕمی کلاود کە تەنها ناو، ئیمەیڵ و پاسوۆردی تێدایە.
2. validation ـی هاوبەش و تاقیکراو بۆ زانیارییەکانی تۆماربوون.
3. زیادکردنی ڕیزبەندی ڕاستەقینەی فێرخوازان بە داتای PostgreSQL و پاراستنی زانیاریی تایبەتی.
4. لابردنی ناوی فێرخوازانی ساختە لە ڕیزبەندی و زیادکردنی دۆخی بارکردن/هەڵە/دووبارە هەوڵدان.
5. نوێکردنەوەی پەیامی پاسوۆرد بۆ کەمترین ٨ پیت.

### پشکنین
- JavaScript syntax checks: سەرکەوتوو.
- Unit tests: 6/6 سەرکەوتوو.
- پێویستی بە تاقیکردنەوەی integration لەگەڵ PostgreSQL و session ـی ڕاستەقینە هەیە.

### پێش Production
- `SESSION_SECRET` ـی بەهێز و `DATABASE_URL` دابین بکە.
- Register، Login، logout، leaderboard و progress sync لە staging تاقی بکەرەوە.
- پێش زیادکردنی بەکارهێنەری گشتی، XP و پاداشتەکان بکە بە server-authoritative events و flow ـە کۆنەکانی `localStorage` لاببە.
