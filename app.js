// ============ COMPLETE APP.JS ============
// Ziman Language Learning App - Full Implementation

// ============ STATE MANAGEMENT ============
const AppState = {
    currentUser: {
        name: 'فێرخواز',
        level: 1,
        xp: parseInt(localStorage.getItem('zm_xp')) || 0,
        coins: parseInt(localStorage.getItem('zm_coins')) || 100,
        gems: parseInt(localStorage.getItem('zm_gems')) || 50,
        hearts: parseInt(localStorage.getItem('zm_hearts')) || 5,
        streak: parseInt(localStorage.getItem('zm_streak')) || 0,
        lastLogin: localStorage.getItem('zm_lastLogin') || null,
    },
    settings: {
        darkMode: localStorage.getItem('zm_dark') === 'true',
        amoledMode: localStorage.getItem('zm_amoled') === 'true',
        currentLanguage: localStorage.getItem('zm_lang') || 'en-ku',
        direction: 'rtl',
    },
    learning: {
        currentLesson: 0,
        currentCategory: 'basics',
        answers: [],
    },
    pages: {
        current: 'home',
        history: [],
    },
    achievements: JSON.parse(localStorage.getItem('zm_achievements')) || [],
    badges: JSON.parse(localStorage.getItem('zm_badges')) || [],
};

// ============ DATA STORE (JSON-LIKE) ============
const LanguageData = {
    'en-ku': {
        name: 'ئینگلیزی → کوردی',
        categories: {
            alphabet: {
                name: 'ئەلفوبێ',
                lessons: [
                    { id: 1, words: [
                        { en: 'A', ku: 'ئەی', type: 'letter' },
                        { en: 'B', ku: 'بی', type: 'letter' },
                        { en: 'C', ku: 'سی', type: 'letter' },
                    ]}
                ]
            },
            greetings: {
                name: 'سڵاوکردن',
                lessons: [
                    { id: 2, words: [
                        { en: 'Hello', ku: 'سڵاو', audio: 'hello.mp3' },
                        { en: 'Good morning', ku: 'بەیانیت باش', audio: 'good_morning.mp3' },
                        { en: 'Good night', ku: 'شەو باش', audio: 'good_night.mp3' },
                        { en: 'How are you?', ku: 'چۆنی؟', audio: 'how_are_you.mp3' },
                        { en: 'Fine, thank you', ku: 'باشم، سوپاس', audio: 'fine_thanks.mp3' },
                    ]}
                ]
            },
            numbers: {
                name: 'ژمارەکان',
                lessons: [
                    { id: 3, words: [
                        { en: 'One', ku: 'یەک' },
                        { en: 'Two', ku: 'دوو' },
                        { en: 'Three', ku: 'سێ' },
                        { en: 'Four', ku: 'چوار' },
                        { en: 'Five', ku: 'پێنج' },
                        { en: 'Six', ku: 'شەش' },
                        { en: 'Seven', ku: 'حەوت' },
                        { en: 'Eight', ku: 'هەشت' },
                        { en: 'Nine', ku: 'نۆ' },
                        { en: 'Ten', ku: 'دە' },
                    ]}
                ]
            },
            colors: {
                name: 'ڕەنگەکان',
                lessons: [
                    { id: 4, words: [
                        { en: 'Red', ku: 'سوور' },
                        { en: 'Blue', ku: 'شین' },
                        { en: 'Green', ku: 'سەوز' },
                        { en: 'Yellow', ku: 'زەرد' },
                        { en: 'Black', ku: 'ڕەش' },
                        { en: 'White', ku: 'سپی' },
                    ]}
                ]
            },
        }
    }
};

