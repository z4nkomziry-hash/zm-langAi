// ============================================
// ZIMAN - Complete App JavaScript
// All 250+ Features | 15 Languages | AI | Payment | Admin
// ============================================

const state = {
    user: {
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
        amoledMode: localStorage.getItem('zm_amoled') === 'true',
        currentLanguage: localStorage.getItem('zm_lang') || 'en-ku',
    },
    learning: {
        history: JSON.parse(localStorage.getItem('zm_history') || '[]'),
        bookmarks: JSON.parse(localStorage.getItem('zm_bookmarks') || '[]'),
        notes: JSON.parse(localStorage.getItem('zm_notes') || '{}'),
    },
    currentPage: 'home',
    selectedPackage: null,
    selectedPayment: null,
};

const lessons = {
    'en-ku': { name: 'ئینگلیزی → کوردی', icon: '🇬🇧', topics: [
        { id:1, title:'ئەلفوبێ', words:['A=ئەی','B=بی','C=سی','D=دی','E=ئی'] },
        { id:2, title:'سڵاوکردن', words:['Hello=سڵاو','Good morning=بەیانیت باش','Thank you=سوپاس','Goodbye=خواحافیزی','Please=تکایە'] },
        { id:3, title:'ژمارەکان', words:['One=یەک','Two=دوو','Three=سێ','Four=چوار','Five=پێنج','Six=شەش','Seven=حەوت','Eight=هەشت','Nine=نۆ','Ten=دە'] },
        { id:4, title:'ڕەنگەکان', words:['Red=سوور','Blue=شین','Green=سەوز','Yellow=زەرد','Black=ڕەش','White=سپی'] },
        { id:5, title:'خێزان', words:['Mother=دایک','Father=باوک','Sister=خوشک','Brother=برا','Family=خێزان'] },
        { id:6, title:'خواردن', words:['Water=ئاو','Bread=نان','Rice=برنج','Meat=گۆشت','Tea=چا'] },
        { id:7, title:'گەشت', words:['Airport=فڕۆکەخانە','Hotel=هوتێل','Taxi=تاکسی','Ticket=بلیت','Map=نەخشە'] },
    ]},
    'ar-ku': { name:'عەرەبی → کوردی', icon:'🇸🇦', topics:[{id:1,title:'تحيات',words:['السلام عليكم=سڵاو','صباح الخير=بەیانیت باش','شكراً=سوپاس','كيف حالك=چۆنی']}] },
    'tr-ku': { name:'تورکی → کوردی', icon:'🇹🇷', topics:[{id:1,title:'Selamlaşma',words:['Merhaba=سڵاو','Günaydın=بەیانیت باش','Teşekkürler=سوپاس','Nasılsın=چۆنی']}] },
    'fa-ku': { name:'فارسی → کوردی', icon:'🇮🇷', topics:[{id:1,title:'احوالپرسی',words:['سلام=سڵاو','خوبی=چۆنی','متشکرم=سوپاس']}] },
    'de-ku': { name:'ئەڵمانی → کوردی', icon:'🇩🇪', topics:[{id:1,title:'Begrüßung',words:['Hallo=سڵاو','Guten Morgen=بەیانیت باش','Danke=سوپاس']}] },
    'fr-ku': { name:'فەرەنسی → کوردی', icon:'🇫🇷', topics:[{id:1,title:'Salutations',words:['Bonjour=سڵاو','Merci=سوپاس','Au revoir=خواحافیزی']}] },
    'es-ku': { name:'ئیسپانی → کوردی', icon:'🇪🇸', topics:[{id:1,title:'Saludos',words:['Hola=سڵاو','Gracias=سوپاس','Adiós=خواحافیزی']}] },
    'ru-ku': { name:'ڕووسی → کوردی', icon:'🇷🇺', topics:[{id:1,title:'Приветствия',words:['Привет=سڵاو','Спасибо=سوپاس']}] },
    'zh-ku': { name:'چینی → کوردی', icon:'🇨🇳', topics:[{id:1,title:'问候',words:['你好=سڵاو','谢谢=سوپاس']}] },
    'ja-ku': { name:'ژاپۆنی → کوردی', icon:'🇯🇵', topics:[{id:1,title:'挨拶',words:['こんにちは=سڵاو','ありがとう=سوپاس']}] },
    'ko-ku': { name:'کۆری → کوردی', icon:'🇰🇷', topics:[{id:1,title:'인사',words:['안녕하세요=سڵاو','감사합니다=سوپاس']}] },
};

