'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PACKAGE_LIMITS, PREMIUM_AI_MODES, resolveEntitlement, remainingDailyAI, canUseAIMode } = require('../subscription-policy');

test('free users receive only the limited entitlement', () => {
  const entitlement = resolveEntitlement([]);
  assert.equal(entitlement.package, 'free');
  assert.equal(entitlement.aiDailyLimit, 5);
  assert.equal(entitlement.canUsePremiumAI, false);
});

test('expired packages do not grant access', () => {
  const entitlement = resolveEntitlement([{ package_key: 'premium', expires_at: '2020-01-01T00:00:00Z' }], Date.parse('2026-01-01T00:00:00Z'));
  assert.equal(entitlement.package, 'free');
});

test('the highest active package is selected', () => {
  const entitlement = resolveEntitlement([{ package_key: 'plus' }, { package_key: 'student' }, { package_key: 'business' }]);
  assert.equal(entitlement.package, 'business');
  assert.equal(entitlement.canUsePremiumAI, true);
});

test('speaking and writing are premium-gated but standard modes remain available', () => {
  const free = resolveEntitlement([]);
  const plus = resolveEntitlement([{ package_key: 'plus' }]);
  const premium = resolveEntitlement([{ package_key: 'premium' }]);
  assert.deepEqual(PREMIUM_AI_MODES, ['speaking', 'writing']);
  assert.equal(canUseAIMode(free, 'speaking'), false);
  assert.equal(canUseAIMode(plus, 'writing'), false);
  assert.equal(canUseAIMode(free, 'tutor'), true);
  assert.equal(canUseAIMode(premium, 'speaking'), true);
});

test('daily allowance never becomes negative', () => {
  assert.equal(remainingDailyAI(PACKAGE_LIMITS.free.aiDailyLimit, 99), 0);
});
