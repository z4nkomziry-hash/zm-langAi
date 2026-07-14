// ============================================================
// ZIMAN — Massive vocabulary seeder (per-language, tiered, scalable)
// ------------------------------------------------------------
// 1. Imports every word already curated in app.js's `lessons` object
//    (all 11 language pairs) into the `vocabulary` table, tagged with
//    lang_pair + a category bucket + a CEFR-derived tier.
// 2. Adds fresh "Work & Business" and "Emergency" vocabulary for all
//    11 pairs — the two categories explicitly requested that the
//    legacy hardcoded lessons did not cover for most language pairs.
// 3. Every Kurdish value (both `word_target` = Sorani and `badini`)
//    is written directly in Perso-Arabic script. Badini is left
//    blank when we are not confident of a distinct Kurmanji form —
//    the app already falls back to Sorani display in that case
//    (see getDialectWord() in app.js), so this never breaks display.
//
// Safe to re-run: upserts on (lang_pair, word_source, category).
//
// Usage:  node scripts/seed-vocabulary-massive.js
// ============================================================
'use strict';

const path = require('path');
const vm = require('vm');
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const LEVEL_TO_TIER = { A1: 'beginner', A2: 'beginner', B1: 'intermediate', B2: 'intermediate', C1: 'advanced', C2: 'master', undefined: 'beginner' };

// Kurdish keyword -> category bucket. Every topic title across every
// language pair embeds the same Kurdish name for the topic (that part
// never changes between languages), so we can categorize consistently
// by matching on it regardless of the source language.
const CATEGORY_KEYWORDS = [
    ['greetings', ['سڵاوکردن']],
    ['numbers_time', ['ژمارە', 'کات و ڕۆژ', 'ڕۆژەکانی هەفتە', 'مانگەکان']],
    ['family_relationships', ['خێزان']],
    ['shopping_food', ['خواردن', 'بازاڕکردن', 'چێشتخانە']],
    ['travel_directions', ['گەشت', 'ئاراستە', 'گواستنەوە']],
    ['daily_life', ['ڕۆژانە', 'ماڵ و ژوور', 'جل و بەرگ', 'ئامێرەکان']],
    ['work_business', ['پیشە', 'بازاڕکردن و پارە']],
    ['emergency', ['تەندروستی']],
];

function categorize(title) {
    for (const [slug, keywords] of CATEGORY_KEYWORDS) {
        if (keywords.some((k) => title.includes(k))) return slug;
    }
    return 'general';
}

// ---------- load the `lessons` object straight out of app.js ----------
function loadLegacyLessons() {
    const filePath = path.join(__dirname, '..', 'app.js');
    const src = fs.readFileSync(filePath, 'utf8');
    const startMarker = 'const lessons = {';
    const start = src.indexOf(startMarker);
    if (start === -1) throw new Error('Could not find `const lessons = {` in app.js');
    // The object literal ends at the first top-level "};" after start
    // (checked against the current file: it is immediately followed by
    // `// ===== PACKAGES =====` / `const packages = {`).
    const endMarker = '\n};\n\n// ===== PACKAGES =====';
    const end = src.indexOf(endMarker, start);
    if (end === -1) throw new Error('Could not find the end of the `lessons` object in app.js — file structure changed, update this script.');
    const objText = src.slice(start + 'const lessons = '.length, end + 3); // include trailing `};`

    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(`this.__ZIMAN_LESSONS__ = ${objText}`, sandbox);
    return sandbox.__ZIMAN_LESSONS__;
}

function parseWordEntry(raw) {
    // Legacy format: "source=target" (occasionally with a bare "A / B" pair like
    // opposites topics — those still split cleanly on the first "=").
    const idx = raw.indexOf('=');
    if (idx === -1) return null;
    return { source: raw.slice(0, idx).trim(), target: raw.slice(idx + 1).trim() };
}

async function upsert(client, entry) {
    const { langPair, source, target, badini = '', level = 'A1', category, pos = '', exampleSource = '', exampleTarget = '' } = entry;
    const tier = LEVEL_TO_TIER[level] || 'beginner';
    await client.query(
        `INSERT INTO vocabulary (lang_pair, word_source, word_target, badini, level, tier, category, pos, example_source, example_target, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'[]')
         ON CONFLICT (lang_pair, word_source, category) DO UPDATE SET
            word_target = EXCLUDED.word_target,
            badini = EXCLUDED.badini,
            level = EXCLUDED.level,
            tier = EXCLUDED.tier,
            pos = EXCLUDED.pos,
            example_source = EXCLUDED.example_source,
            example_target = EXCLUDED.example_target,
            updated_at = NOW()`,
        [langPair, source, target, badini, level, tier, category, pos, exampleSource, exampleTarget]
    );
}

