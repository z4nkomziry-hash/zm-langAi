// ============================================
// ZIMAN - App Logic  (Phase 1 — fixed & hardened)
// ============================================

// ===== SAFE localStorage HELPERS =====
// Wraps every read in try/catch so corrupted data never crashes startup.

function lsGet(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? raw : fallback;
    } catch (e) {
        return fallback;
    }
}

function lsGetJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage full or blocked */ }
}

// ===== APPLICATION STATE =====
const state = {
    user: {
        name:       lsGet('zm_name', 'فێرخواز'),
        level:      parseInt(lsGet('zm_level', '1'))  || 1,
        xp:         parseInt(lsGet('zm_xp',    '0'))  || 0,
        coins:      parseInt(lsGet('zm_coins', '100')) || 100,
        gems:       parseInt(lsGet('zm_gems',  '50'))  || 50,
        hearts:     parseInt(lsGet('zm_hearts','5'))   || 5,
        streak:     parseInt(lsGet('zm_streak','0'))   || 0,
        lastLogin:  lsGet('zm_lastLogin', null),
        totalWords: parseInt(lsGet('zm_words', '0'))   || 0,
    },
    settings: {
        darkMode:        lsGet('zm_dark',  'false') === 'true',
        amoledMode:      lsGet('zm_amoled','false') === 'true',
        currentLanguage: lsGet('zm_lang', 'en-ku'),
    },
    learning: {
        history:   lsGetJSON('zm_history',   []),
        bookmarks: lsGetJSON('zm_bookmarks', []),
        notes:     lsGetJSON('zm_notes',     {}),
    },
    currentPage:     'home',
    selectedPackage: null,
    selectedPayment: null,
};

// ===== LESSONS DATA =====
const lessons = {
    'en-ku': { name: 'ئینگلیزی → کوردی', icon: '🇬🇧', topics: [
        { id:1, title:'ئەلفوبێ',    words:['A=ئەی','B=بی','C=سی','D=دی','E=ئی','F=ئێف','G=جی','H=ئەیچ','I=ئای','J=جەی'] },
        { id:2, title:'سڵاوکردن',   words:['Hello=سڵاو','Good morning=بەیانیت باش','Thank you=سوپاس','Goodbye=خواحافیزی','Please=تکایە','You\'re welcome=خۆشەویستانە','Sorry=ببووربە','Excuse me=ببووربە'] },
        { id:3, title:'ژمارەکان',   words:['One=یەک','Two=دوو','Three=سێ','Four=چوار','Five=پێنج','Six=شەش','Seven=حەوت','Eight=هەشت','Nine=نۆ','Ten=دە'] },
        { id:4, title:'ڕەنگەکان',   words:['Red=سوور','Blue=شین','Green=سەوز','Yellow=زەرد','Black=ڕەش','White=سپی','Orange=نارەنجی','Purple=مۆر'] },
        { id:5, title:'خێزان',      words:['Mother=دایک','Father=باوک','Sister=خوشک','Brother=برا','Family=خێزان','Son=کوڕ','Daughter=کچ','Grandfather=باپیر'] },
        { id:6, title:'خواردن',     words:['Water=ئاو','Bread=نان','Rice=برنج','Meat=گۆشت','Tea=چا','Milk=شیر','Egg=هێلکە','Fruit=مێوە'] },
        { id:7, title:'گەشت',       words:['Airport=فڕۆکەخانە','Hotel=هوتێل','Taxi=تاکسی','Ticket=بلیت','Map=نەخشە','Passport=پاسپۆرت','Bag=جانتا','Train=شەمەندەفەر'] },
    ]},
    'ar-ku': { name:'عەرەبی → کوردی', icon:'🇸🇦', topics:[
        { id:1, title:'تحيات', words:['السلام عليكم=سڵاو','صباح الخير=بەیانیت باش','شكراً=سوپاس','كيف حالك=چۆنی','مع السلامة=خواحافیزی'] },
    ]},
    'tr-ku': { name:'تورکی → کوردی', icon:'🇹🇷', topics:[
        { id:1, title:'Selamlaşma', words:['Merhaba=سڵاو','Günaydın=بەیانیت باش','Teşekkürler=سوپاس','Nasılsın=چۆنی','Hoşça kal=خواحافیزی'] },
    ]},
    'fa-ku': { name:'فارسی → کوردی', icon:'🇮🇷', topics:[
        { id:1, title:'احوالپرسی', words:['سلام=سڵاو','خوبی=چۆنی','متشکرم=سوپاس','خداحافظ=خواحافیزی','لطفاً=تکایە'] },
    ]},
    'de-ku': { name:'ئەڵمانی → کوردی', icon:'🇩🇪', topics:[
        { id:1, title:'Begrüßung', words:['Hallo=سڵاو','Guten Morgen=بەیانیت باش','Danke=سوپاس','Auf Wiedersehen=خواحافیزی','Bitte=تکایە'] },
    ]},
    'fr-ku': { name:'فەرەنسی → کوردی', icon:'🇫🇷', topics:[
        { id:1, title:'Salutations', words:['Bonjour=سڵاو','Merci=سوپاس','Au revoir=خواحافیزی','S\'il vous plaît=تکایە','Comment allez-vous=چۆنی'] },
    ]},
    'es-ku': { name:'ئیسپانی → کوردی', icon:'🇪🇸', topics:[
        { id:1, title:'Saludos', words:['Hola=سڵاو','Gracias=سوپاس','Adiós=خواحافیزی','Por favor=تکایە','Buenos días=بەیانیت باش'] },
    ]},
    'ru-ku': { name:'ڕووسی → کوردی', icon:'🇷🇺', topics:[
        { id:1, title:'Приветствия', words:['Привет=سڵاو','Спасибо=سوپاس','До свидания=خواحافیزی','Пожалуйста=تکایە','Как дела=چۆنی'] },
    ]},
    'zh-ku': { name:'چینی → کوردی', icon:'🇨🇳', topics:[
        { id:1, title:'问候', words:['你好=سڵاو','谢谢=سوپاس','再见=خواحافیزی','请=تکایە','你好吗=چۆنی'] },
    ]},
    'ja-ku': { name:'ژاپۆنی → کوردی', icon:'🇯🇵', topics:[
        { id:1, title:'挨拶', words:['こんにちは=سڵاو','ありがとう=سوپاس','さようなら=خواحافیزی','お願いします=تکایە','お元気ですか=چۆنی'] },
    ]},
    'ko-ku': { name:'کۆری → کوردی', icon:'🇰🇷', topics:[
        { id:1, title:'인사', words:['안녕하세요=سڵاو','감사합니다=سوپاس','안녕히 계세요=خواحافیزی','부탁합니다=تکایە','잘 지내세요=چۆنی'] },
    ]},
};

// ===== PACKAGES =====
const packages = {
    free:     { name:'Free',     price:'$0',     period:'هەمیشە', color:'#9CA3AF', features:['بەشێک لە وانەکان','AI بە سنوور','ڕیکلام هەیە'],                                                    btnText:'بەردەستە' },
    plus:     { name:'Plus',     price:'$5.99',  period:'مانگ',   color:'#3B82F6', features:['١٠ زمان','AI زیاتر','بێ ڕیکلام','Progress Reports'],                                            btnText:'Buy Now', hasPayment:true },
    premium:  { name:'Premium',  price:'$9.99',  period:'مانگ',   color:'#8B5CF6', features:['هەموو ١٥ زمان','هەموو AI','Offline','Certificates','Priority Support'],                          btnText:'Buy Now', featured:true, hasPayment:true },
    family:   { name:'Family',   price:'$14.99', period:'مانگ',   color:'#10B981', features:['تا ٦ ئەندام','Dashboard خێزان','Family Leaderboard'],                                           btnText:'Buy Now', hasPayment:true },
    student:  { name:'Student',  price:'$4.99',  period:'مانگ',   color:'#F59E0B', features:['نرخی کەمتر','هەموو Premium'],                                                                   btnText:'Buy Now', hasPayment:true },
    business: { name:'Business', price:'$29.99', period:'مانگ',   color:'#EC4899', features:['بۆ کۆمپانیاکان','Dashboard تایبەت','بەڕێوەبردنی تیم'],                                        btnText:'Contact Us', hasPayment:true },
};

