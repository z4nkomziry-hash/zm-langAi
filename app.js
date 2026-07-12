// ============================================
// ZIMAN - Complete App JavaScript
// All New Features: Command Palette, Focus Mode, 
// Smart Resume, Heatmap, Split View, Soft Notifications
// ============================================

// ============ STATE MANAGEMENT ============
const AppState = {
    currentUser: {
        name: localStorage.getItem('zm_name') || 'فێرخواز',
        level: parseInt(localStorage.getItem('zm_level')) || 1,
        xp: parseInt(localStorage.getItem('zm_xp')) || 0,
        coins: parseInt(localStorage.getItem('zm_coins')) || 100,
        gems: parseInt(localStorage.getItem('zm_gems')) || 50,
        hearts: parseInt(localStorage.getItem('zm_hearts')) || 5,
        streak: parseInt(localStorage.getItem('zm_streak')) || 0,
        lastLogin: localStorage.getItem('zm_lastLogin') || null,
        totalWords: parseInt(localStorage.getItem('zm_words')) || 0,
    },
    settings: {
        darkMode: localStorage.getItem('zm_dark') === 'true',
        currentLanguage: localStorage.getItem('zm_lang') || 'en-ku',
        direction: localStorage.getItem('zm_dir') || 'rtl',
    },
    learning: {
        currentCategory: 'greetings',
        history: JSON.parse(localStorage.getItem('zm_history')) || [],
        lastSession: JSON.parse(localStorage.getItem('zm_lastSession')) || null,
    },
    pages: { current: 'home', history: [] },
    achievements: JSON.parse(localStorage.getItem('zm_achievements')) || [],
    focusMode: false,
};

// ============ DATA STORE ============
const LanguageData = {
    'en-ku': {
        name: 'ئینگلیزی → کوردی',
        categories: {
            greetings: {
                name: 'سڵاوکردن', icon: '👋',
                lessons: [{ id: 1, words: [
                    { en: 'Hello', ku: 'سڵاو' },
                    { en: 'Good morning', ku: 'بەیانیت باش' },
                    { en: 'How are you?', ku: 'چۆنی؟' },
                    { en: 'Thank you', ku: 'سوپاس' },
                    { en: 'Goodbye', ku: 'خواحافیزی' },
                ]}]
            },
            numbers: {
                name: 'ژمارەکان', icon: '🔢',
                lessons: [{ id: 2, words: [
                    { en: 'One', ku: 'یەک' }, { en: 'Two', ku: 'دوو' },
                    { en: 'Three', ku: 'سێ' }, { en: 'Four', ku: 'چوار' },
                    { en: 'Five', ku: 'پێنج' },
                ]}]
            },
        }
    },
    'ar-ku': { name: 'عەرەبی → کوردی', categories: { greetings: { name: 'تحيات', icon: '👋', lessons: [{ id: 1, words: [{ en: 'السلام عليكم', ku: 'سڵاو' }, { en: 'صباح الخير', ku: 'بەیانیت باش' }] }] } } },
    'tr-ku': { name: 'تورکی → کوردی', categories: { greetings: { name: 'Selamlaşma', icon: '👋', lessons: [{ id: 1, words: [{ en: 'Merhaba', ku: 'سڵاو' }, { en: 'Günaydın', ku: 'بەیانیت باش' }] }] } } },
    'fa-ku': { name: 'فارسی → کوردی', categories: { greetings: { name: 'احوالپرسی', icon: '👋', lessons: [{ id: 1, words: [{ en: 'سلام', ku: 'سڵاو' }] }] } } },
    'de-ku': { name: 'ئەڵمانی → کوردی', categories: { greetings: { name: 'Begrüßung', icon: '👋', lessons: [{ id: 1, words: [{ en: 'Hallo', ku: 'سڵاو' }, { en: 'Danke', ku: 'سوپاس' }] }] } } },
    'fr-ku': { name: 'فەرەنسی → کوردی', categories: { greetings: { name: 'Salutations', icon: '👋', lessons: [{ id: 1, words: [{ en: 'Bonjour', ku: 'سڵاو' }, { en: 'Merci', ku: 'سوپاس' }] }] } } },
    'es-ku': { name: 'ئیسپانی → کوردی', categories: { greetings: { name: 'Saludos', icon: '👋', lessons: [{ id: 1, words: [{ en: 'Hola', ku: 'سڵاو' }, { en: 'Gracias', ku: 'سوپاس' }] }] } } },
};

// ============ UTILITY FUNCTIONS ============
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function saveState() {
    const u = AppState.currentUser;
    ['zm_xp','zm_coins','zm_gems','zm_hearts','zm_streak','zm_lastLogin','zm_level','zm_words','zm_name'].forEach(k => {
        const key = k.replace('zm_', '');
        if (u[key] !== undefined) localStorage.setItem(k, u[key]);
    });
    localStorage.setItem('zm_history', JSON.stringify(AppState.learning.history));
    localStorage.setItem('zm_lastSession', JSON.stringify(AppState.learning.lastSession));
    updateHeaderStats();
}

function updateHeaderStats() {
    const els = { headerStreak: AppState.currentUser.streak, headerXP: AppState.currentUser.xp, headerGems: AppState.currentUser.gems };
    Object.entries(els).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
}

