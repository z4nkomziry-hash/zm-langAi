// ============================================================
// ZIMAN — Secure backend (Express + PostgreSQL)
// Serves the existing static frontend and exposes:
//   - Super Admin auth (email + password, bcrypt, server-side session)
//   - Admin CRUD API for vocabulary / lessons / users / teacher applications
//   - Real user accounts (register/login) with cloud-synced progress
//   - Public read API for vocabulary/lessons consumed by app.js
// ============================================================
'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

const PgStore = new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
});

if (!process.env.SESSION_SECRET) {
    // Fail closed: a predictable/shared session secret would let an attacker
    // forge admin/user session cookies. Never fall back to a hardcoded value.
    console.error('[fatal] SESSION_SECRET is not set. Refusing to start with an insecure session secret.');
    process.exit(1);
}

app.use(session({
    store: PgStore,
    name: 'ziman.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
}));

// ---------- bootstrap: idempotent schema so a fresh environment self-heals ----------
async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_progress (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          xp INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          coins INTEGER DEFAULT 100,
          gems INTEGER DEFAULT 50,
          hearts INTEGER DEFAULT 5,
          streak INTEGER DEFAULT 0,
          total_words INTEGER DEFAULT 0,
          last_login VARCHAR(32),
          history JSONB DEFAULT '[]',
          bookmarks JSONB DEFAULT '[]',
          notes JSONB DEFAULT '{}',
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS vocabulary (
          id SERIAL PRIMARY KEY,
          word_source TEXT NOT NULL,
          word_target TEXT NOT NULL,
          badini TEXT DEFAULT '',
          level VARCHAR(8) DEFAULT 'A1',
          category VARCHAR(64) NOT NULL,
          pos VARCHAR(16) DEFAULT '',
          example_source TEXT DEFAULT '',
          example_target TEXT DEFAULT '',
          tags JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_vocab_source_category ON vocabulary(word_source, category);
        CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary(category);

        CREATE TABLE IF NOT EXISTS lessons (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          category VARCHAR(64) NOT NULL,
          level VARCHAR(8) DEFAULT 'A1',
          description TEXT DEFAULT '',
          word_ids JSONB DEFAULT '[]',
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS teacher_applications (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(64) DEFAULT '',
          message TEXT DEFAULT '',
          status VARCHAR(16) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log('[db] schema ready');
}

// ---------- bootstrap: ensure the super admin account exists ----------
async function ensureAdminSeed() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        console.warn('[admin] ADMIN_EMAIL / ADMIN_PASSWORD not set — admin login disabled until configured.');
        return;
    }
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
        `INSERT INTO admins (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [email.toLowerCase().trim(), hash]
    );
    console.log(`[admin] super admin ready: ${email}`);
}

// ---------- helpers ----------
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    return res.status(401).json({ error: 'ناچالاک — پێویستە بچیتە ژوورەوە وەک بەڕێوەبەر' });
}

function requireUser(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ error: 'پێویستە بچیتە ژوورەوە' });
}

const ALLOWED_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

// ============================================================
// ADMIN AUTH
// ============================================================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'ئیمەیل و پاسورد داواکراوە' });

        const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [String(email).toLowerCase().trim()]);
        const admin = rows[0];
        if (!admin) return res.status(401).json({ error: 'زانیاری چوونەژوورەوە هەڵەیە' });

        const ok = await bcrypt.compare(password, admin.password_hash);
        if (!ok) return res.status(401).json({ error: 'زانیاری چوونەژوورەوە هەڵەیە' });

        req.session.isAdmin = true;
        req.session.adminEmail = admin.email;
        res.json({ ok: true, email: admin.email });
    } catch (e) {
        console.error('[admin/login]', e);
        res.status(500).json({ error: 'هەڵەیەکی سێرڤەر ڕوویدا' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.isAdmin = false;
    req.session.adminEmail = null;
    res.json({ ok: true });
});

app.get('/api/admin/session', (req, res) => {
    res.json({ isAdmin: !!(req.session && req.session.isAdmin), email: req.session?.adminEmail || null });
});

// ============================================================
// ADMIN — VOCABULARY CRUD
// ============================================================
app.get('/api/admin/vocabulary', requireAdmin, async (req, res) => {
    const { category, search, page = '1', pageSize = '50' } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const ps = Math.min(200, Math.max(1, parseInt(pageSize) || 50));
    const offset = (p - 1) * ps;

    const clauses = [];
    const params = [];
    if (category) { params.push(category); clauses.push(`category = $${params.length}`); }
    if (search) { params.push(`%${search}%`); clauses.push(`(word_source ILIKE $${params.length} OR word_target ILIKE $${params.length} OR badini ILIKE $${params.length})`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM vocabulary ${where}`, params);
    params.push(ps, offset);
    const dataRes = await pool.query(
        `SELECT * FROM vocabulary ${where} ORDER BY id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
    );
    res.json({ total: countRes.rows[0].c, page: p, pageSize: ps, items: dataRes.rows });
});

app.post('/api/admin/vocabulary', requireAdmin, async (req, res) => {
    const { word_source, word_target, badini = '', level = 'A1', category, pos = '', example_source = '', example_target = '', tags = [] } = req.body || {};
    if (!word_source || !word_target || !category) return res.status(400).json({ error: 'وشەی سەرچاوە، وەرگێڕان و پۆل پێویستن' });
    if (!ALLOWED_LEVELS.has(level)) return res.status(400).json({ error: 'ئاستی نادروست' });
    const { rows } = await pool.query(
        `INSERT INTO vocabulary (word_source, word_target, badini, level, category, pos, example_source, example_target, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [word_source, word_target, badini, level, category, pos, example_source, example_target, JSON.stringify(tags)]
    );
    res.status(201).json(rows[0]);
});