const paymentMethods = ['FIB','FastPay','USDT (TRC20)','Korek Card','Zain Card','Asia Card','Qi Card','Apple Gift Card','iTunes Gift Card'];

// ===== ACTIVE TIMER REGISTRY =====
// All interval/timeout IDs are stored here so navigateTo() can clean them up.
const _timers = { intervals: [], timeouts: [] };

function _trackInterval(id)  { _timers.intervals.push(id); return id; }
function _trackTimeout(id)   { _timers.timeouts.push(id);  return id; }

function _clearAllTimers() {
    _timers.intervals.forEach(id => clearInterval(id));
    _timers.timeouts.forEach(id  => clearTimeout(id));
    _timers.intervals.length = 0;
    _timers.timeouts.length  = 0;
}

// ===== PERSIST STATE =====
function save() {
    const u = state.user;
    lsSet('zm_name',      u.name);
    lsSet('zm_level',     u.level);
    lsSet('zm_xp',        u.xp);
    lsSet('zm_coins',     u.coins);
    lsSet('zm_gems',      u.gems);
    lsSet('zm_hearts',    u.hearts);
    lsSet('zm_streak',    u.streak);
    lsSet('zm_lastLogin', u.lastLogin);
    lsSet('zm_words',     u.totalWords);

    try { lsSet('zm_history',   JSON.stringify(state.learning.history));   } catch(e) {}
    try { lsSet('zm_bookmarks', JSON.stringify(state.learning.bookmarks)); } catch(e) {}
    try { lsSet('zm_notes',     JSON.stringify(state.learning.notes));     } catch(e) {}

    updateUI();
}

// ===== UPDATE HEADER UI =====
// Previously had a broken forEach loop — replaced with explicit, safe assignments.
function updateUI() {
    const u = state.user;

    const streak = document.getElementById('hStreak');
    const xp     = document.getElementById('hXP');
    const gems   = document.getElementById('hGems');
    const coins  = document.getElementById('hCoins');
    const lvl    = document.getElementById('menuLevel');
    const name   = document.getElementById('menuName');

    if (streak) streak.textContent = u.streak;
    if (xp)     xp.textContent     = u.xp;
    if (gems)   gems.textContent   = u.gems;
    if (coins)  coins.textContent  = u.coins;
    if (lvl)    lvl.textContent    = `ئاست ${u.level}`;
    if (name)   name.textContent   = u.name;
}

// ===== TOAST NOTIFICATIONS =====
function toast(msg) {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className   = 'toast';
    t.textContent = msg;
    c.appendChild(t);
    // Fade out then remove
    _trackTimeout(setTimeout(() => {
        t.style.transition = 'opacity 0.3s ease';
        t.style.opacity    = '0';
        _trackTimeout(setTimeout(() => { if (t.parentNode) t.remove(); }, 300));
    }, 2500));
}

// ===== AUDIO =====
function speakWord(word, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = lang;
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
    }
}

function playBeep(freq = 600, dur = 0.1) {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext; // fixed: added window.
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
    } catch (e) { /* AudioContext unavailable — silent fail */ }
}

// ===== CONFETTI =====
function spawnConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    // Use current viewport dimensions
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#4F46E5','#0EA5E9','#F59E0B','#EF4444','#10B981','#8B5CF6'];
    const ps = Array.from({ length: 100 }, () => ({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -12 - 4,
        s: Math.random() * 8 + 4,
        c: colors[Math.floor(Math.random() * colors.length)],
        l: 1,
        decay: 0.01 + 0.005 * Math.random(),
        g: 0.15,
    }));

    let rafId;
    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        ps.forEach(p => {
            p.vy += p.g;
            p.x  += p.vx;
            p.y  += p.vy;
            p.l  -= p.decay;
            if (p.l > 0) {
                alive = true;
                ctx.globalAlpha = p.l;
                ctx.fillStyle   = p.c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        if (alive) rafId = requestAnimationFrame(draw);
    })();

    // Auto-cancel if the user navigates away mid-animation
    _trackTimeout(setTimeout(() => cancelAnimationFrame(rafId), 4000));
}

// ===== MENU HELPERS =====
function closeMenu() {
    const menu    = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const btn     = document.getElementById('menuBtn');
    if (menu)    menu.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (btn)     btn.setAttribute('aria-expanded', 'false');
}

function openMenu() {
    const menu    = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const btn     = document.getElementById('menuBtn');
    if (menu)    menu.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (btn)     btn.setAttribute('aria-expanded', 'true');
}

// ===== NAVIGATION =====
const pageRenderers = {
    home:        renderHome,
    lessons:     renderLessons,
    flashcards:  renderFlashcards,
    quiz:        renderQuiz,
    'speed-quiz':renderSpeedQuiz,
    listening:   renderListening,
    speaking:    renderSpeaking,
    reading:     renderReading,
    writing:     renderWriting,
    'ai-teacher':renderAITeacher,
    progress:    renderProgress,
    achievements:renderAchievements,
    community:   renderCommunity,
    packages:    renderPackages,
    sponsor:     renderSponsor,
    contact:     renderContact,
    settings:    renderSettings,
};

function navigateTo(page) {
    // 1. Clear any lingering timers from the previous page (e.g. speed-quiz countdown)
    _clearAllTimers();

    // 2. Close the side menu on mobile
    closeMenu();

    state.currentPage = page;
    const main = document.getElementById('mainContent');
    if (!main) return;

    // 3. Render the requested page
    if (pageRenderers[page]) {
        main.innerHTML = '';
        pageRenderers[page](main);
    }

    // 4. Update active state in SIDE MENU (uses data-nav attribute — no brittle string matching)
    document.querySelectorAll('.side-menu .menu-list li button').forEach(btn => {
        const isActive = btn.dataset.nav === page;
        btn.classList.toggle('active', isActive);
    });

    // 5. Update active state in BOTTOM NAV (same approach)
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
        const isActive = btn.dataset.nav === page;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // 6. Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 7. Move focus to main content for keyboard/screen-reader users
    main.focus();
}

