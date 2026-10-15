// ============================================================
// ZIMAN — Student Authentication & License Key Activation
// v3 — Premium UI retained; account authentication uses the server API.
// ============================================================

'use strict';

// License keys are generated, hashed, and validated by the server. No usable keys ship in the browser.
const LICENSE_KEYS = {};

const PACKAGE_NAMES = {
    plus:     'Plus ($5.99/مانگ)',
    premium:  'Premium ($9.99/مانگ)',
    family:   'Family ($14.99/مانگ)',
    student:  'Student ($4.99/مانگ)',
    business: 'Business ($29.99/مانگ)'
};

const PACKAGE_ICONS = {
    plus: '💎', premium: '👑', family: '👨‍👩‍👧‍👦', student: '🎓', business: '🏢'
};

const PACKAGE_COLORS = {
    plus: '#3B82F6', premium: '#8B5CF6', family: '#10B981', student: '#F59E0B', business: '#EC4899'
};

// ===== STORAGE HELPERS =====
function authGet(key, fallback = null) {
    try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : fallback; }
    catch { return fallback; }
}
function authSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ===== CORE DATA ACCESSORS =====
// Credentials and account sessions must never be stored in browser localStorage.
// The authenticated identity lives in memory; the HttpOnly session cookie is server-managed.
let _serverUser = null;
function getUsers() { return []; } // legacy debug UI compatibility; no browser credential database
function setUsers(_users) { /* intentionally disabled */ }
function getSession() { return _serverUser; }
function setSession(user) { _serverUser = user ? normalizeServerUser(user) : null; }
function normalizeServerUser(user) {
    if (!user) return null;
    return {
        ...user,
        fullName: user.full_name || user.fullName || user.name || 'فێرخواز',
        fatherName: user.father_name || user.fatherName || '',
        grandfatherName: user.grandfather_name || user.grandfatherName || '',
        studentID: user.student_id || user.studentID || String(user.id || ''),
        id: user.id,
        activatedPackages: Array.isArray(user.activatedPackages) ? user.activatedPackages : [],
        createdAt: user.created_at || user.createdAt || new Date().toISOString(),
        verified: user.verified === true
    };
}
function getUsedKeys() { return authGet('zm_used_keys', []); }
function setUsedKeys(k) { authSet('zm_used_keys', k); }
function getDebugLog() { return []; }

function addDebugEntry(e) {
    const log = getDebugLog();
    log.unshift({ ...e, ts: new Date().toISOString() });
    if (log.length > 100) log.length = 100;
    authSet('zm_debug_log', log);
    refreshDebugConsole();
}

// ===== GENERATORS =====
function generateStudentID() {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let seg = '';
    for (let i = 0; i < 6; i++) seg += chars[Math.floor(Math.random() * chars.length)];
    return `ZMN-${year}-${seg}`;
}

function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

// ===== SIMULATION HELPERS =====
function simulateEmail(to, subject, body) {
    addDebugEntry({ type: 'email', icon: '📧', label: `ئیمەیڵ بۆ: ${to}`, subject, body });
}

// Escaping function for utility use
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function simulateSMS(phone, otp) {
    addDebugEntry({
        type: 'sms', icon: '📱',
        label: `SMS بۆ: ${phone}`,
        otp,
        body: `[Ziman] کۆدی دڵنیاکردنەوەکەت: ${otp}  ئەم کۆدە لە ٥ خولەکدا تەواو دەبێت.`
    });
}

// ============================================================
// VALIDATION ENGINE
// ============================================================

/**
 * Validates a single field. Returns { ok, msg }.
 * Shows/clears inline error beneath the field.
 */
function validateField(id, rules) {
    const el = document.getElementById(id);
    const val = el ? el.value.trim() : '';
    for (const rule of rules) {
        if (!rule.test(val)) {
            setFieldError(id, rule.msg);
            return false;
        }
    }
    clearFieldError(id);
    return true;
}

function setFieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('auth-input-error');
    let errEl = el.parentElement.querySelector('.auth-field-err');
    if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'auth-field-err';
        el.parentElement.appendChild(errEl);
    }
    errEl.textContent = msg;
    errEl.style.display = 'block';
}

function clearFieldError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('auth-input-error');
    const errEl = el.parentElement.querySelector('.auth-field-err');
    if (errEl) errEl.style.display = 'none';
}

function clearAllFieldErrors() {
    document.querySelectorAll('.auth-input-error').forEach(el => el.classList.remove('auth-input-error'));
    document.querySelectorAll('.auth-field-err').forEach(el => { el.style.display = 'none'; });
}

// Mobile: accepts +964XXXXXXXXXX, 07XXXXXXXXX, 009647XXXXXXXXX formats
const MOBILE_RE = /^(\+964|00964|0)(7[3-9]\d{8}|\d{9,10})$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateSignUpFields() {
    clearAllFieldErrors();
    let ok = true;

    const nameRules = [
        { test: v => v.length >= 2,  msg: '❌ ناو دەبێت لانیکەم ٢ پیت بێت' },
        { test: v => !/\d/.test(v),  msg: '❌ ناو نابێت ژمارە تێدا بێت' }
    ];

    if (!validateField('suFull',   nameRules))  ok = false;
    if (!validateField('suFather', nameRules))  ok = false;
    if (!validateField('suGrand',  nameRules))  ok = false;

    if (!validateField('suMobile', [
        { test: v => v.length > 0,        msg: '❌ ژمارەی مۆبایل پەیوەندییە' },
        { test: v => MOBILE_RE.test(v.replace(/[\s\-]/g, '')), msg: '❌ ژمارەی مۆبایل نادروستە (مسەلا: 07501234567)' }
    ])) ok = false;

    if (!validateField('suEmail', [
        { test: v => v.length > 0,       msg: '❌ ئیمەیڵ پەیوەندییە' },
        { test: v => EMAIL_RE.test(v),   msg: '❌ فۆرماتی ئیمەیڵ نادروستە' }
    ])) ok = false;

    const pass = document.getElementById('suPass')?.value || '';
    if (!validateField('suPass', [
        { test: () => pass.length >= 6,   msg: '❌ پاسوۆرد دەبێت لانیکەم ٦ پیت بێت' },
        { test: () => pass.length <= 64,  msg: '❌ پاسوۆرد زۆر درێژە' }
    ])) ok = false;

    return ok;
}

// ============================================================
// AUTH CORE
// ============================================================

