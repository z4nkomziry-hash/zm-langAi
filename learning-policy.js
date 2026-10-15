'use strict';

const XP_REWARDS = Object.freeze({
  lesson: 15,
  quiz: 10,
  listening: 8,
  speaking: 8,
  writing: 8,
  matching: 5,
  ai: 5,
  practice: 3,
});
const XP_DAILY_CAPS = Object.freeze({
  lesson: 150,
  quiz: 100,
  listening: 80,
  speaking: 80,
  writing: 80,
  matching: 50,
  ai: 50,
  practice: 30,
});
const XP_DAILY_GLOBAL_CAP = 300;

function calculateXPAward(source, totalToday, sourceToday) {
  if (!Object.prototype.hasOwnProperty.call(XP_REWARDS, source)) {
    return { amount: 0, valid: false, capReached: false };
  }
  const total = Math.max(0, Number(totalToday) || 0);
  const sourceTotal = Math.max(0, Number(sourceToday) || 0);
  const amount = Math.max(0, Math.min(XP_REWARDS[source], XP_DAILY_CAPS[source] - sourceTotal, XP_DAILY_GLOBAL_CAP - total));
  return { amount, valid: true, capReached: amount === 0 };
}

module.exports = { XP_REWARDS, XP_DAILY_CAPS, XP_DAILY_GLOBAL_CAP, calculateXPAward };