// ===== PAGE: HOME =====
function renderHome(c) {
    const u = state.user;
    const xpToNext = 1000;
    const xpProgress = ((u.xp % xpToNext) / xpToNext * 100).toFixed(1);

    c.innerHTML = `
        <div class="card gradient-primary" style="color:#fff;margin-bottom:12px">
            <h2 style="font-size:18px;margin-bottom:4px">👋 سڵاو، ${escHtml(u.name)}!</h2>
            <p style="opacity:.88;font-size:14px">ئاست ${u.level} • ⭐ ${u.xp} XP</p>
            <div class="progress-bar" style="margin:10px 0;background:rgba(255,255,255,.3)">
                <div class="progress-fill" style="width:${xpProgress}%;background:#fff"></div>
            </div>
            <p style="font-size:11px;opacity:.75">${Math.round((1 - xpProgress / 100) * xpToNext)} XP بۆ ئاستی داهاتوو</p>
        </div>

        <div class="grid-4" style="margin-bottom:12px">
            <div class="card" style="text-align:center;padding:14px 8px;cursor:default">
                <div style="font-size:24px">🔥</div>
                <strong style="font-size:16px">${u.streak}</strong>
                <p style="font-size:10px;color:var(--text-secondary);margin-top:2px">ستریک</p>
            </div>
            <div class="card" style="text-align:center;padding:14px 8px;cursor:default">
                <div style="font-size:24px">💎</div>
                <strong style="font-size:16px">${u.gems}</strong>
                <p style="font-size:10px;color:var(--text-secondary);margin-top:2px">گەوهەر</p>
            </div>
            <div class="card" style="text-align:center;padding:14px 8px;cursor:default">
                <div style="font-size:24px">🪙</div>
                <strong style="font-size:16px">${u.coins}</strong>
                <p style="font-size:10px;color:var(--text-secondary);margin-top:2px">سکۆ</p>
            </div>
            <div class="card" style="text-align:center;padding:14px 8px;cursor:default">
                <div style="font-size:24px">📚</div>
                <strong style="font-size:16px">${u.totalWords}</strong>
                <p style="font-size:10px;color:var(--text-secondary);margin-top:2px">وشە</p>
            </div>
        </div>

        <button class="card" onclick="navigateTo('lessons')" style="width:100%;text-align:inherit;cursor:pointer;border:none;font-family:var(--font)">
            <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:28px">📚</span>
                <div style="flex:1">
                    <strong style="display:block">بەردەوام بە</strong>
                    <p style="font-size:12px;color:var(--text-secondary)">وانەی داهاتوو چاوەڕوانتە</p>
                </div>
                <span class="btn btn-primary btn-sm">▶️ دەست بکە</span>
            </div>
        </button>

        <div class="grid-2" style="margin-top:4px">
            <button class="card" onclick="navigateTo('quiz')" style="text-align:center;border:none;cursor:pointer;font-family:var(--font)">
                <div style="font-size:32px">📝</div>
                <strong>کویز</strong>
            </button>
            <button class="card" onclick="navigateTo('flashcards')" style="text-align:center;border:none;cursor:pointer;font-family:var(--font)">
                <div style="font-size:32px">🃏</div>
                <strong>فلاشکارت</strong>
            </button>
            <button class="card" onclick="navigateTo('speed-quiz')" style="text-align:center;border:none;cursor:pointer;font-family:var(--font)">
                <div style="font-size:32px">⚡</div>
                <strong>کویزی خێرا</strong>
            </button>
            <button class="card" onclick="navigateTo('packages')" style="text-align:center;border:none;cursor:pointer;font-family:var(--font)">
                <div style="font-size:32px">💳</div>
                <strong>پاکێج</strong>
            </button>
        </div>`;
}

// ===== PAGE: LESSONS =====
function renderLessons(c) {
    let html = '<h2 style="margin-bottom:12px">📚 وانەکان</h2><select class="input" id="langSelect" style="margin-bottom:16px">';
    for (const k in lessons) {
        html += `<option value="${k}" ${state.settings.currentLanguage === k ? 'selected' : ''}>${lessons[k].icon} ${lessons[k].name}</option>`;
    }
    html += '</select><div id="lessonsList"></div>';
    c.innerHTML = html;

    // Use change event — not inline onchange — so the select is re-rendered cleanly
    document.getElementById('langSelect').addEventListener('change', function() {
        state.settings.currentLanguage = this.value;
        lsSet('zm_lang', this.value);
        renderLessonsList();
    });

    renderLessonsList();
}

function renderLessonsList() {
    const lang = state.settings.currentLanguage;
    const data = lessons[lang];
    const list = document.getElementById('lessonsList');
    if (!list || !data) return;

    let html = '';
    data.topics.forEach((t, i) => {
        html += `
            <div class="card">
                <h3 style="margin-bottom:4px">وانەی ${t.id}: ${escHtml(t.title)}</h3>
                <p style="color:var(--text-secondary);font-size:13px;margin-bottom:8px">${t.words.length} وشە</p>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
                    ${t.words.slice(0, 5).map(w => `<span style="background:var(--bg);padding:4px 8px;border-radius:6px;font-size:12px;border:1px solid var(--border)">${escHtml(w.split('=')[0])}</span>`).join('')}
                </div>
                <button class="btn btn-primary btn-sm" onclick="startLesson('${escAttr(lang)}',${i})">دەستپێبکە ▶️</button>
            </div>`;
    });
    list.innerHTML = html;
}

function startLesson(lang, idx) {
    const data = lessons[lang].topics[idx];
    state.user.xp         += 15;
    state.user.gems        += 5;
    state.user.totalWords  += data.words.length;
    state.user.level        = Math.floor(state.user.xp / 1000) + 1;
    state.learning.history.push({ type:'lesson', lang, title:data.title, xp:15, date:new Date().toISOString() });
    save();
    spawnConfetti();
    toast(`🎉 وانەی "${data.title}" تەواو بوو! +15 XP | +5 💎`);
}

// ===== PAGE: FLASHCARDS =====
function renderFlashcards(c) {
    const allWords = getAllWords();
    if (allWords.length === 0) {
        c.innerHTML = '<h2>🃏 فلاشکارت</h2><div class="card"><p>هیچ وشەیەک نەدۆزرایەوە. پێشتر وانەیەک دابگرە.</p></div>';
        return;
    }
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, 8);
    window._fc = { words: shuffled, idx: 0, flipped: false };

    c.innerHTML = `
        <h2 style="margin-bottom:12px">🃏 فلاشکارت</h2>
        <div class="flashcard" id="fc" onclick="flipFC()" role="button" tabindex="0"
             aria-label="فلاشکارت — کلیک بکە بیگۆڕێت">
            <div class="flashcard-inner">
                <div class="flashcard-front"><span id="fcWord">${escHtml(shuffled[0].split('=')[0])}</span></div>
                <div class="flashcard-back"><span id="fcTrans">${escHtml(shuffled[0].split('=')[1])}</span></div>
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:4px">
            <button class="btn btn-danger" onclick="rateFC('wrong')" aria-label="هەڵە">❌ هەڵە</button>
            <button class="btn btn-success" onclick="rateFC('correct')" aria-label="ڕاست">✅ ڕاست</button>
        </div>
        <p style="text-align:center;margin-top:10px;color:var(--text-secondary);font-size:13px">
            <span id="fcIdx">1</span> / ${shuffled.length}
        </p>`;

    // Keyboard support for flashcard flip
    document.getElementById('fc').addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipFC(); }
    });
}

function flipFC() {
    window._fc.flipped = !window._fc.flipped;
    const fc = document.getElementById('fc');
    if (fc) fc.classList.toggle('flipped', window._fc.flipped);
}

function rateFC(r) {
    const d = window._fc;
    if (r === 'correct') { state.user.xp += 3; playBeep(700, 0.08); }
    d.idx++;
    d.flipped = false;
    if (d.idx >= d.words.length) {
        state.user.xp += 10;
        save();
        spawnConfetti();
        toast('🃏 فلاشکارت تەواو بوو! +10 XP');
        _trackTimeout(setTimeout(() => navigateTo('home'), 1500));
        return;
    }
    const fcWord  = document.getElementById('fcWord');
    const fcTrans = document.getElementById('fcTrans');
    const fcIdx   = document.getElementById('fcIdx');
    const fc      = document.getElementById('fc');
    if (fcWord)  fcWord.textContent  = d.words[d.idx].split('=')[0];
    if (fcTrans) fcTrans.textContent = d.words[d.idx].split('=')[1];
    if (fcIdx)   fcIdx.textContent   = d.idx + 1;
    if (fc)      fc.classList.remove('flipped');
    save();
}

