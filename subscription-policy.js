'use strict';

const PACKAGE_LIMITS = Object.freeze({
  free: { aiDailyLimit: 5, tier: 'limited', premium: false },
  plus: { aiDailyLimit: 30, tier: 'plus', premium: true },
  student: { aiDailyLimit: 40, tier: 'premium', premium: true },
  premium: { aiDailyLimit: 100, tier: 'premium', premium: true },
  family: { aiDailyLimit: 100, tier: 'premium', premium: true },
  business: { aiDailyLimit: 200, tier: 'business', premium: true },
});

function resolveEntitlement(packages = [], now = Date.now()) {
  const active = packages.filter(item => {
    if (!item || !PACKAGE_LIMITS[item.package_key]) return false;
    if (item.expires_at == null) return true;
    const expiry = new Date(item.expires_at).getTime();
    return Number.isFinite(expiry) && expiry > now;
  });
  const priority = ['business', 'family', 'premium', 'student', 'plus'];
  const selected = priority.find(key => active.some(item => item.package_key === key)) || 'free';
  return { package: selected, ...PACKAGE_LIMITS[selected] };
}

function remainingDailyAI(limit, used) {
  const safeLimit = Number.isInteger(limit) && limit >= 0 ? limit : 0;
  const safeUsed = Number.isInteger(used) && used >= 0 ? used : 0;
  return Math.max(0, safeLimit - safeUsed);
}

module.exports = { PACKAGE_LIMITS, resolveEntitlement, remainingDailyAI };