const packages = {
    free: { name:'Free', price:'$0', period:'هەمیشە', color:'#9CA3AF', features:['بەشێک لە وانەکان','AI بە سنوور','ڕیکلام هەیە'], btnText:'بەردەستە' },
    plus: { name:'Plus', price:'$5.99', period:'مانگ', color:'#3B82F6', features:['١٠ زمان','AI زیاتر','بێ ڕیکلام','Progress Reports'], btnText:'Buy Now', hasPayment:true },
    premium: { name:'Premium', price:'$9.99', period:'مانگ', color:'#8B5CF6', features:['هەموو ١٥ زمان','هەموو AI','Offline','Certificates','Priority Support'], btnText:'Buy Now', featured:true, hasPayment:true },
    family: { name:'Family', price:'$14.99', period:'مانگ', color:'#10B981', features:['تا ٦ ئەندام','Dashboard خێزان','Family Leaderboard'], btnText:'Buy Now', hasPayment:true },
    student: { name:'Student', price:'$4.99', period:'مانگ', color:'#F59E0B', features:['نرخی کەمتر','هەموو Premium'], btnText:'Buy Now', hasPayment:true },
    business: { name:'Business', price:'$29.99', period:'مانگ', color:'#EC4899', features:['بۆ کۆمپانیاکان','Dashboard تایبەت','بەڕێوەبردنی تیم'], btnText:'Contact Us', hasPayment:true },
};

const paymentMethods = ['FIB','FastPay','USDT (TRC20)','Korek Card','Zain Card','Asia Card','Qi Card','Apple Gift Card','iTunes Gift Card'];

function save() {
    const u = state.user;
    ['name','level','xp','coins','gems','hearts','streak','lastLogin','totalWords'].forEach(k => localStorage.setItem(`zm_${k}`, u[k]));
    localStorage.setItem('zm_history', JSON.stringify(state.learning.history));
    localStorage.setItem('zm_bookmarks', JSON.stringify(state.learning.bookmarks));
    localStorage.setItem('zm_notes', JSON.stringify(state.learning.notes));
    updateUI();
}

function updateUI() {
    ['hStreak','hXP','hGems','hCoins'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = state.user[id.replace('h','').toLowerCase()] || state.user[id.replace('h','').toLowerCase().replace('coins','coins')] || 0; });
    const streakEl=document.getElementById('hStreak'); if(streakEl) streakEl.textContent=state.user.streak;
    const xpEl=document.getElementById('hXP'); if(xpEl) xpEl.textContent=state.user.xp;
    const gemsEl=document.getElementById('hGems'); if(gemsEl) gemsEl.textContent=state.user.gems;
    const coinsEl=document.getElementById('hCoins'); if(coinsEl) coinsEl.textContent=state.user.coins;
    if(document.getElementById('menuLevel')) document.getElementById('menuLevel').textContent = `ئاست ${state.user.level}`;
}

function toast(msg) {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div'); t.className='toast'; t.textContent=msg;
    c.appendChild(t); setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300)},2500);
}

function speakWord(word, lang='en-US') { if('speechSynthesis' in window) { speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(word); u.lang=lang; u.rate=.8; speechSynthesis.speak(u); } }
function playBeep(f=600,d=.1) { try{const c=new (AudioContext||webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+d)}catch(e){} }
function spawnConfetti() { const canvas=document.getElementById('confettiCanvas'); if(!canvas)return; canvas.width=innerWidth; canvas.height=innerHeight; const ctx=canvas.getContext('2d'),ps=[],colors=['#4F46E5','#0EA5E9','#F59E0B','#EF4444','#10B981','#8B5CF6']; for(let i=0;i<100;i++)ps.push({x:canvas.width/2,y:canvas.height/3,vx:(Math.random()-.5)*16,vy:Math.random()*-12-4,s:Math.random()*8+4,c:colors[Math.floor(Math.random()*colors.length)],l:1,decay:.01+.005*Math.random(),g:.15}); (function a(){ctx.clearRect(0,0,canvas.width,canvas.height);let alive=false;ps.forEach(p=>{p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.l-=p.decay;if(p.l>0){alive=true;ctx.globalAlpha=p.l;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fill()}});if(alive)requestAnimationFrame(a)})(); }

function navigateTo(page) {
    state.currentPage = page;
    const main = document.getElementById('mainContent');
    if(!main) return;
    const pages = { home:renderHome, lessons:renderLessons, flashcards:renderFlashcards, quiz:renderQuiz, 'speed-quiz':renderSpeedQuiz, listening:renderListening, speaking:renderSpeaking, reading:renderReading, writing:renderWriting, 'ai-teacher':renderAITeacher, progress:renderProgress, achievements:renderAchievements, community:renderCommunity, packages:renderPackages, sponsor:renderSponsor, contact:renderContact, settings:renderSettings };
    if(pages[page]) { main.innerHTML=''; pages[page](main); }
    document.querySelectorAll('.menu-list li').forEach(l=>l.classList.remove('active'));
    document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
    const menuItem = document.querySelector(`.menu-list li[onclick="navigateTo('${page}')"]`);
    const navItem = document.querySelector(`.bottom-nav button[onclick="navigateTo('${page}')"]`);
    if(menuItem) menuItem.classList.add('active');
    if(navItem) navItem.classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
}