app.put('/api/admin/vocabulary/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id نادروست' });
    const { word_source, word_target, badini = '', level = 'A1', category, pos = '', example_source = '', example_target = '', tags = [] } = req.body || {};
    if (!word_source || !word_target || !category) return res.status(400).json({ error: 'وشەی سەرچاوە، وەرگێڕان و پۆل پێویستن' });
    if (!ALLOWED_LEVELS.has(level)) return res.status(400).json({ error: 'ئاستی نادروست' });
    const { rows } = await pool.query(
        `UPDATE vocabulary SET word_source=$1, word_target=$2, badini=$3, level=$4, category=$5, pos=$6,
         example_source=$7, example_target=$8, tags=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
        [word_source, word_target, badini, level, category, pos, example_source, example_target, JSON.stringify(tags), id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'نەدۆزرایەوە' });
    res.json(rows[0]);
});

app.delete('/api/admin/vocabulary/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id نادروست' });
    await pool.query('DELETE FROM vocabulary WHERE id=$1', [id]);
    res.json({ ok: true });
});

// ============================================================
// ADMIN — LESSONS CRUD
// ============================================================
app.get('/api/admin/lessons', requireAdmin, async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM lessons ORDER BY order_index ASC, id ASC');
    res.json(rows);
});

app.post('/api/admin/lessons', requireAdmin, async (req, res) => {
    const { title, category, level = 'A1', description = '', word_ids = [], order_index = 0 } = req.body || {};
    if (!title || !category) return res.status(400).json({ error: 'ناونیشان و پۆل پێویستن' });
    const { rows } = await pool.query(
        `INSERT INTO lessons (title, category, level, description, word_ids, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [title, category, level, description, JSON.stringify(word_ids), order_index]
    );
    res.status(201).json(rows[0]);
});