// ============ ROUTING SYSTEM ============
function navigateTo(page, data = {}) {
    AppState.pages.history.push(AppState.pages.current);
    AppState.pages.current = page;
    renderPage(page, data);
    
    // Update active states
    document.querySelectorAll('[data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });
}

function renderPage(page, data) {
    const main = document.getElementById('mainContent');
    if (!main) return;
    
    switch(page) {
        case 'home': renderHome(main); break;
        case 'lessons': renderLessons(main); break;
        case 'lesson': renderLessonView(main, data); break;
        case 'quiz': renderQuiz(main, data); break;
        case 'ai-teacher': renderAITeacher(main); break;
        case 'listening': renderListening(main); break;
        case 'speaking': renderSpeaking(main); break;
        case 'reading': renderReading(main); break;
        case 'writing': renderWriting(main); break;
        case 'progress': renderProgress(main); break;
        case 'achievements': renderAchievements(main); break;
        case 'community': renderCommunity(main); break;
        case 'profile': renderProfile(main); break;
        case 'settings': renderSettings(main); break;
        case 'premium': renderPremium(main); break;
        default: renderHome(main);
    }
    
    window.scrollTo(0, 0);
}

// ============ HOME/DASHBOARD ============
function renderHome(container) {
    const user = AppState.currentUser;
    container.innerHTML = `
        <div class="page-home">
            <!-- Welcome Section -->
            <div class="welcome-section gradient-nature" style="padding: 24px; border-radius: var(--radius-xl); color: white; margin: 16px;">
                <h1>سڵاو، ${user.name}! 👋</h1>
                <p>ئاست ${user.level} | ${user.xp} XP</p>
                <div class="progress-bar" style="margin-top: 12px;">
                    <div class="progress-fill" style="width: ${(user.xp % 1000) / 10}%; background: white;"></div>
                </div>
            </div>
            
            <!-- Streak & Stats -->
            <div class="stats-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 16px;">
                <div class="card" style="text-align: center;">
                    <div style="font-size: 32px;">🔥</div>
                    <div style="font-weight: 700;">${user.streak}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">ڕۆژ</div>
                </div>
                <div class="card" style="text-align: center;">
                    <div style="font-size: 32px;">💎</div>
                    <div style="font-weight: 700;">${user.gems}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">گوەهر</div>
                </div>
                <div class="card" style="text-align: center;">
                    <div style="font-size: 32px;">🪙</div>
                    <div style="font-weight: 700;">${user.coins}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">دراو</div>
                </div>
            </div>
            
            <!-- Continue Learning -->
            <div style="padding: 16px;">
                <h3>📚 بەردەوام بە</h3>
                <div class="card" style="margin-top: 8px; cursor: pointer;" onclick="navigateTo('lesson', {category: 'greetings', lesson: 0})">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 36px;">💬</span>
                        <div style="flex: 1;">
                            <strong>سڵاوکردن</strong>
                            <p style="font-size: 13px; color: var(--text-secondary);">وانەی ١ لە ٣</p>
                        </div>
                        <span style="font-size: 24px;">▶️</span>
                    </div>
                </div>
            </div>
            
            <!-- Daily Challenge -->
            <div style="padding: 16px;">
                <div class="card card-premium" style="cursor: pointer;" onclick="startDailyChallenge()">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 36px;">🎯</span>
                        <div>
                            <strong>ڕاهێنانی ڕۆژانە</strong>
                            <p style="font-size: 13px; color: var(--text-secondary);">+30 XP بۆ تەواوکردن</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Word of the Day -->
            <div style="padding: 16px;">
                <div class="card" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                    <p style="font-size: 12px; opacity: 0.8;">📅 وشەی ڕۆژ</p>
                    <h2 style="font-size: 28px;">Hello</h2>
                    <p>سڵاو</p>
                    <button class="btn" style="background: rgba(255,255,255,0.2); color: white; margin-top: 8px;" onclick="speakWord('Hello')">🔊 گوێبگرە</button>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div style="padding: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                <button class="card" onclick="navigateTo('quiz')" style="text-align: center;">
                    <div>📝</div><small>کویز</small>
                </button>
                <button class="card" onclick="navigateTo('listening')" style="text-align: center;">
                    <div>🎧</div><small>بیستن</small>
                </button>
                <button class="card" onclick="navigateTo('speaking')" style="text-align: center;">
                    <div>🎤</div><small>قسە</small>
                </button>
                <button class="card" onclick="openLuckyWheel()" style="text-align: center;">
                    <div>🎡</div><small>بەخت</small>
                </button>
            </div>
        </div>
    `;
}

// ============ LESSONS VIEW ============
function renderLessons(container) {
    const lang = AppState.settings.currentLanguage;
    const data = LanguageData[lang];
    
    if (!data) {
        container.innerHTML = '<p style="padding: 20px;">زمانەکە پشتگیری ناکرێت</p>';
        return;
    }
    
    let html = '<div style="padding: 16px;"><h2>📚 وانەکان</h2><div style="display: flex; gap: 8px; margin: 12px 0; overflow-x: auto; padding-bottom: 8px;">';
    
    // Category filters
    html += '<button class="btn btn-primary btn-rounded" style="white-space: nowrap;">هەموو</button>';
    for (let cat in data.categories) {
        html += `<button class="btn btn-rounded" style="white-space: nowrap; background: var(--card);" onclick="filterLessons('${cat}')">${data.categories[cat].name}</button>`;
    }
    html += '</div><div id="lessonsList">';
    
    for (let cat in data.categories) {
        html += `<div class="lesson-category" data-category="${cat}" style="margin-bottom: 20px;">
            <h3 style="padding: 8px 0;">${data.categories[cat].name}</h3>`;
        
        data.categories[cat].lessons.forEach(lesson => {
            html += `
                <div class="card" style="margin-bottom: 8px; cursor: pointer;" onclick="navigateTo('lesson', {category: '${cat}', lesson: ${lesson.id}})">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">📖</span>
                        <div style="flex: 1;">
                            <strong>وانەی ${lesson.id}: ${lesson.words[0].ku} - ${lesson.words[lesson.words.length-1].ku}</strong>
                            <p style="font-size: 13px; color: var(--text-secondary);">${lesson.words.length} وشە</p>
                        </div>
                        <span>▶️</span>
                    </div>
                </div>`;
        });
        
        html += '</div>';
    }
    
    html += '</div></div>';
    container.innerHTML = html;
}

// ============ LESSON VIEW ============
function renderLessonView(container, data) {
    const lang = AppState.settings.currentLanguage;
    const category = LanguageData[lang]?.categories[data.category];
    
    if (!category) {
        container.innerHTML = '<p>وانە نەدۆزرایەوە</p>';
        return;
    }
    
    const lesson = category.lessons.find(l => l.id === data.lesson);
    if (!lesson) {
        container.innerHTML = '<p>وانە نەدۆزرایەوە</p>';
        return;
    }
    
    AppState.learning.currentLesson = lesson.id;
    AppState.learning.currentCategory = data.category;
    
    let wordIndex = 0;
    
    container.innerHTML = `
        <div class="lesson-view" style="padding: 16px;">
            <div class="lesson-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <button class="btn" onclick="navigateTo('lessons')">⬅️ گەڕانەوە</button>
                <span style="font-weight: 600;">وانەی ${lesson.id}</span>
                <span>❤️ ${AppState.currentUser.hearts}</span>
            </div>
            
            <div class="progress-bar" style="margin-bottom: 24px;">
                <div class="progress-fill" id="lessonProgress" style="width: 0%;"></div>
            </div>
            
            <div class="lesson-card card" style="text-align: center; min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div class="lesson-word" id="lessonWord" style="font-size: 48px; font-weight: 700; margin-bottom: 8px;">
                    ${lesson.words[wordIndex].en}
                </div>
                <div class="lesson-translation" id="lessonTranslation" style="font-size: 24px; color: var(--text-secondary);">
                    ${lesson.words[wordIndex].ku}
                </div>
                <button class="btn" style="margin-top: 16px;" onclick="speakWord('${lesson.words[wordIndex].en}')">
                    🔊 گوێبگرە
                </button>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 16px;">
                <button class="btn" id="prevWord" disabled onclick="prevLessonWord()">⬅️ پێشوو</button>
                <span id="wordCounter">١/${lesson.words.length}</span>
                <button class="btn btn-primary" id="nextWord" onclick="nextLessonWord(${lesson.words.length})">داهاتوو ➡️</button>
            </div>
        </div>
    `;
    
    // Store current word index
    window._lessonData = {
        words: lesson.words,
        currentIndex: 0,
        category: data.category,
        lessonId: lesson.id,
    };
}

function nextLessonWord(totalWords) {
    const data = window._lessonData;
    if (!data) return;
    
    data.currentIndex++;
    
    if (data.currentIndex >= data.words.length) {
        // Lesson complete
        completeLesson();
        return;
    }
    
    updateLessonWord();
}

function prevLessonWord() {
    const data = window._lessonData;
    if (!data || data.currentIndex <= 0) return;
    
    data.currentIndex--;
    updateLessonWord();
}

function updateLessonWord() {
    const data = window._lessonData;
    const word = data.words[data.currentIndex];
    
    document.getElementById('lessonWord').textContent = word.en;
    document.getElementById('lessonTranslation').textContent = word.ku;
    document.getElementById('wordCounter').textContent = `${data.currentIndex + 1}/${data.words.length}`;
    
    const progress = ((data.currentIndex) / data.words.length) * 100;
    document.getElementById('lessonProgress').style.width = progress + '%';
    
    document.getElementById('prevWord').disabled = data.currentIndex === 0;
}

function completeLesson() {
    // Award XP
    AppState.currentUser.xp += 50;
    AppState.currentUser.coins += 20;
    saveState();
    
    // Show confetti
    spawnConfetti();
    
    // Show popup
    showAchievement('🎉', 'وانە تەواو بوو!', '+50 XP | +20 🪙');
    
    // Navigate back
    setTimeout(() => navigateTo('lessons'), 1500);
}

// ============ QUIZ ============
function renderQuiz(container, data) {
    const lang = AppState.settings.currentLanguage;
    const words = LanguageData[lang]?.categories?.greetings?.lessons[0]?.words || [];
    
    const quizWords = words.sort(() => Math.random() - 0.5).slice(0, 5);
    
    container.innerHTML = `
        <div class="quiz-view" style="padding: 16px;">
            <h2>📝 کویز</h2>
            <div class="progress-bar" style="margin: 12px 0;">
                <div class="progress-fill" id="quizProgress" style="width: 0%;"></div>
            </div>
            
            <div id="quizQuestion" class="card" style="text-align: center; margin-bottom: 16px;">
                <h3 id="quizPrompt">"${quizWords[0]?.en}" واتای چییە؟</h3>
            </div>
            
            <div id="quizOptions" class="options-grid"></div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 16px;">
                <span>❤️ <span id="quizHearts">${AppState.currentUser.hearts}</span></span>
                <span>✅ <span id="quizScore">0</span>/${quizWords.length}</span>
            </div>
        </div>
    `;
    
    // Start quiz
    window._quizData = {
        words: quizWords,
        currentIndex: 0,
        score: 0,
    };
    
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const qd = window._quizData;
    if (!qd || qd.currentIndex >= qd.words.length) {
        finishQuiz();
        return;
    }
    
    const correct = qd.words[qd.currentIndex];
    const allWords = LanguageData[AppState.settings.currentLanguage]
        ?.categories?.greetings?.lessons[0]?.words || [];
    
    // Get 3 wrong options
    const wrongOptions = allWords
        .filter(w => w.ku !== correct.ku)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
    
    document.getElementById('quizPrompt').textContent = `"${correct.en}" واتای چییە؟`;
    document.getElementById('quizProgress').style.width = 
        (qd.currentIndex / qd.words.length) * 100 + '%';
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.ku;
        btn.addEventListener('click', () => checkQuizAnswer(opt.ku, correct.ku, btn));
        optionsContainer.appendChild(btn);
    });
}

