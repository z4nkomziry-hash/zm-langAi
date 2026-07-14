// ============================================================
// ZIMAN — One-time (idempotent) vocabulary migration
// ------------------------------------------------------------
// Loads the legacy static vocabulary bank (data/vocabulary.js),
// converts the Badini field from Latin-script Kurmanji to
// Perso-Arabic script (per project requirement: Badini must
// never be shown in Latin script), and upserts everything into
// the `vocabulary` Postgres table so it becomes editable from
// the /admin panel.
//
// Safe to re-run: uses ON CONFLICT (word_source, category) so
// re-running just refreshes existing rows instead of duplicating.
//
// Usage:  node scripts/migrate-vocabulary.js
// ============================================================
'use strict';

const path = require('path');
const vm = require('vm');
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---------- Latin (Hawar) -> Perso-Arabic script transliteration ----------
const LETTER_MAP = {
    'a': 'ا', 'e': 'ە', 'ê': 'ێ', 'i': '', 'î': 'ی', 'o': 'ۆ', 'u': 'و', 'û': 'وو',
    'b': 'ب', 'c': 'ج', 'ç': 'چ', 'd': 'د', 'f': 'ف', 'g': 'گ', 'h': 'ه', 'j': 'ژ',
    'k': 'ک', 'l': 'ل', 'm': 'م', 'n': 'ن', 'p': 'پ', 'q': 'ق', 'r': 'ر', 's': 'س',
    'ş': 'ش', 't': 'ت', 'v': 'ڤ', 'w': 'و', 'x': 'خ', 'y': 'ی', 'z': 'ز', "'": 'ع',
};
const ARABIC_VOWELS = new Set(['ا', 'ە', 'ی', 'ۆ', 'و', 'ێ']);

function transliterateWord(word) {
    let out = '';
    let i = 0;
    const lower = word.toLowerCase();
    while (i < lower.length) {
        if (lower.slice(i, i + 2) === 'xw') { out += 'خو'; i += 2; continue; }
        const ch = lower[i];
        if (i === 0 && ch === 'r') { out += 'ڕ'; i++; continue; }
        if (ch === '?') { out += '؟'; i++; continue; }
        if (LETTER_MAP[ch] !== undefined) out += LETTER_MAP[ch];
        else out += ch; // spaces, digits, punctuation, or already-Arabic text pass through
        i++;
    }
    if (out.length && ARABIC_VOWELS.has(out[0])) out = 'ئ' + out; // word-initial vowel needs a hamza carrier
    return out;
}

function transliteratePhrase(phrase) {
    return phrase.split(' ').map((w) => (w ? transliterateWord(w) : w)).join(' ');
}

// ---------- load the legacy static vocabulary bank ----------
function loadLegacyVocab() {
    const filePath = path.join(__dirname, '..', 'data', 'vocabulary.js');
    const code = fs.readFileSync(filePath, 'utf8');
    const sandbox = {};
    vm.createContext(sandbox);
    // The file is written for the browser (`if (typeof window !== 'undefined')`),
    // so it runs safely here too; we just grab the array by name afterwards.
    vm.runInContext(code + '\n;this.__ZIMAN_VOCAB_EN__ = ZIMAN_VOCAB_EN;', sandbox);
    return sandbox.__ZIMAN_VOCAB_EN__ || [];
}

// A few high-confidence additions authored directly in Arabic script
// (not transliterated — these are new entries, not conversions).
const EXTRA_ENTRIES = [
    ['Twenty', 'بیست', 'بیست', 'A1'], ['Thirty', 'سی', 'سی', 'A1'], ['Forty', 'چل', 'چل', 'A1'],
    ['Fifty', 'پەنجا', 'پەنجی', 'A1'], ['Sixty', 'شەست', 'شەست', 'A1'], ['Seventy', 'حەفتا', 'حەفتێ', 'A1'],
    ['Eighty', 'هەشتا', 'هەشتێ', 'A1'], ['Ninety', 'نەوەد', 'نەوەد', 'A1'], ['One hundred', 'سەد', 'سەد', 'A1'],
    ['Two hundred', 'دووسەد', 'دووسەد', 'A2'], ['Five hundred', 'پێنسەد', 'پێنسەد', 'A2'],
    ['One thousand', 'هەزار', 'هەزار', 'A1'], ['Million', 'ملیۆن', 'ملیۆن', 'B1'],
].map(([w, t, b, lv]) => ({ w, t, b, lv, cat: 'numbers', pos: 'n', ex: null }));

async function upsertEntry(client, e) {
    const badini = e.b ? transliteratePhrase(e.b) : (e.b === '' ? '' : e.b);
    await client.query(
        `INSERT INTO vocabulary (word_source, word_target, badini, level, category, pos, example_source, example_target, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (word_source, category) DO UPDATE SET
            word_target = EXCLUDED.word_target,
            badini = EXCLUDED.badini,
            level = EXCLUDED.level,
            pos = EXCLUDED.pos,
            example_source = EXCLUDED.example_source,
            example_target = EXCLUDED.example_target,
            updated_at = NOW()`,
        [
            e.w, e.t, badini, e.lv || 'A1', e.cat, e.pos || '',
            (e.ex && e.ex[0]) || '', (e.ex && e.ex[1]) || '', JSON.stringify(e.tags || []),
        ]
    );
}

async function main() {
    const legacy = loadLegacyVocab();
    console.log(`[migrate-vocabulary] loaded ${legacy.length} legacy entries`);

    const client = await pool.connect();
    try {
        for (const e of legacy) await upsertEntry(client, e);
        for (const e of EXTRA_ENTRIES) await upsertEntry(client, e);
        const { rows } = await client.query('SELECT COUNT(*)::int AS c FROM vocabulary');
        console.log(`[migrate-vocabulary] done — vocabulary table now has ${rows[0].c} rows`);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((e) => {
    console.error('[migrate-vocabulary] failed', e);
    process.exit(1);
});
