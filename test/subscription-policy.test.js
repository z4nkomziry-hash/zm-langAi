'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveEntitlement, remainingDailyAI } = require('../subscription-policy');

test('users without an active package receive the limited plan', () => {
  assert.deepEqual(resolveEntitlement([]), { package: 'free', aiDailyLimit: 5, tier: 'limited', premium: false });
});

test('expired paid packages do not grant premium access', () => {
  assert.equal(resolveEntitlement([{ package_key: 'premium', expires_at: '2020-01-01T00:00:00Z' }]).premium, false);
});

test('active packages resolve to the highest available entitlement', () => {
  const plan = resolveEntitlement([
    { package_key: 'plus', expires_at: null },
    { package_key: 'premium', expires_at: '2099-01-01T00:00:00Z' }
  ]);
  assert.equal(plan.package, 'premium');
  assert.equal(plan.aiDailyLimit, 100);
});

test('remaining AI quota never becomes negative', () => {
  assert.equal(remainingDailyAI(5, 2), 3);
  assert.equal(remainingDailyAI(5, 9), 0);
});
