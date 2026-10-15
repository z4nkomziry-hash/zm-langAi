'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateXPAward } = require('../learning-policy');

test('server defines a fixed award independent of any client-sent amount', () => {
  assert.deepEqual(calculateXPAward('lesson', 0, 0), { amount: 15, valid: true, capReached: false });
});

test('per-source daily cap limits remaining award', () => {
  assert.deepEqual(calculateXPAward('lesson', 100, 145), { amount: 5, valid: true, capReached: false });
  assert.deepEqual(calculateXPAward('lesson', 100, 150), { amount: 0, valid: true, capReached: true });
});

test('global daily XP cap applies across all sources', () => {
  assert.deepEqual(calculateXPAward('quiz', 295, 20), { amount: 5, valid: true, capReached: false });
  assert.deepEqual(calculateXPAward('quiz', 300, 20), { amount: 0, valid: true, capReached: true });
});

test('unknown XP source is rejected', () => {
  assert.deepEqual(calculateXPAward('admin', 0, 0), { amount: 0, valid: false, capReached: false });
});