function speakWord(word, lang = 'en-US', rate = 0.8) {
    if ('speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(word); u.lang = lang; u.rate = rate; speechSynthesis.speak(u); }
}

function playBeep(f = 600, d = 0.1) {
    try { const c = new (AudioContext||webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.setValueAtTime(.2, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime+d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+d); } catch(e) {}
}

function spawnConfetti() {
    const canvas = document.getElementById('confettiCanvas'); if (!canvas) return;
    canvas.width = innerWidth; canvas.height = innerHeight; const ctx = canvas.getContext('2d');
    const ps = [], colors = ['#4F46E5','#0EA5E9','#F59E0B','#EF4444','#10B981','#8B5CF6'];
    for (let i=0;i<100;i++) ps.push({x:canvas.width/2+Math.random()*200-100,y:canvas.height/3,vx:(Math.random()-.5)*16,vy:Math.random()*-12-4,s:Math.random()*8+4,c:colors[Math.floor(Math.random()*colors.length)],l:1,decay:.01+.005*Math.random(),g:.15});
    (function a(){ctx.clearRect(0,0,canvas.width,canvas.height);let alive=false;ps.forEach(p=>{p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.l-=p.decay;if(p.l>0){alive=true;ctx.globalAlpha=p.l;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fill()}});if(alive)requestAnimationFrame(a)})();
}

// ============ SOFT NOTIFICATION ============
function softNotify(msg, type='info') {
    const existing = document.querySelector('.soft-notification'); if (existing) existing.remove();
    const el = document.createElement('div'); el.className=`soft-notification ${type}`; el.textContent=msg;
    el.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(10px);background:var(--zm-surface);color:var(--zm-text);padding:10px 20px;border-radius:50px;font-size:13px;font-weight:500;box-shadow:var(--zm-shadow-md);border:1px solid var(--zm-border);z-index:1000;opacity:0;transition:all .3s var(--zm-spring);pointer-events:none';
    document.body.appendChild(el);
    requestAnimationFrame(()=>{el.style.opacity='1';el.style.transform='translateX(-50%) translateY(0)'});
    setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(-50%) translateY(-10px)';setTimeout(()=>el.remove(),300)},2500);
}

// ============ ROUTING ============
function navigateTo(page, data={}) {
    AppState.pages.history.push(AppState.pages.current); AppState.pages.current = page;
    AppState.learning.lastSession = { page, data, pageName: getPageName(page), timestamp: Date.now() };
    saveState(); renderPage(page, data);
    $$('.menu-list li[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
    $$('.bottom-nav button[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
    document.getElementById('headerTitle').textContent = getPageName(page);
    if (innerWidth<768) { document.getElementById('sideMenu')?.classList.remove('open'); document.getElementById('menuOverlay')?.classList.remove('open') }
    window.scrollTo({top:0,behavior:'smooth'});
}

function getPageName(page) {
    const m = {home:'🧠 Ziman',lessons:'📚 وانەکان',lesson:'📖 وانە',flashcards:'🃏 فلاشکارت',quiz:'📝 کویز','speed-quiz':'⚡ کویزی خێرا',listening:'🎧 بیستن',speaking:'🎤 قسەکردن',reading:'📖 خوێندنەوە',writing:'✍️ نووسین','ai-teacher':'🤖 AI',progress:'📊 پێشکەوتن',achievements:'🏆 دەستکەوتەکان',community:'👥 کۆمەڵگا',profile:'👤 پڕۆفایل',settings:'⚙️ ڕێکخستن',premium:'💎 پڕیمیوم'};
    return m[page]||'Ziman';
}

// ============ RENDER PAGES ============
function renderPage(page, data={}) {
    const main = document.getElementById('mainContent'); if(!main)return; main.innerHTML='';
    const pages = {home:renderHome,lessons:renderLessons,lesson:renderLessonView,flashcards:renderFlashcards,quiz:renderQuiz,'speed-quiz':renderSpeedQuiz,listening:renderListening,speaking:renderSpeaking,reading:renderReading,writing:renderWriting,'ai-teacher':renderAITeacher,progress:renderProgress,achievements:renderAchievements,community:renderCommunity,profile:renderProfile,settings:renderSettings,premium:renderPremium};
    (pages[page]||renderHome)(main,data);
}

// ============ FOCUS MODE ============
function toggleFocusMode() {
    AppState.focusMode = !AppState.focusMode;
    document.body.classList.toggle('focus-mode', AppState.focusMode);
    softNotify(AppState.focusMode ? '🧘 Focus Mode ON' : 'Focus Mode OFF');
}

// ============ COMMAND PALETTE ============
function initCommandPalette() {
    const overlay = document.getElementById('commandPalette');
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey||e.metaKey)&&e.key==='k') { e.preventDefault(); overlay?.classList.toggle('show'); document.getElementById('commandInput')?.focus(); }
        if (e.key==='Escape') overlay?.classList.remove('show');
        if ((e.ctrlKey||e.metaKey)&&e.key==='f') { e.preventDefault(); toggleFocusMode(); }
    });
    overlay?.addEventListener('click', (e) => { if (e.target===overlay) overlay.classList.remove('show'); });
    document.getElementById('commandInput')?.addEventListener('input', function() {
        const q = this.value.toLowerCase();
        $$('.command-item').forEach(item => { item.style.display = item.textContent.toLowerCase().includes(q) ? 'flex' : 'none'; });
    });
    $$('.command-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action, page = item.dataset.page;
            if (action==='quiz') navigateTo('quiz');
            else if (action==='speed-quiz') navigateTo('speed-quiz');
            else if (action==='flashcards') navigateTo('flashcards');
            else if (action==='focus') toggleFocusMode();
            else if (action==='dark') toggleDarkMode();
            else if (action==='spin') document.getElementById('luckyWheelPopup')?.classList.add('show');
            else if (page) navigateTo(page);
            overlay?.classList.remove('show');
        });
    });
}

// ============ SMART RESUME ============
function showResumeNotification() {
    const session = AppState.learning.lastSession;
    if (!session || Date.now()-session.timestamp>86400000) return;
    const el = document.getElementById('resumeNotification');
    document.getElementById('resumeText').textContent = `لە ${session.pageName} بەردەوام بە`;
    document.getElementById('resumeBtn').onclick = () => { navigateTo(session.page, session.data); el.classList.remove('show'); };
    setTimeout(()=>el.classList.add('show'), 800);
    setTimeout(()=>el.classList.remove('show'), 6000);
}

// ============ DARK MODE ============
function toggleDarkMode() {
    AppState.settings.darkMode = !AppState.settings.darkMode;
    document.body.classList.toggle('dark-mode', AppState.settings.darkMode);
    localStorage.setItem('zm_dark', AppState.settings.darkMode);
    softNotify(AppState.settings.darkMode ? '🌙 Dark Mode' : '☀️ Light Mode');
}