// ===== PAGE: QUIZ =====
function renderQuiz(c) {
    const allWords = getAllWords();
    if (allWords.length < 4) {
        c.innerHTML = '<h2>📝 کویز</h2><div class="card"><p>وشەی پێویست نییە. پێشتر وانەیەک دابگرە.</p></div>';
        return;
    }
    const q       = allWords[Math.floor(Math.random() * allWords.length)].split('=');
    const wrong   = allWords.filter(w => w.split('=')[1] !== q[1]).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts    = [...wrong.map(w => w.split('=')[1]), q[1]].sort(() => Math.random() - 0.5);

    c.innerHTML = `
        <h2 style="margin-bottom:12px">📝 کویز</h2>
        <div class="card" style="text-align:center;padding:28px 20px;margin:0 0 16px">
            <p style="font-size:40px;margin-bottom:8px">${escHtml(q[0])}</p>
            <p style="color:var(--text-secondary);margin-bottom:12px">واتای چییە؟</p>
            <button class="btn btn-sm" onclick="speakWord('${escAttr(q[0])}')" aria-label="گوێ بگرە">🔊 گوێ بگرە</button>
        </div>
        <div class="options-grid" id="qzOpts" role="group" aria-label="وەڵامەکان">
            ${opts.map(o => `<button class="option-btn" onclick="checkQuiz('${escAttr(o)}','${escAttr(q[1])}',this)">${escHtml(o)}</button>`).join('')}
        </div>`;
}

function checkQuiz(s, correct, btn) {
    const allBtns = document.querySelectorAll('#qzOpts .option-btn');
    allBtns.forEach(b => { b.disabled = true; });
    if (s === correct) {
        btn.classList.add('correct');
        state.user.xp += 10;
        playBeep(700, 0.1);
        toast('✅ ڕاستە! +10 XP');
    } else {
        btn.classList.add('wrong');
        allBtns.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
        playBeep(200, 0.2);
    }
    save();
    _trackTimeout(setTimeout(() => renderQuiz(document.getElementById('mainContent')), 1500));
}

// ===== PAGE: SPEED QUIZ =====
function renderSpeedQuiz(c) {
    const allWords = getAllWords();
    if (allWords.length < 4) {
        c.innerHTML = '<h2>⚡ کویزی خێرا</h2><div class="card"><p>وشەی پێویست نییە. پێشتر وانەیەک دابگرە.</p></div>';
        return;
    }
    const qw = allWords.sort(() => Math.random() - 0.5).slice(0, 10);
    window._sp = { words: qw, idx: 0, score: 0, wrong: 0, time: 30, timer: null };

    c.innerHTML = `
        <h2 style="margin-bottom:8px">⚡ کویزی خێرا</h2>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <p style="color:var(--danger);font-weight:700">⏱️ <span id="spTime">30</span>s</p>
            <p>✅ <span id="spScore">0</span> | ❌ <span id="spWrong">0</span></p>
        </div>
        <div class="progress-bar" style="margin-bottom:16px">
            <div class="progress-fill" id="spProg" style="width:0%"></div>
        </div>
        <div class="card" style="text-align:center;padding:20px;margin-bottom:16px">
            <p id="spQ" style="font-size:22px;font-weight:700">${escHtml(qw[0].split('=')[0])}</p>
        </div>
        <div class="options-grid" id="spOpts" role="group" aria-label="وەڵامەکان"></div>`;

    loadSpeedQ();
    startSpTimer();
}

function loadSpeedQ() {
    const d = window._sp;
    if (!d || d.idx >= d.words.length || d.time <= 0) { finishSp(); return; }

    const q    = d.words[d.idx].split('=');
    const wrong = d.words.filter(w => w.split('=')[1] !== q[1]).slice(0, 3);
    const opts  = [...wrong.map(w => w.split('=')[1]), q[1]].sort(() => Math.random() - 0.5);

    const qEl   = document.getElementById('spQ');
    const progEl = document.getElementById('spProg');
    if (qEl)   qEl.textContent = q[0];
    if (progEl) progEl.style.width = (d.idx / d.words.length * 100) + '%';

    const o = document.getElementById('spOpts');
    if (!o) return;
    o.innerHTML = '';
    opts.forEach(opt => {
        const b = document.createElement('button');
        b.className   = 'option-btn';
        b.textContent = opt;
        b.onclick     = () => checkSp(opt, q[1], b);
        o.appendChild(b);
    });
}

function checkSp(s, correct, btn) {
    const d    = window._sp;
    const all  = document.querySelectorAll('#spOpts .option-btn');
    all.forEach(b => { b.disabled = true; });

    if (s === correct) {
        btn.classList.add('correct');
        d.score++;
        d.time += 2;
        const sc = document.getElementById('spScore');
        if (sc) sc.textContent = d.score;
        playBeep(800, 0.06);
    } else {
        btn.classList.add('wrong');
        d.wrong++;
        d.time = Math.max(0, d.time - 3);
        const wr = document.getElementById('spWrong');
        if (wr) wr.textContent = d.wrong;
        all.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
        playBeep(200, 0.12);
    }
    d.idx++;
    save();
    _trackTimeout(setTimeout(loadSpeedQ, 400));
}

function startSpTimer() {
    // Store timer reference so navigateTo() can clear it
    const id = setInterval(() => {
        const d = window._sp;
        if (!d) { clearInterval(id); return; }
        d.time--;
        const el = document.getElementById('spTime');
        if (el) el.textContent = d.time;
        if (d.time <= 0) { clearInterval(id); finishSp(); }
    }, 1000);
    window._sp.timer = id;
    _trackInterval(id);  // register so _clearAllTimers() can cancel it
}

function finishSp() {
    const d  = window._sp;
    if (!d) return;
    if (d.timer) clearInterval(d.timer);
    const xp = d.score * 8;
    state.user.xp += xp;
    save();
    spawnConfetti();
    toast(`⚡ کویزی خێرا تەواو بوو! +${xp} XP`);
    _trackTimeout(setTimeout(() => navigateTo('home'), 1500));
}

// ===== PAGE: LISTENING =====
function renderListening(c) {
    const allWords = getAllWords();
    if (allWords.length < 4) {
        c.innerHTML = '<h2>🎧 بیستن</h2><div class="card"><p>وشەی پێویست نییە.</p></div>';
        return;
    }
    const tw = allWords.sort(() => Math.random() - 0.5).slice(0, 5);
    window._listen = { words: tw, idx: 0, score: 0, chances: 3 };

    c.innerHTML = `
        <h2 style="margin-bottom:12px">🎧 بیستن</h2>
        <div class="card" style="text-align:center;padding:32px 20px;margin-bottom:16px">
            <button class="btn btn-primary" onclick="playListen()"
                    style="font-size:36px;width:76px;height:76px;border-radius:50%;padding:0"
                    aria-label="وشەکە بیستە">🔊</button>
            <p id="listenCount" style="margin-top:12px;color:var(--text-secondary)">٣ جار دەتوانیت گوێ بگریت</p>
        </div>
        <div class="options-grid" id="listenOpts" role="group" aria-label="وەڵامەکان"></div>
        <p style="text-align:center;margin-top:10px;color:var(--text-secondary)">
            ✅ <span id="listenScore">0</span> / ${tw.length}
        </p>`;

    loadListenQ();
}

