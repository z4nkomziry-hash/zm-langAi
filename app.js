// ============================================
// ZIMAN - Complete App JavaScript
// 250+ Features | 15 Languages | AI | Gamification
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
        amoledMode: localStorage.getItem('zm_amoled') === 'true',
        currentLanguage: localStorage.getItem('zm_lang') || 'en-ku',
        direction: localStorage.getItem('zm_dir') || 'rtl',
    },
    learning: {
        currentLesson: 0,
        currentCategory: 'greetings',
        answers: [],
        history: JSON.parse(localStorage.getItem('zm_history')) || [],
    },
    pages: {
        current: 'home',
        history: [],
    },
    achievements: JSON.parse(localStorage.getItem('zm_achievements')) || [],
    badges: JSON.parse(localStorage.getItem('zm_badges')) || [],
    bookmarks: JSON.parse(localStorage.getItem('zm_bookmarks')) || [],
    notes: JSON.parse(localStorage.getItem('zm_notes')) || {},
};

// ============ DATA STORE ============
const LanguageData = {
    'en-ku': {
        name: 'ئینگلیزی → کوردی',
        flag: '🇬🇧',
        categories: {
            alphabet: {
                name: 'ئەلفوبێ',
                icon: '🔤',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'A', ku: 'ئەی', type: 'letter', pronunciation: '/eɪ/' },
                        { en: 'B', ku: 'بی', type: 'letter', pronunciation: '/biː/' },
                        { en: 'C', ku: 'سی', type: 'letter', pronunciation: '/siː/' },
                        { en: 'D', ku: 'دی', type: 'letter', pronunciation: '/diː/' },
                        { en: 'E', ku: 'ئی', type: 'letter', pronunciation: '/iː/' },
                    ]
                }]
            },
            greetings: {
                name: 'سڵاوکردن',
                icon: '👋',
                lessons: [{
                    id: 2,
                    words: [
                        { en: 'Hello', ku: 'سڵاو', pronunciation: '/həˈloʊ/' },
                        { en: 'Good morning', ku: 'بەیانیت باش', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/' },
                        { en: 'Good night', ku: 'شەو باش', pronunciation: '/ɡʊd naɪt/' },
                        { en: 'How are you?', ku: 'چۆنی؟', pronunciation: '/haʊ ɑːr juː/' },
                        { en: 'Fine, thank you', ku: 'باشم، سوپاس', pronunciation: '/faɪn θæŋk juː/' },
                        { en: 'Goodbye', ku: 'خواحافیزی', pronunciation: '/ɡʊdˈbaɪ/' },
                        { en: 'See you later', ku: 'دواتر دەتبینمەوە', pronunciation: '/siː juː ˈleɪtər/' },
                    ]
                }]
            },
            numbers: {
                name: 'ژمارەکان',
                icon: '🔢',
                lessons: [{
                    id: 3,
                    words: [
                        { en: 'One', ku: 'یەک', pronunciation: '/wʌn/' },
                        { en: 'Two', ku: 'دوو', pronunciation: '/tuː/' },
                        { en: 'Three', ku: 'سێ', pronunciation: '/θriː/' },
                        { en: 'Four', ku: 'چوار', pronunciation: '/fɔːr/' },
                        { en: 'Five', ku: 'پێنج', pronunciation: '/faɪv/' },
                        { en: 'Six', ku: 'شەش', pronunciation: '/sɪks/' },
                        { en: 'Seven', ku: 'حەوت', pronunciation: '/ˈsev.ən/' },
                        { en: 'Eight', ku: 'هەشت', pronunciation: '/eɪt/' },
                        { en: 'Nine', ku: 'نۆ', pronunciation: '/naɪn/' },
                        { en: 'Ten', ku: 'دە', pronunciation: '/ten/' },
                    ]
                }]
            },
            colors: {
                name: 'ڕەنگەکان',
                icon: '🎨',
                lessons: [{
                    id: 4,
                    words: [
                        { en: 'Red', ku: 'سوور', pronunciation: '/red/' },
                        { en: 'Blue', ku: 'شین', pronunciation: '/bluː/' },
                        { en: 'Green', ku: 'سەوز', pronunciation: '/ɡriːn/' },
                        { en: 'Yellow', ku: 'زەرد', pronunciation: '/ˈjel.oʊ/' },
                        { en: 'Black', ku: 'ڕەش', pronunciation: '/blæk/' },
                        { en: 'White', ku: 'سپی', pronunciation: '/waɪt/' },
                    ]
                }]
            },
            family: {
                name: 'خێزان',
                icon: '👨‍👩‍👧‍👦',
                lessons: [{
                    id: 5,
                    words: [
                        { en: 'Mother', ku: 'دایک', pronunciation: '/ˈmʌðər/' },
                        { en: 'Father', ku: 'باوک', pronunciation: '/ˈfɑːðər/' },
                        { en: 'Sister', ku: 'خوشک', pronunciation: '/ˈsɪstər/' },
                        { en: 'Brother', ku: 'برا', pronunciation: '/ˈbrʌðər/' },
                        { en: 'Family', ku: 'خێزان', pronunciation: '/ˈfæməli/' },
                    ]
                }]
            },
            food: {
                name: 'خواردن',
                icon: '🍕',
                lessons: [{
                    id: 6,
                    words: [
                        { en: 'Water', ku: 'ئاو', pronunciation: '/ˈwɔːtər/' },
                        { en: 'Bread', ku: 'نان', pronunciation: '/bred/' },
                        { en: 'Rice', ku: 'برنج', pronunciation: '/raɪs/' },
                        { en: 'Meat', ku: 'گۆشت', pronunciation: '/miːt/' },
                        { en: 'Tea', ku: 'چا', pronunciation: '/tiː/' },
                    ]
                }]
            },
            travel: {
                name: 'گەشت',
                icon: '✈️',
                lessons: [{
                    id: 7,
                    words: [
                        { en: 'Airport', ku: 'فڕۆکەخانە', pronunciation: '/ˈer.pɔːrt/' },
                        { en: 'Hotel', ku: 'هوتێل', pronunciation: '/hoʊˈtel/' },
                        { en: 'Taxi', ku: 'تاکسی', pronunciation: '/ˈtæk.si/' },
                        { en: 'Ticket', ku: 'بلیت', pronunciation: '/ˈtɪk.ɪt/' },
                        { en: 'Map', ku: 'نەخشە', pronunciation: '/mæp/' },
                    ]
                }]
            },
        }
    },
    'ku-en': {
        name: 'کوردی → ئینگلیزی',
        flag: '☀️',
        categories: {
            greetings: {
                name: 'سڵاوکردن',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'Hello', ku: 'سڵاو' },
                        { en: 'Good morning', ku: 'بەیانیت باش' },
                        { en: 'How are you?', ku: 'چۆنی؟' },
                    ]
                }]
            },
        }
    },
    'ar-ku': {
        name: 'عەرەبی → کوردی',
        flag: '🇸🇦',
        categories: {
            greetings: {
                name: 'تحيات',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'السلام عليكم', ku: 'سڵاو' },
                        { en: 'صباح الخير', ku: 'بەیانیت باش' },
                        { en: 'مساء الخير', ku: 'ئێوارەت باش' },
                        { en: 'كيف حالك؟', ku: 'چۆنی؟' },
                        { en: 'شكراً', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'tr-ku': {
        name: 'تورکی → کوردی',
        flag: '🇹🇷',
        categories: {
            greetings: {
                name: 'Selamlaşma',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'Merhaba', ku: 'سڵاو' },
                        { en: 'Günaydın', ku: 'بەیانیت باش' },
                        { en: 'İyi akşamlar', ku: 'ئێوارەت باش' },
                        { en: 'Nasılsın?', ku: 'چۆنی؟' },
                        { en: 'Teşekkür ederim', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'fa-ku': {
        name: 'فارسی → کوردی',
        flag: '🇮🇷',
        categories: {
            greetings: {
                name: 'احوالپرسی',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'سلام', ku: 'سڵاو' },
                        { en: 'صبح بخیر', ku: 'بەیانیت باش' },
                        { en: 'حال شما چطور است؟', ku: 'چۆنی؟' },
                        { en: 'متشکرم', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'de-ku': {
        name: 'ئەڵمانی → کوردی',
        flag: '🇩🇪',
        categories: {
            greetings: {
                name: 'Begrüßung',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'Hallo', ku: 'سڵاو' },
                        { en: 'Guten Morgen', ku: 'بەیانیت باش' },
                        { en: 'Gute Nacht', ku: 'شەو باش' },
                        { en: 'Wie geht es Ihnen?', ku: 'چۆنی؟' },
                        { en: 'Danke', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'fr-ku': {
        name: 'فەرەنسی → کوردی',
        flag: '🇫🇷',
        categories: {
            greetings: {
                name: 'Salutations',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'Bonjour', ku: 'سڵاو' },
                        { en: 'Bonsoir', ku: 'ئێوارەت باش' },
                        { en: 'Comment allez-vous?', ku: 'چۆنی؟' },
                        { en: 'Merci', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'es-ku': {
        name: 'ئیسپانی → کوردی',
        flag: '🇪🇸',
        categories: {
            greetings: {
                name: 'Saludos',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'Hola', ku: 'سڵاو' },
                        { en: 'Buenos días', ku: 'بەیانیت باش' },
                        { en: 'Buenas noches', ku: 'شەو باش' },
                        { en: '¿Cómo estás?', ku: 'چۆنی؟' },
                        { en: 'Gracias', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'ru-ku': {
        name: 'ڕووسی → کوردی',
        flag: '🇷🇺',
        categories: {
            greetings: {
                name: 'Приветствия',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'Здравствуйте', ku: 'سڵاو' },
                        { en: 'Доброе утро', ku: 'بەیانیت باش' },
                        { en: 'Как дела?', ku: 'چۆنی؟' },
                        { en: 'Спасибо', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'zh-ku': {
        name: 'چینی → کوردی',
        flag: '🇨🇳',
        categories: {
            greetings: {
                name: '问候',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: '你好', ku: 'سڵاو' },
                        { en: '早上好', ku: 'بەیانیت باش' },
                        { en: '谢谢', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'ja-ku': {
        name: 'ژاپۆنی → کوردی',
        flag: '🇯🇵',
        categories: {
            greetings: {
                name: '挨拶',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: 'こんにちは', ku: 'سڵاو' },
                        { en: 'おはようございます', ku: 'بەیانیت باش' },
                        { en: 'ありがとう', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
    'ko-ku': {
        name: 'کۆری → کوردی',
        flag: '🇰🇷',
        categories: {
            greetings: {
                name: '인사',
                icon: '👋',
                lessons: [{
                    id: 1,
                    words: [
                        { en: '안녕하세요', ku: 'سڵاو' },
                        { en: '좋은 아침', ku: 'بەیانیت باش' },
                        { en: '감사합니다', ku: 'سوپاس' },
                    ]
                }]
            },
        }
    },
};

// ============ UTILITY FUNCTIONS ============
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }
function getEl(id) { return document.getElementById(id); }

function saveState() {
    const u = AppState.currentUser;
    localStorage.setItem('zm_xp', u.xp);
    localStorage.setItem('zm_coins', u.coins);
    localStorage.setItem('zm_gems', u.gems);
    localStorage.setItem('zm_hearts', u.hearts);
    localStorage.setItem('zm_streak', u.streak);
    localStorage.setItem('zm_lastLogin', u.lastLogin);
    localStorage.setItem('zm_level', u.level);
    localStorage.setItem('zm_words', u.totalWords);
    localStorage.setItem('zm_name', u.name);
    localStorage.setItem('zm_history', JSON.stringify(AppState.learning.history));
    localStorage.setItem('zm_achievements', JSON.stringify(AppState.achievements));
    localStorage.setItem('zm_badges', JSON.stringify(AppState.badges));
    localStorage.setItem('zm_bookmarks', JSON.stringify(AppState.bookmarks));
    localStorage.setItem('zm_notes', JSON.stringify(AppState.notes));
    updateHeaderStats();
}

function updateHeaderStats() {
    const hStreak = getEl('headerStreak');
    const hXP = getEl('headerXP');
    const hGems = getEl('headerGems');
    const hCoins = getEl('headerCoins');
    
    if (hStreak) hStreak.textContent = AppState.currentUser.streak;
    if (hXP) hXP.textContent = AppState.currentUser.xp;
    if (hGems) hGems.textContent = AppState.currentUser.gems;
    if (hCoins) hCoins.textContent = AppState.currentUser.coins;
}

function speakWord(word, lang = 'en-US', rate = 0.8) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 0.9;
        speechSynthesis.speak(utterance);
    }
}

function playBeep(freq = 600, duration = 0.1, type = 'sine') {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = 0.2;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

function spawnConfetti() {
    const canvas = getEl('confettiCanvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const colors = ['#58cc02', '#ffc800', '#1cb0f6', '#ff4b4b', '#ce82ff', '#ff9f43', '#ff6b6b', '#7cf000'];
    
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 3 + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() * -14) - 4,
            size: Math.random() * 10 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            life: 1,
            decay: Math.random() * 0.015 + 0.006,
            gravity: 0.18,
            shape: Math.random() > 0.5 ? 'circle' : 'rect',
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        
        particles.forEach(p => {
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.life -= p.decay;
            
            if (p.life > 0) {
                alive = true;
                ctx.save();
                ctx.globalAlpha = Math.min(1, p.life);
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                
                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                }
                
                ctx.restore();
            }
        });
        
        if (alive) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    animate();
}

function showNotification(message, duration = 3000) {
    const container = getEl('notificationsContainer');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    container.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(-10px)';
        notif.style.transition = 'all 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, duration);
}

function showAchievement(icon, title, desc, xp = 0) {
    const popup = getEl('achievementPopup');
    const iconEl = getEl('achievementIcon');
    const titleEl = getEl('achievementTitle');
    const descEl = getEl('achievementDesc');
    const xpEl = getEl('achievementXP');
    
    if (!popup) return;
    
    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (xpEl) xpEl.textContent = xp > 0 ? `+${xp} XP` : '';
    
    popup.classList.add('show');
    
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3500);
}

function showPopup(popupId) {
    const popup = getEl(popupId);
    if (popup) popup.classList.add('show');
}

function hidePopup(popupId) {
    const popup = getEl(popupId);
    if (popup) popup.classList.remove('show');
}

// ============ ROUTING ============
function navigateTo(page, data = {}) {
    AppState.pages.history.push(AppState.pages.current);
    AppState.pages.current = page;
    
    renderPage(page, data);
    
    // Update menu active states
    $$('.menu-list li[data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });
    
    // Update bottom nav
    $$('.bottom-nav button[data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });
    
    // Update header title
    const titles = {
        'home': '🏠 Ziman',
        'lessons': '📚 وانەکان',
        'lesson': '📖 وانە',
        'flashcards': '🃏 فلاشکارت',
        'quiz': '📝 کویز',
        'speed-quiz': '⚡ کویزی خێرا',
        'listening': '🎧 بیستن',
        'speaking': '🎤 قسەکردن',
        'reading': '📖 خوێندنەوە',
        'writing': '✍️ نووسین',
        'ai-teacher': '🤖 مامۆستای AI',
        'progress': '📊 پێشکەوتن',
        'achievements': '🏆 دەستکەوتەکان',
        'community': '👥 کۆمەڵگا',
        'profile': '👤 پڕۆفایل',
        'settings': '⚙️ ڕێکخستن',
        'premium': '💎 پڕیمیوم',
    };
    
    const headerTitle = getEl('headerTitle');
    if (headerTitle) headerTitle.textContent = titles[page] || 'Ziman';
    
    // Close menu on mobile
    const sideMenu = getEl('sideMenu');
    const overlay = getEl('menuOverlay');
    if (sideMenu && window.innerWidth < 768) {
        sideMenu.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ RENDER PAGES ============
function renderPage(page, data = {}) {
    const main = getEl('mainContent');
    if (!main) return;
    
    main.innerHTML = '';
    
    switch(page) {
        case 'home': return renderHome(main);
        case 'lessons': return renderLessons(main);
        case 'lesson': return renderLessonView(main, data);
        case 'flashcards': return renderFlashcards(main);
        case 'quiz': return renderQuiz(main);
        case 'speed-quiz': return renderSpeedQuiz(main);
        case 'listening': return renderListening(main);
        case 'speaking': return renderSpeaking(main);
        case 'reading': return renderReading(main);
        case 'writing': return renderWriting(main);
        case 'ai-teacher': return renderAITeacher(main);
        case 'progress': return renderProgress(main);
        case 'achievements': return renderAchievements(main);
        case 'community': return renderCommunity(main);
        case 'profile': return renderProfile(main);
        case 'settings': return renderSettings(main);
        case 'premium': return renderPremium(main);
        default: return renderHome(main);
    }
}

// ============ HOME PAGE ============
function renderHome(container) {
    const user = AppState.currentUser;
    const xpToNext = (Math.ceil(user.xp / 1000) * 1000);
    const progressPercent = ((user.xp % 1000) / 1000) * 100;
    
    container.innerHTML = `
        <div class="page-home">
            <!-- Welcome Card -->
            <div style="padding: 16px;">
                <div class="card gradient-success" style="color: white;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="font-size: 48px;">👋</div>
                        <div style="flex: 1;">
                            <h2 style="margin: 0;">سڵاو، ${user.name}!</h2>
                            <p style="opacity: 0.9; margin: 4px 0;">ئاست ${user.level} • ${user.xp} XP</p>
                            <div class="progress-bar" style="margin-top: 8px; background: rgba(255,255,255,0.3);">
                                <div class="progress-fill" style="width: ${progressPercent}%; background: white;"></div>
                            </div>
                            <p style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${xpToNext - user.xp} XP بۆ ئاستی داهاتوو</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Stats Row -->
            <div style="padding: 0 16px;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                    <div class="card" style="text-align: center; padding: 14px 8px;">
                        <div style="font-size: 24px;">🔥</div>
                        <div style="font-weight: 700; font-size: 18px;">${user.streak}</div>
                        <div style="font-size: 10px; color: var(--text-secondary);">ڕۆژ</div>
                    </div>
                    <div class="card" style="text-align: center; padding: 14px 8px;">
                        <div style="font-size: 24px;">💎</div>
                        <div style="font-weight: 700; font-size: 18px;">${user.gems}</div>
                        <div style="font-size: 10px; color: var(--text-secondary);">گوەهر</div>
                    </div>
                    <div class="card" style="text-align: center; padding: 14px 8px;">
                        <div style="font-size: 24px;">🪙</div>
                        <div style="font-weight: 700; font-size: 18px;">${user.coins}</div>
                        <div style="font-size: 10px; color: var(--text-secondary);">دراو</div>
                    </div>
                    <div class="card" style="text-align: center; padding: 14px 8px;">
                        <div style="font-size: 24px;">📚</div>
                        <div style="font-weight: 700; font-size: 18px;">${user.totalWords}</div>
                        <div style="font-size: 10px; color: var(--text-secondary);">وشە</div>
                    </div>
                </div>
            </div>
            
            <!-- Continue Learning -->
            <div style="padding: 16px;">
                <h3 style="margin-bottom: 8px;">📚 بەردەوام بە</h3>
                <div class="card" style="cursor: pointer;" onclick="navigateTo('lesson', {category: 'greetings', lesson: 2})">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 36px;">💬</span>
                        <div style="flex: 1;">
                            <strong>سڵاوکردن</strong>
                            <p style="font-size: 13px; color: var(--text-secondary);">وانەی ٢ • ٧ وشە</p>
                        </div>
                        <button class="btn btn-primary btn-sm">بەردەوام بە ▶️</button>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div style="padding: 0 16px;">
                <h3 style="margin-bottom: 8px;">🎯 ڕاهێنانەکان</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    <div class="card" style="cursor: pointer; text-align: center;" onclick="navigateTo('quiz')">
                        <div style="font-size: 32px;">📝</div>
                        <strong>کویز</strong>
                    </div>
                    <div class="card" style="cursor: pointer; text-align: center;" onclick="navigateTo('speed-quiz')">
                        <div style="font-size: 32px;">⚡</div>
                        <strong>کویزی خێرا</strong>
                    </div>
                    <div class="card" style="cursor: pointer; text-align: center;" onclick="navigateTo('flashcards')">
                        <div style="font-size: 32px;">🃏</div>
                        <strong>فلاشکارت</strong>
                    </div>
                    <div class="card" style="cursor: pointer; text-align: center;" onclick="navigateTo('listening')">
                        <div style="font-size: 32px;">🎧</div>
                        <strong>بیستن</strong>
                    </div>
                </div>
            </div>
            
            <!-- Daily Challenge -->
            <div style="padding: 16px;">
                <div class="card card-premium" style="cursor: pointer;" onclick="showPopup('luckyWheelPopup')">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 36px;">🎡</span>
                        <div style="flex: 1;">
                            <strong>چەرخی بەختی</strong>
                            <p style="font-size: 13px; color: var(--text-secondary);">بخولێنە و خەڵات بەدەست بهێنە!</p>
                        </div>
                        <span style="font-size: 24px;">➡️</span>
                    </div>
                </div>
            </div>
            
            <!-- Word of the Day -->
            <div style="padding: 16px;">
                <div class="card gradient-purple" style="color: white;">
                    <p style="font-size: 12px; opacity: 0.8;">📅 وشەی ڕۆژ</p>
                    <h2 style="font-size: 28px; margin: 4px 0;">Hello</h2>
                    <p style="opacity: 0.9;">سڵاو</p>
                    <button class="btn" style="background: rgba(255,255,255,0.2); color: white; margin-top: 8px;" onclick="speakWord('Hello')">
                        🔊 گوێبگرە
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============ LESSONS LIST ============
function renderLessons(container) {
    const lang = AppState.settings.currentLanguage;
    const data = LanguageData[lang];
    
    if (!data) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;"><p>🚧 زمانەکە پشتگیری ناکرێت</p></div>';
        return;
    }
    
    let html = `<div style="padding: 16px;">
        <h2>📚 وانەکانی ${data.name}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 12px;">هاوپەیمانی ${Object.keys(data.categories).length} بابەت</p>`;
    
    for (let catKey in data.categories) {
        const cat = data.categories[catKey];
        html += `
            <div style="margin-bottom: 24px;">
                <h3 style="margin-bottom: 8px;">${cat.icon} ${cat.name}</h3>`;
        
        cat.lessons.forEach(lesson => {
            html += `
                <div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="navigateTo('lesson', {category: '${catKey}', lesson: ${lesson.id}})">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">📖</span>
                        <div style="flex: 1;">
                            <strong>وانەی ${lesson.id}</strong>
                            <p style="font-size: 13px; color: var(--text-secondary);">${lesson.words.length} وشە</p>
                        </div>
                        <button class="btn btn-primary btn-sm">دەستپێبکە ▶️</button>
                    </div>
                </div>`;
        });
        
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// ============ LESSON VIEW ============
function renderLessonView(container, data) {
    const lang = AppState.settings.currentLanguage;
    const category = LanguageData[lang]?.categories[data.category];
    
    if (!category) {
        container.innerHTML = '<p style="padding: 20px;">وانە نەدۆزرایەوە</p>';
        return;
    }
    
    const lesson = category.lessons.find(l => l.id === data.lesson);
    if (!lesson) {
        container.innerHTML = '<p style="padding: 20px;">وانە نەدۆزرایەوە</p>';
        return;
    }
    
    AppState.learning.currentLesson = lesson.id;
    AppState.learning.currentCategory = data.category;
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <button class="btn btn-sm" onclick="navigateTo('lessons')">⬅️ گەڕانەوە</button>
                <span style="font-weight: 600;">وانەی ${lesson.id}</span>
                <span>❤️ ${AppState.currentUser.hearts}</span>
            </div>
            
            <div class="progress-bar" style="margin-bottom: 20px;">
                <div class="progress-fill" id="lessonProgress" style="width: 0%;"></div>
            </div>
            
            <div class="card" style="text-align: center; min-height: 280px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 30px;">
                <div id="lessonWord" style="font-size: 44px; font-weight: 700; margin-bottom: 8px;">
                    ${lesson.words[0].en}
                </div>
                <div id="lessonTranslation" style="font-size: 22px; color: var(--text-secondary); margin-bottom: 8px;">
                    ${lesson.words[0].ku}
                </div>
                <div id="lessonPronunciation" style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">
                    ${lesson.words[0].pronunciation || ''}
                </div>
                <button class="btn btn-primary" onclick="speakWord('${lesson.words[0].en}')">
                    🔊 گوێبگرە
                </button>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                <button class="btn" id="prevWord" disabled onclick="changeLessonWord(-1)">⬅️ پێشوو</button>
                <span id="wordCounter" style="font-weight: 600;">١/${lesson.words.length}</span>
                <button class="btn btn-primary" id="nextWord" onclick="changeLessonWord(1)">داهاتوو ➡️</button>
            </div>
        </div>
    `;
    
    window._lessonData = {
        words: lesson.words,
        currentIndex: 0,
        category: data.category,
        lessonId: lesson.id,
    };
}

function changeLessonWord(direction) {
    const data = window._lessonData;
    if (!data) return;
    
    data.currentIndex += direction;
    
    if (data.currentIndex >= data.words.length) {
        completeLesson();
        return;
    }
    
    if (data.currentIndex < 0) {
        data.currentIndex = 0;
        return;
    }
    
    const word = data.words[data.currentIndex];
    const wordEl = getEl('lessonWord');
    const transEl = getEl('lessonTranslation');
    const pronEl = getEl('lessonPronunciation');
    const counterEl = getEl('wordCounter');
    const progressEl = getEl('lessonProgress');
    const prevBtn = getEl('prevWord');
    
    if (wordEl) wordEl.textContent = word.en;
    if (transEl) transEl.textContent = word.ku;
    if (pronEl) pronEl.textContent = word.pronunciation || '';
    if (counterEl) counterEl.textContent = `${data.currentIndex + 1}/${data.words.length}`;
    if (progressEl) progressEl.style.width = `${(data.currentIndex / data.words.length) * 100}%`;
    if (prevBtn) prevBtn.disabled = data.currentIndex === 0;
}

function completeLesson() {
    const data = window._lessonData;
    const xpEarned = data.words.length * 10;
    
    AppState.currentUser.xp += xpEarned;
    AppState.currentUser.coins += 20;
    AppState.currentUser.totalWords += data.words.length;
    AppState.currentUser.level = Math.floor(AppState.currentUser.xp / 1000) + 1;
    
    // Add to history
    AppState.learning.history.push({
        type: 'lesson',
        category: data.category,
        lessonId: data.lessonId,
        words: data.words.length,
        xp: xpEarned,
        date: new Date().toISOString(),
    });
    
    saveState();
    spawnConfetti();
    showAchievement('🎉', 'وانە تەواو بوو!', `+${xpEarned} XP | +20 🪙`, xpEarned);
    
    setTimeout(() => navigateTo('lessons'), 1500);
}

// ============ FLASHCARDS ============
function renderFlashcards(container) {
    const lang = AppState.settings.currentLanguage;
    const allWords = [];
    
    for (let cat in LanguageData[lang]?.categories || {}) {
        LanguageData[lang].categories[cat].lessons.forEach(lesson => {
            lesson.words.forEach(word => allWords.push(word));
        });
    }
    
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, 8);
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🃏 فلاشکارت</h2>
            <p style="color: var(--text-secondary);">کرتە بکە بۆ وەرگێڕان</p>
            
            <div class="flashcard-container" style="margin: 20px 0;">
                <div class="flashcard" id="flashcardEl" onclick="flipFlashcard()">
                    <div class="flashcard-front">
                        <span id="fcWord">${shuffled[0]?.en || ''}</span>
                    </div>
                    <div class="flashcard-back">
                        <span id="fcTranslation">${shuffled[0]?.ku || ''}</span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 16px;">
                <button class="btn" id="fcWrong" onclick="rateFlashcard('wrong')">❌ نازانم</button>
                <button class="btn btn-primary" id="fcCorrect" onclick="rateFlashcard('correct')">✅ دەزانم</button>
            </div>
            
            <p style="text-align: center; margin-top: 12px;">
                <span id="fcIndex">1</span>/${shuffled.length}
            </p>
        </div>
    `;
    
    window._fcData = {
        words: shuffled,
        currentIndex: 0,
        isFlipped: false,
        correct: 0,
        wrong: 0,
    };
}

function flipFlashcard() {
    const card = getEl('flashcardEl');
    const data = window._fcData;
    if (!card || !data) return;
    
    data.isFlipped = !data.isFlipped;
    card.classList.toggle('flipped', data.isFlipped);
}

function rateFlashcard(rating) {
    const data = window._fcData;
    if (!data) return;
    
    if (rating === 'correct') {
        data.correct++;
        AppState.currentUser.xp += 3;
        playBeep(700, 0.08);
    } else {
        data.wrong++;
        playBeep(250, 0.15);
    }
    
    data.currentIndex++;
    data.isFlipped = false;
    
    if (data.currentIndex >= data.words.length) {
        const totalXP = data.correct * 3 + 10;
        AppState.currentUser.xp += 10;
        saveState();
        spawnConfetti();
        showAchievement('🃏', 'فلاشکارت تەواو!', `ڕاست: ${data.correct} | +${totalXP} XP`);
        setTimeout(() => navigateTo('home'), 1500);
        return;
    }
    
    const word = data.words[data.currentIndex];
    const card = getEl('flashcardEl');
    const wordEl = getEl('fcWord');
    const transEl = getEl('fcTranslation');
    const indexEl = getEl('fcIndex');
    
    if (card) card.classList.remove('flipped');
    if (wordEl) wordEl.textContent = word.en;
    if (transEl) transEl.textContent = word.ku;
    if (indexEl) indexEl.textContent = data.currentIndex + 1;
    
    saveState();
}

// ============ QUIZ ============
function renderQuiz(container) {
    const lang = AppState.settings.currentLanguage;
    const allWords = [];
    
    for (let cat in LanguageData[lang]?.categories || {}) {
        LanguageData[lang].categories[cat].lessons.forEach(lesson => {
            lesson.words.forEach(word => allWords.push(word));
        });
    }
    
    const quizWords = allWords.sort(() => Math.random() - 0.5).slice(0, 6);
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>📝 کویز</h2>
            <div class="progress-bar" style="margin: 12px 0;">
                <div class="progress-fill" id="quizProgress" style="width: 0%;"></div>
            </div>
            
            <div class="card" style="text-align: center; margin-bottom: 16px; padding: 30px;">
                <h3 id="quizPrompt">"${quizWords[0]?.en}" واتای چییە؟</h3>
                <button class="btn btn-sm" style="margin-top: 8px;" onclick="speakWord('${quizWords[0]?.en}')">🔊</button>
            </div>
            
            <div class="options-grid" id="quizOptions"></div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 16px;">
                <span>❤️ <span id="quizHearts">${AppState.currentUser.hearts}</span></span>
                <span>✅ <span id="quizScore">0</span>/${quizWords.length}</span>
            </div>
        </div>
    `;
    
    window._quizData = {
        words: quizWords,
        allWords: allWords,
        currentIndex: 0,
        score: 0,
        answered: false,
    };
    
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const data = window._quizData;
    if (!data || data.currentIndex >= data.words.length) {
        finishQuiz();
        return;
    }
    
    data.answered = false;
    const correct = data.words[data.currentIndex];
    
    const wrongOptions = data.allWords
        .filter(w => w.ku !== correct.ku)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
    
    const promptEl = getEl('quizPrompt');
    const progressEl = getEl('quizProgress');
    const optionsEl = getEl('quizOptions');
    
    if (promptEl) promptEl.innerHTML = `"${correct.en}" واتای چییە؟ <br><button class="btn btn-sm" style="margin-top:8px;" onclick="speakWord('${correct.en}')">🔊</button>`;
    if (progressEl) progressEl.style.width = (data.currentIndex / data.words.length) * 100 + '%';
    
    if (optionsEl) {
        optionsEl.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.ku;
            btn.addEventListener('click', () => checkQuizAnswer(opt.ku, correct.ku, btn));
            optionsEl.appendChild(btn);
        });
    }
}

function checkQuizAnswer(selected, correct, btnEl) {
    const data = window._quizData;
    if (!data || data.answered) return;
    data.answered = true;
    
    const allBtns = document.querySelectorAll('#quizOptions .option-btn');
    const scoreEl = getEl('quizScore');
    const heartsEl = getEl('quizHearts');
    
    if (selected === correct) {
        btnEl.classList.add('correct');
        data.score++;
        if (scoreEl) scoreEl.textContent = data.score;
        playBeep(700, 0.1);
        AppState.currentUser.xp += 10;
    } else {
        btnEl.classList.add('wrong');
        AppState.currentUser.hearts--;
        if (heartsEl) heartsEl.textContent = AppState.currentUser.hearts;
        allBtns.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
        playBeep(200, 0.2);
    }
    
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    
    if (AppState.currentUser.hearts <= 0) {
        AppState.currentUser.hearts = 5;
        saveState();
        showAchievement('💔', 'دڵەکانت تەواو بوون!', 'دڵەکان ڕیست کرانەوە');
        setTimeout(() => navigateTo('home'), 1200);
        return;
    }
    
    data.currentIndex++;
    saveState();
    setTimeout(loadQuizQuestion, 1000);
}

function finishQuiz() {
    const data = window._quizData;
    if (!data) return;
    
    const xpEarned = data.score * 15;
    AppState.currentUser.xp += xpEarned;
    AppState.currentUser.coins += data.score * 5;
    
    AppState.learning.history.push({
        type: 'quiz',
        score: data.score,
        total: data.words.length,
        xp: xpEarned,
        date: new Date().toISOString(),
    });
    
    saveState();
    spawnConfetti();
    showAchievement('🏆', 'کویز تەواو بوو!', `ڕاست: ${data.score}/${data.words.length} | +${xpEarned} XP`, xpEarned);
    setTimeout(() => navigateTo('home'), 1500);
}

// ============ SPEED QUIZ ============
function renderSpeedQuiz(container) {
    const lang = AppState.settings.currentLanguage;
    const allWords = [];
    
    for (let cat in LanguageData[lang]?.categories || {}) {
        LanguageData[lang].categories[cat].lessons.forEach(lesson => {
            lesson.words.forEach(word => allWords.push(word));
        });
    }
    
    const quizWords = allWords.sort(() => Math.random() - 0.5).slice(0, 10);
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>⚡ کویزی خێرا</h2>
            <p style="color: var(--heart-red); font-weight: 700;">⏱️ <span id="speedTimer">30</span> چرکە</p>
            
            <div class="progress-bar" style="margin: 12px 0;">
                <div class="progress-fill" id="speedProgress" style="width: 0%;"></div>
            </div>
            
            <div class="card" style="text-align: center; padding: 24px;">
                <h3 id="speedQuestion">${quizWords[0]?.en}</h3>
            </div>
            
            <div class="options-grid" id="speedOptions" style="margin-top: 16px;"></div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 16px;">
                <span>✅ <span id="speedScore">0</span></span>
                <span>❌ <span id="speedWrong">0</span></span>
            </div>
        </div>
    `;
    
    window._speedData = {
        words: quizWords,
        allWords: allWords,
        currentIndex: 0,
        score: 0,
        wrong: 0,
        timeLeft: 30,
        timer: null,
        answered: false,
    };
    
    loadSpeedQuestion();
    startSpeedTimer();
}

function loadSpeedQuestion() {
    const data = window._speedData;
    if (!data || data.currentIndex >= data.words.length || data.timeLeft <= 0) {
        finishSpeedQuiz();
        return;
    }
    
    data.answered = false;
    const correct = data.words[data.currentIndex];
    
    const wrongOptions = data.allWords
        .filter(w => w.ku !== correct.ku)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
    
    const questionEl = getEl('speedQuestion');
    const progressEl = getEl('speedProgress');
    const optionsEl = getEl('speedOptions');
    
    if (questionEl) questionEl.textContent = correct.en;
    if (progressEl) progressEl.style.width = (data.currentIndex / data.words.length) * 100 + '%';
    
    if (optionsEl) {
        optionsEl.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.ku;
            btn.addEventListener('click', () => checkSpeedAnswer(opt.ku, correct.ku, btn));
            optionsEl.appendChild(btn);
        });
    }
}

function checkSpeedAnswer(selected, correct, btnEl) {
    const data = window._speedData;
    if (!data || data.answered) return;
    data.answered = true;
    
    const allBtns = document.querySelectorAll('#speedOptions .option-btn');
    
    if (selected === correct) {
        btnEl.classList.add('correct');
        data.score++;
        data.timeLeft += 2;
        getEl('speedScore').textContent = data.score;
        playBeep(800, 0.06);
    } else {
        btnEl.classList.add('wrong');
        data.wrong++;
        data.timeLeft = Math.max(0, data.timeLeft - 3);
        getEl('speedWrong').textContent = data.wrong;
        allBtns.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
        playBeep(200, 0.12);
    }
    
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    data.currentIndex++;
    saveState();
    setTimeout(loadSpeedQuestion, 400);
}

function startSpeedTimer() {
    const data = window._speedData;
    if (!data) return;
    
    data.timer = setInterval(() => {
        data.timeLeft--;
        const timerEl = getEl('speedTimer');
        if (timerEl) {
            timerEl.textContent = data.timeLeft;
            if (data.timeLeft <= 10) timerEl.style.color = 'var(--heart-red)';
        }
        
        if (data.timeLeft <= 0) {
            clearInterval(data.timer);
            finishSpeedQuiz();
        }
    }, 1000);
}

function finishSpeedQuiz() {
    const data = window._speedData;
    if (!data) return;
    clearInterval(data.timer);
    
    const xpEarned = data.score * 8;
    AppState.currentUser.xp += xpEarned;
    
    AppState.learning.history.push({
        type: 'speed-quiz',
        score: data.score,
        wrong: data.wrong,
        xp: xpEarned,
        date: new Date().toISOString(),
    });
    
    saveState();
    spawnConfetti();
    showAchievement('⚡', 'کویزی خێرا تەواو!', `ڕاست: ${data.score} | هەڵە: ${data.wrong} | +${xpEarned} XP`, xpEarned);
    setTimeout(() => navigateTo('home'), 1500);
}

// ============ LISTENING ============
function renderListening(container) {
    const lang = AppState.settings.currentLanguage;
    const allWords = [];
    
    for (let cat in LanguageData[lang]?.categories || {}) {
        LanguageData[lang].categories[cat].lessons.forEach(lesson => {
            lesson.words.forEach(word => allWords.push(word));
        });
    }
    
    const testWords = allWords.sort(() => Math.random() - 0.5).slice(0, 5);
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🎧 ڕاهێنانی بیستن</h2>
            <p style="color: var(--text-secondary);">گوێبگرە و وەڵام هەڵبژێرە</p>
            
            <div class="card" style="text-align: center; padding: 40px; margin: 16px 0;">
                <button class="btn btn-primary btn-glow" onclick="playListenAudio()" style="font-size: 40px; width: 80px; height: 80px; border-radius: 50%; padding: 0;">
                    🔊
                </button>
                <p style="margin-top: 8px;" id="listenCount">٣ جار ماوە</p>
            </div>
            
            <div class="options-grid" id="listenOptions"></div>
            
            <div style="margin-top: 16px; text-align: center;">
                <span>✅ <span id="listenScore">0</span>/${testWords.length}</span>
            </div>
        </div>
    `;
    
    window._listenData = {
        words: testWords,
        allWords: allWords,
        currentIndex: 0,
        score: 0,
        chances: 3,
    };
    
    loadListeningQuestion();
}

function loadListeningQuestion() {
    const data = window._listenData;
    if (!data || data.currentIndex >= data.words.length) {
        finishListening();
        return;
    }
    
    data.chances = 3;
    const correct = data.words[data.currentIndex];
    
    const wrongOptions = data.allWords
        .filter(w => w.ku !== correct.ku)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
    
    getEl('listenCount').textContent = '٣ جار ماوە';
    
    const optionsEl = getEl('listenOptions');
    if (optionsEl) {
        optionsEl.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt.ku;
            btn.addEventListener('click', () => checkListenAnswer(opt.ku, correct.ku, btn));
            optionsEl.appendChild(btn);
        });
    }
    
    playListenAudio();
}

function playListenAudio() {
    const data = window._listenData;
    if (!data || data.chances <= 0) return;
    
    const word = data.words[data.currentIndex];
    speakWord(word.en, 'en-US', 0.7);
    data.chances--;
    getEl('listenCount').textContent = `${data.chances} جار ماوە`;
}

function checkListenAnswer(selected, correct, btnEl) {
    const data = window._listenData;
    if (!data) return;
    
    const allBtns = document.querySelectorAll('#listenOptions .option-btn');
    
    if (selected === correct) {
        btnEl.classList.add('correct');
        data.score++;
        getEl('listenScore').textContent = data.score;
        AppState.currentUser.xp += 12;
        playBeep(800, 0.1);
    } else {
        btnEl.classList.add('wrong');
        allBtns.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
        playBeep(200, 0.2);
    }
    
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    data.currentIndex++;
    saveState();
    setTimeout(loadListeningQuestion, 1200);
}

function finishListening() {
    const data = window._listenData;
    if (!data) return;
    
    const xpEarned = data.score * 12;
    AppState.currentUser.xp += xpEarned;
    
    AppState.learning.history.push({
        type: 'listening',
        score: data.score,
        total: data.words.length,
        xp: xpEarned,
        date: new Date().toISOString(),
    });
    
    saveState();
    spawnConfetti();
    showAchievement('🎧', 'بیستن تەواو!', `ڕاست: ${data.score}/${data.words.length} | +${xpEarned} XP`, xpEarned);
    setTimeout(() => navigateTo('home'), 1500);
}

// ============ SPEAKING ============
function renderSpeaking(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🎤 ڕاهێنانی قسەکردن</h2>
            
            <div class="card" style="text-align: center; padding: 40px 20px; margin: 16px 0;">
                <p style="font-size: 18px; margin-bottom: 16px;">ئەم ڕستەیە بڵێ:</p>
                <h2 style="color: var(--primary);" id="speakPrompt">"Hello, how are you?"</h2>
                <button class="btn btn-sm" style="margin: 8px 0;" onclick="speakWord('Hello, how are you?', 'en-US', 0.7)">🔊 گوێبگرە</button>
                
                <button class="btn btn-primary btn-lg" style="margin-top: 16px;" onclick="startRecording()">
                    🎤 دەست بکە بە قسەکردن
                </button>
                <p id="recordingStatus" style="margin-top: 12px; color: var(--text-secondary); font-weight: 600;"></p>
            </div>
        </div>
    `;
}

function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        getEl('recordingStatus').textContent = '⚠️ وێبگەڕەکەت پشتگیری ناکات';
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    getEl('recordingStatus').textContent = 'گوێدەگرم... 🎙️';
    
    recognition.start();
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        getEl('recordingStatus').textContent = `تۆ وتت: "${transcript}"`;
        AppState.currentUser.xp += 15;
        saveState();
        showNotification('+15 XP! 👏');
    };
    
    recognition.onerror = () => {
        getEl('recordingStatus').textContent = '❌ هەڵەیەک ڕوویدا، دووبارە هەوڵبدە';
    };
}

// ============ READING ============
function renderReading(container) {
    const stories = [
        {
            title: 'ڕۆژێکی سادە',
            english: 'Every morning, I wake up at 7 o\'clock. I brush my teeth and wash my face. Then I eat breakfast. I like to drink tea with my breakfast.',
            kurdish: 'هەموو بەیانییەک، کاژێر ٧ هەڵدەستم. ددانم شوشت و ڕوخسارم دەشۆم. دواتر نانی بەیانی دەخۆم. حەزم لە چایە لەگەڵ نانی بەیانی.',
            questions: [
                { q: 'کاژێر چەند هەڵدەستێت؟', options: ['٦', '٧', '٨', '٩'], correct: '٧' },
                { q: 'چی دەخواتەوە لەگەڵ نانی بەیانی؟', options: ['قاوە', 'چا', 'شیر', 'ئاو'], correct: 'چا' },
            ]
        }
    ];
    
    const story = stories[0];
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>📖 خوێندنەوە</h2>
            
            <div class="card" style="margin: 12px 0;">
                <h3>📝 ${story.title}</h3>
                <p style="line-height: 2; margin: 12px 0;" id="storyEnglish">${story.english}</p>
                <button class="btn btn-sm" onclick="toggleStoryTranslation()" id="toggleTranslationBtn">
                    👀 پیشاندانی وەرگێڕان
                </button>
                <p style="line-height: 2; margin: 12px 0; display: none;" id="storyKurdish">${story.kurdish}</p>
            </div>
            
            <div id="readingQuestions"></div>
        </div>
    `;
    
    window._readingData = story;
    renderReadingQuestions();
}

function toggleStoryTranslation() {
    const kurdishEl = getEl('storyKurdish');
    const btn = getEl('toggleTranslationBtn');
    
    if (kurdishEl.style.display === 'none') {
        kurdishEl.style.display = 'block';
        btn.textContent = '🙈 شاردنەوەی وەرگێڕان';
    } else {
        kurdishEl.style.display = 'none';
        btn.textContent = '👀 پیشاندانی وەرگێڕان';
    }
}

function renderReadingQuestions() {
    const story = window._readingData;
    const container = getEl('readingQuestions');
    if (!container) return;
    
    container.innerHTML = '<h3 style="margin-top: 20px;">❓ پرسیارەکان:</h3>';
    
    story.questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginTop = '12px';
        div.innerHTML = `
            <p><strong>${i + 1}. ${q.q}</strong></p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                ${q.options.map(opt => `
                    <button class="option-btn reading-opt" data-correct="${q.correct}" 
                            onclick="checkReadingAnswer(this, '${opt}', '${q.correct}')">${opt}</button>
                `).join('')}
            </div>
        `;
        container.appendChild(div);
    });
}

function checkReadingAnswer(btn, selected, correct) {
    const parent = btn.parentElement;
    const allBtns = parent.querySelectorAll('.reading-opt');
    
    if (selected === correct) {
        btn.classList.add('correct');
        AppState.currentUser.xp += 10;
        playBeep(800, 0.1);
    } else {
        btn.classList.add('wrong');
        allBtns.forEach(b => {
            if (b.dataset.correct === correct) b.classList.add('correct');
        });
        playBeep(200, 0.2);
    }
    
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    saveState();
}

// ============ WRITING ============
function renderWriting(container) {
    const lang = AppState.settings.currentLanguage;
    const allWords = [];
    
    for (let cat in LanguageData[lang]?.categories || {}) {
        LanguageData[lang].categories[cat].lessons.forEach(lesson => {
            lesson.words.forEach(word => allWords.push(word));
        });
    }
    
    const testWords = allWords.sort(() => Math.random() - 0.5).slice(0, 5);
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>✍️ ڕاهێنانی نووسین</h2>
            
            <div class="card" style="text-align: center; padding: 30px; margin: 16px 0;">
                <p>ئەم وشەیە بنووسە:</p>
                <h2 id="writePrompt" style="color: var(--primary); font-size: 36px;">${testWords[0]?.ku}</h2>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <input type="text" id="writingInput" placeholder="لێرە بنووسە..." 
                       style="flex: 1; padding: 16px; border-radius: var(--radius-lg); 
                              border: 2px solid var(--border); font-size: 18px;
                              background: var(--card); color: var(--text); font-family: var(--font-family);">
                <button class="btn btn-primary" onclick="checkWriting()">پشکنین ✅</button>
            </div>
            
            <p id="writingFeedback" style="text-align: center; margin-top: 12px; font-weight: 600; min-height: 24px;"></p>
            <p style="text-align: center;">✅ <span id="writeScore">0</span>/${testWords.length}</p>
        </div>
    `;
    
    window._writingData = {
        words: testWords,
        currentIndex: 0,
        score: 0,
    };
}

function checkWriting() {
    const data = window._writingData;
    if (!data) return;
    
    const input = getEl('writingInput').value.trim().toLowerCase();
    const correct = data.words[data.currentIndex].en.toLowerCase();
    const feedback = getEl('writingFeedback');
    
    if (input === correct) {
        feedback.textContent = '✅ زۆر باشە! ڕاستە!';
        feedback.style.color = 'var(--primary)';
        data.score++;
        getEl('writeScore').textContent = data.score;
        AppState.currentUser.xp += 10;
        playBeep(800, 0.1);
    } else {
        feedback.textContent = `❌ هەڵە! ڕاستەکە: "${correct}"`;
        feedback.style.color = 'var(--heart-red)';
        playBeep(200, 0.2);
    }
    
    data.currentIndex++;
    saveState();
    
    if (data.currentIndex >= data.words.length) {
        const xpEarned = data.score * 10;
        AppState.currentUser.xp += xpEarned;
        saveState();
        spawnConfetti();
        showAchievement('✍️', 'نووسین تەواو!', `ڕاست: ${data.score}/${data.words.length} | +${xpEarned} XP`, xpEarned);
        setTimeout(() => navigateTo('home'), 1500);
        return;
    }
    
    setTimeout(() => {
        getEl('writePrompt').textContent = data.words[data.currentIndex].ku;
        getEl('writingInput').value = '';
        feedback.textContent = '';
    }, 1200);
}

// ============ AI TEACHER ============
function renderAITeacher(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🤖 مامۆستای AI</h2>
            <p style="color: var(--text-secondary);">پرسیار بکە و یارمەتی وەربگرە</p>
            
            <div id="aiChat" class="card" style="min-height: 300px; max-height: 400px; overflow-y: auto; margin: 12px 0; padding: 16px;">
                <div style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
                    <p style="font-size: 48px;">🤖</p>
                    <p>چۆن دەتوانم یارمەتیت بدەم؟</p>
                    <p style="font-size: 13px;">پرسیار لەسەر ڕێزمان، وەرگێڕان، یان ڕاهێنان بکە</p>
                </div>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <input type="text" id="aiInput" placeholder="پرسیارەکەت لێرە بنووسە..." 
                       style="flex: 1; padding: 14px; border-radius: var(--radius-lg); 
                              border: 2px solid var(--border); font-size: 16px;
                              background: var(--card); color: var(--text); font-family: var(--font-family);">
                <button class="btn btn-primary" onclick="askAI()">ناردن 📤</button>
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                <button class="btn btn-sm" onclick="quickAI('ڕێزمانی Hello')">ڕێزمان</button>
                <button class="btn btn-sm" onclick="quickAI('وەرگێڕانی: How are you')">وەرگێڕان</button>
                <button class="btn btn-sm" onclick="quickAI('ڕاهێنانێکم پێبدە')">ڕاهێنان</button>
            </div>
        </div>
    `;
}

function askAI() {
    const input = getEl('aiInput');
    const chat = getEl('aiChat');
    if (!input || !chat || !input.value.trim()) return;
    
    const question = input.value.trim();
    input.value = '';
    
    // Add user message
    chat.innerHTML += `<div style="text-align: right; margin: 8px 0;"><span style="background: var(--primary); color: white; padding: 8px 14px; border-radius: 18px; display: inline-block;">${question}</span></div>`;
    
    // Simulate AI response
    const responses = [
        'بەڵێ، دەتوانم یارمەتیت بدەم! تکایە زیاتر ڕوون بکەرەوە.',
        'زۆر باشە! ئەمە ڕێزمانی وشەکەیە...',
        'وەرگێڕانەکە: "چۆنی؟" بە کوردی.',
        'باشە، ڕاهێنانێک: "Hello" واتای چییە؟',
    ];
    
    setTimeout(() => {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        chat.innerHTML += `<div style="text-align: left; margin: 8px 0;"><span style="background: var(--bg-secondary); padding: 8px 14px; border-radius: 18px; display: inline-block;">🤖 ${randomResponse}</span></div>`;
        chat.scrollTop = chat.scrollHeight;
        AppState.currentUser.xp += 5;
        saveState();
    }, 800);
    
    chat.scrollTop = chat.scrollHeight;
}

function quickAI(query) {
    getEl('aiInput').value = query;
    askAI();
}

// ============ PROGRESS ============
function renderProgress(container) {
    const history = AppState.learning.history.slice(-10).reverse();
    const user = AppState.currentUser;
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>📊 پێشکەوتن</h2>
            
            <div class="card" style="margin: 12px 0;">
                <h3>ئامارەکان</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                    <div><strong>کۆی XP:</strong> ${user.xp}</div>
                    <div><strong>ئاست:</strong> ${user.level}</div>
                    <div><strong>وشەکان:</strong> ${user.totalWords}</div>
                    <div><strong>ستریک:</strong> ${user.streak} 🔥</div>
                </div>
            </div>
            
            <div class="card">
                <h3>📝 مێژوو</h3>
                ${history.length === 0 ? '<p style="color: var(--text-secondary);">هێشتا هیچ چالاکییەک نییە</p>' : ''}
                ${history.map(h => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
                        <span style="font-size: 24px;">${h.type === 'quiz' ? '📝' : h.type === 'listening' ? '🎧' : '📚'}</span>
                        <div style="flex: 1;">
                            <strong>${h.type === 'quiz' ? 'کویز' : h.type === 'listening' ? 'بیستن' : 'وانە'}</strong>
                            <p style="font-size: 12px; color: var(--text-secondary);">${new Date(h.date).toLocaleDateString('ckb')}</p>
                        </div>
                        <span style="font-weight: 600; color: var(--primary);">+${h.xp} XP</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============ ACHIEVEMENTS ============
function renderAchievements(container) {
    const allBadges = [
        { name: 'برۆنزی', icon: '🥉', desc: 'تەواوکردنی ٥ وانە', earned: AppState.learning.history.filter(h => h.type === 'lesson').length >= 5 },
        { name: 'زیوی', icon: '🥈', desc: 'تەواوکردنی ٢٠ وانە', earned: AppState.learning.history.filter(h => h.type === 'lesson').length >= 20 },
        { name: 'زێڕین', icon: '🥇', desc: 'تەواوکردنی ٥٠ وانە', earned: AppState.learning.history.filter(h => h.type === 'lesson').length >= 50 },
        { name: 'پلاتینۆم', icon: '💎', desc: '١٠٠ ڕۆژ ستریک', earned: AppState.currentUser.streak >= 100 },
        { name: 'گەشتیار', icon: '🚀', desc: 'فێربوونی ٥٠٠ وشە', earned: AppState.currentUser.totalWords >= 500 },
        { name: 'خێرا', icon: '⚡', desc: 'کویزی خێرا تەواو بکە', earned: AppState.learning.history.some(h => h.type === 'speed-quiz') },
        { name: 'زیرەک', icon: '🧠', desc: '١٠ کویز تەواو بکە', earned: AppState.learning.history.filter(h => h.type === 'quiz').length >= 10 },
        { name: 'پۆلیگلۆت', icon: '🌍', desc: 'فێربوونی ٣ زمان', earned: false },
    ];
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🏆 دەستکەوتەکان</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px;">
                ${allBadges.map(b => `
                    <div class="card" style="text-align: center; opacity: ${b.earned ? '1' : '0.4'};">
                        <div style="font-size: 40px;">${b.earned ? b.icon : '🔒'}</div>
                        <strong>${b.name}</strong>
                        <p style="font-size: 10px; color: var(--text-secondary);">${b.desc}</p>
                        ${b.earned ? '<span style="color: var(--primary); font-size: 12px;">✅ بەدەستهاتووە</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============ COMMUNITY ============
function renderCommunity(container) {
    const users = [
        { name: 'سارا', level: 12, xp: 4500, avatar: '👩', streak: 15 },
        { name: 'ئارام', level: 8, xp: 2800, avatar: '👨', streak: 8 },
        { name: 'دلشاد', level: 15, xp: 6200, avatar: '🧔', streak: 30 },
        { name: 'شیلان', level: 5, xp: 1200, avatar: '👩‍🦰', streak: 3 },
        { name: 'کاروان', level: 20, xp: 9800, avatar: '👨‍🦱', streak: 45 },
    ].sort((a, b) => b.xp - a.xp);
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>👥 کۆمەڵگا</h2>
            
            <div class="card" style="margin: 12px 0;">
                <h3>🏆 ڕیزبەندی</h3>
                ${users.map((u, i) => `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
                        <span style="font-size: 20px; width: 30px; font-weight: 700;">
                            ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <span style="font-size: 28px;">${u.avatar}</span>
                        <div style="flex: 1;">
                            <strong>${u.name}</strong>
                            <p style="font-size: 11px; color: var(--text-secondary);">ئاست ${u.level} • 🔥 ${u.streak}</p>
                        </div>
                        <span style="font-weight: 700; color: var(--primary);">${u.xp} XP</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============ PROFILE ============
function renderProfile(container) {
    const user = AppState.currentUser;
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <div class="card" style="text-align: center; padding: 30px;">
                <div style="font-size: 72px;">👤</div>
                <h2>${user.name}</h2>
                <p style="color: var(--text-secondary);">ئاست ${user.level}</p>
                <div class="progress-bar" style="margin: 12px 0;">
                    <div class="progress-fill" style="width: ${(user.xp % 1000) / 10}%;"></div>
                </div>
                <p>${user.xp} / ${Math.ceil(user.xp / 1000) * 1000} XP</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px;">
                <div class="card" style="text-align: center;">🔥 ستریک: ${user.streak}</div>
                <div class="card" style="text-align: center;">💎 گوەهر: ${user.gems}</div>
                <div class="card" style="text-align: center;">🪙 دراو: ${user.coins}</div>
                <div class="card" style="text-align: center;">📚 وشە: ${user.totalWords}</div>
            </div>
            
            <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 16px;" onclick="changeName()">
                ✏️ گۆڕینی ناو
            </button>
        </div>
    `;
}

function changeName() {
    const name = prompt('ناوی نوێ بنووسە:', AppState.currentUser.name);
    if (name && name.trim()) {
        AppState.currentUser.name = name.trim();
        saveState();
        navigateTo('profile');
        showNotification('✅ ناو گۆڕدرا!');
    }
}

// ============ SETTINGS ============
function renderSettings(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>⚙️ ڕێکخستنەکان</h2>
            
            <div class="card" style="margin-top: 12px;">
                <h3>🌗 ڕووکار</h3>
                <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                    <button class="btn ${!AppState.settings.darkMode && !AppState.settings.amoledMode ? 'btn-primary' : ''}" 
                            onclick="setTheme('light')">☀️ ڕووناک</button>
                    <button class="btn ${AppState.settings.darkMode && !AppState.settings.amoledMode ? 'btn-primary' : ''}" 
                            onclick="setTheme('dark')">🌙 تاریک</button>
                    <button class="btn ${AppState.settings.amoledMode ? 'btn-primary' : ''}" 
                            onclick="setTheme('amoled')">🖤 AMOLED</button>
                </div>
            </div>
            
            <div class="card" style="margin-top: 12px;">
                <h3>🌍 زمان</h3>
                <select id="settingsLang" onchange="changeLanguage(this.value)" style="width: 100%; margin-top: 8px; padding: 10px; border-radius: var(--radius-md); border: 2px solid var(--border); background: var(--card); color: var(--text); font-family: var(--font-family);">
                    <option value="en-ku" ${AppState.settings.currentLanguage === 'en-ku' ? 'selected' : ''}>🇬🇧 ئینگلیزی → کوردی</option>
                    <option value="ku-en" ${AppState.settings.currentLanguage === 'ku-en' ? 'selected' : ''}>☀️ کوردی → ئینگلیزی</option>
                    <option value="ar-ku" ${AppState.settings.currentLanguage === 'ar-ku' ? 'selected' : ''}>🇸🇦 عەرەبی → کوردی</option>
                    <option value="tr-ku" ${AppState.settings.currentLanguage === 'tr-ku' ? 'selected' : ''}>🇹🇷 تورکی → کوردی</option>
                    <option value="fa-ku" ${AppState.settings.currentLanguage === 'fa-ku' ? 'selected' : ''}>🇮🇷 فارسی → کوردی</option>
                    <option value="de-ku" ${AppState.settings.currentLanguage === 'de-ku' ? 'selected' : ''}>🇩🇪 ئەڵمانی → کوردی</option>
                    <option value="fr-ku" ${AppState.settings.currentLanguage === 'fr-ku' ? 'selected' : ''}>🇫🇷 فەرەنسی → کوردی</option>
                    <option value="es-ku" ${AppState.settings.currentLanguage === 'es-ku' ? 'selected' : ''}>🇪🇸 ئیسپانی → کوردی</option>
                    <option value="ru-ku" ${AppState.settings.currentLanguage === 'ru-ku' ? 'selected' : ''}>🇷🇺 ڕووسی → کوردی</option>
                    <option value="zh-ku" ${AppState.settings.currentLanguage === 'zh-ku' ? 'selected' : ''}>🇨🇳 چینی → کوردی</option>
                    <option value="ja-ku" ${AppState.settings.currentLanguage === 'ja-ku' ? 'selected' : ''}>🇯🇵 ژاپۆنی → کوردی</option>
                    <option value="ko-ku" ${AppState.settings.currentLanguage === 'ko-ku' ? 'selected' : ''}>🇰🇷 کۆری → کوردی</option>
                </select>
            </div>
            
            <div class="card" style="margin-top: 12px;">
                <h3>🔄 ڕیستکردنەوە</h3>
                <button class="btn" style="background: var(--heart-red); color: white; margin-top: 8px;" 
                        onclick="resetProgress()">🔄 ڕیستکردنەوەی هەموو پێشکەوتن</button>
            </div>
        </div>
    `;
}

function setTheme(theme) {
    AppState.settings.darkMode = theme === 'dark';
    AppState.settings.amoledMode = theme === 'amoled';
    
    document.body.classList.remove('dark-mode', 'amoled-mode');
    if (theme === 'dark') document.body.classList.add('dark-mode');
    if (theme === 'amoled') document.body.classList.add('amoled-mode');
    
    localStorage.setItem('zm_dark', AppState.settings.darkMode);
    localStorage.setItem('zm_amoled', AppState.settings.amoledMode);
    
    renderPage('settings');
}

function changeLanguage(lang) {
    AppState.settings.currentLanguage = lang;
    localStorage.setItem('zm_lang', lang);
    getEl('languageSelect').value = lang;
    showNotification('✅ زمان گۆڕدرا!');
}

function resetProgress() {
    if (confirm('دڵنیایت دەتەوێت هەموو پێشکەوتنەکانت ڕیست بکەیتەوە؟')) {
        localStorage.clear();
        location.reload();
    }
}

// ============ PREMIUM ============
function renderPremium(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>💎 ببە بە پڕیمیوم</h2>
            
            <div class="card" style="text-align: center; margin-top: 16px;">
                <h3>🆓 پلانی بێبەرامبەر</h3>
                <p style="color: var(--text-secondary);">دەستگەیشتنی سنووردار</p>
                <p style="font-size: 32px; font-weight: 800;">$0</p>
                <p>❤️ ٥ دڵ | 📚 وانە سنووردار</p>
            </div>
            
            <div class="card card-premium" style="text-align: center; margin-top: 12px;">
                <h3>💎 پڕیمیوم</h3>
                <p style="color: var(--text-secondary);">هەموو تایبەتمەندییەکان</p>
                <p style="font-size: 32px; font-weight: 800; color: var(--primary);">$4.99</p>
                <p style="font-size: 14px;">/ مانگانە</p>
                <p>❤️ دڵی بێسنوور | 🤖 AI تەواو | 📚 هەموو وانەکان</p>
                <button class="btn btn-primary btn-lg btn-glow" style="margin-top: 12px;" onclick="showNotification('🚀 بەم زووانە دەست دەکەوێت!')">
                    دەستپێبکە 🚀
                </button>
            </div>
            
            <div class="card" style="text-align: center; margin-top: 12px;">
                <h3>👑 پلانی شاهانە</h3>
                <p style="font-size: 32px; font-weight: 800; color: #ffd700;">$9.99</p>
                <p style="font-size: 14px;">/ مانگانە</p>
                <p>هەموو شتێک + وانەی تایبەت</p>
                <button class="btn btn-gradient" style="margin-top: 8px;" onclick="showNotification('👑 بەم زووانە!')">
                    هەڵبژاردن 👑
                </button>
            </div>
        </div>
    `;
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ziman App Starting...');
    console.log('🌍 15 Languages | 🤖 AI Teacher | 🎮 Gamification | 💎 Premium Ready');
    
    // Hide splash screen
    setTimeout(() => {
        const splash = getEl('splashScreen');
        if (splash) splash.style.display = 'none';
    }, 2300);
    
    // Apply theme
    if (AppState.settings.darkMode) document.body.classList.add('dark-mode');
    if (AppState.settings.amoledMode) document.body.classList.add('amoled-mode');
    
    // Check streak
    checkStreak();
    
    // Show daily reward
    setTimeout(() => {
        const lastReward = localStorage.getItem('zm_lastReward');
        const today = new Date().toDateString();
        if (lastReward !== today) {
            showPopup('dailyRewardPopup');
        }
    }, 3500);
    
    // Render home
    renderHome(getEl('mainContent'));
    updateHeaderStats();
    
    // Menu toggle
    getEl('menuBtn')?.addEventListener('click', () => {
        getEl('sideMenu')?.classList.toggle('open');
        getEl('menuOverlay')?.classList.toggle('open');
    });
    
    getEl('menuOverlay')?.addEventListener('click', () => {
        getEl('sideMenu')?.classList.remove('open');
        getEl('menuOverlay')?.classList.remove('open');
    });
    
    // Navigation
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', () => {
            const page = el.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // Language select
    getEl('languageSelect')?.addEventListener('change', function() {
        changeLanguage(this.value);
    });
    
    getEl('settingsLang')?.addEventListener('change', function() {
        changeLanguage(this.value);
    });
    
    // Daily reward
    getEl('claimReward')?.addEventListener('click', () => {
        AppState.currentUser.gems += 50;
        AppState.currentUser.xp += 20;
        saveState();
        localStorage.setItem('zm_lastReward', new Date().toDateString());
        hidePopup('dailyRewardPopup');
        spawnConfetti();
        showNotification('🎁 +50 💎 | +20 XP وەرگیرا!');
    });
    
    // Close achievement
    getEl('closeAchievement')?.addEventListener('click', () => {
        hidePopup('achievementPopup');
    });
    
    // Lucky wheel
    getEl('spinWheel')?.addEventListener('click', spinWheel);
    getEl('closeWheel')?.addEventListener('click', () => hidePopup('luckyWheelPopup'));
    
    // Treasure box
    getEl('openTreasure')?.addEventListener('click', openTreasure);
    getEl('closeTreasure')?.addEventListener('click', () => hidePopup('treasureBoxPopup'));
    
    // AI Bubble
    getEl('aiBubble')?.addEventListener('click', () => navigateTo('ai-teacher'));
    
    // Keyboard shortcut for search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !e.target.closest('input, textarea')) {
            e.preventDefault();
            getEl('menuSearch')?.focus();
        }
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
        const canvas = getEl('confettiCanvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
    
    // Add ripple effect to buttons
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// ============ STREAK CHECK ============
function checkStreak() {
    const last = AppState.currentUser.lastLogin;
    const today = new Date();
    
    if (!last) {
        AppState.currentUser.streak = 1;
    } else {
        const lastDate = new Date(last);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return; // Same day
        if (diffDays === 1) {
            AppState.currentUser.streak++;
            if (AppState.currentUser.streak % 7 === 0) {
                showNotification(`🔥 ${AppState.currentUser.streak} ڕۆژ ستریک! خەڵاتی تایبەت!`);
            }
        } else if (diffDays > 1) {
            AppState.currentUser.streak = 1;
        }
    }
    
    AppState.currentUser.lastLogin = today.toISOString();
    saveState();
}

// ============ LUCKY WHEEL ============
function spinWheel() {
    const wheel = getEl('luckyWheel');
    const btn = getEl('spinWheel');
    if (!wheel || !btn) return;
    
    const rotation = Math.floor(Math.random() * 360) + 1800;
    wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheel.style.transform = `rotate(${rotation}deg)`;
    
    btn.disabled = true;
    btn.textContent = 'دەخولێتەوە... 🎰';
    
    setTimeout(() => {
        const prizes = [
            { text: '50 XP', action: () => { AppState.currentUser.xp += 50; } },
            { text: '100 💎', action: () => { AppState.currentUser.gems += 100; } },
            { text: '❤️ دڵ', action: () => { AppState.currentUser.hearts = Math.min(5, AppState.currentUser.hearts + 1); } },
            { text: '30 XP', action: () => { AppState.currentUser.xp += 30; } },
            { text: '200 💎', action: () => { AppState.currentUser.gems += 200; } },
            { text: '🏆 بەدج', action: () => { AppState.currentUser.xp += 100; } },
        ];
        
        const prize = prizes[Math.floor(Math.random() * prizes.length)];
        prize.action();
        
        saveState();
        showNotification(`🎉 براوە: ${prize.text}!`);
        spawnConfetti();
        
        btn.disabled = false;
        btn.textContent = 'بخولێنە! 🎡';
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';
        
        setTimeout(() => hidePopup('luckyWheelPopup'), 1500);
    }, 3200);
}

// ============ TREASURE BOX ============
function openTreasure() {
    const box = getEl('treasureBox');
    const btn = getEl('openTreasure');
    if (!box || !btn) return;
    
    const prizes = [
        { icon: '💎', amount: 50, type: 'gems' },
        { icon: '🪙', amount: 100, type: 'coins' },
        { icon: '⭐', amount: 30, type: 'xp' },
        { icon: '❤️', amount: 2, type: 'hearts' },
    ];
    
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    box.textContent = prize.icon;
    box.style.animation = 'treasureShake 0.5s ease';
    btn.disabled = true;
    
    if (prize.type === 'gems') AppState.currentUser.gems += prize.amount;
    if (prize.type === 'coins') AppState.currentUser.coins += prize.amount;
    if (prize.type === 'xp') AppState.currentUser.xp += prize.amount;
    if (prize.type === 'hearts') AppState.currentUser.hearts = Math.min(5, AppState.currentUser.hearts + prize.amount);
    
    saveState();
    
    setTimeout(() => {
        showNotification(`${prize.icon} +${prize.amount} دەستکەوت!`);
        hidePopup('treasureBoxPopup');
        box.style.animation = '';
        btn.disabled = false;
        box.textContent = '🎁';
    }, 2000);
}

// ============ SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// ============ PWA INSTALL ============
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    setTimeout(() => {
        showNotification('📱 دەتوانیت وەک ئەپ دایبمەزرێنیت!');
    }, 5000);
});

// ============ GLOBAL ERROR HANDLER ============
window.addEventListener('error', (e) => {
    console.error('Ziman Error:', e.error);
});

// ============ EXPORT FOR DEBUG ============
console.log('✅ Ziman App Loaded Successfully!');
console.log('📊 State:', AppState);
console.log('🌍 Available Languages:', Object.keys(LanguageData));
console.log('💡 Tip: Press / to search, use bottom nav to navigate');