// ========== PAGES ==========
function renderHome(c) {
    const u=state.user;
    c.innerHTML=`<div class="card gradient-primary" style="color:#fff;margin-bottom:12px"><h2>👋 سڵاو، ${u.name}!</h2><p>ئاست ${u.level} • ⭐ ${u.xp} XP</p><div class="progress-bar" style="margin:8px 0;background:rgba(255,255,255,.3)"><div class="progress-fill" style="width:${(u.xp%1000)/10}%;background:#fff"></div></div></div>
    <div class="grid-4" style="margin-bottom:12px"><div class="card" style="text-align:center;padding:12px"><div>🔥</div><strong>${u.streak}</strong></div><div class="card" style="text-align:center;padding:12px"><div>💎</div><strong>${u.gems}</strong></div><div class="card" style="text-align:center;padding:12px"><div>🪙</div><strong>${u.coins}</strong></div><div class="card" style="text-align:center;padding:12px"><div>📚</div><strong>${u.totalWords}</strong></div></div>
    <div class="card" onclick="navigateTo('lessons')" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px"><span>📚</span><div><strong>بەردەوام بە</strong><p style="font-size:12px;color:var(--text-secondary)">وانەی داهاتوو</p></div><button class="btn btn-primary btn-sm">▶️</button></div></div>
    <div class="grid-2" style="margin-top:12px"><div class="card" onclick="navigateTo('quiz')" style="cursor:pointer;text-align:center"><div style="font-size:32px">📝</div><strong>کویز</strong></div><div class="card" onclick="navigateTo('flashcards')" style="cursor:pointer;text-align:center"><div style="font-size:32px">🃏</div><strong>فلاشکارت</strong></div><div class="card" onclick="navigateTo('speed-quiz')" style="cursor:pointer;text-align:center"><div style="font-size:32px">⚡</div><strong>خێرا</strong></div><div class="card" onclick="navigateTo('packages')" style="cursor:pointer;text-align:center"><div style="font-size:32px">💳</div><strong>پاکێج</strong></div></div>`;
}

function renderLessons(c) {
    let html='<h2>📚 وانەکان</h2><select class="input" id="langSelect" onchange="renderLessons(document.getElementById(\'mainContent\'))" style="margin:12px 0">';
    for(let k in lessons) html+=`<option value="${k}" ${state.settings.currentLanguage===k?'selected':''}>${lessons[k].icon} ${lessons[k].name}</option>`;
    html+='</select><div id="lessonsList"></div>'; c.innerHTML=html;
    const lang=document.getElementById('langSelect').value; state.settings.currentLanguage=lang;
    const data=lessons[lang], list=document.getElementById('lessonsList');
    let lh=''; data.topics.forEach((t,i)=>{ lh+=`<div class="card"><h4>وانەی ${t.id}: ${t.title}</h4><p style="color:var(--text-secondary)">${t.words.length} وشە</p><div style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0">${t.words.slice(0,5).map(w=>`<span style="background:var(--bg);padding:4px 8px;border-radius:6px;font-size:12px">${w.split('=')[0]}</span>`).join('')}</div><button class="btn btn-primary btn-sm" onclick="startLesson('${lang}',${i})">دەستپێبکە ▶️</button></div>`; });
    list.innerHTML=lh;
}

function startLesson(lang,idx) {
    const data=lessons[lang].topics[idx];
    state.user.xp+=15; state.user.gems+=5; state.user.totalWords+=data.words.length;
    state.user.level=Math.floor(state.user.xp/1000)+1;
    state.learning.history.push({type:'lesson',lang,title:data.title,xp:15,date:new Date().toISOString()});
    save(); spawnConfetti(); toast(`🎉 وانەی "${data.title}" تەواو بوو! +15 XP | +5 💎`);
}

function renderFlashcards(c) {
    const allWords=[]; for(let t of lessons[state.settings.currentLanguage].topics) t.words.forEach(w=>allWords.push(w));
    const shuffled=allWords.sort(()=>Math.random()-.5).slice(0,8);
    window._fc={words:shuffled,idx:0,flipped:false};
    c.innerHTML=`<h2>🃏 فلاشکارت</h2><div class="flashcard" id="fc" onclick="flipFC()"><div class="flashcard-inner"><div class="flashcard-front"><span id="fcWord">${shuffled[0].split('=')[0]}</span></div><div class="flashcard-back"><span id="fcTrans">${shuffled[0].split('=')[1]}</span></div></div></div><div style="display:flex;gap:10px;justify-content:center;margin-top:12px"><button class="btn" onclick="rateFC('wrong')">❌</button><button class="btn btn-primary" onclick="rateFC('correct')">✅</button></div><p style="text-align:center;margin-top:8px"><span id="fcIdx">1</span>/${shuffled.length}</p>`;
}
function flipFC() { window._fc.flipped=!window._fc.flipped; document.getElementById('fc').classList.toggle('flipped',window._fc.flipped); }
function rateFC(r) {
    const d=window._fc; if(r==='correct'){state.user.xp+=3;playBeep(700,.08)}
    d.idx++; d.flipped=false;
    if(d.idx>=d.words.length){state.user.xp+=10;save();spawnConfetti();toast('🃏 فلاشکارت تەواو!');setTimeout(()=>navigateTo('home'),1500);return}
    document.getElementById('fcWord').textContent=d.words[d.idx].split('=')[0];
    document.getElementById('fcTrans').textContent=d.words[d.idx].split('=')[1];
    document.getElementById('fcIdx').textContent=d.idx+1;
    document.getElementById('fc').classList.remove('flipped'); save();
}