function loadListenQ() {
    const d = window._listen;
    if (!d || d.idx >= d.words.length) { finishListen(); return; }
    d.chances = 3;

    const q    = d.words[d.idx].split('=');
    const all  = getAllWords();
    const wrong = all.filter(w => w.split('=')[1] !== q[1]).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts  = [...wrong.map(w => w.split('=')[1]), q[1]].sort(() => Math.random() - 0.5);

    const lc = document.getElementById('listenCount');
    if (lc) lc.textContent = '٣ جار دەتوانیت گوێ بگریت';

    const o = document.getElementById('listenOpts');
    if (!o) return;
    o.innerHTML = '';
    opts.forEach(opt => {
        const b = document.createElement('button');
        b.className   = 'option-btn';
        b.textContent = opt;
        b.onclick     = () => checkListen(opt, q[1], b);
        o.appendChild(b);
    });
    playListen();
}

function playListen() {
    const d = window._listen;
    if (!d || d.chances <= 0) return;
    speakWord(d.words[d.idx].split('=')[0], 'en-US');
    d.chances--;
    const lc = document.getElementById('listenCount');
    if (lc) lc.textContent = d.chances > 0 ? `${d.chances} جار ماوەتەوە` : 'کۆتا جار';
}

function checkListen(s, correct, btn) {
    const d   = window._listen;
    const all = document.querySelectorAll('#listenOpts .option-btn');
    all.forEach(b => { b.disabled = true; });

    if (s === correct) {
        btn.classList.add('correct');
        d.score++;
        const sc = document.getElementById('listenScore');
        if (sc) sc.textContent = d.score;
        state.user.xp += 12;
        playBeep(800, 0.1);
    } else {
        btn.classList.add('wrong');
        all.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
        playBeep(200, 0.2);
    }
    d.idx++;
    save();
    _trackTimeout(setTimeout(loadListenQ, 1200));
}

function finishListen() {
    const d  = window._listen;
    if (!d) return;
    const xp = d.score * 12;
    state.user.xp += xp;
    save();
    spawnConfetti();
    toast(`🎧 بیستن تەواو بوو! +${xp} XP`);
    _trackTimeout(setTimeout(() => navigateTo('home'), 1500));
}

// ===== PAGE: SPEAKING =====
function renderSpeaking(c) {
    c.innerHTML = `
        <h2 style="margin-bottom:12px">🎤 قسەکردن</h2>
        <div class="card" style="text-align:center;padding:32px 20px">
            <p style="color:var(--text-secondary);margin-bottom:12px">ئەم ڕستەیە بڵێ:</p>
            <h3 style="color:var(--primary);font-size:22px;margin-bottom:16px">"Hello, how are you?"</h3>
            <button class="btn btn-sm" onclick="speakWord('Hello, how are you?')" aria-label="نموونەکە بیستە" style="margin-bottom:16px">🔊 نموونە بیستە</button>
            <br>
            <button class="btn btn-primary btn-lg" onclick="startRec()" id="recBtn" aria-label="وتنت دەستبکە">🎤 دەست بکە</button>
            <p id="recStatus" style="margin-top:12px;min-height:24px" aria-live="polite"></p>
        </div>`;
}

function startRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const statusEl = document.getElementById('recStatus');
    const btn      = document.getElementById('recBtn');
    if (!SR) {
        if (statusEl) statusEl.textContent = '⚠️ وەرگرتنی دەنگ پشتگیری ناکرێت لەم وەرزەرەدا';
        return;
    }
    const r = new SR();
    r.lang = 'en-US';
    r.start();
    if (statusEl) statusEl.textContent = '🎤 گوێدەگرم...';
    if (btn)      btn.disabled = true;
    r.onresult = e => {
        const transcript = e.results[0][0].transcript;
        if (statusEl) statusEl.textContent = `تۆ وتت: "${transcript}"`;
        state.user.xp += 15;
        save();
        toast('+15 XP!');
        if (btn) btn.disabled = false;
    };
    r.onerror = () => {
        if (statusEl) statusEl.textContent = '❌ هەڵەیەک ڕوویدا. دووبارە هەوڵبدەرەوە.';
        if (btn)      btn.disabled = false;
    };
    r.onend = () => { if (btn) btn.disabled = false; };
}

// ===== PAGE: READING =====
function renderReading(c) {
    const story = {
        title: 'ڕۆژێکی سادە',
        en:    'Every morning, I wake up at 7. I brush my teeth. Then I eat breakfast.',
        ku:    'هەموو بەیانییەک، ٧ هەڵدەستم. ددانم شووشتم. دواتر نانی بەیانی دەخۆم.',
        q:     [{ q:'کاژێر چەند هەڵدەستێت؟', o:['٦','٧','٨'], c:'٧' }],
    };

    c.innerHTML = `
        <h2 style="margin-bottom:12px">📖 خوێندنەوە</h2>
        <div class="card">
            <h3 style="margin-bottom:10px">${escHtml(story.title)}</h3>
            <p id="stEn" style="margin-bottom:12px;line-height:1.8">${escHtml(story.en)}</p>
            <button class="btn btn-sm" onclick="document.getElementById('stKu').style.display='block';this.style.display='none'" aria-label="وەرگێڕان ببینە">
                👀 وەرگێڕان ببینە
            </button>
            <p id="stKu" style="display:none;margin-top:10px;color:var(--text-secondary);line-height:1.8">${escHtml(story.ku)}</p>
        </div>
        <div id="rdQ"></div>`;

    const rdq = document.getElementById('rdQ');
    story.q.forEach((q, i) => {
        const d = document.createElement('div');
        d.className = 'card';
        d.innerHTML = `
            <p style="margin-bottom:10px"><strong>${i + 1}. ${escHtml(q.q)}</strong></p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${q.o.map(o => `<button class="btn btn-sm" onclick="checkRd('${escAttr(o)}','${escAttr(q.c)}',this)">${escHtml(o)}</button>`).join('')}
            </div>`;
        rdq.appendChild(d);
    });
}

function checkRd(s, correct, btn) {
    if (s === correct) {
        btn.style.background = 'var(--success)';
        btn.style.color      = '#fff';
        state.user.xp       += 10;
        toast('✅ ڕاستە! +10 XP');
    } else {
        btn.style.background = 'var(--danger)';
        btn.style.color      = '#fff';
    }
    save();
}

// ===== PAGE: WRITING =====
function renderWriting(c) {
    const allWords = getAllWords();
    if (allWords.length === 0) {
        c.innerHTML = '<h2>✍️ نووسین</h2><div class="card"><p>وشەی پێویست نییە.</p></div>';
        return;
    }
    const tw = allWords.sort(() => Math.random() - 0.5).slice(0, 5);
    window._wr = { words: tw, idx: 0, score: 0 };

    c.innerHTML = `
        <h2 style="margin-bottom:12px">✍️ نووسین</h2>
        <div class="card" style="text-align:center;padding:24px;margin-bottom:16px">
            <p style="color:var(--text-secondary);margin-bottom:8px">وشەی کوردی:</p>
            <p id="wrPrompt" style="font-size:28px;font-weight:800;color:var(--primary)">${escHtml(tw[0].split('=')[1])}</p>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px">
            <input id="wrInput" class="input" placeholder="وەرگێڕانی ئینگلیزی بنووسە..."
                   onkeydown="if(event.key==='Enter')checkWr()" autocomplete="off" autocorrect="off" spellcheck="false">
            <button class="btn btn-primary" onclick="checkWr()" aria-label="پشکنین">✅</button>
        </div>
        <p id="wrFB" style="text-align:center;min-height:22px;font-weight:600" aria-live="polite"></p>
        <p style="text-align:center;color:var(--text-secondary);font-size:13px">
            ✅ <span id="wrScore">0</span> / ${tw.length}
        </p>`;

    _trackTimeout(setTimeout(() => document.getElementById('wrInput')?.focus(), 100));
}