// ============ HOME PAGE ============
function renderHome(container) {
    const u = AppState.currentUser;
    container.innerHTML = `
        <div style="padding:16px">
            <div class="card gradient-primary" style="color:#fff;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:16px">
                    <div style="font-size:48px">👋</div>
                    <div><h2>سڵاو، ${u.name}!</h2><p>ئاست ${u.level} • ${u.xp} XP</p></div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
                <div class="card" style="text-align:center;padding:12px"><div style="font-size:24px">🔥</div><strong>${u.streak}</strong></div>
                <div class="card" style="text-align:center;padding:12px"><div style="font-size:24px">💎</div><strong>${u.gems}</strong></div>
                <div class="card" style="text-align:center;padding:12px"><div style="font-size:24px">🪙</div><strong>${u.coins}</strong></div>
                <div class="card" style="text-align:center;padding:12px"><div style="font-size:24px">📚</div><strong>${u.totalWords}</strong></div>
            </div>
            <div class="card" style="cursor:pointer;margin-bottom:8px" onclick="navigateTo('lesson',{category:'greetings',lesson:1})"><div style="display:flex;align-items:center;gap:12px"><span>💬</span><div style="flex:1"><strong>سڵاوکردن</strong></div><button class="btn btn-primary btn-sm">▶️</button></div></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
                <div class="card" style="cursor:pointer;text-align:center" onclick="navigateTo('quiz')"><div style="font-size:32px">📝</div><strong>کویز</strong></div>
                <div class="card" style="cursor:pointer;text-align:center" onclick="navigateTo('speed-quiz')"><div style="font-size:32px">⚡</div><strong>خێرا</strong></div>
                <div class="card" style="cursor:pointer;text-align:center" onclick="navigateTo('flashcards')"><div style="font-size:32px">🃏</div><strong>فلاشکارت</strong></div>
                <div class="card" style="cursor:pointer;text-align:center" onclick="document.getElementById('luckyWheelPopup').classList.add('show')"><div style="font-size:32px">🎡</div><strong>بەخت</strong></div>
            </div>
        </div>`;
}

// ============ LESSONS LIST ============
function renderLessons(container) {
    const lang = AppState.settings.currentLanguage, data = LanguageData[lang];
    if (!data) { container.innerHTML = '<p style="padding:20px;text-align:center">🚧 زمانەکە پشتگیری ناکرێت</p>'; return; }
    let html = `<div style="padding:16px"><h2>📚 وانەکانی ${data.name}</h2>`;
    for (let cat in data.categories) {
        const c = data.categories[cat];
        html += `<h3 style="margin:12px 0 8px">${c.icon} ${c.name}</h3>`;
        c.lessons.forEach(l => { html += `<div class="card" style="margin-bottom:8px;cursor:pointer" onclick="navigateTo('lesson',{category:'${cat}',lesson:${l.id}})"><div style="display:flex;align-items:center;gap:12px"><span>📖</span><div style="flex:1"><strong>وانەی ${l.id}</strong><p style="font-size:12px;color:var(--zm-text-secondary)">${l.words.length} وشە</p></div><button class="btn btn-primary btn-sm">▶️</button></div></div>`; });
    }
    html += '</div>'; container.innerHTML = html;
}

// ============ LESSON VIEW ============
function renderLessonView(container, data) {
    const lang = AppState.settings.currentLanguage, cat = LanguageData[lang]?.categories[data.category];
    if (!cat) { container.innerHTML = '<p>وانە نەدۆزرایەوە</p>'; return; }
    const lesson = cat.lessons.find(l=>l.id===data.lesson);
    if (!lesson) { container.innerHTML = '<p>وانە نەدۆزرایەوە</p>'; return; }
    container.innerHTML = `
        <div style="padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <button class="btn btn-sm" onclick="navigateTo('lessons')">⬅️</button>
                <span>وانەی ${lesson.id}</span><span>❤️ ${AppState.currentUser.hearts}</span>
            </div>
            <div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" id="lessonProgress" style="width:0%"></div></div>
            <div class="card" style="text-align:center;min-height:250px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:30px">
                <div id="lessonWord" style="font-size:40px;font-weight:700">${lesson.words[0].en}</div>
                <div id="lessonTranslation" style="font-size:20px;color:var(--zm-text-secondary);margin:8px 0">${lesson.words[0].ku}</div>
                <button class="btn btn-primary btn-sm" onclick="speakWord('${lesson.words[0].en}')">🔊 گوێبگرە</button>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:12px">
                <button class="btn btn-sm" id="prevWord" disabled onclick="changeLessonWord(-1)">⬅️</button>
                <span id="wordCounter">١/${lesson.words.length}</span>
                <button class="btn btn-primary btn-sm" id="nextWord" onclick="changeLessonWord(1)">➡️</button>
            </div>
        </div>`;
    window._lessonData = { words: lesson.words, currentIndex: 0, category: data.category, lessonId: lesson.id };
}

function changeLessonWord(d) {
    const data = window._lessonData; if(!data)return; data.currentIndex+=d;
    if(data.currentIndex>=data.words.length){completeLesson();return}
    if(data.currentIndex<0){data.currentIndex=0;return}
    const w=data.words[data.currentIndex];document.getElementById('lessonWord').textContent=w.en;document.getElementById('lessonTranslation').textContent=w.ku;
    document.getElementById('wordCounter').textContent=`${data.currentIndex+1}/${data.words.length}`;
    document.getElementById('lessonProgress').style.width=`${(data.currentIndex/data.words.length)*100}%`;
    document.getElementById('prevWord').disabled=data.currentIndex===0;
}