// ---------- NEW: Work & Business + Emergency, authored fresh for all 11 pairs ----------
// Kurdish (Sorani) target and Badini are both Perso-Arabic script per project requirement.
// Badini left '' where a distinct Kurmanji form isn't established in this app yet —
// getDialectWord() already falls back to Sorani display for those, matching existing behaviour.
const NEW_CATEGORY_WORDS = {
    work_business: {
        ku: ['کار', 'ئۆفیس', 'کۆمپانیا', 'کۆبوونەوە', 'بەڕێوەبەر', 'کارمەند', 'مووچە', 'گرێبەست', 'کڕیار', 'پرۆژە', 'ئیمەیل', 'کاتی کار'],
        badini: ['کار', '', 'کۆمپانی', 'کۆبون', 'بەرپرس', 'کارمەند', 'مووچە', 'پەیمان', 'کڕیار', 'پرۆژە', 'ئیمەیل', 'دەمێ کار'],
        pairs: {
            'en-ku': ['Job', 'Office', 'Company', 'Meeting', 'Manager', 'Employee', 'Salary', 'Contract', 'Customer', 'Project', 'Email', 'Work hours'],
            'ar-ku': ['وظيفة', 'مكتب', 'شركة', 'اجتماع', 'مدير', 'موظف', 'راتب', 'عقد', 'زبون', 'مشروع', 'بريد إلكتروني', 'ساعات العمل'],
            'tr-ku': ['İş', 'Ofis', 'Şirket', 'Toplantı', 'Müdür', 'Çalışan', 'Maaş', 'Sözleşme', 'Müşteri', 'Proje', 'E-posta', 'Çalışma saatleri'],
            'fr-ku': ['Travail', 'Bureau', 'Entreprise', 'Réunion', 'Directeur', 'Employé', 'Salaire', 'Contrat', 'Client', 'Projet', 'E-mail', "Heures de travail"],
            'de-ku': ['Arbeit', 'Büro', 'Firma', 'Besprechung', 'Manager', 'Mitarbeiter', 'Gehalt', 'Vertrag', 'Kunde', 'Projekt', 'E-Mail', 'Arbeitszeit'],
            'es-ku': ['Trabajo', 'Oficina', 'Empresa', 'Reunión', 'Gerente', 'Empleado', 'Salario', 'Contrato', 'Cliente', 'Proyecto', 'Correo electrónico', 'Horario laboral'],
            'fa-ku': ['کار', 'دفتر', 'شرکت', 'جلسه', 'مدیر', 'کارمند', 'حقوق', 'قرارداد', 'مشتری', 'پروژه', 'ایمیل', 'ساعت کاری'],
            'ru-ku': ['Работа', 'Офис', 'Компания', 'Встреча', 'Менеджер', 'Сотрудник', 'Зарплата', 'Контракт', 'Клиент', 'Проект', 'Email', 'Рабочие часы'],
            'zh-ku': ['工作', '办公室', '公司', '会议', '经理', '员工', '工资', '合同', '客户', '项目', '电子邮件', '工作时间'],
            'ja-ku': ['仕事', 'オフィス', '会社', '会議', 'マネージャー', '従業員', '給料', '契約', '顧客', 'プロジェクト', 'メール', '勤務時間'],
            'ko-ku': ['직업', '사무실', '회사', '회의', '매니저', '직원', '월급', '계약', '고객', '프로젝트', '이메일', '근무 시간'],
        },
    },
    emergency: {
        ku: ['یارمەتی', 'ئاگرکوژێنەوە', 'پۆلیس', 'ئامبولانس', 'مەترسی', 'ڕووداو', 'نەخۆشخانە', 'زوو بە زوو', 'ئاگر', 'دزی', 'شکاندن', 'زیانمەند'],
        badini: ['هاریکاری', 'ئاگرکوژان', 'پۆلیس', 'ئامبولانس', 'مەترسی', 'رودان', 'نەخوەشخانە', 'زوی زوی', 'ئاگر', 'دزی', 'شکان', 'زیانمەند'],
        pairs: {
            'en-ku': ['Help', 'Fire department', 'Police', 'Ambulance', 'Danger', 'Accident', 'Hospital', 'Emergency', 'Fire', 'Theft', 'Injury', 'Victim'],
            'ar-ku': ['مساعدة', 'الإطفاء', 'الشرطة', 'إسعاف', 'خطر', 'حادث', 'مستشفى', 'حالة طارئة', 'حريق', 'سرقة', 'إصابة', 'ضحية'],
            'tr-ku': ['Yardım', 'İtfaiye', 'Polis', 'Ambulans', 'Tehlike', 'Kaza', 'Hastane', 'Acil durum', 'Yangın', 'Hırsızlık', 'Yaralanma', 'Kurban'],
            'fr-ku': ['Aide', 'Pompiers', 'Police', 'Ambulance', 'Danger', 'Accident', 'Hôpital', 'Urgence', 'Incendie', 'Vol', 'Blessure', 'Victime'],
            'de-ku': ['Hilfe', 'Feuerwehr', 'Polizei', 'Krankenwagen', 'Gefahr', 'Unfall', 'Krankenhaus', 'Notfall', 'Feuer', 'Diebstahl', 'Verletzung', 'Opfer'],
            'es-ku': ['Ayuda', 'Bomberos', 'Policía', 'Ambulancia', 'Peligro', 'Accidente', 'Hospital', 'Emergencia', 'Incendio', 'Robo', 'Herida', 'Víctima'],
            'fa-ku': ['کمک', 'آتش‌نشانی', 'پلیس', 'آمبولانس', 'خطر', 'تصادف', 'بیمارستان', 'اضطراری', 'آتش', 'دزدی', 'آسیب', 'قربانی'],
            'ru-ku': ['Помощь', 'Пожарная служба', 'Полиция', 'Скорая помощь', 'Опасность', 'Авария', 'Больница', 'Экстренная ситуация', 'Пожар', 'Кража', 'Травма', 'Жертва'],
            'zh-ku': ['帮助', '消防队', '警察', '救护车', '危险', '事故', '医院', '紧急情况', '火', '盗窃', '受伤', '受害者'],
            'ja-ku': ['助け', '消防署', '警察', '救急車', '危険', '事故', '病院', '緊急事態', '火事', '盗難', '負傷', '被害者'],
            'ko-ku': ['도움', '소방서', '경찰', '구급차', '위험', '사고', '병원', '응급 상황', '화재', '도난', '부상', '피해자'],
        },
    },
};