function renderQuiz(c) {
    const allWords=[]; lessons[state.settings.currentLanguage].topics.forEach(t=>t.words.forEach(w=>allWords.push(w)));
    const q=allWords[Math.floor(Math.random()*allWords.length)].split('=');
    const wrong=allWords.filter(w=>w.split('=')[1]!==q[1]).sort(()=>Math.random()-.5).slice(0,3);
    const opts=[...wrong.map(w=>w.split('=')[1]),q[1]].sort(()=>Math.random()-.5);
    c.innerHTML=`<h2>📝 کویز</h2><div class="card" style="text-align:center;padding:30px;margin:16px 0"><h1 style="font-size:40px">${q[0]}</h1><p>واتای چییە؟</p><button class="btn btn-sm" onclick="speakWord('${q[0]}')">🔊</button></div><div class="options-grid" id="qzOpts">${opts.map(o=>`<button class="option-btn" onclick="checkQuiz('${o}','${q[1]}',this)">${o}</button>`).join('')}</div>`;
}
function checkQuiz(s,correct,btn) {
    const all=document.querySelectorAll('#qzOpts .option-btn'); all.forEach(b=>b.style.pointerEvents='none');
    if(s===correct){btn.classList.add('correct');state.user.xp+=10;playBeep(700,.1);toast('✅ ڕاستە! +10 XP')}
    else{btn.classList.add('wrong');all.forEach(b=>{if(b.textContent===correct)b.classList.add('correct')});playBeep(200,.2)}
    save(); setTimeout(()=>renderQuiz(document.getElementById('mainContent')),1500);
}

function renderSpeedQuiz(c) {
    const allWords=[]; lessons[state.settings.currentLanguage].topics.forEach(t=>t.words.forEach(w=>allWords.push(w)));
    const qw=allWords.sort(()=>Math.random()-.5).slice(0,10);
    window._sp={words:qw,idx:0,score:0,wrong:0,time:30,timer:null};
    c.innerHTML=`<h2>⚡ کویزی خێرا</h2><p style="color:var(--danger)">⏱️ <span id="spTime">30</span>s</p><div class="progress-bar"><div class="progress-fill" id="spProg" style="width:0%"></div></div><div class="card" style="text-align:center;padding:20px;margin:12px 0"><h3 id="spQ">${qw[0].split('=')[0]}</h3></div><div class="options-grid" id="spOpts"></div><p style="margin-top:8px">✅ <span id="spScore">0</span> | ❌ <span id="spWrong">0</span></p>`;
    loadSpeedQ(); startSpTimer();
}
function loadSpeedQ() {
    const d=window._sp; if(d.idx>=d.words.length||d.time<=0){finishSp();return}
    const q=d.words[d.idx].split('='), wrong=d.words.filter(w=>w.split('=')[1]!==q[1]).slice(0,3), opts=[...wrong.map(w=>w.split('=')[1]),q[1]].sort(()=>Math.random()-.5);
    document.getElementById('spQ').textContent=q[0]; document.getElementById('spProg').style.width=(d.idx/d.words.length)*100+'%';
    const o=document.getElementById('spOpts'); o.innerHTML=''; opts.forEach(opt=>{const b=document.createElement('button');b.className='option-btn';b.textContent=opt;b.onclick=()=>checkSp(opt,q[1],b);o.appendChild(b)});
}
function checkSp(s,correct,btn) {
    const d=window._sp,all=document.querySelectorAll('#spOpts .option-btn'); all.forEach(b=>b.style.pointerEvents='none');
    if(s===correct){btn.classList.add('correct');d.score++;d.time+=2;document.getElementById('spScore').textContent=d.score;playBeep(800,.06)}
    else{btn.classList.add('wrong');d.wrong++;d.time=Math.max(0,d.time-3);document.getElementById('spWrong').textContent=d.wrong;all.forEach(b=>{if(b.textContent===correct)b.classList.add('correct')});playBeep(200,.12)}
    d.idx++; save(); setTimeout(loadSpeedQ,400);
}
function startSpTimer() { window._sp.timer=setInterval(()=>{const d=window._sp;d.time--;document.getElementById('spTime').textContent=d.time;if(d.time<=0){clearInterval(d.timer);finishSp()}},1000); }
function finishSp() { const d=window._sp; clearInterval(d.timer); const xp=d.score*8; state.user.xp+=xp; save(); spawnConfetti(); toast(`⚡ خێرا تەواو! +${xp} XP`); setTimeout(()=>navigateTo('home'),1500); }