// Authentication is performed only by the server API. Legacy simulated OTP and
// password-reset helpers are intentionally disabled: there is no real SMS/email provider configured.
function authRegister() { return { ok: false, msg: 'تکایە پەیوەندی بە سێرڤەر بکە.' }; }
function authVerifyOTP() { return { ok: false, msg: 'دڵنیاکردنەوەی OTP هێشتا بە خزمەتگوزاری SMS/Email پەیوەست نەکراوە.' }; }
function authLogin() { return { ok: false, msg: 'چوونەژوورەوەی ئۆنلاین پێویستە.' }; }
function authForgotPassword() { return { ok: false, msg: 'ڕیسێتی پاسوۆرد تا پەیوەستکردنی خزمەتگوزاری Email/SMS ناچالاکە.' }; }
function authResetPassword() { return { ok: false, msg: 'ڕیسێتی پاسوۆرد تا پەیوەستکردنی خزمەتگوزاری Email/SMS ناچالاکە.' }; }

function authLogout() {
    const old = getSession();
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    setSession(null);
    refreshAuthNavUI();
    if (typeof navigateTo === 'function') navigateTo('home');
}

// ===== SERVER-SIDE LICENSE KEY ACTIVATION =====
async function activateLicenseKey(key) {
    if (!getSession()) return { ok: false, msg: '❌ تکایە پێشتر داخل بوو.' };
    try {
        const response = await fetch('/api/licenses/activate', {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return { ok: false, msg: data.error || '❌ کلیل چالاک نەکرا.' };
        const current = getSession() || {};
        const active = Array.isArray(current.activatedPackages) ? current.activatedPackages : [];
        if (!active.includes(data.package)) active.push(data.package);
        setSession({ ...current, activatedPackages: active });
        return { ok: true, pkg: data.package, pkgName: PACKAGE_NAMES[data.package] || data.package };
    } catch {
        return { ok: false, msg: '❌ پەیوەندی بە سێرڤەر نەکرا.' };
    }
}

// ============================================================
// AUTH MODAL SYSTEM
// ============================================================

let _authMode        = 'signin';
let _authPendingEmail = '';

function showAuthModal(mode = 'signin') {
    _authMode = mode;
    document.querySelector('.auth-overlay')?.remove();

    const overlay      = document.createElement('div');
    overlay.className  = 'auth-overlay';
    overlay.id         = 'authOverlay';
    overlay.innerHTML  = _buildAuthShell(mode);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('auth-visible'));
    });

    overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });

    // Auto-focus first input
    setTimeout(() => {
        const first = overlay.querySelector('input:not([type=hidden])');
        first?.focus();
    }, 380);
}

function closeAuthModal() {
    const overlay = document.getElementById('authOverlay');
    if (!overlay) return;
    overlay.classList.remove('auth-visible');
    setTimeout(() => overlay?.remove(), 360);
}

function _buildAuthShell(mode) {
    const builders = {
        signin: _buildSignInForm,
        signup: _buildSignUpForm,
        forgot: _buildForgotForm,
        otp:    _buildOTPForm,
        reset:  _buildResetForm
    };
    return `
    <div class="auth-box">
        <div class="auth-progress-bar" id="authProgressBar"></div>
        <button class="auth-close-btn" onclick="closeAuthModal()" aria-label="داخستن">✕</button>
        <div class="auth-brand">
            <span class="auth-brand-logo">🌍</span>
            <span class="auth-brand-name">Ziman</span>
        </div>
        <div id="authFormBody">${(builders[mode] || builders.signin)()}</div>
    </div>`;
}

// ---------- SIGN IN ----------
function _buildSignInForm() {
    return `
    <h2 class="auth-title">چوونەژوورەوە</h2>
    <p class="auth-sub">بەخێربێیت! داخل بوو بە ئەژمارەکەت</p>

    <div class="auth-field">
        <label class="auth-label">📧 ئیمەیڵ</label>
        <input type="email" id="siEmail" class="auth-input" placeholder="name@example.com"
               autocomplete="email" dir="ltr" oninput="clearFieldError('siEmail')">
    </div>
    <div class="auth-field">
        <label class="auth-label">🔐 پاسوۆرد</label>
        <div class="auth-pass-wrap">
            <input type="password" id="siPass" class="auth-input" placeholder="پاسوۆردەکەت"
                   autocomplete="current-password" oninput="clearFieldError('siPass')"
                   onkeydown="if(event.key==='Enter')handleSignIn()">
            <button type="button" class="auth-eye" onclick="toggleAuthPass('siPass',this)" tabindex="-1">👁</button>
        </div>
    </div>

    <div id="authMsg" class="auth-msg" style="display:none"></div>

    <button class="auth-btn auth-btn-primary" id="signInBtn" onclick="handleSignIn()">
        <span class="btn-text">چوونەژوورەوە</span>
        <span class="btn-icon">→</span>
    </button>

    <div class="auth-divider"><span>یان</span></div>
    <button class="auth-btn auth-btn-ghost" onclick="showAuthModal('signup')">✨ تۆمارکردنی ئەژمارەی نوێ</button>
    <button class="auth-btn auth-btn-link" onclick="showAuthModal('forgot')">🔑 پاسوۆردت لەبیرچووە?</button>`;
}

