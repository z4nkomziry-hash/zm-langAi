'use strict';

// Small, deterministic spaced-repetition scheduler (SM-2-inspired).
// Pure functions keep the scheduling logic testable without a database.
const EASE_MIN = 1.3;
const EASE_MAX = 2.8;

function scheduleReview(previous = {}, rating, now = new Date()) {
  if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
    throw new TypeError('rating must be again, hard, good, or easy');
  }
  const repetitions = Math.max(0, Math.min(1000, Number.isInteger(previous.repetitions) ? previous.repetitions : 0));
  const intervalDays = Math.max(0, Math.min(3650, Number(previous.intervalDays) || 0));
  const easeFactor = Math.max(EASE_MIN, Math.min(EASE_MAX, Number(previous.easeFactor) || 2.5));
  let nextRepetitions = repetitions;
  let nextIntervalDays = intervalDays;
  let nextEase = easeFactor;
  let dueAt;
  let lapses = Math.max(0, Number(previous.lapses) || 0);

  if (rating === 'again') {
    nextRepetitions = 0;
    nextIntervalDays = 0;
    nextEase = Math.max(EASE_MIN, easeFactor - 0.2);
    lapses += 1;
    dueAt = new Date(now.getTime() + 10 * 60 * 1000);
  } else {
    if (rating === 'hard') {
      nextIntervalDays = Math.max(1, Math.round((intervalDays || 1) * 1.2));
      nextEase = Math.max(EASE_MIN, easeFactor - 0.15);
    } else if (rating === 'good') {
      nextIntervalDays = repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(1, Math.round((intervalDays || 3) * easeFactor));
    } else {
      nextIntervalDays = repetitions === 0 ? 4 : Math.max(2, Math.round((intervalDays || 3) * easeFactor * 1.3));
      nextEase = Math.min(EASE_MAX, easeFactor + 0.1);
    }
    nextRepetitions = repetitions + 1;
    dueAt = new Date(now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000);
  }

  return {
    repetitions: nextRepetitions,
    intervalDays: nextIntervalDays,
    easeFactor: Number(nextEase.toFixed(2)),
    lapses,
    lastRating: rating,
    dueAt: dueAt.toISOString(),
  };
}

module.exports = { scheduleReview };
