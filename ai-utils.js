'use strict';

const ALLOWED_PAIRS = new Set(['en-ku', 'ar-ku', 'tr-ku', 'fr-ku', 'de-ku', 'es-ku', 'fa-ku', 'ru-ku', 'zh-ku', 'ja-ku', 'ko-ku']);
const ALLOWED_AI_MODES = new Set(['tutor', 'conversation', 'speaking', 'grammar', 'vocabulary', 'writing']);

function getAIModeInstruction(mode = 'tutor') {
    const instructions = {
        tutor: 'Teach the learner step by step. Correct mistakes gently and give one concise example.',
        conversation: 'Run a natural, level-appropriate conversation. Ask one question at a time and encourage the learner to reply in the target language.',
        speaking: 'Act as a speaking-practice coach. Give short phrases to say aloud, ask one prompt at a time, and assess only text the learner provides. Do not claim to hear or score audio unless audio was actually supplied and processed.',
        grammar: 'Focus on grammar: state the rule simply, give two contrasting examples, point out a common mistake, then offer one short practice question.',
        vocabulary: 'Build vocabulary: give 5 useful words at most, with meaning, pronunciation guidance where reliable, and an example sentence; then quiz the learner briefly.',
        writing: "Coach writing: review the learner's submitted text, identify up to three high-impact corrections, explain them kindly, and show a corrected version without changing the intended meaning."
    };
    return instructions[ALLOWED_AI_MODES.has(mode) ? mode : 'tutor'];
}

function validateAIChatPayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return 'داتای چات نادروستە';
    if (!['sorani', 'badini'].includes(body.dialect)) return 'شێوەزاری کوردی نادروستە';
    if (body.mode !== undefined && !ALLOWED_AI_MODES.has(body.mode)) return 'شێوازی مامۆستای AI نادروستە';
    if (!ALLOWED_PAIRS.has(body.langPair)) return 'جوتە زمانی نادروستە';
    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 10) return 'مێژووی چات نادروستە';
    let total = 0;
    for (const message of body.messages) {
        if (!message || typeof message !== 'object' || !['user', 'assistant'].includes(message.role)) return 'ڕۆڵی نامە نادروستە';
        if (typeof message.content !== 'string' || !message.content.trim() || message.content.length > 3000) return 'ناوەڕۆکی نامە نادروستە';
        total += message.content.length;
    }
    if (total > 10000) return 'قەبارەی مێژووی چات زۆرە';
    if (body.messages[body.messages.length - 1].role !== 'user') return 'نامەی نوێ پێویستە لەلایەن فێرخوازەوە بێت';
    return null;
}

function toGeminiContents(messages = []) {
    return messages.map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
    }));
}

function extractGeminiText(payload) {
    if (!payload || typeof payload !== 'object') return '';
    const parts = payload.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';
    return parts.map(part => typeof part?.text === 'string' ? part.text : '').join('');
}

module.exports = { ALLOWED_AI_MODES, getAIModeInstruction, validateAIChatPayload, toGeminiContents, extractGeminiText };