app.put('/api/admin/lessons/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id نادروست' });
    const { title, category, level = 'A1', description = '', word_ids = [], order_index = 0 } = req.body || {};
    const { rows } = await pool.query(
        `UPDATE lessons SET title=$1, category=$2, level=$3, description=$4, word_ids=$5, order_index=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
        [title, category, level, description, JSON.stringify(word_ids), order_index, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'نەدۆزرایەوە' });
    res.json(rows[0]);
});

app.delete('/api/admin/lessons/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id نادروست' });
    await pool.query('DELETE FROM lessons WHERE id=$1', [id]);
    res.json({ ok: true });
});

// ============================================================
// ADMIN — USERS
// ============================================================
app.get('/api/admin/users', requireAdmin, async (req, res) => {
    const { rows } = await pool.query(
        `SELECT u.id, u.name, u.email, u.created_at,
                p.xp, p.level, p.coins, p.gems, p.streak, p.total_words, p.updated_at AS progress_updated_at
         FROM users u LEFT JOIN user_progress p ON p.user_id = u.id
         ORDER BY u.id DESC`
    );
    res.json(rows);
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id نادروست' });
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ ok: true });
});

// ============================================================
// ADMIN — TEACHER APPLICATIONS
// ============================================================
app.get('/api/admin/teacher-applications', requireAdmin, async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM teacher_applications ORDER BY id DESC');
    res.json(rows);
});

app.put('/api/admin/teacher-applications/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body || {};
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'دۆخی نادروست' });
    const { rows } = await pool.query('UPDATE teacher_applications SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
    if (!rows[0]) return res.status(404).json({ error: 'نەدۆزرایەوە' });
    res.json(rows[0]);
});

app.delete('/api/admin/teacher-applications/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await pool.query('DELETE FROM teacher_applications WHERE id=$1', [id]);
    res.json({ ok: true });
});

// ============================================================
// PUBLIC — TEACHER APPLICATION SUBMISSION
// ============================================================
app.post('/api/teacher-applications', async (req, res) => {
    const { name, email, phone = '', message = '' } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'ناو و ئیمەیل پێویستن' });
    const { rows } = await pool.query(
        `INSERT INTO teacher_applications (name, email, phone, message) VALUES ($1,$2,$3,$4) RETURNING *`,
        [name, email, phone, message]
    );
    res.status(201).json(rows[0]);
});

// ============================================================
// PUBLIC — READ-ONLY VOCAB / LESSONS (consumed by app.js)
// ============================================================
app.get('/api/vocabulary', async (req, res) => {
    const { category } = req.query;
    const params = [];
    let where = '';
    if (category) { params.push(category); where = 'WHERE category = $1'; }
    const { rows } = await pool.query(`SELECT * FROM vocabulary ${where} ORDER BY id ASC`, params);
    res.json(rows);
});

app.get('/api/lessons', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM lessons ORDER BY order_index ASC, id ASC');
    res.json(rows);
});

// ============================================================
// USER ACCOUNTS — register / login / session / progress sync
// ============================================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) return res.status(400).json({ error: 'ناو، ئیمەیل و پاسورد پێویستن' });
        if (String(password).length < 6) return res.status(400).json({ error: 'پاسورد پێویستە لانیکەم ٦ پیت بێت' });

        const existing = await pool.query('SELECT id FROM users WHERE email=$1', [String(email).toLowerCase().trim()]);
        if (existing.rows[0]) return res.status(409).json({ error: 'ئەم ئیمەیلە پێشتر تۆمارکراوە' });

        const hash = await bcrypt.hash(password, 12);
        const { rows } = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email',
            [name, String(email).toLowerCase().trim(), hash]
        );
        const user = rows[0];
        await pool.query('INSERT INTO user_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

        req.session.userId = user.id;
        res.status(201).json({ ok: true, user });
    } catch (e) {
        console.error('[auth/register]', e);
        res.status(500).json({ error: 'هەڵەیەکی سێرڤەر ڕوویدا' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ error: 'ئیمەیل و پاسورد پێویستن' });
        const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase().trim()]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'زانیاری چوونەژوورەوە هەڵەیە' });
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: 'زانیاری چوونەژوورەوە هەڵەیە' });
        req.session.userId = user.id;
        res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (e) {
        console.error('[auth/login]', e);
        res.status(500).json({ error: 'هەڵەیەکی سێرڤەر ڕوویدا' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.userId = null;
    res.json({ ok: true });
});

app.get('/api/auth/session', async (req, res) => {
    if (!req.session || !req.session.userId) return res.json({ user: null });
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id=$1', [req.session.userId]);
    res.json({ user: rows[0] || null });
});

app.get('/api/progress', requireUser, async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM user_progress WHERE user_id=$1', [req.session.userId]);
    res.json(rows[0] || null);
});

app.put('/api/progress', requireUser, async (req, res) => {
    const { xp = 0, level = 1, coins = 0, gems = 0, hearts = 5, streak = 0, total_words = 0, last_login = null, history = [], bookmarks = [], notes = {} } = req.body || {};
    const { rows } = await pool.query(
        `INSERT INTO user_progress (user_id, xp, level, coins, gems, hearts, streak, total_words, last_login, history, bookmarks, notes, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
            xp = GREATEST(user_progress.xp, EXCLUDED.xp),
            level = GREATEST(user_progress.level, EXCLUDED.level),
            coins = EXCLUDED.coins,
            gems = EXCLUDED.gems,
            hearts = EXCLUDED.hearts,
            streak = GREATEST(user_progress.streak, EXCLUDED.streak),
            total_words = GREATEST(user_progress.total_words, EXCLUDED.total_words),
            last_login = EXCLUDED.last_login,
            history = EXCLUDED.history,
            bookmarks = EXCLUDED.bookmarks,
            notes = EXCLUDED.notes,
            updated_at = NOW()
         RETURNING *`,
        [req.session.userId, xp, level, coins, gems, hearts, streak, total_words, last_login, JSON.stringify(history), JSON.stringify(bookmarks), JSON.stringify(notes)]
    );
    res.json(rows[0]);
});

// ============================================================
// STATIC FRONTEND
// ============================================================
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ============================================================
// BOOT
// ============================================================
const PORT = process.env.PORT || 5000;

ensureSchema()
    .then(() => ensureAdminSeed())
    .catch((e) => console.error('[boot] schema/admin bootstrap failed', e))
    .finally(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[ziman] server listening on port ${PORT}`);
        });
    });