// ---------- SIGN UP ----------
function _buildSignUpForm() {
    return `
    <h2 class="auth-title">تۆمارکردنی فێرخواز</h2>
    <p class="auth-sub">زانیاری تەواوی خۆت داخل بکە</p>

    <div class="auth-names-grid">
        <div class="auth-field">
            <label class="auth-label">👤 ناوی خۆت</label>
            <input type="text" id="suFull" class="auth-input" placeholder="ئارام"
                   oninput="clearFieldError('suFull')">
        </div>
        <div class="auth-field">
            <label class="auth-label">👨 باوک</label>
            <input type="text" id="suFather" class="auth-input" placeholder="کارزان"
                   oninput="clearFieldError('suFather')">
        </div>
        <div class="auth-field">
            <label class="auth-label">👴 باپیر</label>
            <input type="text" id="suGrand" class="auth-input" placeholder="شێخ"
                   oninput="clearFieldError('suGrand')">
        </div>
    </div>

    <div class="auth-field">
        <label class="auth-label">📱 ژمارەی مۆبایل</label>
        <input type="tel" id="suMobile" class="auth-input" placeholder="07501234567"
               dir="ltr" autocomplete="tel" oninput="clearFieldError('suMobile')">
        <span class="auth-hint">فۆرمات: 07XXXXXXXXX یان +964XXXXXXXXXX</span>
    </div>

    <div class="auth-field">
        <label class="auth-label">📧 ئیمەیڵ</label>
        <input type="email" id="suEmail" class="auth-input" placeholder="name@example.com"
               dir="ltr" autocomplete="email" oninput="clearFieldError('suEmail')">
    </div>

    <div class="auth-field">
        <label class="auth-label">🔐 پاسوۆرد <span class="auth-hint-inline">(لانیکەم ٦ پیت)</span></label>
        <div class="auth-pass-wrap">
            <input type="password" id="suPass" class="auth-input" placeholder="لانیکەم ٦ پیت"
                   autocomplete="new-password" oninput="clearFieldError('suPass');updatePassStrength(this.value)">
            <button type="button" class="auth-eye" onclick="toggleAuthPass('suPass',this)" tabindex="-1">👁</button>
        </div>
        <div class="pass-strength-bar" id="passStrengthBar" style="display:none">
            <div class="pass-strength-fill" id="passStrengthFill"></div>
        </div>
        <span class="pass-strength-label" id="passStrengthLabel"></span>
    </div>

    <div id="authMsg" class="auth-msg" style="display:none"></div>

    <button class="auth-btn auth-btn-primary" id="signUpBtn" onclick="handleSignUp()">
        <span class="btn-text">تۆمارکردن و نێردنی کۆد</span>
        <span class="btn-icon">📲</span>
    </button>
    <button class="auth-btn auth-btn-ghost" onclick="showAuthModal('signin')">← گەڕانەوە</button>`;
}

// ---------- FORGOT PASSWORD ----------
function _buildForgotForm() {
    return `
    <h2 class="auth-title">پاسوۆردت لەبیرچووە؟</h2>
    <p class="auth-sub">ئیمەیڵی تۆمارکراوت بنووسە، کۆدی ڕیسێت دەنێرین</p>
    <div class="auth-field">
        <label class="auth-label">📧 ئیمەیڵی تۆمارکراو</label>
        <input type="email" id="fpEmail" class="auth-input" placeholder="name@example.com"
               dir="ltr" oninput="clearFieldError('fpEmail')"
               onkeydown="if(event.key==='Enter')handleForgot()">
    </div>
    <div id="authMsg" class="auth-msg" style="display:none"></div>
    <button class="auth-btn auth-btn-primary" onclick="handleForgot()">
        <span class="btn-text">نێردنی کۆدی ڕیسێت</span>
        <span class="btn-icon">📲</span>
    </button>
    <button class="auth-btn auth-btn-ghost" onclick="showAuthModal('signin')">← گەڕانەوە</button>`;
}

// ---------- OTP ----------
function _buildOTPForm() {
    return `
    <div class="auth-otp-hero">
        <div class="auth-otp-pulse">📲</div>
    </div>
    <h2 class="auth-title">دڵنیاکردنەوەی ئەژمارە</h2>
    <p class="auth-sub">کۆدی ٦ ژمارەیی نێردراوی بۆ مۆبایلەکەت داخل بکە</p>
    <div class="auth-otp-inputs" id="otpInputs">
        ${[0,1,2,3,4,5].map(i =>
            `<input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]"
                    class="auth-otp-cell" id="otp${i}"
                    oninput="otpAdvance(this,${i})"
                    onkeydown="otpBack(this,event,${i})"
                    onpaste="${i===0 ? 'otpPaste(event)' : ''}">`
        ).join('')}
    </div>
    <div id="authMsg" class="auth-msg" style="display:none"></div>
    <button class="auth-btn auth-btn-primary" onclick="handleOTPVerify()">
        <span class="btn-text">دڵنیاکردنەوە</span>
        <span class="btn-icon">✅</span>
    </button>
    <button class="auth-btn auth-btn-link" onclick="_resendOTP()">↻ کۆدی نوێ بنێرە</button>
    <button class="auth-btn auth-btn-ghost" onclick="showAuthModal('signup')">← گەڕانەوە</button>`;
}

// ---------- RESET PASSWORD ----------
function _buildResetForm() {
    return `
    <h2 class="auth-title">گۆڕینی پاسوۆرد</h2>
    <p class="auth-sub">کۆدی ڕیسێت و پاسوۆردی نوێ بنووسە</p>
    <div class="auth-field">
        <label class="auth-label">🔢 کۆدی ڕیسێت</label>
        <input type="text" id="rpCode" class="auth-input auth-input-mono"
               placeholder="123456" dir="ltr" maxlength="6" inputmode="numeric"
               oninput="clearFieldError('rpCode')">
    </div>
    <div class="auth-field">
        <label class="auth-label">🔐 پاسوۆردی نوێ <span class="auth-hint-inline">(لانیکەم ٦ پیت)</span></label>
        <div class="auth-pass-wrap">
            <input type="password" id="rpPass" class="auth-input" placeholder="پاسوۆردی نوێ"
                   oninput="clearFieldError('rpPass')">
            <button type="button" class="auth-eye" onclick="toggleAuthPass('rpPass',this)" tabindex="-1">👁</button>
        </div>
    </div>
    <div id="authMsg" class="auth-msg" style="display:none"></div>
    <button class="auth-btn auth-btn-primary" onclick="handleReset()">
        <span class="btn-text">گۆڕینی پاسوۆرد</span>
        <span class="btn-icon">✅</span>
    </button>
    <button class="auth-btn auth-btn-ghost" onclick="showAuthModal('signin')">← گەڕانەوە</button>`;
}

// ============================================================
// FORM HANDLERS
// ============================================================

function showAuthMsg(msg, type = 'error') {
    const el = document.getElementById('authMsg');
    if (!el) return;
    el.textContent  = msg;
    el.className    = `auth-msg auth-msg-${type}`;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleAuthPass(id, btn) {
    const inp = document.getElementById(id);
    if (!inp) return;
    inp.type    = inp.type === 'password' ? 'text' : 'password';
    btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function updatePassStrength(val) {
    const bar   = document.getElementById('passStrengthBar');
    const fill  = document.getElementById('passStrengthFill');
    const label = document.getElementById('passStrengthLabel');
    if (!bar || !fill || !label) return;

    if (!val) { bar.style.display = 'none'; label.textContent = ''; return; }
    bar.style.display = 'block';

    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) || /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
        { pct: 20,  color: '#EF4444', text: 'زۆر لاوازە' },
        { pct: 40,  color: '#F97316', text: 'لاوازە' },
        { pct: 60,  color: '#EAB308', text: 'مامناوەندە' },
        { pct: 80,  color: '#22C55E', text: 'باشە' },
        { pct: 100, color: '#10B981', text: '💪 بەهێزە' }
    ];
    const lvl = levels[Math.min(score, 4)];
    fill.style.width      = lvl.pct + '%';
    fill.style.background = lvl.color;
    label.textContent     = lvl.text;
    label.style.color     = lvl.color;
}

