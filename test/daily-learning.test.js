'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { dayKey, normalize, markActivity, buildPlan } = require('../daily-learning');

test('daily challenge uses a stable local calendar date key', () => {
  assert.equal(dayKey(new Date(2026, 9, 15, 12)), '2026-10-15');
});

test('challenge resets on a new day and keeps same-day progress', () => {
  assert.deepEqual(normalize({ day: '2026-10-14', done: { lesson: 'x' } }, '2026-10-15'), { day: '2026-10-15', done: {} });
  assert.deepEqual(normalize({ day: '2026-10-15', done: { lesson: 'x' } }, '2026-10-15'), { day: '2026-10-15', done: { lesson: 'x' } });
});

test('activity marks the right task and does not overwrite the first completion', () => {
  const first = new Date('2026-10-15T09:00:00.000Z');
  const second = new Date('2026-10-15T10:00:00.000Z');
  const one = markActivity({ day: '2026-10-15', done: {} }, 'lessons', first);
  const two = markActivity(one, 'lessons', second);
  assert.equal(two.done.lesson, first.toISOString());
  assert.equal(two.done.quiz, undefined);
});

test('study plan counts completed tasks and selects a useful beginner tip', () => {
  const plan = buildPlan({ day: dayKey(), done: { lesson: 'x', review: 'y' } }, { totalWords: 5, streak: 0, xp: 0 });
  assert.equal(plan.completed, 2);
  assert.equal(plan.total, 3);
  assert.equal(plan.finished, false);
  assert.match(plan.tip, /وشەی بنەڕەتی/);
});