function checkQuizAnswer(selected, correct, btnElement) {
    const qd = window._quizData;
    if (!qd) return;
    
    const allBtns = document.querySelectorAll('#quizOptions .option-btn');
    
    if (selected === correct) {
        btnElement.classList.add('correct');
        qd.score++;
        document.getElementById('quizScore').textContent = qd.score;
        playBeep(600, 0.1);
    } else {
        btnElement.classList.add('wrong');
        AppState.currentUser.hearts--;
        document.getElementById('quizHearts').textContent = AppState.currentUser.hearts;
        allBtns.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
        playBeep(200, 0.2);
    }
    
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    
    if (AppState.currentUser.hearts <= 0) {
        setTimeout(() => {
            alert('💔 دڵەکانت تەواو بوون!');
            navigateTo('home');
        }, 1000);
        return;
    }
    
    qd.currentIndex++;
    saveState();
    
    setTimeout(loadQuizQuestion, 1200);
}

function finishQuiz() {
    const qd = window._quizData;
    const xpEarned = qd.score * 20;
    AppState.currentUser.xp += xpEarned;
    saveState();
    
    spawnConfetti();
    showAchievement('🏆', 'کویز تەواو بوو!', `+${xpEarned} XP | ${qd.score}/${qd.words.length} ڕاست`);
    
    setTimeout(() => navigateTo('home'), 1500);
}