// ---- Progress bar helpers ----
function _startProgress() {
    const bar = document.getElementById('authProgressBar');
    if (bar) { bar.style.width = '0'; bar.classList.add('auth-progress-running'); }
}
function _stopProgress() {
    const bar = document.getElementById('authProgressBar');
    if (bar) { bar.classList.remove('auth-progress-running'); bar.style.width = '100%'; setTimeout(() => { bar.style.width = '0'; }, 400); }
}

// ---- Button loading state ----
function _setBtnLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    const textEl = btn.querySelector('.btn-text');
    const iconEl = btn.querySelector('.btn-icon');
    if (loading) {
        btn.dataset.origText = textEl?.textContent || '';
        btn.dataset.origIcon = iconEl?.textContent || '';
        if (textEl) textEl.textContent = 'چاوەڕێ بکە...';
        if (iconEl) iconEl.innerHTML = '<span class="auth-spinner"></span>';
    } else {
        if (textEl && btn.dataset.origText) textEl.textContent = btn.dataset.origText;
        if (iconEl && btn.dataset.origIcon) iconEl.textContent = btn.dataset.origIcon;
    }
}

// ---- Sign In ----
async function handleSignIn() {
    clearAllFieldErrors();
    const email = document.getElementById('siEmail')?.value.trim() || '';
    const pass = document.getElementById('siPass')?.value || '';
    let ok = true;
    if (!validateField('siEmail', [
        { test: v => v.length > 0, msg: '❌ ئیمەیڵ پێویستە' },
        { test: v => EMAIL_RE.test(v), msg: '❌ فۆرماتی ئیمەیڵ نادروستە' }
    ])) ok = false;
    if (!validateField('siPass', [{ test: () => pass.length > 0, msg: '❌ پاسوۆرد پێویستە' }])) ok = false;
    if (!ok) return;
    const btn = document.getElementById('signInBtn');
    _setBtnLoading(btn, true); _startProgress();
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.user) { showAuthMsg(data.error || '❌ نەتوانرا داخل بیت.'); return; }
        setSession(data.user);
        closeAuthModal(); refreshAuthNavUI();
        if (typeof toast === 'function') toast(`✅ بەخێربێی، ${getSession().fullName}!`);
        if (typeof spawnConfetti === 'function') spawnConfetti();
    } catch (_) { showAuthMsg('❌ پەیوەندی بە سێرڤەر نەکرا. دووبارە هەوڵ بدەرەوە.'); }
    finally { _setBtnLoading(btn, false); _stopProgress(); }
}

// ---- Sign Up ----
async function handleSignUp() {
    if (!validateSignUpFields()) return;
    const payload = {
        fullName: document.getElementById('suFull').value.trim(),
        fatherName: document.getElementById('suFather').value.trim(),
        grandfatherName: document.getElementById('suGrand').value.trim(),
        mobile: document.getElementById('suMobile').value.trim(),
        email: document.getElementById('suEmail').value.trim(),
        password: document.getElementById('suPass').value
    };
    const btn = document.getElementById('signUpBtn') || document.querySelector('#authOverlay .auth-btn-primary');
    _setBtnLoading(btn, true); _startProgress();
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.user) { showAuthMsg(data.error || '❌ تۆمارکردن سەرکەوتوو نەبوو.'); return; }
        setSession(data.user);
        closeAuthModal(); refreshAuthNavUI();
        if (typeof toast === 'function') toast(`🎉 ئەژمارەکەت دروست کرا، بەخێربێی ${getSession().fullName}!`);
        if (typeof spawnConfetti === 'function') spawnConfetti();
        if (typeof navigateTo === 'function') navigateTo('account');
    } catch (_) { showAuthMsg('❌ پەیوەندی بە سێرڤەر نەکرا. دووبارە هەوڵ بدەرەوە.'); }
    finally { _setBtnLoading(btn, false); _stopProgress(); }
}

// ---- Forgot Password ----
function handleForgot() {
    showAuthMsg('ڕیسێتی پاسوۆرد هێشتا چالاک نییە؛ پێویستە خزمەتگوزاری Email/SMS بە سێرڤەرەوە پەیوەست بکرێت.');
}

// ---- OTP Verify ----
function handleOTPVerify() {
    showAuthMsg('دڵنیاکردنەوەی OTP هێشتا چالاک نییە؛ هیچ کۆدێک بە شێوەی ڕاستەقینە نانێردرێت.');
}

function handleReset() {
    showAuthMsg('گۆڕینی پاسوۆرد لە ڕێگەی OTP تا پەیوەستکردنی خزمەتگوزاری Email/SMS ناچالاکە.');
}

// ---- OTP input helpers ----
function otpAdvance(el, idx) {
    el.value = el.value.replace(/\D/g, '').slice(0, 1);
    if (el.value && idx < 5) document.getElementById(`otp${idx + 1}`)?.focus();
}

function otpBack(el, e, idx) {
    if (e.key === 'Backspace' && !el.value && idx > 0) {
        document.getElementById(`otp${idx - 1}`)?.focus();
    }
}

function otpPaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
    text.split('').forEach((ch, i) => {
        const inp = document.getElementById(`otp${i}`);
        if (inp) inp.value = ch;
    });
    document.getElementById(`otp${Math.min(text.length, 5)}`)?.focus();
}

// ============================================================
// LICENSE KEY ACTIVATION MODAL
// ============================================================