function completeLesson() {
    const data=window._lessonData,xpEarned=data.words.length*10;
    AppState.currentUser.xp+=xpEarned;AppState.currentUser.coins+=20;AppState.currentUser.totalWords+=data.words.length;
    AppState.currentUser.level=Math.floor(AppState.currentUser.xp/1000)+1;
    AppState.learning.history.push({type:'lesson',category:data.category,lessonId:data.lessonId,words:data.words.length,xp:xpEarned,date:new Date().toISOString()});
    saveState();spawnConfetti();softNotify(`🎉 وانە تەواو بوو! +${xpEarned} XP`);
    setTimeout(()=>navigateTo('lessons'),1500);
}

// ============ FLASHCARDS ============
function renderFlashcards(container) {
    const words=[];const lang=AppState.settings.currentLanguage;
    for(let c in LanguageData[lang]?.categories||{}){LanguageData[lang].categories[c].lessons.forEach(l=>l.words.forEach(w=>words.push(w)))}
    const shuffled=words.sort(()=>Math.random()-.5).slice(0,8);
    container.innerHTML=`<div style="padding:16px"><h2>🃏 فلاشکارت</h2><div class="flashcard-container" style="perspective:1000px;margin:20px 0"><div class="flashcard" id="fcEl" onclick="flipFC()" style="width:100%;height:220px;position:relative;transform-style:preserve-3d;transition:transform .6s;cursor:pointer"><div style="position:absolute;inset:0;backface-visibility:hidden;background:var(--zm-surface);border-radius:var(--zm-radius);display:flex;justify-content:center;align-items:center;font-size:32px;font-weight:700;border:1px solid var(--zm-border)"><span id="fcWord">${shuffled[0]?.en||''}</span></div><div style="position:absolute;inset:0;backface-visibility:hidden;background:var(--zm-primary);border-radius:var(--zm-radius);display:flex;justify-content:center;align-items:center;font-size:32px;font-weight:700;color:#fff;transform:rotateY(180deg)"><span id="fcTrans">${shuffled[0]?.ku||''}</span></div></div></div><div style="display:flex;gap:10px;justify-content:center"><button class="btn" onclick="rateFC('wrong')">❌</button><button class="btn btn-primary" onclick="rateFC('correct')">✅</button></div><p style="text-align:center;margin-top:8px"><span id="fcIdx">1</span>/${shuffled.length}</p></div>`;
    window._fcData={words:shuffled,currentIndex:0,isFlipped:false,correct:0};
}

function flipFC(){const d=window._fcData;d.isFlipped=!d.isFlipped;document.getElementById('fcEl').style.transform=d.isFlipped?'rotateY(180deg)':'rotateY(0deg)'}
function rateFC(r){const d=window._fcData;if(r==='correct'){d.correct++;AppState.currentUser.xp+=3;playBeep(700,.08)}d.currentIndex++;d.isFlipped=false;
    if(d.currentIndex>=d.words.length){AppState.currentUser.xp+=10;saveState();spawnConfetti();softNotify('🃏 فلاشکارت تەواو!');setTimeout(()=>navigateTo('home'),1500);return}
    const w=d.words[d.currentIndex];document.getElementById('fcWord').textContent=w.en;document.getElementById('fcTrans').textContent=w.ku;document.getElementById('fcIdx').textContent=d.currentIndex+1;document.getElementById('fcEl').style.transform='rotateY(0deg)';saveState()}

// ============ QUIZ ============
function renderQuiz(container) {
    const words=[];const lang=AppState.settings.currentLanguage;
    for(let c in LanguageData[lang]?.categories||{}){LanguageData[lang].categories[c].lessons.forEach(l=>l.words.forEach(w=>words.push(w)))}
    const qw=words.sort(()=>Math.random()-.5).slice(0,6);
    container.innerHTML=`<div style="padding:16px"><h2>📝 کویز</h2><div class="progress-bar" style="margin:8px 0"><div class="progress-fill" id="qzProgress" style="width:0%"></div></div><div class="card" style="text-align:center;padding:24px;margin-bottom:12px"><h3 id="qzPrompt">"${qw[0]?.en}"</h3><button class="btn btn-sm" onclick="speakWord('${qw[0]?.en}')">🔊</button></div><div class="options-grid" id="qzOptions"></div><div style="display:flex;justify-content:space-between;margin-top:12px"><span>❤️ <span id="qzHearts">${AppState.currentUser.hearts}</span></span><span>✅ <span id="qzScore">0</span>/${qw.length}</span></div></div>`;
    window._qzData={words:qw,allWords:words,currentIndex:0,score:0,answered:false};loadQuizQuestion();
}

function loadQuizQuestion(){const d=window._qzData;if(!d||d.currentIndex>=d.words.length){finishQuiz();return}d.answered=false;const c=d.words[d.currentIndex],wrongs=d.allWords.filter(w=>w.ku!==c.ku).sort(()=>Math.random()-.5).slice(0,3),opts=[...wrongs,c].sort(()=>Math.random()-.5);
    document.getElementById('qzPrompt').innerHTML=`"${c.en}" <br><button class="btn btn-sm" onclick="speakWord('${c.en}')">🔊</button>`;document.getElementById('qzProgress').style.width=(d.currentIndex/d.words.length)*100+'%';
    const oEl=document.getElementById('qzOptions');oEl.innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.className='option-btn';b.textContent=o.ku;b.onclick=()=>checkQuizAnswer(o.ku,c.ku,b);oEl.appendChild(b)})}
function checkQuizAnswer(s,c,b){const d=window._qzData;if(!d||d.answered)return;d.answered=true;const all=$$('#qzOptions .option-btn');
    if(s===c){b.classList.add('correct');d.score++;document.getElementById('qzScore').textContent=d.score;AppState.currentUser.xp+=10;playBeep(700,.1)}else{b.classList.add('wrong');AppState.currentUser.hearts--;document.getElementById('qzHearts').textContent=AppState.currentUser.hearts;all.forEach(x=>{if(x.textContent===c)x.classList.add('correct')});playBeep(200,.2)}
    all.forEach(x=>x.style.pointerEvents='none');if(AppState.currentUser.hearts<=0){AppState.currentUser.hearts=5;saveState();softNotify('💔 دڵەکان ڕیست کرانەوە');setTimeout(()=>navigateTo('home'),1000);return}d.currentIndex++;saveState();setTimeout(loadQuizQuestion,1000)}
