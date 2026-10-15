'use strict';

// Deterministic daily challenge helpers shared by the browser app and unit tests.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.ZimanDailyLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const CATEGORY_BY_PAGE = Object.freeze({
        lessons: 'lesson', quiz: 'quiz', 'speed-quiz': 'quiz', review: 'review',
        listening: 'listening', speaking: 'speaking', writing: 'writing',
        'ai-teacher': 'ai', 'match-pairs': 'matching', 'fill-blank': 'practice',
        'sentence-order': 'practice', reading: 'practice'
    });
    const TASKS = Object.freeze([
        { key: 'lesson', title: 'تەواوکردنی وانەیەک', detail: 'وشە و دەستەواژەی نوێ فێربە', icon: '📚', page: 'lessons' },
        { key: 'quiz', title: 'کویزێک تاقی بکەرەوە', detail: 'زانیارییەکانت بەکاربهێنە', icon: '📝', page: 'quiz' },
        { key: 'review', title: 'پێداچوونەوەی وشەکان', detail: 'وشە کۆنەکان لە بیرت مەچن', icon: '🧠', page: 'review' }
    ]);

    function dayKey(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    function normalize(saved, today = dayKey()) {
        if (saved && saved.day === today && saved.done && typeof saved.done === 'object' && !Array.isArray(saved.done)) return saved;
        return { day: today, done: {} };
    }
    function markActivity(saved, page, date = new Date()) {
        const challenge = normalize(saved, dayKey(date));
        const category = CATEGORY_BY_PAGE[page];
        if (category && !challenge.done[category]) challenge.done[category] = date.toISOString();
        return challenge;
    }
    function buildPlan(saved, user = {}) {
        const challenge = normalize(saved);
        const tasks = TASKS.map(task => ({ ...task, complete: Boolean(challenge.done[task.key]) }));
        const completed = tasks.filter(task => task.complete).length;
        let tip = 'بە وانەیەکی کورت دەست پێبکە و پاشان کویزێک ئەنجام بدە.';
        if (Number(user.totalWords) < 20) tip = 'ئامانجی ئەمڕۆ: وشەی بنەڕەتی فێربە و پێشکەوتنت بە هێواشی بنیات بنێ.';
        else if (Number(user.streak) >= 3) tip = 'ستریکەکەت بەردەوام بکە؛ پێداچوونەوەی وشەکان لە پلانی ئەمڕۆت دابنێ.';
        else if (Number(user.xp) > 500) tip = 'ئاستی داهاتووت نزیکە؛ کویز و پێداچوونەوە بەکاربهێنە بۆ جێگیرکردنی فێربوون.';
        return { tasks, completed, total: tasks.length, tip, finished: completed === tasks.length };
    }
    return { dayKey, normalize, markActivity, buildPlan };
});