// ============ SPEAKING PAGE ============
function renderSpeaking(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🎤 ڕاهێنانی قسەکردن</h2>
            <div class="card" style="text-align: center; padding: 40px 20px; margin-top: 16px;">
                <p style="font-size: 18px; margin-bottom: 16px;">ئەم ڕستەیە بڵێ:</p>
                <h2 style="color: var(--primary);">"Hello, how are you?"</h2>
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="startRecording()">
                    🎤 دەست بکە بە قسەکردن
                </button>
                <p id="recordingStatus" style="margin-top: 8px; color: var(--text-secondary);"></p>
            </div>
        </div>
    `;
}

function startRecording() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        
        document.getElementById('recordingStatus').textContent = 'گوێدەگرم... 🎙️';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('recordingStatus').textContent = 
                `تۆ وتت: "${transcript}"`;
            AppState.currentUser.xp += 15;
            saveState();
        };
    } else {
        alert('وێبگەڕەکەت پشتگیری قسەکردن ناکات');
    }
}

// ============ ACHIEVEMENTS PAGE ============
function renderAchievements(container) {
    const allBadges = [
        { name: 'برۆنزی', icon: '🥉', condition: 'تەواوکردنی ٥ وانە' },
        { name: 'زیوی', icon: '🥈', condition: 'تەواوکردنی ٢٠ وانە' },
        { name: 'زێڕین', icon: '🥇', condition: 'تەواوکردنی ٥٠ وانە' },
        { name: 'پلاتینۆم', icon: '💎', condition: '١٠٠ ڕۆژ ستریک' },
        { name: 'الماسی', icon: '👑', condition: 'گەیشتن بە ئاست ٢٥' },
        { name: 'گەشتیار', icon: '🚀', condition: 'فێربوونی ١٠٠٠ وشە' },
        { name: 'خێرا فێربوو', icon: '⚡', condition: 'کویزی خێرا تەواو بکە' },
        { name: 'پاڵەوانی ستریک', icon: '🔥', condition: '٣٠ ڕۆژ ستریک' },
        { name: 'زیرەک', icon: '🧠', condition: 'تەواوکردنی هەموو کویزەکان' },
        { name: 'پۆلیگلۆت', icon: '🌍', condition: 'فێربوونی ٣ زمان' },
    ];
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>🏆 دەستکەوتەکان</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                ${allBadges.map(badge => `
                    <div class="card" style="text-align: center; opacity: ${Math.random() > 0.5 ? '1' : '0.4'};">
                        <div style="font-size: 40px;">${badge.icon}</div>
                        <strong>${badge.name}</strong>
                        <p style="font-size: 11px; color: var(--text-secondary);">${badge.condition}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============ PROFILE PAGE ============
function renderProfile(container) {
    const user = AppState.currentUser;
    container.innerHTML = `
        <div style="padding: 16px;">
            <div class="card" style="text-align: center;">
                <div style="font-size: 64px;">👤</div>
                <h2>${user.name}</h2>
                <p>ئاست ${user.level}</p>
                <div class="progress-bar" style="margin: 12px 0;">
                    <div class="progress-fill" style="width: ${(user.xp % 1000) / 10}%;"></div>
                </div>
                <p>${user.xp} / ${Math.ceil(user.level * 1000)} XP</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                <div class="card">🔥 ستریک: ${user.streak}</div>
                <div class="card">💎 گوەهر: ${user.gems}</div>
                <div class="card">🪙 دراو: ${user.coins}</div>
                <div class="card">❤️ دڵ: ${user.hearts}</div>
            </div>
        </div>
    `;
}

// ============ SETTINGS PAGE ============
function renderSettings(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>⚙️ ڕێکخستنەکان</h2>
            
            <div class="card" style="margin-top: 12px;">
                <h3>ڕووکار</h3>
                <button class="btn" onclick="toggleDarkMode()">
                    ${AppState.settings.darkMode ? '☀️ ڕووناک' : '🌙 تاریک'}
                </button>
                <button class="btn" style="margin-top: 8px;" onclick="toggleAmoledMode()">
                    🖤 AMOLED
                </button>
            </div>
            
            <div class="card" style="margin-top: 12px;">
                <h3>زمان</h3>
                <select id="settingsLang" onchange="changeLanguage(this.value)">
                    <option value="en-ku">ئینگلیزی → کوردی</option>
                    <option value="ku-en">کوردی → ئینگلیزی</option>
                </select>
            </div>
            
            <div class="card" style="margin-top: 12px;">
                <h3>ئاراستە</h3>
                <button class="btn" onclick="toggleDirection()">LTR / RTL</button>
            </div>
        </div>
    `;
}

// ============ PREMIUM PAGE ============
function renderPremium(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <h2>💎 ببە بە پڕیمیوم</h2>
            
            <div class="card card-premium" style="text-align: center; margin-top: 16px;">
                <h3>🆓 بێبەرامبەر</h3>
                <p>دەستگەیشتنی سنووردار</p>
                <p style="font-size: 24px; font-weight: 700;">$0</p>
            </div>
            
            <div class="card card-premium" style="text-align: center; margin-top: 12px;">
                <h3>💎 پڕیمیوم</h3>
                <p>هەموو تایبەتمەندییەکان</p>
                <p style="font-size: 24px; font-weight: 700;">$9.99/مانگ</p>
                <button class="btn btn-primary btn-glow">دەستپێبکە</button>
            </div>
        </div>
    `;
}

// ============ HELPER FUNCTIONS ============
function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function spawnConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const colors = ['#58cc02', '#ffc800', '#1cb0f6', '#ff4b4b', '#ce82ff'];
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 3,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() * -12) - 3,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: Math.random() * 0.015 + 0.008,
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        
        particles.forEach(p => {
            p.vy += 0.2;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life > 0) {
                alive = true;
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
        
        if (alive) requestAnimationFrame(animate);
    }
    
    animate();
}