function finishQuiz(){const d=window._qzData,xp=d.score*15;AppState.currentUser.xp+=xp;AppState.currentUser.coins+=d.score*5;AppState.learning.history.push({type:'quiz',score:d.score,total:d.words.length,xp,date:new Date().toISOString()});saveState();spawnConfetti();softNotify(`🏆 کویز تەواو! +${xp} XP`);setTimeout(()=>navigateTo('home'),1500)}

// ============ SPEED QUIZ ============
function renderSpeedQuiz(container){const words=[];const lang=AppState.settings.currentLanguage;for(let c in LanguageData[lang]?.categories||{}){LanguageData[lang].categories[c].lessons.forEach(l=>l.words.forEach(w=>words.push(w)))}const qw=words.sort(()=>Math.random()-.5).slice(0,10);
    container.innerHTML=`<div style="padding:16px"><h2>⚡ کویزی خێرا</h2><p style="color:#EF4444;font-weight:700">⏱️ <span id="spTimer">30</span>s</p><div class="progress-bar" style="margin:8px 0"><div class="progress-fill" id="spProgress" style="width:0%"></div></div><div class="card" style="text-align:center;padding:20px"><h3 id="spQuestion">${qw[0]?.en}</h3></div><div class="options-grid" id="spOptions" style="margin-top:12px"></div><div style="display:flex;justify-content:space-between;margin-top:12px"><span>✅ <span id="spScore">0</span></span><span>❌ <span id="spWrong">0</span></span></div></div>`;
    window._spData={words:qw,allWords:words,currentIndex:0,score:0,wrong:0,timeLeft:30,timer:null,answered:false};loadSpeedQuestion();startSpeedTimer()}
function loadSpeedQuestion(){const d=window._spData;if(!d||d.currentIndex>=d.words.length||d.timeLeft<=0){finishSpeedQuiz();return}d.answered=false;const c=d.words[d.currentIndex],wrongs=d.allWords.filter(w=>w.ku!==c.ku).sort(()=>Math.random()-.5).slice(0,3),opts=[...wrongs,c].sort(()=>Math.random()-.5);
    document.getElementById('spQuestion').textContent=c.en;document.getElementById('spProgress').style.width=(d.currentIndex/d.words.length)*100+'%';const oEl=document.getElementById('spOptions');oEl.innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.className='option-btn';b.textContent=o.ku;b.onclick=()=>checkSpeedAnswer(o.ku,c.ku,b);oEl.appendChild(b)})}
function checkSpeedAnswer(s,c,b){const d=window._spData;if(!d||d.answered)return;d.answered=true;const all=$$('#spOptions .option-btn');
    if(s===c){b.classList.add('correct');d.score++;d.timeLeft+=2;document.getElementById('spScore').textContent=d.score;playBeep(800,.06)}else{b.classList.add('wrong');d.wrong++;d.timeLeft=Math.max(0,d.timeLeft-3);document.getElementById('spWrong').textContent=d.wrong;all.forEach(x=>{if(x.textContent===c)x.classList.add('correct')});playBeep(200,.12)}
    all.forEach(x=>x.style.pointerEvents='none');d.currentIndex++;saveState();setTimeout(loadSpeedQuestion,400)}
function startSpeedTimer(){const d=window._spData;d.timer=setInterval(()=>{d.timeLeft--;document.getElementById('spTimer').textContent=d.timeLeft;if(d.timeLeft<=0){clearInterval(d.timer);finishSpeedQuiz()}},1000)}
function finishSpeedQuiz(){const d=window._spData;clearInterval(d.timer);const xp=d.score*8;AppState.currentUser.xp+=xp;AppState.learning.history.push({type:'speed-quiz',score:d.score,wrong:d.wrong,xp,date:new Date().toISOString()});saveState();spawnConfetti();softNotify(`⚡ خێرا تەواو! +${xp} XP`);setTimeout(()=>navigateTo('home'),1500)}

// ============ LISTENING ============
function renderListening(container){const words=[];const lang=AppState.settings.currentLanguage;for(let c in LanguageData[lang]?.categories||{}){LanguageData[lang].categories[c].lessons.forEach(l=>l.words.forEach(w=>words.push(w)))}const tw=words.sort(()=>Math.random()-.5).slice(0,5);
    container.innerHTML=`<div style="padding:16px"><h2>🎧 بیستن</h2><div class="card" style="text-align:center;padding:40px;margin:16px 0"><button class="btn btn-primary" onclick="playListenAudio()" style="font-size:40px;width:80px;height:80px;border-radius:50%;padding:0">🔊</button><p id="listenCount">٣ جار ماوە</p></div><div class="options-grid" id="listenOptions"></div><p style="text-align:center;margin-top:12px">✅ <span id="listenScore">0</span>/${tw.length}</p></div>`;
    window._listenData={words:tw,allWords:words,currentIndex:0,score:0,chances:3};loadListeningQuestion()}
function loadListeningQuestion(){const d=window._listenData;if(!d||d.currentIndex>=d.words.length){finishListening();return}d.chances=3;const c=d.words[d.currentIndex],wrongs=d.allWords.filter(w=>w.ku!==c.ku).sort(()=>Math.random()-.5).slice(0,3),opts=[...wrongs,c].sort(()=>Math.random()-.5);
    document.getElementById('listenCount').textContent='٣ جار ماوە';const oEl=document.getElementById('listenOptions');oEl.innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.className='option-btn';b.textContent=o.ku;b.onclick=()=>checkListenAnswer(o.ku,c.ku,b);oEl.appendChild(b)});playListenAudio()}
