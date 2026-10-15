'use strict';

/** Validate the client-synced progress shape before it reaches PostgreSQL. */
function validateProgressPayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return 'داتای پێشکەوتن نادروستە';
    const integerFields = {
        xp: [0, 100000000], level: [1, 10000], coins: [0, 100000000],
        gems: [0, 100000000], hearts: [0, 1000], streak: [0, 1000000],
        total_words: [0, 100000000]
    };
    for (const [key, [min, max]] of Object.entries(integerFields)) {
        if (body[key] === undefined) continue;
        if (!Number.isSafeInteger(body[key]) || body[key] < min || body[key] > max) {
            return `نرخی ${key} نادروستە`;
        }
    }
    if (body.last_login !== undefined && body.last_login !== null &&
        (typeof body.last_login !== 'string' || body.last_login.length > 32)) {
        return 'زانیاری کاتی چوونەژوورەوە نادروستە';
    }
    if (body.history !== undefined && (!Array.isArray(body.history) || body.history.length > 5000)) return 'مێژووی پێشکەوتن نادروستە';
    if (body.bookmarks !== undefined && (!Array.isArray(body.bookmarks) || body.bookmarks.length > 10000)) return 'نیشانکراوەکان نادروستن';
    if (body.notes !== undefined && (!body.notes || typeof body.notes !== 'object' || Array.isArray(body.notes))) return 'تێبینییەکان نادروستن';
    for (const key of ['history', 'bookmarks', 'notes']) {
        if (body[key] !== undefined && Buffer.byteLength(JSON.stringify(body[key]), 'utf8') > 512 * 1024) return `قەبارەی ${key} زۆرە`;
    }
    return null;
}


/** Validate registration input shared by the HTTP handler and unit tests. */
function validateRegistrationPayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return 'داتای تۆماربوون نادروستە';
    const name = String(body.fullName || body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fatherName = String(body.fatherName || '').trim();
    const grandfatherName = String(body.grandfatherName || '').trim();
    const mobile = String(body.mobile || '').replace(/[\s-]/g, '');
    if (name.length < 2 || name.length > 100 || !email || !password) return 'ناو، ئیمەیڵ و پاسوۆرد پێویستن';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return 'فۆرماتی ئیمەیڵ نادروستە';
    if (password.length < 8 || password.length > 128) return 'پاسوۆرد دەبێت لە ٨ تا ١٢٨ پیت بێت';
    if (fatherName.length > 100 || grandfatherName.length > 100 || mobile.length > 32) return 'قەبارەی زانیارییەکان زۆرە';
    if (mobile && !/^(\+964|00964|0)(7[3-9]\d{8}|\d{9,10})$/.test(mobile)) return 'ژمارەی مۆبایل نادروستە';
    return null;
}

/** Lightweight per-process limiter; use a shared store for multi-instance production. */
function createRateLimiter({ windowMs, max, message = 'زۆر هەوڵ دراوە؛ تکایە دواتر هەوڵ بدە' }) {
    const buckets = new Map();
    let lastSweep = Date.now();
    return function rateLimit(req, res, next) {
        const now = Date.now();
        if (now - lastSweep > windowMs) {
            for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
            lastSweep = now;
        }
        const key = `${req.ip || req.socket?.remoteAddress || 'unknown'}:${req.baseUrl || ''}${req.path || ''}`;
        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + windowMs };
        bucket.count++;
        buckets.set(key, bucket);
        res.setHeader('RateLimit-Limit', String(max));
        res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
        if (bucket.count > max) {
            res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
            return res.status(429).json({ error: message });
        }
        next();
    };
}

module.exports = { validateProgressPayload, validateRegistrationPayload, createRateLimiter };