async function seedNewCategories(client) {
    let count = 0;
    for (const [category, def] of Object.entries(NEW_CATEGORY_WORDS)) {
        for (const [langPair, sourceWords] of Object.entries(def.pairs)) {
            for (let i = 0; i < sourceWords.length; i++) {
                await upsert(client, {
                    langPair,
                    source: sourceWords[i],
                    target: def.ku[i],
                    badini: def.badini[i] || '',
                    level: 'B1',
                    category,
                });
                count++;
            }
        }
    }
    return count;
}

async function seedLegacyLessons(client) {
    const lessons = loadLegacyLessons();
    let count = 0;
    for (const [langPair, langData] of Object.entries(lessons)) {
        for (const topic of langData.topics) {
            const category = categorize(topic.title);
            for (const raw of topic.words) {
                const parsed = parseWordEntry(raw);
                if (!parsed) continue;
                await upsert(client, {
                    langPair,
                    source: parsed.source,
                    target: parsed.target,
                    level: topic.level || 'A1',
                    category,
                });
                count++;
            }
        }
    }
    return count;
}

async function main() {
    const client = await pool.connect();
    try {
        const legacyCount = await seedLegacyLessons(client);
        console.log(`[seed] imported ${legacyCount} legacy words from app.js lessons`);
        const newCount = await seedNewCategories(client);
        console.log(`[seed] added ${newCount} fresh Work & Business / Emergency words`);

        const { rows } = await client.query('SELECT lang_pair, COUNT(*)::int AS c FROM vocabulary GROUP BY lang_pair ORDER BY lang_pair');
        console.log('[seed] totals per language pair:');
        for (const r of rows) console.log(`  ${r.lang_pair}: ${r.c}`);
        const total = await client.query('SELECT COUNT(*)::int AS c FROM vocabulary');
        console.log(`[seed] grand total: ${total.rows[0].c} words`);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((e) => {
    console.error('[seed] failed', e);
    process.exit(1);
});