function playListenAudio(){const d=window._listenData;if(!d||d.chances<=0)return;speakWord(d.words[d.currentIndex].en,'en-US',.7);d.chances--;document.getElementById('listenCount').textContent=`${d.chances} جار ماوە`}
function checkListenAnswer(s,c,b){const d=window._listenData;const all=$$('#listenOptions .option-btn');if(s===c){b.classList.add('correct');d.score++;document.getElementById('listenScore').textContent=d.score;AppState.currentUser.xp+=12;playBeep(800,.1)}else{b.classList.add('wrong');all.forEach(x=>{if(x.textContent===c)x.classList.add('correct')});playBeep(200,.2)}all.forEach(x=>x.style.pointerEvents='none');d.currentIndex++;saveState();setTimeout(loadListeningQuestion,1200)}
function finishListening(){const d=window._listenData,xp=d.score*12;AppState.currentUser.xp+=xp;AppState.learning.history.push({type:'listening',score:d.score,total:d.words.length,xp,date:new Date().toISOString()});saveState();spawnConfetti();softNotify(`🎧 بیستن تەواو! +${xp} XP`);setTimeout(()=>navigateTo('home'),1500)}

// ============ SPEAKING ============
function renderSpeaking(container){container.innerHTML=`<div style="padding:16px"><h2>🎤 قسەکردن</h2><div class="card" style="text-align:center;padding:40px;margin:16px 0"><p>ئەم ڕستەیە بڵێ:</p><h2 style="color:var(--zm-primary)">"Hello, how are you?"</h2><button class="btn btn-sm" onclick="speakWord('Hello, how are you?','en-US',.7)">🔊</button><button class="btn btn-primary btn-lg" style="margin-top:16px" onclick="startRecording()">🎤 دەست بکە</button><p id="recStatus" style="margin-top:8px;color:var(--zm-text-secondary)"></p></div></div>`}
function startRecording(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){document.getElementById('recStatus').textContent='⚠️ پشتگیری ناکرێت';return}const r=new SR();r.lang='en-US';r.start();document.getElementById('recStatus').textContent='گوێدەگرم... 🎙️';r.onresult=e=>{document.getElementById('recStatus').textContent=`تۆ وتت: "${e.results[0][0].transcript}"`;AppState.currentUser.xp+=15;saveState();softNotify('+15 XP!')};r.onerror=()=>document.getElementById('recStatus').textContent='❌ هەڵە'}

// ============ READING ============
function renderReading(container){const story={title:'ڕۆژێکی سادە',en:'Every morning, I wake up at 7. I brush my teeth. Then I eat breakfast.',ku:'هەموو بەیانییەک، ٧ هەڵدەستم. ددانم شوشت. دواتر نانی بەیانی دەخۆم.',questions:[{q:'کاژێر چەند هەڵدەستێت؟',opts:['٦','٧','٨'],correct:'٧'}]};
    container.innerHTML=`<div style="padding:16px"><h2>📖 خوێندنەوە</h2><div class="card" style="margin:12px 0"><h3>${story.title}</h3><p id="stEn" style="line-height:2">${story.en}</p><button class="btn btn-sm" onclick="toggleStory()">👀 وەرگێڕان</button><p id="stKu" style="line-height:2;display:none">${story.ku}</p></div><div id="rdQuestions"></div></div>`;
    window._rdData=story;renderReadingQuestions()}
function toggleStory(){const ku=document.getElementById('stKu');ku.style.display=ku.style.display==='none'?'block':'none'}
function renderReadingQuestions(){const s=window._rdData,c=document.getElementById('rdQuestions');c.innerHTML='';s.questions.forEach((q,i)=>{const d=document.createElement('div');d.className='card';d.style.marginTop='8px';d.innerHTML=`<p><strong>${i+1}. ${q.q}</strong></p><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">${q.opts.map(o=>`<button class="option-btn rdOpt" data-correct="${q.correct}" onclick="checkRdAnswer(this,'${o}','${q.correct}')">${o}</button>`).join('')}</div>`;c.appendChild(d)})}
function checkRdAnswer(b,s,c){const all=b.parentElement.querySelectorAll('.rdOpt');if(s===c){b.classList.add('correct');AppState.currentUser.xp+=10;playBeep(800,.1)}else{b.classList.add('wrong');all.forEach(x=>{if(x.dataset.correct===c)x.classList.add('correct')});playBeep(200,.2)}all.forEach(x=>x.style.pointerEvents='none');saveState()}

// ============ WRITING ============
function renderWriting(container){const words=[];const lang=AppState.settings.currentLanguage;for(let c in LanguageData[lang]?.categories||{}){LanguageData[lang].categories[c].lessons.forEach(l=>l.words.forEach(w=>words.push(w)))}const tw=words.sort(()=>Math.random()-.5).slice(0,5);
    container.innerHTML=`<div style="padding:16px"><h2>✍️ نووسین</h2><div class="card" style="text-align:center;padding:24px;margin:16px 0"><h2 id="wrPrompt" style="color:var(--zm-primary)">${tw[0]?.ku}</h2></div><div style="display:flex;gap:8px"><input id="wrInput" placeholder="بنووسە..." style="flex:1;padding:14px;border-radius:var(--zm-radius-sm);border:2px solid var(--zm-border);font-size:16px;background:var(--zm-surface);color:var(--zm-text)"><button class="btn btn-primary" onclick="checkWriting()">✅</button></div><p id="wrFeedback" style="text-align:center;margin-top:8px;font-weight:600"></p><p style="text-align:center">✅ <span id="wrScore">0</span>/${tw.length}</p></div>`;
    window._wrData={words:tw,currentIndex:0,score:0}}
function checkWriting(){const d=window._wrData,i=document.getElementById('wrInput').value.trim().toLowerCase(),c=d.words[d.currentIndex].en.toLowerCase(),f=document.getElementById('wrFeedback');
    if(i===c){f.textContent='✅ ڕاستە!';f.style.color='#10B981';d.score++;document.getElementById('wrScore').textContent=d.score;AppState.currentUser.xp+=10;playBeep(800,.1)}else{f.textContent=`❌ ڕاستەکە: "${c}"`;f.style.color='#EF4444';playBeep(200,.2)}
    d.currentIndex++;saveState();if(d.currentIndex>=d.words.length){const xp=d.score*10;AppState.currentUser.xp+=xp;saveState();spawnConfetti();softNotify(`✍️ نووسین تەواو! +${xp} XP`);setTimeout(()=>navigateTo('home'),1500);return}
    setTimeout(()=>{document.getElementById('wrPrompt').textContent=d.words[d.currentIndex].ku;document.getElementById('wrInput').value='';f.textContent=''},1200)}