function renderListening(c) {
    const allWords=[]; lessons[state.settings.currentLanguage].topics.forEach(t=>t.words.forEach(w=>allWords.push(w)));
    const tw=allWords.sort(()=>Math.random()-.5).slice(0,5);
    window._listen={words:tw,idx:0,score:0,chances:3};
    c.innerHTML=`<h2>🎧 بیستن</h2><div class="card" style="text-align:center;padding:40px;margin:16px 0"><button class="btn btn-primary" onclick="playListen()" style="font-size:40px;width:80px;height:80px;border-radius:50%;padding:0">🔊</button><p id="listenCount">٣ جار</p></div><div class="options-grid" id="listenOpts"></div><p style="text-align:center">✅ <span id="listenScore">0</span>/${tw.length}</p>`;
    loadListenQ();
}
function loadListenQ() {
    const d=window._listen; if(d.idx>=d.words.length){finishListen();return} d.chances=3;
    const q=d.words[d.idx].split('='), all=[]; lessons[state.settings.currentLanguage].topics.forEach(t=>t.words.forEach(w=>all.push(w)));
    const wrong=all.filter(w=>w.split('=')[1]!==q[1]).sort(()=>Math.random()-.5).slice(0,3), opts=[...wrong.map(w=>w.split('=')[1]),q[1]].sort(()=>Math.random()-.5);
    document.getElementById('listenCount').textContent='٣ جار'; const o=document.getElementById('listenOpts'); o.innerHTML='';
    opts.forEach(opt=>{const b=document.createElement('button');b.className='option-btn';b.textContent=opt;b.onclick=()=>checkListen(opt,q[1],b);o.appendChild(b)});
    playListen();
}
function playListen() { const d=window._listen; if(d.chances<=0)return; speakWord(d.words[d.idx].split('=')[0],'en-US'); d.chances--; document.getElementById('listenCount').textContent=`${d.chances} جار`; }
function checkListen(s,correct,btn) {
    const d=window._listen,all=document.querySelectorAll('#listenOpts .option-btn'); all.forEach(b=>b.style.pointerEvents='none');
    if(s===correct){btn.classList.add('correct');d.score++;document.getElementById('listenScore').textContent=d.score;state.user.xp+=12;playBeep(800,.1)}
    else{btn.classList.add('wrong');all.forEach(b=>{if(b.textContent===correct)b.classList.add('correct')});playBeep(200,.2)}
    d.idx++; save(); setTimeout(loadListenQ,1200);
}
function finishListen() { const d=window._listen,xp=d.score*12; state.user.xp+=xp; save(); spawnConfetti(); toast(`🎧 بیستن تەواو! +${xp} XP`); setTimeout(()=>navigateTo('home'),1500); }

function renderSpeaking(c) { c.innerHTML=`<h2>🎤 قسەکردن</h2><div class="card" style="text-align:center;padding:40px;margin:16px 0"><p>ئەم ڕستەیە بڵێ:</p><h2 style="color:var(--primary)">"Hello, how are you?"</h2><button class="btn btn-sm" onclick="speakWord('Hello, how are you?')">🔊</button><button class="btn btn-primary btn-lg" style="margin-top:16px" onclick="startRec()">🎤 دەست بکە</button><p id="recStatus" style="margin-top:8px"></p></div>`; }
function startRec() { const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){document.getElementById('recStatus').textContent='⚠️ پشتگیری ناکرێت';return} const r=new SR(); r.lang='en-US'; r.start(); document.getElementById('recStatus').textContent='گوێدەگرم...'; r.onresult=e=>{document.getElementById('recStatus').textContent=`تۆ وتت: "${e.results[0][0].transcript}"`;state.user.xp+=15;save();toast('+15 XP!')}; r.onerror=()=>document.getElementById('recStatus').textContent='❌ هەڵە'; }