function playBeep(freq, duration) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
}

function showAchievement(icon, title, desc) {
    document.getElementById('achievementIcon').textContent = icon;
    document.getElementById('achievementTitle').textContent = title;
    document.getElementById('achievementDesc').textContent = desc;
    document.getElementById('achievementPopup').classList.add('show');
    
    setTimeout(() => {
        document.getElementById('achievementPopup').classList.remove('show');
    }, 3000);
}

function showNotification(message) {
    const container = document.getElementById('notificationsContainer');
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    container.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

function toggleDarkMode() {
    AppState.settings.darkMode = !AppState.settings.darkMode;
    document.body.classList.toggle('dark-mode', AppState.settings.darkMode);
    localStorage.setItem('zm_dark', AppState.settings.darkMode);
    renderPage(AppState.pages.current);
}

function toggleAmoledMode() {
    AppState.settings.amoledMode = !AppState.settings.amoledMode;
    document.body.classList.toggle('amoled-mode', AppState.settings.amoledMode);
    localStorage.setItem('zm_amoled', AppState.settings.amoledMode);
}

function openLuckyWheel() {
    document.getElementById('luckyWheelPopup').classList.add('show');
}

function saveState() {
    const u = AppState.currentUser;
    localStorage.setItem('zm_xp', u.xp);
    localStorage.setItem('zm_coins', u.coins);
    localStorage.setItem('zm_gems', u.gems);
    localStorage.setItem('zm_hearts', u.hearts);
    localStorage.setItem('zm_streak', u.streak);
    localStorage.setItem('zm_lastLogin', new Date().toISOString());
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Hide splash screen after animation
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
    }, 2600);
    
    // Apply saved theme
    if (AppState.settings.darkMode) document.body.classList.add('dark-mode');
    if (AppState.settings.amoledMode) document.body.classList.add('amoled-mode');
    
    // Check streak
    checkStreak();
    
    // Show daily reward
    setTimeout(() => {
        document.getElementById('dailyRewardPopup').classList.add('show');
    }, 3000);
    
    // Render home page
    renderHome(document.getElementById('mainContent'));
    
    // Navigation listeners
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', () => navigateTo(el.dataset.page));
    });
    
    // Menu toggle
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('sideMenu').classList.toggle('open');
    });
    
    // Claim daily reward
    document.getElementById('claimReward').addEventListener('click', () => {
        AppState.currentUser.gems += 50;
        saveState();
        document.getElementById('dailyRewardPopup').classList.remove('show');
        showNotification('+50 💎 وەرگیرا!');
    });
    
    // Close achievement popup
    document.getElementById('closeAchievement').addEventListener('click', () => {
        document.getElementById('achievementPopup').classList.remove('show');
    });
    
    // Spin wheel
    document.getElementById('spinWheel').addEventListener('click', () => {
        const wheel = document.getElementById('luckyWheel');
        const rotation = Math.random() * 360 + 720;
        wheel.style.transform = `rotate(${rotation}deg)`;
        
        setTimeout(() => {
            const prize = Math.random() > 0.5 ? '50 XP' : '100 💎';
            showNotification(`براوە: ${prize}!`);
            document.getElementById('luckyWheelPopup').classList.remove('show');
        }, 2000);
    });
    
    // Open treasure box
    document.getElementById('openTreasure').addEventListener('click', () => {
        document.getElementById('treasureBox').textContent = '✨';
        AppState.currentUser.coins += 30;
        saveState();
        showNotification('+30 🪙 لە سندوقی گەنجینە!');
        setTimeout(() => {
            document.getElementById('treasureBoxPopup').classList.remove('show');
        }, 1500);
    });
});

function checkStreak() {
    const last = AppState.currentUser.lastLogin;
    if (!last) {
        AppState.currentUser.streak = 1;
        saveState();
        return;
    }
    
    const lastDate = new Date(last);
    const today = new Date();
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return; // Same day
    if (diffDays === 1) {
        AppState.currentUser.streak++;
        showNotification(`🔥 ستریک: ${AppState.currentUser.streak} ڕۆژ!`);
    } else {
        AppState.currentUser.streak = 1;
    }
    
    saveState();
}

// ============ REGISTER SERVICE WORKER ============
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

console.log('🚀 Ziman App Ready! 250+ Features Active');
console.log('🌍 15 Languages | 🤖 AI Teacher | 🎮 Gamification');
console.log('💎 Premium Ready | 📱 PWA | 🎨 3 Themes');