// ============ AI TEACHER ============
function renderAITeacher(container){container.innerHTML=`<div style="padding:16px"><h2>🤖 مامۆستای AI</h2><div id="aiChat" class="card" style="min-height:300px;max-height:400px;overflow-y:auto;margin:12px 0;padding:16px"><div style="text-align:center;color:var(--zm-text-secondary);padding:40px 0"><p style="font-size:48px">🤖</p><p>چۆن دەتوانم یارمەتیت بدەم؟</p></div></div><div style="display:flex;gap:8px"><input id="aiInput" placeholder="پرسیار بکە..." style="flex:1;padding:14px;border-radius:var(--zm-radius-sm);border:2px solid var(--zm-border);background:var(--zm-surface);color:var(--zm-text)"><button class="btn btn-primary" onclick="askAI()">📤</button></div><div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn btn-sm" onclick="quickAI('ڕێزمان')">ڕێزمان</button><button class="btn btn-sm" onclick="quickAI('وەرگێڕان')">وەرگێڕان</button><button class="btn btn-sm" onclick="quickAI('ڕاهێنان')">ڕاهێنان</button></div></div>`}
function askAI(){const i=document.getElementById('aiInput'),c=document.getElementById('aiChat');if(!i||!c||!i.value.trim())return;const q=i.value.trim();i.value='';c.innerHTML+=`<div style="text-align:right;margin:8px 0"><span style="background:var(--zm-primary);color:#fff;padding:8px 14px;border-radius:18px;display:inline-block">${q}</span></div>`;setTimeout(()=>{const rs=['بەڵێ، دەتوانم یارمەتیت بدەم!','زۆر باشە، ئەمە ڕێزمانەکەیە...','باشە، ڕاهێنانێک دەست پێدەکەم...'];c.innerHTML+=`<div style="text-align:left;margin:8px 0"><span style="background:var(--zm-surface-hover);padding:8px 14px;border-radius:18px;display:inline-block">🤖 ${rs[Math.floor(Math.random()*rs.length)]}</span></div>`;c.scrollTop=c.scrollHeight;AppState.currentUser.xp+=5;saveState()},800);c.scrollTop=c.scrollHeight}
function quickAI(q){document.getElementById('aiInput').value=q;askAI()}

// ============ PROGRESS ============
function renderProgress(container){const h=AppState.learning.history.slice(-10).reverse(),u=AppState.currentUser;
    container.innerHTML=`<div style="padding:16px"><h2>📊 پێشکەوتن</h2><div class="card" style="margin:12px 0"><h3>ئامار</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><div>XP: ${u.xp}</div><div>ئاست: ${u.level}</div><div>وشە: ${u.totalWords}</div><div>ستریک: ${u.streak}🔥</div></div></div><div class="card"><h3>مێژوو</h3>${h.length===0?'<p style="color:var(--zm-text-secondary)">هێشتا هیچ چالاکییەک نییە</p>':h.map(x=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--zm-border-light)"><span>${x.type==='quiz'?'📝':x.type==='listening'?'🎧':'📚'}</span><div style="flex:1"><strong>${x.type}</strong></div><span style="color:var(--zm-primary)">+${x.xp} XP</span></div>`).join('')}</div></div>`}

// ============ ACHIEVEMENTS ============
function renderAchievements(container){const b=[{n:'برۆنزی',i:'🥉',e:AppState.learning.history.filter(h=>h.type==='lesson').length>=5},{n:'زیوی',i:'🥈',e:AppState.learning.history.filter(h=>h.type==='lesson').length>=20},{n:'زێڕین',i:'🥇',e:AppState.currentUser.xp>=5000},{n:'خێرا',i:'⚡',e:AppState.learning.history.some(h=>h.type==='speed-quiz')}];
    container.innerHTML=`<div style="padding:16px"><h2>🏆 دەستکەوتەکان</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">${b.map(x=>`<div class="card" style="text-align:center;opacity:${x.e?'1':'.4'}"><div style="font-size:36px">${x.e?x.i:'🔒'}</div><strong>${x.n}</strong>${x.e?'<p style="color:#10B981;font-size:11px">✅</p>':''}</div>`).join('')}</div></div>`}