function checkWr() {
    const d   = window._wr;
    const inp = document.getElementById('wrInput');
    const fb  = document.getElementById('wrFB');
    if (!d || !inp || !fb) return;

    const input   = inp.value.trim().toLowerCase();
    const correct = d.words[d.idx].split('=')[0].toLowerCase();

    if (input === correct) {
        fb.textContent = '✅ ڕاستە!';
        fb.style.color = 'var(--success)';
        d.score++;
        const sc = document.getElementById('wrScore');
        if (sc) sc.textContent = d.score;
        state.user.xp += 10;
        playBeep(800, 0.1);
    } else {
        fb.textContent = `❌ ڕاستەکە: "${correct}"`;
        fb.style.color = 'var(--danger)';
        playBeep(200, 0.2);
    }
    d.idx++;
    save();

    if (d.idx >= d.words.length) {
        const bonus = d.score * 10;
        state.user.xp += bonus;
        save();
        spawnConfetti();
        toast(`✍️ نووسین تەواو بوو! +${bonus} XP`);
        _trackTimeout(setTimeout(() => navigateTo('home'), 1500));
        return;
    }
    _trackTimeout(setTimeout(() => {
        const prompt = document.getElementById('wrPrompt');
        if (prompt) prompt.textContent = d.words[d.idx].split('=')[1];
        inp.value     = '';
        fb.textContent = '';
        inp.focus();
    }, 1200));
}

// ===== PAGE: AI TEACHER =====
function renderAITeacher(c) {
    c.innerHTML = `
        <h2 style="margin-bottom:12px">🤖 مامۆستای AI</h2>
        <div id="aiChat" class="card"
             style="min-height:300px;max-height:420px;overflow-y:auto;padding:16px;margin-bottom:12px"
             aria-live="polite" aria-label="چاتی AI">
            <div style="text-align:center;color:var(--text-secondary);padding:40px 0">
                <p style="font-size:48px;margin-bottom:8px">🤖</p>
                <p>سڵاو! چۆن دەتوانم یارمەتیت بدەم؟</p>
            </div>
        </div>
        <div style="display:flex;gap:8px">
            <input id="aiInput" class="input" placeholder="پرسیارت بکە..."
                   onkeydown="if(event.key==='Enter')askAI()" aria-label="پیامت بنووسە">
            <button class="btn btn-primary" onclick="askAI()" aria-label="بنێرە">📤</button>
        </div>`;

    _trackTimeout(setTimeout(() => document.getElementById('aiInput')?.focus(), 100));
}

function askAI() {
    const inp  = document.getElementById('aiInput');
    const chat = document.getElementById('aiChat');
    if (!inp || !chat || !inp.value.trim()) return;

    const q = inp.value.trim();
    inp.value = '';

    // User bubble
    chat.innerHTML += `
        <div style="text-align:right;margin:8px 0">
            <span style="background:var(--primary);color:#fff;padding:8px 14px;border-radius:18px 4px 18px 18px;display:inline-block;max-width:80%;word-break:break-word">
                ${escHtml(q)}
            </span>
        </div>`;
    chat.scrollTop = chat.scrollHeight;

    // Simulated AI response
    const responses = [
        'بەڵێ، دەتوانم یارمەتیت بدەم! زمانی کوردی زۆر جوانە.',
        'زۆر باشە! پرسیارەکەت دروستە. وانەی داهاتوو دەتوانیت بیخوێنیتەوە.',
        'باشترین ڕێگا بۆ فێربوون، ئەمەیە: ڕۆژانە تەمرین بکە!',
        'ئەمە پرسیارێکی باشە. بەردەوام بە، دەبیتە زۆر باش!',
        'زمانی کوردی ١٢ ملیۆن قسەکەر هەیە. شانازیت بە فێربوونیەوە!',
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];

    _trackTimeout(setTimeout(() => {
        const chatNow = document.getElementById('aiChat');
        if (!chatNow) return;
        chatNow.innerHTML += `
            <div style="text-align:left;margin:8px 0">
                <span style="background:var(--surface-hover);padding:8px 14px;border-radius:4px 18px 18px 18px;display:inline-block;max-width:80%;word-break:break-word">
                    🤖 ${escHtml(reply)}
                </span>
            </div>`;
        chatNow.scrollTop = chatNow.scrollHeight;
        state.user.xp += 5;
        save();
    }, 800));
}

