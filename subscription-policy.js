'use strict';

const PREMIUM_AI_MODES = Object.freeze(['speaking', 'writing']);
const PACKAGE_LIMITS = Object.freeze({
  free: { aiDailyLimit: 5, tier: 'limited', premium: false, canUsePremiumAI: false, cloudSync: true, offlineLessons: false },
  plus: { aiDailyLimit: 30, tier: 'plus', premium: true, canUsePremiumAI: false, cloudSync: true, offlineLessons: true },
  student: { aiDailyLimit: 40, tier: 'premium', premium: true, canUsePremiumAI: true, cloudSync: true, offlineLessons: true },
  premium: { aiDailyLimit: 100, tier: 'premium', premium: true, canUsePremiumAI: true, cloudSync: true, offlineLessons: true },
  family: { aiDailyLimit: 100, tier: 'premium', premium: true, canUsePremiumAI: true, cloudSync: true, offlineLessons: true },
  business: { aiDailyLimit: 200, tier: 'business', premium: true, canUsePremiumAI: true, cloudSync: true, offlineLessons: true },
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

function canUseAIMode(entitlement, mode) {
  if (!PREMIUM_AI_MODES.includes(mode)) return true;
  return Boolean(entitlement && entitlement.canUsePremiumAI === true);
}

module.exports = { PACKAGE_LIMITS, PREMIUM_AI_MODES, resolveEntitlement, remainingDailyAI, canUseAIMode };