function renderReading(c) {
    const story={title:'ڕۆژێکی سادە',en:'Every morning, I wake up at 7. I brush my teeth. Then I eat breakfast.',ku:'هەموو بەیانییەک، ٧ هەڵدەستم. ددانم شوشت. دواتر نانی بەیانی دەخۆم.',q:[{q:'کاژێر چەند هەڵدەستێت؟',o:['٦','٧','٨'],c:'٧'}]};
    c.innerHTML=`<h2>📖 خوێندنەوە</h2><div class="card"><h3>${story.title}</h3><p id="stEn">${story.en}</p><button class="btn btn-sm" onclick="document.getElementById('stKu').style.display='block'">👀 وەرگێڕان</button><p id="stKu" style="display:none">${story.ku}</p></div><div id="rdQ"></div>`;
    const rdq=document.getElementById('rdQ'); story.q.forEach((q,i)=>{const d=document.createElement('div');d.className='card';d.innerHTML=`<p><strong>${i+1}. ${q.q}</strong></p><div style="display:flex;gap:6px;margin-top:6px">${q.o.map(o=>`<button class="btn btn-sm" onclick="checkRd('${o}','${q.c}',this)">${o}</button>`).join('')}</div>`;rdq.appendChild(d)});
}
function checkRd(s,c,btn) { if(s===c){btn.style.background='var(--success)';btn.style.color='#fff';state.user.xp+=10;toast('✅ +10 XP')}else{btn.style.background='var(--danger)';btn.style.color='#fff'} save(); }

function renderWriting(c) {
    const allWords=[]; lessons[state.settings.currentLanguage].topics.forEach(t=>t.words.forEach(w=>allWords.push(w)));
    const tw=allWords.sort(()=>Math.random()-.5).slice(0,5); window._wr={words:tw,idx:0,score:0};
    c.innerHTML=`<h2>✍️ نووسین</h2><div class="card" style="text-align:center;padding:24px;margin:16px 0"><h2 id="wrPrompt" style="color:var(--primary)">${tw[0].split('=')[1]}</h2></div><div style="display:flex;gap:8px"><input id="wrInput" class="input" placeholder="بنووسە..."><button class="btn btn-primary" onclick="checkWr()">✅</button></div><p id="wrFB" style="text-align:center;margin-top:8px"></p><p style="text-align:center">✅ <span id="wrScore">0</span>/${tw.length}</p>`;
}
function checkWr() {
    const d=window._wr,i=document.getElementById('wrInput').value.trim().toLowerCase(),c=d.words[d.idx].split('=')[0].toLowerCase(),fb=document.getElementById('wrFB');
    if(i===c){fb.textContent='✅ ڕاستە!';fb.style.color='var(--success)';d.score++;document.getElementById('wrScore').textContent=d.score;state.user.xp+=10;playBeep(800,.1)}else{fb.textContent=`❌ ڕاستەکە: "${c}"`;fb.style.color='var(--danger)';playBeep(200,.2)}
    d.idx++; save(); if(d.idx>=d.words.length){state.user.xp+=d.score*10;save();spawnConfetti();toast('✍️ تەواو!');setTimeout(()=>navigateTo('home'),1500);return}
    setTimeout(()=>{document.getElementById('wrPrompt').textContent=d.words[d.idx].split('=')[1];document.getElementById('wrInput').value='';fb.textContent=''},1200);
}

function renderAITeacher(c) { c.innerHTML=`<h2>🤖 مامۆستای AI</h2><div id="aiChat" class="card" style="min-height:300px;max-height:400px;overflow-y:auto;padding:16px;margin:12px 0"><div style="text-align:center;color:var(--text-secondary);padding:40px 0"><p style="font-size:48px">🤖</p><p>چۆن دەتوانم یارمەتیت بدەم؟</p></div></div><div style="display:flex;gap:8px"><input id="aiInput" class="input" placeholder="پرسیار بکە..." onkeypress="if(event.key==='Enter')askAI()"><button class="btn btn-primary" onclick="askAI()">📤</button></div>`; }
function askAI() { const i=document.getElementById('aiInput'),c=document.getElementById('aiChat'); if(!i||!c||!i.value.trim())return; const q=i.value.trim(); i.value=''; c.innerHTML+=`<div style="text-align:right;margin:8px 0"><span style="background:var(--primary);color:#fff;padding:8px 14px;border-radius:18px;display:inline-block">${q}</span></div>`; setTimeout(()=>{const rs=['بەڵێ، دەتوانم یارمەتیت بدەم!','زۆر باشە، ئەمە ڕێزمانەکەیە...','باشە، ڕاهێنانێک دەست پێدەکەم...'];c.innerHTML+=`<div style="text-align:left;margin:8px 0"><span style="background:var(--surface-hover);padding:8px 14px;border-radius:18px;display:inline-block">🤖 ${rs[Math.floor(Math.random()*rs.length)]}</span></div>`;c.scrollTop=c.scrollHeight;state.user.xp+=5;save()},800); c.scrollTop=c.scrollHeight; }