// ===== PAGE: PROGRESS =====
function renderProgress(c) {
    const history = state.learning.history.slice(-10).reverse();

    c.innerHTML = `
        <h2 style="margin-bottom:12px">📊 پێشکەوتن</h2>
        <div class="card" style="margin-bottom:12px">
            <h3 style="margin-bottom:12px">ئامارەکان</h3>
            <div class="grid-2" style="gap:12px">
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center">
                    <p style="font-size:24px">⭐</p>
                    <strong style="font-size:20px">${state.user.xp}</strong>
                    <p style="font-size:12px;color:var(--text-secondary)">XP</p>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center">
                    <p style="font-size:24px">📚</p>
                    <strong style="font-size:20px">${state.user.level}</strong>
                    <p style="font-size:12px;color:var(--text-secondary)">ئاست</p>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center">
                    <p style="font-size:24px">🔥</p>
                    <strong style="font-size:20px">${state.user.streak}</strong>
                    <p style="font-size:12px;color:var(--text-secondary)">ستریک</p>
                </div>
                <div style="background:var(--bg);padding:12px;border-radius:var(--radius-sm);text-align:center">
                    <p style="font-size:24px">📖</p>
                    <strong style="font-size:20px">${state.user.totalWords}</strong>
                    <p style="font-size:12px;color:var(--text-secondary)">وشە</p>
                </div>
            </div>
        </div>
        <div class="card">
            <h3 style="margin-bottom:12px">مێژووی چالاکی</h3>
            ${history.length === 0
                ? '<p style="color:var(--text-secondary);text-align:center;padding:20px 0">هێشتا هیچ چالاکییەک نییە. وانەیەک دابگرە!</p>'
                : history.map(x => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light)">
                        <span>${x.type === 'quiz' ? '📝' : x.type === 'lesson' ? '📚' : '🎧'} ${escHtml(x.title || '')}</span>
                        <span style="color:var(--primary);font-weight:700">+${x.xp} XP</span>
                    </div>`).join('')
            }
        </div>`;
}

// ===== PAGE: ACHIEVEMENTS =====
function renderAchievements(c) {
    const badges = [
        { n:'برۆنزی',  i:'🥉', req:100,   e: state.user.xp >= 100   },
        { n:'زیوی',    i:'🥈', req:1000,  e: state.user.xp >= 1000  },
        { n:'زێڕین',  i:'🥇', req:5000,  e: state.user.xp >= 5000  },
        { n:'ئەڵماسی',i:'💎', req:10000, e: state.user.xp >= 10000 },
        { n:'شاهانە', i:'👑', req:50000, e: state.user.xp >= 50000 },
        { n:'سووتاو',  i:'🔥', req:7,    e: state.user.streak >= 7  },
    ];

    c.innerHTML = `
        <h2 style="margin-bottom:12px">🏆 دەستکەوتەکان</h2>
        <div class="grid-2">
            ${badges.map(b => `
                <div class="card" style="text-align:center;opacity:${b.e ? '1' : '0.45'};transition:opacity var(--transition)">
                    <div style="font-size:40px;margin-bottom:8px">${b.e ? b.i : '🔒'}</div>
                    <strong>${escHtml(b.n)}</strong>
                    ${b.e
                        ? '<p style="color:var(--success);font-size:12px;margin-top:4px">✅ کردەوەی</p>'
                        : `<p style="font-size:11px;color:var(--text-muted);margin-top:4px">${b.req} ${b.req === 7 ? 'ستریک' : 'XP'} پێویستە</p>`}
                </div>`).join('')}
        </div>`;
}

// ===== PAGE: COMMUNITY =====
function renderCommunity(c) {
    const users = [
        { n:'سارا',   l:12, xp:4500, a:'👩' },
        { n:'ئارام',  l:8,  xp:2800, a:'👨' },
        { n:'دلشاد', l:15, xp:6200, a:'🧔' },
        { n:'تۆ',    l:state.user.level, xp:state.user.xp, a:'👤' },
    ].sort((a, b) => b.xp - a.xp);

    const medals = ['🥇','🥈','🥉'];

    c.innerHTML = `
        <h2 style="margin-bottom:12px">👥 کۆمەڵگا</h2>
        <div class="card">
            <h3 style="margin-bottom:12px">🏆 ڕیزبەندی هەفتانە</h3>
            ${users.map((u, i) => `
                <div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--border-light)">
                    <span style="font-size:20px;width:28px;text-align:center">${medals[i] || `#${i + 1}`}</span>
                    <span style="font-size:22px">${u.a}</span>
                    <div style="flex:1">
                        <strong style="${u.n === 'تۆ' ? 'color:var(--primary)' : ''}">${escHtml(u.n)}</strong>
                        <p style="font-size:12px;color:var(--text-secondary)">ئاست ${u.l}</p>
                    </div>
                    <span style="font-weight:700;color:var(--primary)">${u.xp.toLocaleString()} XP</span>
                </div>`).join('')}
        </div>`;
}

// ===== PAGE: PACKAGES =====
function renderPackages(c) {
    let html = '<h2 style="margin-bottom:12px">💳 پاکێجەکان</h2>';
    for (const k in packages) {
        const p = packages[k];
        html += `
            <div class="card ${p.featured ? 'featured' : ''}" style="border-right:4px solid ${p.color}">
                ${p.featured ? '<span class="badge badge-premium" style="margin-bottom:8px;display:inline-block">⭐ پێشنیارکراو</span>' : ''}
                <h3 style="color:${p.color};margin-bottom:4px">${escHtml(p.name)}</h3>
                <p style="font-size:28px;font-weight:800;margin-bottom:8px">
                    ${escHtml(p.price)}<small style="font-size:14px;font-weight:500;color:var(--text-secondary)"> / ${escHtml(p.period)}</small>
                </p>
                <ul style="list-style:none;padding:0;margin-bottom:16px">
                    ${p.features.map(f => `<li style="padding:3px 0;font-size:14px">✅ ${escHtml(f)}</li>`).join('')}
                </ul>
                <button class="btn btn-primary btn-block" onclick="buyPackage('${escAttr(k)}')">${escHtml(p.btnText)}</button>
            </div>`;
    }
    c.innerHTML = html;
}

function buyPackage(key) {
    state.selectedPackage = key;
    const pkg = packages[key];
    if (key === 'free') {
        state.user.package = 'free';
        save();
        toast('✅ پاکێجی بێبەرامبەر چالاک کرا!');
        return;
    }
    if (!pkg.hasPayment) {
        window.open(`https://wa.me/${AppConfig.contact.whatsapp}`, '_blank', 'noopener');
        return;
    }
    showPaymentModal(pkg);
}

function showPaymentModal(pkg) {
    // Remove any existing modal first
    document.querySelector('.modal.show')?.remove();

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', `کڕینی ${pkg.name}`);
    modal.onclick = function(e) { if (e.target === this) this.remove(); };

    let html = `
        <div class="modal-content">
            <h3 style="margin-bottom:4px">کڕینی ${escHtml(pkg.name)}</h3>
            <p style="margin-bottom:16px">بڕ: <strong>${escHtml(pkg.price)}</strong></p>
            <p style="margin-bottom:8px;font-weight:600">شێوازی پارەدان:</p>
            <div class="grid-3" style="margin-bottom:16px">`;

    paymentMethods.forEach(m => {
        html += `<div class="payment-method ${state.selectedPayment === m ? 'selected' : ''}"
                       onclick="selectPayment('${escAttr(m)}',this)"
                       role="button" tabindex="0"
                       onkeydown="if(event.key==='Enter'||event.key===' ')selectPayment('${escAttr(m)}',this)">
                    ${escHtml(m)}
                 </div>`;
    });
    html += '</div>';

    if (state.selectedPayment) {
        const info = getPaymentInfo(state.selectedPayment);
        const safeInfo = escAttr(info);
        html += `
            <div style="margin-top:4px">
                <p style="font-weight:600;margin-bottom:8px">زانیاری پارەدان:</p>
                <div class="copy-box">
                    <span>${escHtml(info)}</span>
                    <button class="btn btn-sm btn-primary"
                            onclick="navigator.clipboard.writeText('${safeInfo}').then(()=>toast('✅ کۆپی کرا!'))"
                            aria-label="کۆپی بکە">📋</button>
                </div>
                <input type="text"  id="buyerName"  class="input" placeholder="ناوی تەواو"  style="margin-bottom:8px">
                <input type="email" id="buyerEmail" class="input" placeholder="ئیمەیڵ"       style="margin-bottom:12px">
                <button class="btn btn-success btn-block" onclick="submitPayment()">✅ ناردن</button>
            </div>`;
    }

    html += '</div>';
    modal.innerHTML = html;
    document.body.appendChild(modal);

    // Trap focus inside modal — close on Escape
    modal.addEventListener('keydown', e => {
        if (e.key === 'Escape') modal.remove();
    });
}

function selectPayment(m, el) {
    state.selectedPayment = m;
    document.querySelectorAll('.payment-method').forEach(x => x.classList.remove('selected'));
    if (el) el.classList.add('selected');
    showPaymentModal(packages[state.selectedPackage]);
}

function getPaymentInfo(method) {
    const map = {
        'FIB':              AppConfig.payment.fib,
        'FastPay':          AppConfig.payment.fastpay,
        'USDT (TRC20)':     AppConfig.payment.usdt,
        'Korek Card':       AppConfig.payment.korek  || 'بەردەست نییە',
        'Zain Card':        AppConfig.payment.zain   || 'بەردەست نییە',
        'Asia Card':        AppConfig.payment.asia   || 'بەردەست نییە',
        'Qi Card':          AppConfig.payment.qi     || 'بەردەست نییە',
        'Apple Gift Card':  AppConfig.payment.apple  || 'بەردەست نییە',
        'iTunes Gift Card': AppConfig.payment.itunes || 'بەردەست نییە',
    };
    return map[method] || 'بەردەست نییە';
}

function submitPayment() {
    const nameEl  = document.getElementById('buyerName');
    const emailEl = document.getElementById('buyerEmail');
    if (!nameEl?.value.trim() || !emailEl?.value.trim()) {
        toast('❌ تکایە ناو و ئیمەیڵ بنووسە');
        return;
    }
    const payments = lsGetJSON('zm_payments', []);
    payments.push({
        id:      Date.now(),
        package: state.selectedPackage,
        method:  state.selectedPayment,
        name:    nameEl.value.trim(),
        email:   emailEl.value.trim(),
        status:  'pending',
        date:    new Date().toISOString(),
    });
    lsSet('zm_payments', JSON.stringify(payments));
    document.querySelector('.modal.show')?.remove();
    toast('✅ داواکاری پارەدانت تۆمار کرا!');
}

// ===== PAGE: SPONSOR =====
function renderSponsor(c) {
    c.innerHTML = `
        <h2 style="margin-bottom:12px">📢 سپۆنسەر</h2>
        <div class="card">
            <h3 style="margin-bottom:8px">ببنە سپۆنسەر</h3>
            <p style="color:var(--text-secondary);margin-bottom:16px">بۆ ڕیکلام و سپۆنسەرکردن پەیوەندیمان پێوە بکە</p>
            <a href="https://wa.me/${AppConfig.contact.whatsapp}" target="_blank" rel="noopener"
               class="btn btn-primary btn-block" style="margin-bottom:8px">💬 WhatsApp</a>
            <a href="https://t.me/${AppConfig.contact.telegram}" target="_blank" rel="noopener"
               class="btn btn-block" style="background:#0088cc;color:#fff">✈️ Telegram</a>
        </div>`;
}

// ===== PAGE: CONTACT =====
function renderContact(c) {
    c.innerHTML = `
        <h2 style="margin-bottom:12px">📞 پەیوەندی</h2>
        <a href="https://wa.me/${AppConfig.contact.whatsapp}" target="_blank" rel="noopener"
           class="card" style="display:block;text-decoration:none;background:#25D366;color:#fff;margin-bottom:12px">
            <h3>💬 WhatsApp</h3>
            <p style="opacity:.88;font-size:14px">ڕاستەوخۆ چات</p>
        </a>
        <a href="https://t.me/${AppConfig.contact.telegram}" target="_blank" rel="noopener"
           class="card" style="display:block;text-decoration:none;background:#0088cc;color:#fff;margin-bottom:12px">
            <h3>✈️ Telegram</h3>
            <p style="opacity:.88;font-size:14px">ڕاستەوخۆ چات</p>
        </a>
        <div class="card">
            <h3 style="margin-bottom:4px">📧 ئیمەیڵ</h3>
            <a href="mailto:${AppConfig.contact.email}" style="color:var(--primary)">${escHtml(AppConfig.contact.email || 'support@ziman.app')}</a>
        </div>`;
}

// ===== PAGE: SETTINGS =====
function renderSettings(c) {
    c.innerHTML = `
        <h2 style="margin-bottom:12px">⚙️ ڕێکخستن</h2>

        <div class="card">
            <h3 style="margin-bottom:12px">🌗 ڕووکاری ئاپ</h3>
            <div style="display:flex;gap:8px">
                <button class="btn ${!state.settings.darkMode && !state.settings.amoledMode ? 'btn-primary' : ''}"
                        onclick="setTheme('light')" aria-pressed="${!state.settings.darkMode && !state.settings.amoledMode}">☀️ ڕووناک</button>
                <button class="btn ${state.settings.darkMode && !state.settings.amoledMode ? 'btn-primary' : ''}"
                        onclick="setTheme('dark')" aria-pressed="${state.settings.darkMode && !state.settings.amoledMode}">🌙 تاریک</button>
                <button class="btn ${state.settings.amoledMode ? 'btn-primary' : ''}"
                        onclick="setTheme('amoled')" aria-pressed="${state.settings.amoledMode}">🖤 AMOLED</button>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-bottom:12px">👤 پروفایل</h3>
            <label for="nameInput" style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:6px">ناوی تۆ</label>
            <div style="display:flex;gap:8px">
                <input id="nameInput" class="input" value="${escAttr(state.user.name)}" placeholder="ناوت بنووسە" maxlength="30">
                <button class="btn btn-primary" onclick="saveName()" aria-label="ناو خەزن بکە">✅</button>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-bottom:8px">🗑️ داتا</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">ئەگەر داتاکەت دەیەوێت سڕیتەوە، ئەمە کلیک بکە. ئەم کارە گەڕاندنەوەی نییە.</p>
            <button class="btn btn-danger btn-sm" onclick="confirmReset()">🗑️ سڕینەوەی داتا</button>
        </div>`;
}

function setTheme(t) {
    state.settings.darkMode   = t === 'dark';
    state.settings.amoledMode = t === 'amoled';
    document.body.classList.remove('dark-mode', 'amoled-mode');
    if (t === 'dark')   document.body.classList.add('dark-mode');
    if (t === 'amoled') document.body.classList.add('amoled-mode');
    lsSet('zm_dark',   state.settings.darkMode);
    lsSet('zm_amoled', state.settings.amoledMode);
    toast(`✅ ڕووکاری ${t} چالاک کرا`);
    // Re-render settings to update button states
    renderSettings(document.getElementById('mainContent'));
}

function saveName() {
    const inp = document.getElementById('nameInput');
    if (!inp) return;
    const name = inp.value.trim();
    if (!name) { toast('❌ ناوێک بنووسە'); return; }
    state.user.name = name;
    save();
    toast('✅ ناوت خەزن کرا!');
}

function confirmReset() {
    if (!window.confirm('دڵنیایت داتاکەت سڕیتەوە؟ ئەم کارە گەڕاندنەوەی نییە.')) return;
    // Clear all zm_* keys
    try {
        Object.keys(localStorage).filter(k => k.startsWith('zm_')).forEach(k => localStorage.removeItem(k));
    } catch(e) {}
    toast('✅ داتا سڕایەوە');
    _trackTimeout(setTimeout(() => window.location.reload(), 1000));
}

// ===== STREAK CHECK =====
function checkStreak() {
    const last = state.user.lastLogin;
    const now  = new Date();
    if (!last) {
        state.user.streak = 1;
    } else {
        const lastDate = new Date(last);
        const diffDays = Math.floor((now - lastDate) / 86400000);
        if (diffDays === 0) {
            // Same day — streak unchanged, skip save
            state.user.lastLogin = now.toISOString();
            return;
        } else if (diffDays === 1) {
            state.user.streak++;
            toast(`🔥 ستریک: ${state.user.streak} ڕۆژ!`);
        } else {
            state.user.streak = 1; // streak broken
        }
    }
    state.user.lastLogin = now.toISOString();
    save();
}

// ===== UTILITY FUNCTIONS =====

/** Collect all words for the currently selected language */
function getAllWords() {
    const lang = state.settings.currentLanguage;
    const data = lessons[lang];
    if (!data) return [];
    const words = [];
    data.topics.forEach(t => t.words.forEach(w => words.push(w)));
    return words;
}

/** Escape HTML special characters to prevent XSS in innerHTML */
function escHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Escape for use in HTML attribute values (inside single-quoted onclick strings) */
function escAttr(str) {
    if (str == null) return '';
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

// ===== MOUSE vs. KEYBOARD FOCUS DETECTION =====
// Hides focus ring for mouse users; restores it for keyboard users.
(function initFocusMode() {
    let usingMouse = false;
    document.addEventListener('mousedown', () => { usingMouse = true;  document.body.classList.add('js-focus-mouse'); });
    document.addEventListener('keydown',   () => { usingMouse = false; document.body.classList.remove('js-focus-mouse'); });
})();

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    if (state.settings.darkMode)   document.body.classList.add('dark-mode');
    if (state.settings.amoledMode) document.body.classList.add('amoled-mode');

    // Hamburger button — open menu
    document.getElementById('menuBtn')?.addEventListener('click', openMenu);

    // Overlay — close menu when tapping outside
    document.getElementById('menuOverlay')?.addEventListener('click', closeMenu);

    // Global escape key — close any open modal or menu
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeMenu();
            document.querySelector('.modal.show')?.remove();
        }
    });

    // Boot sequence
    checkStreak();
    updateUI();
    navigateTo('home');
});
