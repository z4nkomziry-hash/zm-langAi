'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateProgressPayload, validateRegistrationPayload, createRateLimiter } = require('../security-utils');

test('progress validation accepts a normal payload and omitted optional fields', () => {
  assert.equal(validateProgressPayload({ xp: 250, level: 3, history: [], bookmarks: [], notes: {} }), null);
  assert.equal(validateProgressPayload({}), null);
});
test('progress validation rejects invalid numeric ranges and shapes', () => {
  assert.match(validateProgressPayload({ xp: -1 }), /xp/);
  assert.match(validateProgressPayload({ level: 0 }), /level/);
  assert.match(validateProgressPayload({ history: {} }), /مێژوو/);
  assert.match(validateProgressPayload({ notes: [] }), /تێبینی/);
});
test('progress validation caps oversized collections', () => {
  assert.match(validateProgressPayload({ history: Array(5001).fill(0) }), /مێژوو/);
  assert.match(validateProgressPayload({ notes: { huge: 'x'.repeat(530000) } }), /قەبارە/);
});
test('rate limiter allows max requests then returns 429', () => {
  const middleware = createRateLimiter({ windowMs: 60000, max: 2 });
  const run = () => {
    let status = 200, json = null, nextCalled = false;
    const res = { setHeader() {}, status(n) { status = n; return this; }, json(v) { json = v; return this; } };
    middleware({ ip: 'test-ip', path: '/unit' }, res, () => { nextCalled = true; });
    return { status, json, nextCalled };
  };
  assert.equal(run().nextCalled, true);
  assert.equal(run().nextCalled, true);
  assert.equal(run().status, 429);
});


test('registration accepts the app current three-field form', () => {
  assert.equal(validateRegistrationPayload({ name: 'Zanyar', email: 'zanyar@example.com', password: 'securepass8' }), null);
});
test('registration rejects weak passwords, malformed email, and invalid optional phone', () => {
  assert.match(validateRegistrationPayload({ name: 'Zanyar', email: 'zanyar@example.com', password: 'short' }), /پاسوۆرد/);
  assert.match(validateRegistrationPayload({ name: 'Zanyar', email: 'not-an-email', password: 'securepass8' }), /ئیمەیڵ/);
  assert.match(validateRegistrationPayload({ name: 'Zanyar', email: 'zanyar@example.com', password: 'securepass8', mobile: 'abc' }), /مۆبایل/);
});