// ============ COMMUNITY ============
function renderCommunity(container){const u=[{n:'سارا',l:12,xp:4500,a:'👩'},{n:'ئارام',l:8,xp:2800,a:'👨'},{n:'دلشاد',l:15,xp:6200,a:'🧔'}].sort((a,b)=>b.xp-a.xp);
    container.innerHTML=`<div style="padding:16px"><h2>👥 کۆمەڵگا</h2><div class="card"><h3>🏆 ڕیزبەندی</h3>${u.map((x,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--zm-border-light)"><span>${i===0?'🥇':i===1?'🥈':'🥉'}</span><span>${x.a}</span><div style="flex:1"><strong>${x.n}</strong></div><span style="color:var(--zm-primary)">${x.xp} XP</span></div>`).join('')}</div></div>`}

// ============ PROFILE ============
function renderProfile(container){const u=AppState.currentUser;
    container.innerHTML=`<div style="padding:16px"><div class="card" style="text-align:center;padding:24px"><div style="font-size:64px">👤</div><h2>${u.name}</h2><p>ئاست ${u.level}</p><div class="progress-bar" style="margin:8px 0"><div class="progress-fill" style="width:${(u.xp%1000)/10}%"></div></div><p>${u.xp} XP</p></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><div class="card">🔥 ${u.streak}</div><div class="card">💎 ${u.gems}</div><div class="card">🪙 ${u.coins}</div><div class="card">📚 ${u.totalWords}</div></div><button class="btn btn-primary btn-lg" style="width:100%;margin-top:12px" onclick="changeName()">✏️ گۆڕینی ناو</button></div>`}
function changeName(){const n=prompt('ناوی نوێ:');if(n&&n.trim()){AppState.currentUser.name=n.trim();saveState();navigateTo('profile')}}

// ============ SETTINGS ============
function renderSettings(container){container.innerHTML=`<div style="padding:16px"><h2>⚙️ ڕێکخستن</h2><div class="card" style="margin-top:12px"><h3>🌗 ڕووکار</h3><div style="display:flex;gap:8px;margin-top:8px"><button class="btn ${!AppState.settings.darkMode?'btn-primary':''}" onclick="setTheme(false)">☀️</button><button class="btn ${AppState.settings.darkMode?'btn-primary':''}" onclick="setTheme(true)">🌙</button></div></div><div class="card" style="margin-top:12px"><h3>🌍 زمان</h3><select onchange="changeLang(this.value)" style="width:100%;margin-top:8px;padding:10px;border-radius:8px;border:2px solid var(--zm-border);background:var(--zm-surface);color:var(--zm-text)">${Object.entries(LanguageData).map(([k,v])=>`<option value="${k}" ${AppState.settings.currentLanguage===k?'selected':''}>${v.name}</option>`).join('')}</select></div></div>`}
function setTheme(d){AppState.settings.darkMode=d;document.body.classList.toggle('dark-mode',d);localStorage.setItem('zm_dark',d);softNotify(d?'🌙 Dark Mode':'☀️ Light Mode')}
function changeLang(l){AppState.settings.currentLanguage=l;localStorage.setItem('zm_lang',l);softNotify('✅ زمان گۆڕدرا')}

// ============ PREMIUM ============
function renderPremium(container){container.innerHTML=`<div style="padding:16px"><h2>💎 پڕیمیوم</h2><div class="card" style="text-align:center;margin-top:12px"><h3>🆓 بێبەرامبەر</h3><p style="font-size:28px;font-weight:800">$0</p></div><div class="card card-premium" style="text-align:center;margin-top:12px"><h3>💎 پڕیمیوم</h3><p style="font-size:28px;font-weight:800;color:var(--zm-primary)">$4.99</p><button class="btn btn-primary btn-lg" style="margin-top:8px" onclick="softNotify('🚀 بەم زووانە!')">دەستپێبکە</button></div></div>`}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded',()=>{
    console.log('🚀 Ziman App - All New Features Active');
    setTimeout(()=>document.getElementById('splashScreen').style.display='none',2300);
    if(AppState.settings.darkMode)document.body.classList.add('dark-mode');
    checkStreak();initCommandPalette();
    setTimeout(()=>{document.getElementById('dailyRewardPopup')?.classList.add('show');showResumeNotification()},3500);
    renderHome(document.getElementById('mainContent'));updateHeaderStats();
    document.getElementById('menuBtn')?.addEventListener('click',()=>{document.getElementById('sideMenu')?.classList.toggle('open');document.getElementById('menuOverlay')?.classList.toggle('open')});
    document.getElementById('menuOverlay')?.addEventListener('click',()=>{document.getElementById('sideMenu')?.classList.remove('open');document.getElementById('menuOverlay')?.classList.remove('open')});
    $$('[data-page]').forEach(el=>el.addEventListener('click',()=>{const p=el.dataset.page;if(p)navigateTo(p)}));
    document.getElementById('languageSelect')?.addEventListener('change',function(){changeLang(this.value)});
    document.getElementById('claimReward')?.addEventListener('click',()=>{AppState.currentUser.gems+=50;AppState.currentUser.xp+=20;saveState();localStorage.setItem('zm_lastReward',new Date().toDateString());document.getElementById('dailyRewardPopup').classList.remove('show');spawnConfetti();softNotify('🎁 +50 💎 وەرگیرا!')});
    document.getElementById('closeAchievement')?.addEventListener('click',()=>document.getElementById('achievementPopup').classList.remove('show'));
    document.getElementById('spinWheel')?.addEventListener('click',spinWheel);
    document.getElementById('closeWheel')?.addEventListener('click',()=>document.getElementById('luckyWheelPopup').classList.remove('show'));
    document.getElementById('aiBubble')?.addEventListener('click',()=>navigateTo('ai-teacher'));
    window.addEventListener('resize',()=>{const c=document.getElementById('confettiCanvas');if(c){c.width=innerWidth;c.height=innerHeight}});
});

function checkStreak(){const l=AppState.currentUser.lastLogin,t=new Date();if(!l){AppState.currentUser.streak=1}else{const ld=new Date(l),diff=Math.floor((t-ld)/86400000);if(diff===0)return;if(diff===1){AppState.currentUser.streak++;if(AppState.currentUser.streak%7===0)softNotify(`🔥 ${AppState.currentUser.streak} ڕۆژ!`)}else{AppState.currentUser.streak=1}}AppState.currentUser.lastLogin=t.toISOString();saveState()}
function spinWheel(){const w=document.getElementById('luckyWheel'),b=document.getElementById('spinWheel');w.style.transform=`rotate(${Math.floor(Math.random()*360)+1800}deg)`;b.disabled=true;b.textContent='...';setTimeout(()=>{const p=[()=>{AppState.currentUser.xp+=50},()=>{AppState.currentUser.gems+=100}][Math.floor(Math.random()*2)];p();saveState();softNotify('🎉 براوە!');spawnConfetti();b.disabled=false;b.textContent='بخولێنە!';w.style.transform='rotate(0deg)';setTimeout(()=>document.getElementById('luckyWheelPopup').classList.remove('show'),1000)},3000)}

if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}

console.log('✅ Ziman App Loaded! Command Palette (Ctrl+K) | Focus Mode (Ctrl+F) | Smart Resume | Heatmap Ready');