function showActivateModal() {
    const session = getSession();
    if (!session) { showAuthModal('signin'); return; }

    document.querySelector('.activate-overlay')?.remove();
    const overlay      = document.createElement('div');
    overlay.className  = 'auth-overlay activate-overlay';
    overlay.innerHTML  = `
    <div class="auth-box activate-box">
        <div class="auth-progress-bar" id="activateProgressBar"></div>
        <button class="auth-close-btn" onclick="this.closest('.activate-overlay').remove()" aria-label="داخستن">✕</button>

        <div class="auth-brand">
            <span class="auth-brand-logo">🎫</span>
            <span class="auth-brand-name">چالاکردنی پاکێج</span>
        </div>

        <div class="activate-student-strip">
            <span class="activate-avatar">🎓</span>
            <div>
                <strong>${escHtml(session.fullName)}</strong>
                <span>${escHtml(session.id)}</span>
            </div>
        </div>

        <div class="auth-field">
            <label class="auth-label">🔑 کلیلی مەجاز (License Key)</label>
            <input type="text" id="licKeyInput" class="auth-input auth-input-mono"
                   placeholder="ZIMAN-XXXX-XXXXXX" dir="ltr" autocomplete="off" spellcheck="false"
                   oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9\\-]/g,'');clearActivateMsg()">
        </div>

        <div id="activateMsg" class="auth-msg" style="display:none"></div>

        <button class="auth-btn auth-btn-primary" id="activateBtn" onclick="handleActivateKey()">
            <span class="btn-text">✅ چالاکردن</span>
            <span class="btn-icon"></span>
        </button>
    </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { requestAnimationFrame(() => overlay.classList.add('auth-visible')); });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    setTimeout(() => document.getElementById('licKeyInput')?.focus(), 380);
}

function clearActivateMsg() {
    const m = document.getElementById('activateMsg');
    if (m) m.style.display = 'none';
}

async function handleActivateKey() {
    const key = document.getElementById('licKeyInput')?.value.trim().toUpperCase();
    const msg = document.getElementById('activateMsg');

    if (!key) {
        if (msg) { msg.textContent = '❌ تکایە کلیل داخل بکە.'; msg.className = 'auth-msg auth-msg-error'; msg.style.display = 'block'; }
        return;
    }

    const btn = document.getElementById('activateBtn');
    _setBtnLoading(btn, true);
    const bar = document.getElementById('activateProgressBar');
    if (bar) bar.classList.add('auth-progress-running');

    const res = await activateLicenseKey(key);
        _setBtnLoading(btn, false);
        if (bar) { bar.classList.remove('auth-progress-running'); bar.style.width = '100%'; }

        if (!res.ok) {
            if (msg) { msg.textContent = res.msg; msg.className = 'auth-msg auth-msg-error'; msg.style.display = 'block'; }
            // Shake the input
            const inp = document.getElementById('licKeyInput');
            if (inp) { inp.classList.add('shake-err'); setTimeout(() => inp.classList.remove('shake-err'), 500); }
            return;
        }

        if (msg) {
            msg.innerHTML = `<strong>🎉 پاکێجی ${escHtml(res.pkgName)} بە سەرکەوتوویی چالاک کرا!</strong>`;
            msg.className = 'auth-msg auth-msg-success auth-msg-big';
            msg.style.display = 'block';
        }

        if (typeof toast === 'function') toast(`🎉 ${res.pkgName} چالاک کرا!`);
        if (typeof spawnConfetti === 'function') spawnConfetti();

        setTimeout(() => {
            document.querySelector('.activate-overlay')?.remove();
            refreshAuthNavUI();
            if (typeof navigateTo === 'function') navigateTo('account');
        }, 1200);
}

// ============================================================
// DEBUG CONSOLE  — v2: collapsible, search, copy-all
// ============================================================

let _debugOpen    = false;
let _dcActiveTab  = 'log';
let _dcKeyFilter  = '';
let _dcCollapsed  = {};  // pkg -> bool

function buildDebugConsoleHTML() {
    const log      = getDebugLog();
    const usedKeys = getUsedKeys();
    const users    = getUsers();
    const session  = getSession();

    // ---- Activity Log ----
    const logHTML = log.length === 0
        ? `<div class="dc-empty">هێشتا هیچ چالاکییەک نیە...</div>`
        : log.map((e, i) => `
            <div class="dc-entry dc-entry-${e.type || 'info'}" style="animation-delay:${Math.min(i*0.03,0.3)}s">
                <div class="dc-entry-header">
                    <span class="dc-icon">${e.icon || '📌'}</span>
                    <span class="dc-label">${escHtml(e.label || '')}</span>
                    <span class="dc-ts">${new Date(e.ts).toLocaleTimeString('en-GB')}</span>
                </div>
                ${e.otp ? `
                <div class="dc-otp-reveal">
                    <span class="dc-otp-label">کۆدی OTP:</span>
                    <strong class="dc-otp-code" id="otpCode${i}">${escHtml(e.otp)}</strong>
                    <button class="dc-copy-btn" onclick="
                        navigator.clipboard.writeText('${escHtml(e.otp)}')
                            .then(()=>{ this.textContent='✅ کۆپی کرا!'; setTimeout(()=>this.textContent='📋 کۆپی',1500); })">
                        📋 کۆپی
                    </button>
                </div>` : ''}
                ${e.subject ? `<div class="dc-email-subject">📌 ${escHtml(e.subject)}</div>` : ''}
                ${e.body ? `<pre class="dc-body">${escHtml(e.body)}</pre>` : ''}
            </div>`).join('');

    // ---- License Keys ----
    const filteredEntries = Object.entries(LICENSE_KEYS).map(([pkg, keys]) => {
        const filtered = _dcKeyFilter
            ? keys.filter(k => k.toLowerCase().includes(_dcKeyFilter.toLowerCase()))
            : keys;
        return { pkg, keys: filtered, all: keys };
    });

    const keysHTML = `
        <div class="dc-keys-search-wrap">
            <input type="text" class="dc-search" placeholder="🔍 گەڕان لە کلیلەکان..."
                   value="${escHtml(_dcKeyFilter)}"
                   oninput="_dcKeyFilter=this.value;refreshDebugConsole();switchDCTab('keys')">
        </div>
        ${filteredEntries.map(({ pkg, keys, all }) => {
            const avail  = all.filter(k => !usedKeys.includes(k));
            const used   = all.filter(k =>  usedKeys.includes(k));
            const isOpen = !_dcCollapsed[pkg];
            const availFiltered = keys.filter(k => !usedKeys.includes(k));
            return `
            <div class="dc-keys-pkg" id="dcpkg-${pkg}">
                <div class="dc-keys-pkg-header" onclick="_dcCollapsed['${pkg}']=!_dcCollapsed['${pkg}'];refreshDebugConsole();switchDCTab('keys')" style="cursor:pointer">
                    <span class="dc-pkg-toggle">${isOpen ? '▼' : '▶'}</span>
                    <span class="dc-pkg-icon">${PACKAGE_ICONS[pkg] || '🎫'}</span>
                    <span class="dc-pkg-name">${escHtml(PACKAGE_NAMES[pkg] || pkg)}</span>
                    <span class="dc-badge dc-badge-green">${avail.length} بەردەست</span>
                    <span class="dc-badge dc-badge-red">${used.length} بەکارچووە</span>
                    ${availFiltered.length > 0 ? `
                    <button class="dc-copy-all-btn" onclick="event.stopPropagation();
                        navigator.clipboard.writeText(\`${availFiltered.join('\\n')}\`)\n                            .then(()=>{ this.textContent='✅ کۆپی کرا!'; setTimeout(()=>this.textContent='📋 هەمووی',1500); })">
                        📋 هەمووی
                    </button>` : ''}
                </div>
                ${isOpen ? `
                <div class="dc-keys-grid">
                    ${keys.map(k => {
                        const isUsed = usedKeys.includes(k);
                        return `
                        <div class="dc-key ${isUsed ? 'dc-key-used' : 'dc-key-avail'}">
                            <code class="dc-key-code">${escHtml(k)}</code>
                            ${!isUsed
                                ? `<button class="dc-mini-copy" title="کۆپی"
                                       onclick="navigator.clipboard.writeText('${escHtml(k)}').then(()=>{ this.textContent='✅'; setTimeout(()=>this.textContent='📋',1500); })">📋</button>`
                                : `<span class="dc-used-x">✗ بەکارچووە</span>`}
                        </div>`;
                    }).join('')}
                </div>` : ''}
            </div>`;
        }).join('')}`;

    // ---- Students ----
    const usersHTML = users.length === 0
        ? `<div class="dc-empty">هیچ فێرخوازێک تۆمار نەکراوە.</div>`
        : users.map(u => `
        <div class="dc-user-card ${session && session.id === u.id ? 'dc-user-active' : ''}">
            <div class="dc-user-top">
                <div class="dc-user-avatar">${u.verified ? '🎓' : '⏳'}</div>
                <div class="dc-user-meta">
                    <strong>${escHtml(u.fullName)}</strong>
                    <span class="dc-user-id">${escHtml(u.id)}</span>
                    ${session && session.id === u.id ? '<span class="dc-active-badge">● چالاک</span>' : ''}
                </div>
                <div class="dc-user-status">${u.verified ? '<span class="dc-verified">✅</span>' : '<span class="dc-unverified">⏳</span>'}</div>
            </div>
            <div class="dc-user-details">
                <div class="dc-user-detail-row"><span>📧</span><code>${escHtml(u.email)}</code></div>
                <div class="dc-user-detail-row"><span>📱</span><code>${escHtml(u.mobile)}</code></div>
                <div class="dc-user-detail-row"><span>🔐</span><code>پاسوۆرد بۆ پاراستنا نهێنی ناهێتە پیشاندان</code></div>
                <div class="dc-user-detail-row"><span>🎫</span>
                    ${u.activatedPackages?.length
                        ? u.activatedPackages.map(p => `<span class="dc-pkg-pill" style="background:${PACKAGE_COLORS[p]}22;color:${PACKAGE_COLORS[p]};border:1px solid ${PACKAGE_COLORS[p]}44">${PACKAGE_ICONS[p]} ${p}</span>`).join('')
                        : '<span style="color:#475569">هیچ پاکێجێک نیە</span>'}
                </div>
            </div>
        </div>`).join('');

    const tabDefs = [
        { id: 'log',   label: `📋 چالاکییەکان`, count: log.length },
        { id: 'keys',  label: `🎫 کلیلەکان`,    count: '' },
        { id: 'users', label: `👥 فێرخوازەکان`, count: users.length }
    ];

    return `
    <div class="dc-header">
        <div class="dc-header-left">
            <span class="dc-dot dc-dot-red"></span>
            <span class="dc-dot dc-dot-yellow"></span>
            <span class="dc-dot dc-dot-green"></span>
            <span class="dc-title">Developer Console</span>
            <span class="dc-sim-badge">⚡ SIM</span>
        </div>
        <div class="dc-header-right">
            <button class="dc-icon-btn" title="پاككردنی لۆگ"
                onclick="authSet('zm_debug_log','[]');_dcKeyFilter='';refreshDebugConsole()">🗑️</button>
            <button class="dc-icon-btn" title="داخستن" onclick="closeDebugConsole()">✕</button>
        </div>
    </div>

    <div class="dc-tabs">
        ${tabDefs.map(t => `
        <button class="dc-tab ${_dcActiveTab === t.id ? 'dc-tab-active' : ''}"
                onclick="switchDCTab('${t.id}')">
            ${t.label}${t.count !== '' ? ` <span class="dc-tab-count">${t.count}</span>` : ''}
        </button>`).join('')}
    </div>

    <div class="dc-pane-wrap">
        <div class="dc-pane ${_dcActiveTab === 'log'   ? 'dc-pane-active' : ''}" id="dcPane-log">${logHTML}</div>
        <div class="dc-pane ${_dcActiveTab === 'keys'  ? 'dc-pane-active' : ''}" id="dcPane-keys">${keysHTML}</div>
        <div class="dc-pane ${_dcActiveTab === 'users' ? 'dc-pane-active' : ''}" id="dcPane-users">${usersHTML}</div>
    </div>`;
}

function switchDCTab(tab) {
    _dcActiveTab = tab;
    document.querySelectorAll('.dc-tab').forEach(t => {
        t.classList.toggle('dc-tab-active', t.textContent.trim().startsWith(
            { log: '📋', keys: '🎫', users: '👥' }[tab] || ''));
    });
    document.querySelectorAll('.dc-pane').forEach(p => p.classList.remove('dc-pane-active'));
    const pane = document.getElementById(`dcPane-${tab}`);
    if (pane) pane.classList.add('dc-pane-active');
}

function openDebugConsole() {
    const _sess = getSession();
    if (!_sess?.isAdmin && !window._devUnlocked) return;
    _debugOpen = true;
    let dc = document.getElementById('debugConsole');
    if (!dc) {
        dc = document.createElement('div');
        dc.id        = 'debugConsole';
        dc.className = 'debug-console';
        document.body.appendChild(dc);
    }
    dc.innerHTML = buildDebugConsoleHTML();
    requestAnimationFrame(() => dc.classList.add('dc-open'));
    const fab = document.getElementById('debugFAB');
    if (fab) fab.classList.add('dc-fab-active');
}

function closeDebugConsole() {
    _debugOpen = false;
    const dc = document.getElementById('debugConsole');
    if (dc) dc.classList.remove('dc-open');
    const fab = document.getElementById('debugFAB');
    if (fab) fab.classList.remove('dc-fab-active');
}

function toggleDebugConsole() {
    _debugOpen ? closeDebugConsole() : openDebugConsole();
}

function refreshDebugConsole() {
    if (!_debugOpen) return;
    const dc = document.getElementById('debugConsole');
    if (!dc?.classList.contains('dc-open')) return;
    const scrollTop = dc.querySelector('.dc-pane-wrap')?.scrollTop || 0;
    dc.innerHTML = buildDebugConsoleHTML();
    const wrap = dc.querySelector('.dc-pane-wrap');
    if (wrap) wrap.scrollTop = scrollTop;
}

// ============================================================
// STUDENT DASHBOARD PAGE  — full rich layout
// ============================================================

function renderAccount(c) {
    const session = getSession();

    if (!session) {
        c.innerHTML = `
        <div class="auth-gate">
            <div class="auth-gate-icon">🔐</div>
            <h2>داخل نەبووی</h2>
            <p>تکایە داخل بوو تا داشبۆردی خۆت ببینیت</p>
            <div class="auth-gate-btns">
                <button class="btn btn-primary" onclick="showAuthModal('signin')">چوونەژوورەوە</button>
                <button class="btn" onclick="showAuthModal('signup')">تۆمارکردنی ئەژمارەی نوێ</button>
            </div>
        </div>`;
        return;
    }

    const pkgs = session.activatedPackages || [];
    const hasPackage = pkgs.length > 0;

    // XP and level from app state
    const xp     = (typeof state !== 'undefined') ? (state.user?.xp     || 0) : 0;
    const streak = (typeof state !== 'undefined') ? (state.user?.streak  || 0) : 0;
    const words  = (typeof state !== 'undefined') ? (state.user?.totalWords || 0) : 0;
    const level  = (typeof state !== 'undefined') ? (state.user?.level   || 1) : 1;

    const memberSince = new Date(session.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

    c.innerHTML = `
    <div class="dash-hero">
        <div class="dash-hero-bg"></div>
        <div class="dash-hero-content">
            <div class="dash-avatar">${hasPackage ? '🎓' : '👤'}</div>
            <div class="dash-hero-info">
                <h2 class="dash-name">${escHtml(session.fullName)}</h2>
                <div class="dash-student-id">
                    <span>🆔</span>
                    <code>${escHtml(session.studentID || session.id)}</code>
                    <button class="dash-copy-id" onclick="navigator.clipboard.writeText('${escHtml(session.studentID || session.id)}').then(()=>toast('✅ ID کۆپی کرا!'))" title="کۆپی">📋</button>
                </div>
                <div class="dash-status-row">
                    <span class="dash-badge-verified">✅ تۆمارکراو</span>
                    ${hasPackage ? `<span class="dash-badge-premium">${PACKAGE_ICONS[pkgs[0]]} ${pkgs[0].charAt(0).toUpperCase()+pkgs[0].slice(1)}</span>` : ''}
                </div>
            </div>
        </div>
    </div>

    <div class="dash-stats-row">
        <div class="dash-stat">
            <span class="dash-stat-icon">⭐</span>
            <strong>${xp.toLocaleString()}</strong>
            <span>XP</span>
        </div>
        <div class="dash-stat">
            <span class="dash-stat-icon">🔥</span>
            <strong>${streak}</strong>
            <span>ستریک</span>
        </div>
        <div class="dash-stat">
            <span class="dash-stat-icon">📚</span>
            <strong>${words}</strong>
            <span>وشە</span>
        </div>
        <div class="dash-stat">
            <span class="dash-stat-icon">🏅</span>
            <strong>${level}</strong>
            <span>ئاست</span>
        </div>
    </div>

    <div class="card dash-section">
        <div class="dash-section-header">
            <h3>🎫 پاکێجەکانم</h3>
            <button class="dash-link-btn" onclick="showActivateModal()">+ چالاکردنی نوێ</button>
        </div>
        ${hasPackage
            ? `<div class="dash-pkg-list">
                ${pkgs.map(p => `
                <div class="dash-pkg-item" style="border-right-color:${PACKAGE_COLORS[p] || '#4F46E5'}">
                    <span class="dash-pkg-icon-lg">${PACKAGE_ICONS[p] || '🎫'}</span>
                    <div>
                        <strong style="color:${PACKAGE_COLORS[p] || '#4F46E5'}">${p.charAt(0).toUpperCase()+p.slice(1)}</strong>
                        <span>${PACKAGE_NAMES[p]}</span>
                    </div>
                    <span class="dash-pkg-active-dot">✅ چالاک</span>
                </div>`).join('')}
               </div>`
            : `<div class="dash-no-pkg">
                <p>هیچ پاکێجێک چالاک نەکراوە</p>
                <button class="btn btn-primary btn-sm" onclick="showActivateModal()">🔑 چالاکردنی پاکێج</button>
               </div>`}
    </div>

    <div class="card dash-section">
        <div class="dash-section-header">
            <h3>📋 زانیاری کەسی</h3>
        </div>
        <div class="dash-info-grid">
            <div class="dash-info-item"><span>👤 ناو</span><strong>${escHtml(session.fullName)}</strong></div>
            <div class="dash-info-item"><span>👨 باوک</span><strong>${escHtml(session.fatherName || '—')}</strong></div>
            <div class="dash-info-item"><span>👴 باپیر</span><strong>${escHtml(session.grandfatherName || '—')}</strong></div>
            <div class="dash-info-item"><span>📱 مۆبایل</span><strong dir="ltr">${escHtml(session.mobile || '—')}</strong></div>
            <div class="dash-info-item"><span>📧 ئیمەیڵ</span><strong dir="ltr" style="font-size:12px">${escHtml(session.email)}</strong></div>
            <div class="dash-info-item"><span>📅 تۆمارکراوە</span><strong>${memberSince}</strong></div>
        </div>
    </div>

    <div class="card dash-section">
        <div class="dash-section-header"><h3>⚡ کردارە خێراکان</h3></div>
        <div class="dash-quick-grid">
            <button class="dash-quick-btn" onclick="typeof navigateTo==='function'&&navigateTo('lessons')">
                <span>📚</span><span>وانەکان</span>
            </button>
            <button class="dash-quick-btn" onclick="typeof navigateTo==='function'&&navigateTo('quiz')">
                <span>📝</span><span>کویز</span>
            </button>
            <button class="dash-quick-btn" onclick="typeof navigateTo==='function'&&navigateTo('ai-teacher')">
                <span>🤖</span><span>AI مامۆستا</span>
            </button>
            <button class="dash-quick-btn" onclick="showActivateModal()">
                <span>🔑</span><span>کلیل</span>
            </button>
        </div>
    </div>

    <div class="dash-footer-row">
        ${getSession()?.isAdmin ? '<button class="dash-dev-btn" onclick="openDebugConsole()">🛠️ Dev Console</button>' : ''}
        <button class="dash-logout-btn" onclick="authLogout()">🚪 چوونەدەرەوە</button>
    </div>`;
}

// ============================================================
// NAV UI REFRESH
// ============================================================

function _getOTPValue() {
    return [0,1,2,3,4,5].map(i => document.getElementById(`otp${i}`)?.value || '').join('');
}

function refreshAuthNavUI() {
    const session = getSession();
    const btn     = document.getElementById('authNavBtn');
    const name    = document.getElementById('menuName');
    const avatar  = document.getElementById('menuAvatar');

    if (btn) {
        if (session) {
            btn.textContent = `🎓 ${session.fullName.split(' ')[0]}`;
            btn.onclick     = () => navigateTo('account');
            btn.classList.add('auth-nav-btn-active');
        } else {
            btn.textContent = '🔐 داخلبوون';
            btn.onclick     = () => showAuthModal('signin');
            btn.classList.remove('auth-nav-btn-active');
        }
    }
    if (name)   name.textContent   = session ? session.fullName : (typeof lsGet === 'function' ? lsGet('zm_name','فێرخواز') : 'فێرخواز');
    if (avatar) avatar.textContent = session ? '🎓' : '👤';
}


// ===== SECRET DEV UNLOCK — 5 rapid taps on XP ring =====
let _xpTapCount = 0, _xpTapTimer = null;
function _xpRingTap() {
    _xpTapCount++;
    clearTimeout(_xpTapTimer);
    _xpTapTimer = setTimeout(() => { _xpTapCount = 0; }, 1800);
    if (_xpTapCount >= 5) {
        _xpTapCount = 0;
        window._devUnlocked = true;
        injectDebugFAB();
        openDebugConsole();
        if (typeof toast === 'function') toast('🛠️ Developer Mode فامکراوەتەوە');
    }
}
window._xpRingTap = _xpRingTap;
// ============================================================
// FLOATING DEBUG FAB
// ============================================================

function injectDebugFAB() {
    // Only visible to admins or when secret XP-ring trigger is used
    const sess = getSession();
    if (!sess?.isAdmin && !window._devUnlocked) return;
    if (document.getElementById('debugFAB')) return;
    const fab       = document.createElement('button');
    fab.id          = 'debugFAB';
    fab.className   = 'debug-fab';
    fab.setAttribute('aria-label', 'Developer Debug Console');
    fab.setAttribute('title', 'Developer Debug Console');
    fab.innerHTML   = `<span class="debug-fab-icon">🛠️</span><span class="debug-fab-label">Dev</span>`;
    fab.onclick     = toggleDebugConsole;
    document.body.appendChild(fab);
}

// ============================================================
// INIT — runs after DOM ready, restores session from localStorage
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject FAB
    injectDebugFAB();

    // 2. Register account page renderer
    if (typeof pageRenderers !== 'undefined') {
        pageRenderers['account'] = renderAccount;
    }

    // 3. Inject auth button into header
    const headerStats = document.querySelector('.header-stats');
    if (headerStats && !document.getElementById('authNavBtn')) {
        const authBtn      = document.createElement('button');
        authBtn.id         = 'authNavBtn';
        authBtn.className  = 'auth-nav-btn';
        authBtn.innerHTML  = '🔐 داخلبوون';
        authBtn.onclick    = () => showAuthModal('signin');
        headerStats.parentNode.insertBefore(authBtn, headerStats.nextSibling);
    }

    // 4. Add "ئەژمارەکەم" to side menu (only once)
    const menuLists = document.querySelectorAll('.side-menu .menu-list');
    if (menuLists.length > 0 && !document.querySelector('[data-nav="account"]')) {
        const li = document.createElement('li');
        li.setAttribute('role', 'listitem');
        li.innerHTML = `<button onclick="navigateTo('account')" data-nav="account"><span aria-hidden="true">🎓</span> ئەژمارەکەم</button>`;
        menuLists[0].insertBefore(li, menuLists[0].firstChild);
    }

    // Remove old insecure browser-side credential/session caches from earlier builds.
    try { localStorage.removeItem('zm_auth_users'); localStorage.removeItem('zm_auth_session'); localStorage.removeItem('zm_debug_log'); } catch (_) {}

    // 5. Restore identity from the server-side HttpOnly session cookie.
    refreshAuthNavUI();
    fetch('/api/auth/session', { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : { user: null })
        .then(data => { setSession(data.user || null); refreshAuthNavUI(); })
        .catch(() => { setSession(null); refreshAuthNavUI(); });

    // 7. Keyboard shortcuts
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.getElementById('authOverlay')?.remove();
            document.querySelector('.activate-overlay')?.remove();
            closeDebugConsole();
        }
    });
});

