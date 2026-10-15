'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { scheduleReview } = require('../review-scheduler');

const base = new Date('2026-10-14T12:00:00.000Z');

test('again schedules a short retry and records a lapse', () => {
  const result = scheduleReview({ repetitions: 3, intervalDays: 12, easeFactor: 2.3, lapses: 1 }, 'again', base);
  assert.equal(result.repetitions, 0);
  assert.equal(result.intervalDays, 0);
  assert.equal(result.lapses, 2);
  assert.equal(result.dueAt, '2026-10-14T12:10:00.000Z');
});

test('good follows spaced intervals of one day then three days', () => {
  const first = scheduleReview({}, 'good', base);
  assert.equal(first.intervalDays, 1);
  assert.equal(first.repetitions, 1);
  const second = scheduleReview(first, 'good', base);
  assert.equal(second.intervalDays, 3);
  assert.equal(second.repetitions, 2);
});

test('easy increases ease but never exceeds the configured ceiling', () => {
  const result = scheduleReview({ repetitions: 8, intervalDays: 900, easeFactor: 2.8, lapses: 0 }, 'easy', base);
  assert.equal(result.easeFactor, 2.8);
  assert.ok(result.intervalDays <= 3650);
  assert.equal(result.lastRating, 'easy');
});

test('invalid ratings are rejected', () => {
  assert.throws(() => scheduleReview({}, 'perfect', base), /rating/);
});