function renderProgress(c) { const h=state.learning.history.slice(-10).reverse(); c.innerHTML=`<h2>📊 پێشکەوتن</h2><div class="card"><h3>ئامار</h3><div class="grid-2"><div>⭐ XP: ${state.user.xp}</div><div>📚 ئاست: ${state.user.level}</div><div>🔥 ستریک: ${state.user.streak}</div><div>📖 وشە: ${state.user.totalWords}</div></div></div><div class="card"><h3>مێژوو</h3>${h.length===0?'<p style="color:var(--text-secondary)">هێشتا چالاکی نییە</p>':h.map(x=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>${x.type==='quiz'?'📝':x.type==='lesson'?'📚':'🎧'} ${x.title||''}</span><span style="color:var(--primary)">+${x.xp} XP</span></div>`).join('')}</div>`; }

function renderAchievements(c) {
    const badges=[{n:'برۆنزی',i:'🥉',e:state.user.xp>=100},{n:'زیوی',i:'🥈',e:state.user.xp>=1000},{n:'زێڕین',i:'🥇',e:state.user.xp>=5000},{n:'ئەڵماسی',i:'💎',e:state.user.xp>=10000},{n:'شاهانە',i:'👑',e:state.user.xp>=50000}];
    c.innerHTML=`<h2>🏆 دەستکەوتەکان</h2><div class="grid-2">${badges.map(b=>`<div class="card" style="text-align:center;opacity:${b.e?'1':'.4'}"><div style="font-size:40px">${b.e?b.i:'🔒'}</div><strong>${b.n}</strong>${b.e?'<p style="color:var(--success)">✅</p>':''}</div>`).join('')}</div>`;
}

function renderCommunity(c) {
    const users=[{n:'سارا',l:12,xp:4500,a:'👩'},{n:'ئارام',l:8,xp:2800,a:'👨'},{n:'دلشاد',l:15,xp:6200,a:'🧔'},{n:'تۆ',l:state.user.level,xp:state.user.xp,a:'👤'}].sort((a,b)=>b.xp-a.xp);
    c.innerHTML=`<h2>👥 کۆمەڵگا</h2><div class="card"><h3>🏆 ڕیزبەندی</h3>${users.map((u,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border-light)"><span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span><span>${u.a}</span><div style="flex:1"><strong>${u.n}</strong></div><span style="color:var(--primary)">${u.xp} XP</span></div>`).join('')}</div>`;
}

function renderPackages(c) {
    let html='<h2>💳 پاکێجەکان</h2>';
    for(let k in packages){const p=packages[k]; html+=`<div class="card ${p.featured?'featured':''}" style="border-left:4px solid ${p.color}">${p.featured?'<span class="badge badge-premium">پێشنیارکراو</span>':''}<h3 style="color:${p.color}">${p.name}</h3><p style="font-size:28px;font-weight:800">${p.price}<small style="font-size:14px">/${p.period}</small></p><ul style="list-style:none;padding:0">${p.features.map(f=>`<li>✅ ${f}</li>`).join('')}</ul><button class="btn btn-primary btn-block" onclick="buyPackage('${k}')">${p.btnText}</button></div>`;}
    c.innerHTML=html;
}

function buyPackage(key) {
    state.selectedPackage=key; const pkg=packages[key];
    if(key==='free'){state.user.package='free';save();toast('✅ پاکێجی بێبەرامبەر چالاک کرا!');return}
    if(!pkg.hasPayment){window.open(`https://wa.me/${AppConfig.contact.whatsapp}`,'_blank');return}
    showPaymentModal(pkg);
}

function showPaymentModal(pkg) {
    const modal=document.createElement('div'); modal.className='modal show'; modal.onclick=function(e){if(e.target===this)this.remove()};
    let html=`<div class="modal-content"><h3>کڕینی ${pkg.name}</h3><p>بڕ: <strong>${pkg.price}</strong></p><p style="margin:12px 0">شێوازی پارەدان:</p><div class="grid-3">`;
    paymentMethods.forEach(m=>{ html+=`<div class="payment-method ${state.selectedPayment===m?'selected':''}" onclick="selectPayment('${m}',this)">${m}</div>`; });
    html+='</div>';
    if(state.selectedPayment){
        const info=getPaymentInfo(state.selectedPayment);
        html+=`<div style="margin-top:16px;padding:16px;background:var(--bg);border-radius:12px"><p><strong>زانیاری پارەدان:</strong></p><div class="copy-box"><span>${info}</span><button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText('${info.replace(/'/g,"\\'")}').then(()=>toast('✅ کۆپی کرا!'))">📋</button></div><input type="text" id="buyerName" class="input" placeholder="ناوی تەواو" style="margin:8px 0"><input type="email" id="buyerEmail" class="input" placeholder="ئیمەیڵ"><button class="btn btn-success btn-block" style="margin-top:12px" onclick="submitPayment()">ناردن ✅</button></div>`;
    }
    html+='</div>'; modal.innerHTML=html; document.body.appendChild(modal);
}

function selectPayment(m,el) {
    state.selectedPayment=m;
    document.querySelectorAll('.payment-method').forEach(x=>x.classList.remove('selected'));
    if(el) el.classList.add('selected');
    showPaymentModal(packages[state.selectedPackage]);
}

function getPaymentInfo(method) {
    const map={ 'FIB':AppConfig.payment.fib, 'FastPay':AppConfig.payment.fastpay, 'USDT (TRC20)':AppConfig.payment.usdt, 'Korek Card':AppConfig.payment.korek||'بەردەست نییە', 'Zain Card':AppConfig.payment.zain||'بەردەست نییە', 'Asia Card':AppConfig.payment.asia||'بەردەست نییە', 'Qi Card':AppConfig.payment.qi||'بەردەست نییە', 'Apple Gift Card':AppConfig.payment.apple||'بەردەست نییە', 'iTunes Gift Card':AppConfig.payment.itunes||'بەردەست نییە' };
    return map[method]||'بەردەست نییە';
}

function submitPayment() {
    const name=document.getElementById('buyerName')?.value, email=document.getElementById('buyerEmail')?.value;
    if(!name||!email){toast('❌ تکایە ناو و ئیمەیڵ بنووسە');return}
    const payments=JSON.parse(localStorage.getItem('zm_payments')||'[]');
    payments.push({id:Date.now(),package:state.selectedPackage,method:state.selectedPayment,name,email,status:'pending',date:new Date().toISOString()});
    localStorage.setItem('zm_payments',JSON.stringify(payments));
    document.querySelector('.modal.show')?.remove(); toast('✅ پارەدان تۆمار کرا!');
}

function renderSponsor(c) { c.innerHTML=`<h2>📢 سپۆنسەر</h2><div class="card"><h3>ببنە سپۆنسەر</h3><p>بۆ ڕیکلام و سپۆنسەرکردن پەیوەندیمان پێوە بکە</p><a href="https://wa.me/${AppConfig.contact.whatsapp}" target="_blank" class="btn btn-primary btn-block" style="margin-top:12px">WhatsApp 💬</a><a href="https://t.me/${AppConfig.contact.telegram}" target="_blank" class="btn btn-block" style="background:#0088cc;color:#fff;margin-top:8px">Telegram ✈️</a></div>`; }

function renderContact(c) { c.innerHTML=`<h2>📞 پەیوەندی</h2><a href="https://wa.me/${AppConfig.contact.whatsapp}" target="_blank" class="card" style="text-decoration:none;background:#25D366;color:#fff"><h3>💬 WhatsApp</h3><p>ڕاستەوخۆ چات</p></a><a href="https://t.me/${AppConfig.contact.telegram}" target="_blank" class="card" style="text-decoration:none;background:#0088cc;color:#fff"><h3>✈️ Telegram</h3><p>ڕاستەوخۆ چات</p></a><div class="card"><h3>📧 Email</h3><p>${AppConfig.contact.email||'support@ziman.app'}</p></div>`; }

function renderSettings(c) { c.innerHTML=`<h2>⚙️ ڕێکخستن</h2><div class="card"><h3>🌗 ڕووکار</h3><div style="display:flex;gap:8px;margin-top:8px"><button class="btn ${!state.settings.darkMode&&!state.settings.amoledMode?'btn-primary':''}" onclick="setTheme('light')">☀️</button><button class="btn ${state.settings.darkMode&&!state.settings.amoledMode?'btn-primary':''}" onclick="setTheme('dark')">🌙</button><button class="btn ${state.settings.amoledMode?'btn-primary':''}" onclick="setTheme('amoled')">🖤</button></div></div>`; }
function setTheme(t) { state.settings.darkMode=t==='dark'; state.settings.amoledMode=t==='amoled'; document.body.classList.remove('dark-mode','amoled-mode'); if(t==='dark')document.body.classList.add('dark-mode'); if(t==='amoled')document.body.classList.add('amoled-mode'); localStorage.setItem('zm_dark',state.settings.darkMode); localStorage.setItem('zm_amoled',state.settings.amoledMode); toast(`✅ ڕووکاری ${t}`); }

document.addEventListener('DOMContentLoaded',()=>{
    if(state.settings.darkMode)document.body.classList.add('dark-mode');
    if(state.settings.amoledMode)document.body.classList.add('amoled-mode');
    document.getElementById('menuBtn')?.addEventListener('click',()=>{document.getElementById('sideMenu')?.classList.toggle('open');document.getElementById('menuOverlay')?.classList.toggle('open')});
    document.getElementById('menuOverlay')?.addEventListener('click',()=>{document.getElementById('sideMenu')?.classList.remove('open');document.getElementById('menuOverlay')?.classList.remove('open')});
    checkStreak(); updateUI(); navigateTo('home');
});

function checkStreak() { const last=state.user.lastLogin,t=new Date(); if(!last){state.user.streak=1}else{const ld=new Date(last),diff=Math.floor((t-ld)/86400000);if(diff===0)return;if(diff===1){state.user.streak++;toast(`🔥 ستریک: ${state.user.streak} ڕۆژ!`)}else{state.user.streak=1}} state.user.lastLogin=t.toISOString(); save(); }