// ============================================================
// GLOBAL EXPORTS
// ============================================================

window.showAuthModal       = showAuthModal;
window.closeAuthModal      = closeAuthModal;
window.handleSignIn        = handleSignIn;
window.handleSignUp        = handleSignUp;
window.handleForgot        = handleForgot;
window.handleOTPVerify     = handleOTPVerify;
window.handleReset         = handleReset;
window.toggleAuthPass      = toggleAuthPass;
window.updatePassStrength  = updatePassStrength;
window.otpAdvance          = otpAdvance;
window.otpBack             = otpBack;
window.otpPaste            = otpPaste;
window.authLogout          = authLogout;
window.showActivateModal   = showActivateModal;
window.handleActivateKey   = handleActivateKey;
window.clearActivateMsg    = clearActivateMsg;
window.openDebugConsole    = openDebugConsole;
window.closeDebugConsole   = closeDebugConsole;
window.toggleDebugConsole  = toggleDebugConsole;
window.refreshDebugConsole = refreshDebugConsole;
window.switchDCTab         = switchDCTab;
window.authSet             = authSet;
window.clearFieldError     = clearFieldError;
window._resendOTP          = _resendOTP;
window._dcKeyFilter        = _dcKeyFilter;
window._dcCollapsed        = _dcCollapsed;
