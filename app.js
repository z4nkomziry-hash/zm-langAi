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
        darkMode:        lsGet('zm_dark',    'false')   === 'true',
        amoledMode:      lsGet('zm_amoled', 'false')    === 'true',
        currentLanguage: lsGet('zm_lang',   'en-ku'),
        dialect:         lsGet('zm_dialect','sorani'),  // 'sorani' | 'badini'
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
// NOTE: Extended vocabulary is in data/vocabulary.js (ZIMAN_VOCAB_EN).
// Topics here cover A1→B2 across 40 categories; each topic's words array
// is kept at 10–15 entries for quiz UX. The full word bank (1,600+ entries)
// is available via vocabByCategory() / vocabByLevel() for adaptive quizzes.
const lessons = {
    'en-ku': { name: 'ئینگلیزی → کوردی', icon: '🇬🇧', topics: [
        // ── A1 FOUNDATION ──────────────────────────────────────
        { id:1,  title:'🔤 ئەلفوبێ',              level:'A1', words:['A=ئەی','B=بی','C=سی','D=دی','E=ئی','F=ئێف','G=جی','H=ئەیچ','I=ئای','J=جەی','K=کەی','L=ئێڵ','M=ئێم','N=ئێن','O=ئۆ'] },
        { id:2,  title:'👋 سڵاوکردن',              level:'A1', words:['Hello=سڵاو','Good morning=بەیانیت باش','Good evening=ئێوارت باش','Good night=شەوت باش','Thank you=سوپاس','Please=تکایە','Sorry=ببووربە','You\'re welcome=خۆشەویستانە','Goodbye=خواحافیزی','See you later=تا دواتر','Yes=بەڵێ','No=نەخێر'] },
        { id:3,  title:'🔢 ژمارە ١-٢٠',            level:'A1', words:['One=یەک','Two=دوو','Three=سێ','Four=چوار','Five=پێنج','Six=شەش','Seven=حەوت','Eight=هەشت','Nine=نۆ','Ten=دە','Eleven=یازدە','Twelve=دوازدە','Twenty=بیست','Hundred=سەد','Thousand=هەزار'] },
        { id:4,  title:'🎨 ڕەنگەکان',              level:'A1', words:['Red=سوور','Blue=شین','Green=سەوز','Yellow=زەرد','Black=ڕەش','White=سپی','Orange=نارەنجی','Purple=مۆر','Pink=پەمبە','Brown=قاوەیی','Grey=خاکستەری','Gold=زێڕین'] },
        { id:5,  title:'👨‍👩‍👧‍👦 خێزان',                level:'A1', words:['Mother=دایک','Father=باوک','Sister=خوشک','Brother=برا','Son=کوڕ','Daughter=کچ','Grandfather=باپیر','Grandmother=دایبابا','Husband=مێرد','Wife=هاوسەر','Baby=منداڵی بچووک','Family=خێزان'] },
        { id:6,  title:'🫀 جەستە ١',               level:'A1', words:['Head=سەر','Face=رووخسار','Eye=چاو','Ear=گوێ','Nose=لووت','Mouth=دەم','Tooth=دندان','Neck=مل','Hand=دەست','Finger=پێچ','Foot=پێ','Heart=دڵ'] },
        { id:7,  title:'🍽️ خواردن و خواردنەوە',    level:'A1', words:['Water=ئاو','Bread=نان','Rice=برنج','Meat=گۆشت','Chicken=مریشک','Egg=هێلکە','Cheese=پەنیر','Milk=شیر','Tea=چا','Coffee=قاوە','Sugar=شەکر','Salt=خوێو'] },
        { id:8,  title:'🍎 مێوەکان',               level:'A1', words:['Apple=سێو','Banana=بەلەوان','Orange=پرتقال','Grape=ترێ','Watermelon=شووتی','Strawberry=فراو','Lemon=لیمۆ','Mango=مانگا','Cherry=گیلاس','Peach=خووخ','Pear=ئەمرود','Pomegranate=هنار'] },
        { id:9,  title:'🥦 سەوزەکان',              level:'A1', words:['Tomato=تەماتە','Potato=باتاتا','Onion=پیاز','Garlic=سیر','Cucumber=خیار','Pepper=بیبار','Carrot=گەزەر','Spinach=ئیسپانا','Eggplant=بادنجان','Cabbage=کەلەم','Corn=جگەر','Mushroom=کروپە'] },
        { id:10, title:'⏰ کات و ڕۆژ',             level:'A1', words:['Morning=بەیانی','Afternoon=نیوەڕۆ','Evening=ئێوارە','Night=شەو','Today=ئەمڕۆ','Tomorrow=سبەینێ','Yesterday=دوێنێ','Week=هەفتە','Month=مانگ','Year=ساڵ','Hour=کاتژمێر','Minute=خولەک'] },
        { id:11, title:'📅 ڕۆژەکانی هەفتە',        level:'A1', words:['Monday=دووشەممە','Tuesday=سێشەممە','Wednesday=چوارشەممە','Thursday=پێنجشەممە','Friday=هەینی','Saturday=شەممە','Sunday=یەکشەممە'] },
        { id:12, title:'📆 مانگەکان',               level:'A1', words:['January=کانوونی دووەم','February=شوبات','March=ئازار','April=نیسان','May=ئایار','June=حوزەیران','July=تەمووز','August=ئاب','September=ئەیلووڵ','October=تشرینی یەکەم','November=تشرینی دووەم','December=کانوونی یەکەم'] },
        { id:13, title:'🌤️ ئاب و هەوا',             level:'A1', words:['Sun=خۆر','Moon=مانگ','Star=ئەستێرە','Rain=باران','Snow=بەفر','Wind=با','Cloud=هەور','Storm=توفان','Hot=گەرم','Cold=سارد','Warm=گەرمایی','Fog=مەگز'] },
        { id:14, title:'🌿 سروشت',                  level:'A1', words:['Mountain=چیا','River=ڕووبار','Lake=گۆڵ','Sea=دەریا','Forest=دار','Desert=بیابان','Tree=دار','Flower=گوڵ','Grass=گیا','Rock=بەرد','Sky=ئاسمان','Island=دووردانە'] },
        // ── A1 CONTINUED ───────────────────────────────────────
        { id:15, title:'🐾 گیانلەبەران ١',          level:'A1', words:['Cat=پشیلە','Dog=سەگ','Horse=ئەسپ','Cow=مانگا','Sheep=مەڕ','Goat=بزن','Donkey=کەر','Lion=شێر','Tiger=پلنگ','Bear=هەورامی','Wolf=گورگ','Fox=ڕووبای'] },
        { id:16, title:'🐦 باڵندەکان',              level:'A1', words:['Eagle=هەڵۆ','Sparrow=گنجیشک','Pigeon=کەوتر','Parrot=ببەغا','Owl=کووسی','Chicken=مریشک','Duck=مروو','Butterfly=پەپووڵە','Bee=هەنگوینبزووڵە','Ant=مرۆوی'] },
        { id:17, title:'👤 جێناوەکان',              level:'A1', words:['I=من','You=تۆ','He=ئەو (پیاو)','She=ئەو (ژن)','We=ئێمە','They=ئەوان','My=مینی','Your=تۆی','His/Her=ئەوی','Our=ئێمەی','This=ئەمە','That=ئەوە'] },
        { id:18, title:'❓ پرسیارەکان',             level:'A1', words:['Who=کێ','What=چی','Where=لەکوێ','When=کەی','Why=بۆچی','How=چۆن','How much=چەند پارەیە','How many=چەند','Which=کامیان','Whose=ئەوی کێیە'] },
        // ── A2 LEVEL ───────────────────────────────────────────
        { id:19, title:'🏠 ماڵ و ژوورەکان',         level:'A2', words:['House=ماڵ','Door=دەرگا','Window=پەنجەرە','Roof=بان','Kitchen=متبەخ','Bathroom=دشتشووی','Bedroom=ژووری نووستن','Living room=ژووری نووستنگا','Garden=باغچە','Floor=زەوی','Wall=دیوار','Stairs=پلەکان'] },
        { id:20, title:'🪑 ئامێرەکان',              level:'A2', words:['Chair=کورسی','Table=مێز','Bed=جێخەو','Sofa=دیوان','Cupboard=کابینت','Shelf=رەف','Mirror=ئاوێنە','Lamp=چرا','Curtain=پەردە','Carpet=خالیچە','Fridge=سارکردنەوە','Oven=تەنوور'] },
        { id:21, title:'👗 جل و بەرگ',              level:'A2', words:['Shirt=کراس','Trousers=پانتۆڵ','Jacket=جاکێت','Coat=قاپووت','Shoes=پێڵاو','Socks=گوریلۆک','Hat=کولاو','Scarf=کیسپک','Gloves=دەستکێش','Jeans=جینز','Sweater=پووڵۆوەر','Belt=کەمەر'] },
        { id:22, title:'✈️ گەشت و سەفەر',            level:'A2', words:['Airport=فڕۆکەخانە','Hotel=هوتێل','Ticket=بلیت','Passport=پاسپۆرت','Visa=ڤیزا','Map=نەخشە','Luggage=جانتا','Room=ژوور','Reservation=حجزکردن','Restaurant=چێشتخانە','Tour guide=ڕێنمایی','Border=سنوور'] },
        { id:23, title:'🚗 گواستنەوە',               level:'A2', words:['Car=ئۆتۆمبێل','Bus=ئۆتۆبێس','Train=شەمەندەفەر','Airplane=فڕۆکە','Ship=کەشتی','Bicycle=دووچەرخە','Motorcycle=مۆتۆر','Taxi=تاکسی','Truck=کامیۆن','Helicopter=هێلیکۆپتەر','Road=ڕێگا','Bridge=پرد'] },
        { id:24, title:'📍 شوێنەکان',               level:'A2', words:['Hospital=نەخۆشخانە','School=قوتابخانە','University=زانکۆ','Market=بازاڕ','Bank=بانک','Library=پەرتووکخانە','Museum=موزەخانە','Cinema=سینەما','Mosque=مزگەوت','Park=پارک','Police=پۆلیس','Station=گارەجی'] },
        { id:25, title:'👩‍💼 پیشەکان ١',              level:'A2', words:['Doctor=دکتۆر','Teacher=مامۆستا','Engineer=ئەندازیار','Nurse=پەرستار','Lawyer=پارێزەر','Driver=شۆفێر','Chef=باشپێز','Farmer=گەلاڵە','Soldier=سەربازی','Artist=هونەرمەند','Journalist=ڕۆژنامەوان','Pilot=فڕۆکەڕان'] },
        { id:26, title:'👩‍💼 پیشەکان ٢',              level:'A2', words:['Programmer=پڕۆگرامەر','Designer=دیزاینەر','Accountant=حیسابدار','Architect=مرفۆلۆج','Pharmacist=دارووفرۆش','Dentist=دکتۆری دندان','Scientist=زانستوان','Economist=ئابووریدان','Psychologist=دکتۆری دەروونناسی','Police officer=پۆلیس'] },
        { id:27, title:'😊 هەستەکان',               level:'A2', words:['Happy=خۆشحاڵ','Sad=خەفەتی','Angry=تووڕە','Tired=مەندوو','Scared=ترسان','Excited=مەستی','Bored=کووڕمایی','Surprised=سەرسام','Lonely=تەنها','Proud=سەربەرز','Jealous=چاوتەرس','Grateful=سوپاسگوزار'] },
        { id:28, title:'✨ تایبەتییەکان ١',           level:'A2', words:['Big=گەورە','Small=بچووک','Long=درێژ','Short=کورت','Tall=بەرز','Heavy=قورس','Fast=خێرا','Slow=هێواش','New=نوێ','Old=کۆن','Beautiful=جوان','Clean=پاک'] },
        { id:29, title:'✨ تایبەتییەکان ٢',           level:'A2', words:['Hard=سەخت','Soft=نەرم','Strong=بەهێز','Weak=لاوازی','Rich=دەوڵەمەند','Poor=هەژار','Funny=پێکەنین هاتوو','Kind=بایەخ','Clever=زیرەک','Expensive=گران','Cheap=هەرزان','Important=گرنگ'] },
        { id:30, title:'↔️ دژووەکان',               level:'A2', words:['Hot=گەرم / Cold=سارد','Big=گەورە / Small=بچووک','Fast=خێرا / Slow=هێواش','New=نوێ / Old=کۆن','Open=کراوە / Closed=داخراو','Rich=دەوڵەمەند / Poor=هەژار','Strong=بەهێز / Weak=لاوازی','Day=ڕۆژ / Night=شەو','Light=ڕووناک / Dark=تاریک','Love=خۆشەویستی / Hate=ڕەزیل'] },
        { id:31, title:'📌 ئامووزەکان',              level:'A2', words:['In=لە','On=سەر','Under=خوار','Between=نێوان','Behind=پشت','In front of=پێشەوە','Near=نزیک','Far=دووری','Inside=ژوورەوە','Outside=دەرەوە','North=باکووری','South=باشووری'] },
        { id:32, title:'🗺️ ئاراستە',                 level:'A2', words:['North=باکووری','South=باشووری','East=ڕۆژهەڵات','West=ڕۆژئاوا','Left=هەستی چەپ','Right=ڕاست','Straight=ڕاستەوخۆ','Turn=ئاراستەکردن','Near=نزیک','Far=دووری'] },
        // ── A2 VERBS & PHRASES ─────────────────────────────────
        { id:33, title:'⚡ لەکردنی بنەڕەتی ١',       level:'A2', words:['To be=بوون','To have=هەبوون','To do=کردن','To say=گوتن','To know=زانین','To see=بینین','To eat=خواردن','To drink=خواردنەوە','To sleep=نووستن','To work=کارکردن','To study=خوێندن','To play=یاریکردن'] },
        { id:34, title:'⚡ لەکردنی بنەڕەتی ٢',       level:'A2', words:['To go=چوون','To come=هاتن','To walk=ڕوومالکردن','To run=ڕووخستن','To buy=کڕین','To sell=فرۆشتن','To give=دان','To take=وەرگرتن','To open=کردنەوە','To close=داخستن','To help=یارمەتیدان','To want=خواستن'] },
        { id:35, title:'💬 ڕستەی ڕۆژانە ١',          level:'A2', words:['I am hungry=برسیمە','I am thirsty=تینووم','I am tired=مەندووم','I am lost=گومبوومە','I don\'t understand=تێناگەم','I don\'t know=نازانم','I want to learn Kurdish=دەمەوێت کوردی فێربم','Call a doctor=دکتۆر بانگ بکە','Good luck=سەرکەوتوو بی','Congratulations=پیرۆزبایی'] },
        { id:36, title:'💬 ڕستەی ڕۆژانە ٢',          level:'A2', words:['Where is the bathroom?=دەستشووی لەکوێیە؟','How much does it cost?=چەند پارەیە؟','Can you help me?=دەتوانیت یارمەتیم بدەیت؟','What time is it?=کاتژمێر چەندەیە؟','Speak slowly=هێواش قسە بکە','Repeat please=دووبارە بکەرەوە','Have a good trip=گەشتی خۆش','Get well soon=زووی خۆشبەست','Happy new year=ساڵی نوێتان پیرۆزبێت','Take care=لە خۆت بپارێزە'] },
        // ── B1 LEVEL ───────────────────────────────────────────
        { id:37, title:'📚 خوێندن و زانکۆ',          level:'B1', words:['Book=کتێب','Dictionary=فەرهەنگ','Grammar=ڕێزمان','Vocabulary=وشەکان','Exam=تاقیکردنەوە','Homework=ئەرکی ماڵ','Degree=بڕوانامە','Scholarship=بورس','Research=لێکۆڵینەوە','Lesson=وانە','Exercise=مەشق','Grade=نمرە'] },
        { id:38, title:'🏥 تەندروستی',                level:'B1', words:['Medicine=دارمان','Pill=حەبە','Fever=گەرمای تووشی','Headache=سەردەرد','Stomachache=ئەگردەرد','Cough=کۆکەی','Allergy=هەستیاری','Blood pressure=زەخمی خوێن','First aid=ئیلافی یەکەم','Ambulance=ئامبولانس','Operation=نیشتن','X-ray=ئەشعە'] },
        { id:39, title:'⚽ وەرزش و کارا کاتی',        level:'B1', words:['Football=توپ','Basketball=باسکێتبۆل','Swimming=مەلەکردن','Running=ڕووخستن','Tennis=تێنیس','Boxing=بۆکس','Gym=سالۆنی وەرزشی','Champion=قەهرەمان','Reading=خوێندن','Photography=وێنەگرتن','Gardening=باغوانی','Cooking=خواردن پێزین'] },
        { id:40, title:'🎵 موزیک و هونەر',             level:'B1', words:['Music=موزیک','Singing=گۆرانی گوتن','Guitar=گیتار','Drum=دهل','Piano=پیانۆ','Song=گۆرانی','Novel=ڕۆمان','Poetry=شیعر','Theatre=تیاتر','Exhibition=پیشانگا','Sculpture=پەیکەرتاشی','Masterpiece=ئەثەری گەورە'] },
        { id:41, title:'💻 تەکنەلۆژیا',               level:'B1', words:['Phone=تەلەفۆن','Computer=کۆمپیووتەر','Internet=ئینتەرنێت','Website=ماڵپەڕ','Application=ئەپ','Password=پاسوورد','Email=ئیمەیڵ','Social media=تۆڕی کۆمەڵایەتی','Camera=کامێرا','Battery=باتری','Download=داونلود','AI=زیرەکی دەستکردی'] },
        { id:42, title:'🛒 بازاڕکردن و پارە',          level:'B1', words:['Shop=دوکان','Price=بایەخ','Discount=داشکاندن','Cash=پارەی نەقد','Credit card=کارتی بانکی','Salary=مووچە','Tax=بڕگەی باج','Loan=قەرز','Profit=قازانج','Receipt=پسوولە','Expensive=گران','Cheap=هەرزان'] },
        { id:43, title:'🍜 چێشتخانە',                 level:'B1', words:['Menu=لیستی خواردن','Waiter=خزمەتکار','Bill=حیساب','Tip=قەیش','Reservation=حجزکردن','Table for two=مێزی دووکەسی','I would like=دەمەوێت','Takeaway=بردن','Vegetarian=دەرختخور','Sweet=شیرین','Sour=ترش','Spicy=ترش و تیژ'] },
        { id:44, title:'🎭 کولتور و ئایین',            level:'B1', words:['Culture=کولتور','Tradition=دەرفەت','Celebration=جەژن','Wedding=جەژنی هاوسەرگیری','Religion=ئایین','Islam=ئیسلام','Prayer=نوێژ','Fasting=ڕۆژووگرتن','Peace=ئاشتی','Pilgrimage=حەج','Funeral=شین','Congratulations=پیرۆزبایی'] },
        { id:45, title:'🌐 دنیا و وڵاتان',              level:'B1', words:['Country=وڵات','Capital=پایتەخت','City=شار','Village=گوند','Language=زمان','Culture=کولتور','Geography=جوگرافیا','Continent=قارە','Europe=ئەوروپا','Asia=ئاسیا','Africa=ئەفریقا','America=ئەمریکا'] },
        // ── B2 LEVEL ───────────────────────────────────────────
        { id:46, title:'🏛️ سیاسەت و کۆمەڵگا',         level:'B2', words:['Government=حکومەت','Democracy=دیموکراسی','Election=هەڵبژاردن','Freedom=ئازادی','Rights=مافەکان','Constitution=یاسای بنەڕەتی','Parliament=پەرلەمان','Protest=خۆپیشاندان','Justice=دادگەری','War=جەنگ','Treaty=ئەقید','Diplomacy=دیپلۆماسی'] },
        { id:47, title:'🔬 زانست و ژینگە',              level:'B2', words:['Energy=وزە','Chemical=کیمیایی','Evolution=گەشەکردن','Climate change=گۆڕانی ئاب و هەوا','Pollution=قیرانی ژینگە','Gravity=ڕووی زەوی','DNA=ژینگە','Atom=ئەتۆم','Earthquake=بومەلەرزە','Volcano=ئاگرکوو','Biodiversity=جۆراوجۆری ژیان','Ecosystem=ئیکۆسیستەم'] },
        { id:48, title:'💬 گوتارەکان و مەتەڵ',          level:'B2', words:['Time is money=کات زێڕه','Knowledge is power=زانین هێزە','Better late than never=دواتر باشترە لە هیچکات','Actions speak louder than words=کردار لە قسەوە بلندترە','Break a leg=بەتاللا باشت بێت','No pain no gain=بێ ئەزیەت بێ قازانج','Practice makes perfect=مەشق کەمال دەبێت'] },
        { id:49, title:'🗨️ ئەدەب و پەیوەندی',           level:'B2', words:['To promise=بەڵێندان','To explain=ڕوونکردنەوە','To negotiate=مامەڵەکردن','To persuade=دڵنیاکردن','To disagree=ئامانجنەبون','To complain=گیلۆکردن','To apologize=لێبووردەخواستن','To congratulate=پیرۆزی کردن','To encourage=هەڵبکێشاندن','To argue=ناکۆکی'] },
        { id:50, title:'🎓 زانست و فەلسەفە',            level:'B2', words:['Philosophy=فەلسەفە','Psychology=دەروونناسی','Economics=ئابووری','Sociology=کۆمەڵناسی','History=مێژوو','Mathematics=ماتماتیک','Physics=فیزیک','Chemistry=کیمیا','Biology=بیۆلۆژی','Literature=وێژە','Linguistics=زمانناسی','Anthropology=مرۆڤناسی'] },
    ]},
    'ar-ku': { name:'عەرەبی → کوردی', icon:'🇸🇦', topics:[
        { id:1, title:'تحيات — سڵاوکردن', words:['السلام عليكم=سڵاو','صباح الخير=بەیانیت باش','مساء الخير=ئێوارت باش','شكراً=سوپاس','عفواً=تکایە','كيف حالك=چۆنی','أنا بخير=باشم','مع السلامة=خواحافیزی','إلى اللقاء=تا دیکەوە','يشرفنا=خوشحاڵبووین'] },
        { id:2, title:'الأرقام — ژمارەکان', words:['واحد=یەک','اثنان=دوو','ثلاثة=سێ','أربعة=چوار','خمسة=پێنج','ستة=شەش','سبعة=حەوت','ثمانية=هەشت','تسعة=نۆ','عشرة=دە'] },
        { id:3, title:'الألوان — ڕەنگەکان', words:['أحمر=سوور','أزرق=شین','أخضر=سەوز','أصفر=زەرد','أسود=ڕەش','أبيض=سپی','برتقالي=نارەنجی','بنفسجي=مۆر','وردي=پەمبە','بني=قاوەیی'] },
        { id:4, title:'العائلة — خێزان', words:['أم=دایک','أب=باوک','أخت=خوشک','أخ=برا','جد=باپیر','جدة=دایبابا','ابن=کوڕ','ابنة=کچ','زوج=مێرد','زوجة=ژن'] },
        { id:5, title:'الطعام — خواردن', words:['ماء=ئاو','خبز=نان','أرز=برنج','لحم=گۆشت','شاي=چا','حليب=شیر','بيض=هێلکە','فاكهة=مێوە','خضار=سەوزە','سكر=شەکر'] },
        { id:6, title:'السفر — گەشت', words:['مطار=فڕۆکەخانە','فندق=هوتێل','جواز سفر=پاسپۆرت','تذكرة=بلیت','حقيبة=جانتا','خريطة=نەخشە','سيارة أجرة=تاکسی','قطار=شەمەندەفەر'] },
        { id:7, title:'يوميات — ڕۆژانە', words:['صباح=بەیانی','ليل=شەو','يوم=ڕۆژ','أسبوع=هەفتە','شهر=مانگ','سنة=ساڵ','الآن=ئێستا','غداً=سبەینێ'] },
    ]},
    'tr-ku': { name:'تورکی → کوردی', icon:'🇹🇷', topics:[
        { id:1, title:'Selamlaşma — سڵاوکردن', words:['Merhaba=سڵاو','Günaydın=بەیانیت باش','İyi akşamlar=ئێوارت باش','Teşekkürler=سوپاس','Lütfen=تکایە','Nasılsın=چۆنی','İyiyim=باشم','Görüşürüz=تا دیکەوە','Hoşça kal=خواحافیزی','Rica ederim=خۆش بێی'] },
        { id:2, title:'Sayılar — ژمارەکان', words:['Bir=یەک','İki=دوو','Üç=سێ','Dört=چوار','Beş=پێنج','Altı=شەش','Yedi=حەوت','Sekiz=هەشت','Dokuz=نۆ','On=دە'] },
        { id:3, title:'Renkler — ڕەنگەکان', words:['Kırmızı=سوور','Mavi=شین','Yeşil=سەوز','Sarı=زەرد','Siyah=ڕەش','Beyaz=سپی','Turuncu=نارەنجی','Mor=مۆر','Pembe=پەمبە','Kahverengi=قاوەیی'] },
        { id:4, title:'Aile — خێزان', words:['Anne=دایک','Baba=باوک','Kız kardeş=خوشک','Erkek kardeş=برا','Büyükbaba=باپیر','Büyükanne=دایبابا','Oğul=کوڕ','Kız=کچ','Eş=هاوسەر','Aile=خێزان'] },
        { id:5, title:'Yiyecek — خواردن', words:['Su=ئاو','Ekmek=نان','Pirinç=برنج','Et=گۆشت','Çay=چا','Süt=شیر','Yumurta=هێلکە','Meyve=مێوە','Sebze=سەوزە','Şeker=شەکر'] },
        { id:6, title:'Seyahat — گەشت', words:['Havalimanı=فڕۆکەخانە','Otel=هوتێل','Pasaport=پاسپۆرت','Bilet=بلیت','Çanta=جانتا','Harita=نەخشە','Taksi=تاکسی','Tren=شەمەندەفەر'] },
        { id:7, title:'Günlük — ڕۆژانە', words:['Sabah=بەیانی','Gece=شەو','Gün=ڕۆژ','Hafta=هەفتە','Ay=مانگ','Yıl=ساڵ','Şimdi=ئێستا','Yarın=سبەینێ'] },
    ]},
    'fr-ku': { name:'فەرەنسی → کوردی', icon:'🇫🇷', topics:[
        { id:1,  title:'Salutations — سڵاوکردن', words:['Bonjour=سڵاو','Bonsoir=ئێوارت باش','Merci=سوپاس',"S'il vous plaît=تکایە",'Excusez-moi=ببووربە','Comment allez-vous=چۆنی','Je vais bien=باشم','Au revoir=خواحافیزی','À bientôt=تا دواتر','Bienvenue=بەخێربێی'] },
        { id:2,  title:'Nombres — ژمارەکان', words:['Un=یەک','Deux=دوو','Trois=سێ','Quatre=چوار','Cinq=پێنج','Six=شەش','Sept=حەوت','Huit=هەشت','Neuf=نۆ','Dix=دە'] },
        { id:3,  title:'Couleurs — ڕەنگەکان', words:['Rouge=سوور','Bleu=شین','Vert=سەوز','Jaune=زەرد','Noir=ڕەش','Blanc=سپی','Orange=نارەنجی','Violet=مۆر','Rose=پەمبە','Marron=قاوەیی'] },
        { id:4,  title:'Famille — خێزان', words:['Mère=دایک','Père=باوک','Sœur=خوشک','Frère=برا','Grand-père=باپیر','Grand-mère=دایبابا','Fils=کوڕ','Fille=کچ','Mari=مێرد','Femme=ژن'] },
        { id:5,  title:'Nourriture — خواردن', words:['Eau=ئاو','Pain=نان','Riz=برنج','Viande=گۆشت','Thé=چا','Lait=شیر','Œuf=هێلکە','Fruit=مێوە','Légume=سەوزە','Sucre=شەکر'] },
        { id:6,  title:'Voyage — گەشت', words:['Aéroport=فڕۆکەخانە','Hôtel=هوتێل','Passeport=پاسپۆرت','Billet=بلیت','Sac=جانتا','Carte=نەخشە','Taxi=تاکسی','Train=شەمەندەفەر'] },
        { id:7,  title:'Corps — جەستە', words:['Tête=سەر','Œil=چاو','Oreille=گوێ','Nez=لووت','Bouche=دەم','Main=دەست','Pied=پێ','Cœur=دڵ','Dos=پشت','Épaule=مەر'] },
        { id:8,  title:'Météo — ئاب و هەوا', words:['Soleil=خۆر','Pluie=باران','Vent=با','Neige=بەفر','Nuage=هەور','Chaud=گەرم','Froid=سارد','Tiède=گەرمای','Tempête=توفان','Tonnerre=ئەرعد'] },
    ]},
    'de-ku': { name:'ئەڵمانی → کوردی', icon:'🇩🇪', topics:[
        { id:1,  title:'Begrüßung — سڵاوکردن', words:['Hallo=سڵاو','Guten Morgen=بەیانیت باش','Guten Abend=ئێوارت باش','Danke=سوپاس','Bitte=تکایە','Entschuldigung=ببووربە','Wie geht es Ihnen=چۆنی','Mir geht es gut=باشم','Auf Wiedersehen=خواحافیزی','Willkommen=بەخێربێی'] },
        { id:2,  title:'Zahlen — ژمارەکان', words:['Eins=یەک','Zwei=دوو','Drei=سێ','Vier=چوار','Fünf=پێنج','Sechs=شەش','Sieben=حەوت','Acht=هەشت','Neun=نۆ','Zehn=دە'] },
        { id:3,  title:'Farben — ڕەنگەکان', words:['Rot=سوور','Blau=شین','Grün=سەوز','Gelb=زەرد','Schwarz=ڕەش','Weiß=سپی','Orange=نارەنجی','Lila=مۆر','Rosa=پەمبە','Braun=قاوەیی'] },
        { id:4,  title:'Familie — خێزان', words:['Mutter=دایک','Vater=باوک','Schwester=خوشک','Bruder=برا','Großvater=باپیر','Großmutter=دایبابا','Sohn=کوڕ','Tochter=کچ','Ehemann=مێرد','Ehefrau=ژن'] },
        { id:5,  title:'Essen — خواردن', words:['Wasser=ئاو','Brot=نان','Reis=برنج','Fleisch=گۆشت','Tee=چا','Milch=شیر','Ei=هێلکە','Obst=مێوە','Gemüse=سەوزە','Zucker=شەکر'] },
        { id:6,  title:'Reise — گەشت', words:['Flughafen=فڕۆکەخانە','Hotel=هوتێل','Reisepass=پاسپۆرت','Ticket=بلیت','Tasche=جانتا','Karte=نەخشە','Taxi=تاکسی','Zug=شەمەندەفەر'] },
        { id:7,  title:'Körper — جەستە', words:['Kopf=سەر','Auge=چاو','Ohr=گوێ','Nase=لووت','Mund=دەم','Hand=دەست','Fuß=پێ','Herz=دڵ','Rücken=پشت','Schulter=مەر'] },
        { id:8,  title:'Wetter — ئاب و هەوا', words:['Sonne=خۆر','Regen=باران','Wind=با','Schnee=بەفر','Wolke=هەور','Heiß=گەرم','Kalt=سارد','Warm=گەرمای','Sturm=توفان','Donner=ئەرعد'] },
    ]},
    'es-ku': { name:'ئیسپانی → کوردی', icon:'🇪🇸', topics:[
        { id:1,  title:'Saludos — سڵاوکردن', words:['Hola=سڵاو','Buenos días=بەیانیت باش','Buenas noches=ئێوارت باش','Gracias=سوپاس','Por favor=تکایە','Perdón=ببووربە','Cómo estás=چۆنی','Estoy bien=باشم','Adiós=خواحافیزی','Bienvenido=بەخێربێی'] },
        { id:2,  title:'Números — ژمارەکان', words:['Uno=یەک','Dos=دوو','Tres=سێ','Cuatro=چوار','Cinco=پێنج','Seis=شەش','Siete=حەوت','Ocho=هەشت','Nueve=نۆ','Diez=دە'] },
        { id:3,  title:'Colores — ڕەنگەکان', words:['Rojo=سوور','Azul=شین','Verde=سەوز','Amarillo=زەرد','Negro=ڕەش','Blanco=سپی','Naranja=نارەنجی','Morado=مۆر','Rosa=پەمبە','Marrón=قاوەیی'] },
        { id:4,  title:'Familia — خێزان', words:['Madre=دایک','Padre=باوک','Hermana=خوشک','Hermano=برا','Abuelo=باپیر','Abuela=دایبابا','Hijo=کوڕ','Hija=کچ','Esposo=مێرد','Esposa=ژن'] },
        { id:5,  title:'Comida — خواردن', words:['Agua=ئاو','Pan=نان','Arroz=برنج','Carne=گۆشت','Té=چا','Leche=شیر','Huevo=هێلکە','Fruta=مێوە','Verdura=سەوزە','Azúcar=شەکر'] },
        { id:6,  title:'Viaje — گەشت', words:['Aeropuerto=فڕۆکەخانە','Hotel=هوتێل','Pasaporte=پاسپۆرت','Billete=بلیت','Bolsa=جانتا','Mapa=نەخشە','Taxi=تاکسی','Tren=شەمەندەفەر'] },
        { id:7,  title:'Cuerpo — جەستە', words:['Cabeza=سەر','Ojo=چاو','Oreja=گوێ','Nariz=لووت','Boca=دەم','Mano=دەست','Pie=پێ','Corazón=دڵ','Espalda=پشت','Hombro=مەر'] },
        { id:8,  title:'Clima — ئاب و هەوا', words:['Sol=خۆر','Lluvia=باران','Viento=با','Nieve=بەفر','Nube=هەور','Caliente=گەرم','Frío=سارد','Tibio=گەرمای','Tormenta=توفان','Trueno=ئەرعد'] },
    ]},
    'fa-ku': { name:'فارسی → کوردی', icon:'🇮🇷', topics:[
        { id:1, title:'احوالپرسی — سڵاوکردن', words:['سلام=سڵاو','صبح بخیر=بەیانیت باش','عصر بخیر=ئێوارت باش','ممنون=سوپاس','لطفاً=تکایە','حالت چطوره=چۆنی','خوبم=باشم','خداحافظ=خواحافیزی','تا دیدار=تا دیکەوە','خوش آمدید=بەخێربێی'] },
        { id:2, title:'اعداد — ژمارەکان', words:['یک=یەک','دو=دوو','سه=سێ','چهار=چوار','پنج=پێنج','شش=شەش','هفت=حەوت','هشت=هەشت','نه=نۆ','ده=دە'] },
        { id:3, title:'رنگ‌ها — ڕەنگەکان', words:['قرمز=سوور','آبی=شین','سبز=سەوز','زرد=زەرد','سیاه=ڕەش','سفید=سپی','نارنجی=نارەنجی','بنفش=مۆر','صورتی=پەمبە','قهوه‌ای=قاوەیی'] },
        { id:4, title:'خانواده — خێزان', words:['مادر=دایک','پدر=باوک','خواهر=خوشک','برادر=برا','پدربزرگ=باپیر','مادربزرگ=دایبابا','پسر=کوڕ','دختر=کچ','همسر=هاوسەر','خانواده=خێزان'] },
        { id:5, title:'غذا — خواردن', words:['آب=ئاو','نان=نان','برنج=برنج','گوشت=گۆشت','چای=چا','شیر=شیر','تخم‌مرغ=هێلکە','میوه=مێوە','سبزی=سەوزە','شکر=شەکر'] },
        { id:6, title:'سفر — گەشت', words:['فرودگاه=فڕۆکەخانە','هتل=هوتێل','گذرنامه=پاسپۆرت','بلیت=بلیت','کیف=جانتا','نقشه=نەخشە','تاکسی=تاکسی','قطار=شەمەندەفەر'] },
        { id:7, title:'روزانه — ڕۆژانە', words:['صبح=بەیانی','شب=شەو','روز=ڕۆژ','هفته=هەفتە','ماه=مانگ','سال=ساڵ','الان=ئێستا','فردا=سبەینێ'] },
    ]},
    'de-ku': { name:'ئەڵمانی → کوردی', icon:'🇩🇪', topics:[
        { id:1, title:'Begrüßung — سڵاوکردن', words:['Hallo=سڵاو','Guten Morgen=بەیانیت باش','Guten Abend=ئێوارت باش','Danke=سوپاس','Bitte=تکایە','Wie geht es dir=چۆنی','Mir geht es gut=باشم','Auf Wiedersehen=خواحافیزی','Tschüss=سبوختانێ','Willkommen=بەخێربێی'] },
        { id:2, title:'Zahlen — ژمارەکان', words:['Eins=یەک','Zwei=دوو','Drei=سێ','Vier=چوار','Fünf=پێنج','Sechs=شەش','Sieben=حەوت','Acht=هەشت','Neun=نۆ','Zehn=دە'] },
        { id:3, title:'Farben — ڕەنگەکان', words:['Rot=سوور','Blau=شین','Grün=سەوز','Gelb=زەرد','Schwarz=ڕەش','Weiß=سپی','Orange=نارەنجی','Lila=مۆر','Rosa=پەمبە','Braun=قاوەیی'] },
        { id:4, title:'Familie — خێزان', words:['Mutter=دایک','Vater=باوک','Schwester=خوشک','Bruder=برا','Großvater=باپیر','Großmutter=دایبابا','Sohn=کوڕ','Tochter=کچ','Ehepartner=هاوسەر','Familie=خێزان'] },
        { id:5, title:'Essen — خواردن', words:['Wasser=ئاو','Brot=نان','Reis=برنج','Fleisch=گۆشت','Tee=چا','Milch=شیر','Ei=هێلکە','Obst=مێوە','Gemüse=سەوزە','Zucker=شەکر'] },
        { id:6, title:'Reise — گەشت', words:['Flughafen=فڕۆکەخانە','Hotel=هوتێل','Reisepass=پاسپۆرت','Ticket=بلیت','Tasche=جانتا','Karte=نەخشە','Taxi=تاکسی','Zug=شەمەندەفەر'] },
        { id:7, title:'Alltag — ڕۆژانە', words:['Morgen=بەیانی','Nacht=شەو','Tag=ڕۆژ','Woche=هەفتە','Monat=مانگ','Jahr=ساڵ','Jetzt=ئێستا','Morgen=سبەینێ'] },
    ]},
    'fr-ku': { name:'فەرەنسی → کوردی', icon:'🇫🇷', topics:[
        { id:1, title:'Salutations — سڵاوکردن', words:['Bonjour=سڵاو','Bonsoir=ئێوارت باش','Merci=سوپاس','S\'il vous plaît=تکایە','Comment allez-vous=چۆنی','Je vais bien=باشم','Au revoir=خواحافیزی','À bientôt=تا دیکەوە','Bienvenue=بەخێربێی','De rien=خۆش بێی'] },
        { id:2, title:'Chiffres — ژمارەکان', words:['Un=یەک','Deux=دوو','Trois=سێ','Quatre=چوار','Cinq=پێنج','Six=شەش','Sept=حەوت','Huit=هەشت','Neuf=نۆ','Dix=دە'] },
        { id:3, title:'Couleurs — ڕەنگەکان', words:['Rouge=سوور','Bleu=شین','Vert=سەوز','Jaune=زەرد','Noir=ڕەش','Blanc=سپی','Orange=نارەنجی','Violet=مۆر','Rose=پەمبە','Marron=قاوەیی'] },
        { id:4, title:'Famille — خێزان', words:['Mère=دایک','Père=باوک','Sœur=خوشک','Frère=برا','Grand-père=باپیر','Grand-mère=دایبابا','Fils=کوڕ','Fille=کچ','Époux=هاوسەر','Famille=خێزان'] },
        { id:5, title:'Nourriture — خواردن', words:['Eau=ئاو','Pain=نان','Riz=برنج','Viande=گۆشت','Thé=چا','Lait=شیر','Œuf=هێلکە','Fruit=مێوە','Légume=سەوزە','Sucre=شەکر'] },
        { id:6, title:'Voyage — گەشت', words:['Aéroport=فڕۆکەخانە','Hôtel=هوتێل','Passeport=پاسپۆرت','Billet=بلیت','Sac=جانتا','Carte=نەخشە','Taxi=تاکسی','Train=شەمەندەفەر'] },
        { id:7, title:'Quotidien — ڕۆژانە', words:['Matin=بەیانی','Nuit=شەو','Jour=ڕۆژ','Semaine=هەفتە','Mois=مانگ','An=ساڵ','Maintenant=ئێستا','Demain=سبەینێ'] },
    ]},
    'es-ku': { name:'ئیسپانی → کوردی', icon:'🇪🇸', topics:[
        { id:1, title:'Saludos — سڵاوکردن', words:['Hola=سڵاو','Buenos días=بەیانیت باش','Buenas noches=شەوت باش','Gracias=سوپاس','Por favor=تکایە','¿Cómo estás=چۆنی','Estoy bien=باشم','Adiós=خواحافیزی','Hasta luego=تا دیکەوە','Bienvenido=بەخێربێی'] },
        { id:2, title:'Números — ژمارەکان', words:['Uno=یەک','Dos=دوو','Tres=سێ','Cuatro=چوار','Cinco=پێنج','Seis=شەش','Siete=حەوت','Ocho=هەشت','Nueve=نۆ','Diez=دە'] },
        { id:3, title:'Colores — ڕەنگەکان', words:['Rojo=سوور','Azul=شین','Verde=سەوز','Amarillo=زەرد','Negro=ڕەش','Blanco=سپی','Naranja=نارەنجی','Morado=مۆر','Rosa=پەمبە','Marrón=قاوەیی'] },
        { id:4, title:'Familia — خێزان', words:['Madre=دایک','Padre=باوک','Hermana=خوشک','Hermano=برا','Abuelo=باپیر','Abuela=دایبابا','Hijo=کوڕ','Hija=کچ','Cónyuge=هاوسەر','Familia=خێزان'] },
        { id:5, title:'Comida — خواردن', words:['Agua=ئاو','Pan=نان','Arroz=برنج','Carne=گۆشت','Té=چا','Leche=شیر','Huevo=هێلکە','Fruta=مێوە','Verdura=سەوزە','Azúcar=شەکر'] },
        { id:6, title:'Viaje — گەشت', words:['Aeropuerto=فڕۆکەخانە','Hotel=هوتێل','Pasaporte=پاسپۆرت','Billete=بلیت','Maleta=جانتا','Mapa=نەخشە','Taxi=تاکسی','Tren=شەمەندەفەر'] },
        { id:7, title:'Cotidiano — ڕۆژانە', words:['Mañana=بەیانی','Noche=شەو','Día=ڕۆژ','Semana=هەفتە','Mes=مانگ','Año=ساڵ','Ahora=ئێستا','Mañana=سبەینێ'] },
    ]},
    'ru-ku': { name:'ڕووسی → کوردی', icon:'🇷🇺', topics:[
        { id:1, title:'Приветствия — سڵاوکردن', words:['Привет=سڵاو','Доброе утро=بەیانیت باش','Добрый вечер=ئێوارت باش','Спасибо=سوپاس','Пожалуйста=تکایە','Как дела=چۆنی','Хорошо=باشم','До свидания=خواحافیزی','Увидимся=تا دیکەوە','Добро пожаловать=بەخێربێی'] },
        { id:2, title:'Числа — ژمارەکان', words:['Один=یەک','Два=دوو','Три=سێ','Четыре=چوار','Пять=پێنج','Шесть=شەش','Семь=حەوت','Восемь=هەشت','Девять=نۆ','Десять=دە'] },
        { id:3, title:'Цвета — ڕەنگەکان', words:['Красный=سوور','Синий=شین','Зелёный=سەوز','Жёлтый=زەرد','Чёрный=ڕەش','Белый=سپی','Оранжевый=نارەنجی','Фиолетовый=مۆر','Розовый=پەمبە','Коричневый=قاوەیی'] },
        { id:4, title:'Семья — خێزان', words:['Мать=دایک','Отец=باوک','Сестра=خوشک','Брат=برا','Дедушка=باپیر','Бабушка=دایبابا','Сын=کوڕ','Дочь=کچ','Супруг=هاوسەر','Семья=خێزان'] },
        { id:5, title:'Еда — خواردن', words:['Вода=ئاو','Хлеب=نان','Рис=برنج','Мясо=گۆشت','Чай=چا','Молоко=شیر','Яйцо=هێلکە','Фрукт=مێوە','Овощ=سەوزە','Сахар=شەکر'] },
        { id:6, title:'Путешествие — گەشت', words:['Аэропорт=فڕۆکەخانە','Отель=هوتێل','Паспорт=پاسپۆرت','Билет=بلیت','Сумка=جانتا','Карта=نەخشە','Такси=تاکسی','Поезд=شەمەندەفەر'] },
        { id:7, title:'Ежедневно — ڕۆژانە', words:['Утро=بەیانی','Ночь=شەو','День=ڕۆژ','Неделя=هەفتە','Месяц=مانگ','Год=ساڵ','Сейчас=ئێستا','Завтра=سبەینێ'] },
    ]},
    'zh-ku': { name:'چینی → کوردی', icon:'🇨🇳', topics:[
        { id:1, title:'问候 — سڵاوکردن', words:['你好=سڵاو','早上好=بەیانیت باش','晚上好=ئێوارت باش','谢谢=سوپاس','请=تکایە','你好吗=چۆنی','我很好=باشم','再见=خواحافیزی','回头见=تا دیکەوە','欢迎=بەخێربێی'] },
        { id:2, title:'数字 — ژمارەکان', words:['一=یەک','二=دوو','三=سێ','四=چوار','五=پێنج','六=شەش','七=حەوت','八=هەشت','九=نۆ','十=دە'] },
        { id:3, title:'颜色 — ڕەنگەکان', words:['红色=سوور','蓝色=شین','绿色=سەوز','黄色=زەرد','黑色=ڕەش','白色=سپی','橙色=نارەنجی','紫色=مۆر','粉色=پەمبە','棕色=قاوەیی'] },
        { id:4, title:'家庭 — خێزان', words:['母亲=دایک','父亲=باوک','姐妹=خوشک','兄弟=برا','祖父=باپیر','祖母=دایبابا','儿子=کوڕ','女儿=کچ','配偶=هاوسەر','家庭=خێزان'] },
        { id:5, title:'食物 — خواردن', words:['水=ئاو','面包=نان','米饭=برنج','肉=گۆشت','茶=چا','牛奶=شیر','鸡蛋=هێلکە','水果=مێوە','蔬菜=سەوزە','糖=شەکر'] },
        { id:6, title:'旅行 — گەشت', words:['机场=فڕۆکەخانە','酒店=هوتێل','护照=پاسپۆرت','机票=بلیت','包=جانتا','地图=نەخشە','出租车=تاکسی','火车=شەمەندەفەر'] },
        { id:7, title:'日常 — ڕۆژانە', words:['早晨=بەیانی','夜晚=شەو','天=ڕۆژ','周=هەفتە','月=مانگ','年=ساڵ','现在=ئێستا','明天=سبەینێ'] },
    ]},
    'ja-ku': { name:'ژاپۆنی → کوردی', icon:'🇯🇵', topics:[
        { id:1, title:'挨拶 — سڵاوکردن', words:['こんにちは=سڵاو','おはようございます=بەیانیت باش','こんばんは=ئێوارت باش','ありがとう=سوپاس','お願いします=تکایە','お元気ですか=چۆنی','元気です=باشم','さようなら=خواحافیزی','またね=تا دیکەوە','ようこそ=بەخێربێی'] },
        { id:2, title:'数字 — ژمارەکان', words:['一=یەک','二=دوو','三=سێ','四=چوار','五=پێنج','六=شەش','七=حەوت','八=هەشت','九=نۆ','十=دە'] },
        { id:3, title:'色 — ڕەنگەکان', words:['赤=سوور','青=شین','緑=سەوز','黄色=زەرد','黒=ڕەش','白=سپی','オレンジ=نارەنجی','紫=مۆر','ピンク=پەمبە','茶色=قاوەیی'] },
        { id:4, title:'家族 — خێزان', words:['母=دایک','父=باوک','姉妹=خوشک','兄弟=برا','祖父=باپیر','祖母=دایبابا','息子=کوڕ','娘=کچ','配偶者=هاوسەر','家族=خێزان'] },
        { id:5, title:'食べ物 — خواردن', words:['水=ئاو','パン=نان','ご飯=برنج','肉=گۆشت','お茶=چا','牛乳=شیر','卵=هێلکە','果物=مێوە','野菜=سەوزە','砂糖=شەکر'] },
        { id:6, title:'旅行 — گەشت', words:['空港=فڕۆکەخانە','ホテル=هوتێل','パスポート=پاسپۆرت','チケット=بلیت','バッグ=جانتا','地図=نەخشە','タクシー=تاکسی','電車=شەمەندەفەر'] },
        { id:7, title:'日常 — ڕۆژانە', words:['朝=بەیانی','夜=شەو','日=ڕۆژ','週=هەفتە','月=مانگ','年=ساڵ','今=ئێستا','明日=سبەینێ'] },
    ]},
    'ko-ku': { name:'کۆری → کوردی', icon:'🇰🇷', topics:[
        { id:1, title:'인사 — سڵاوکردن', words:['안녕하세요=سڵاو','좋은 아침=بەیانیت باش','안녕하세요 (저녁)=ئێوارت باش','감사합니다=سوپاس','부탁합니다=تکایە','잘 지내세요=چۆنی','잘 지냅니다=باشم','안녕히 계세요=خواحافیزی','또 봐요=تا دیکەوە','환영합니다=بەخێربێی'] },
        { id:2, title:'숫자 — ژمارەکان', words:['일=یەک','이=دوو','삼=سێ','사=چوار','오=پێنج','육=شەش','칠=حەوت','팔=هەشت','구=نۆ','십=دە'] },
        { id:3, title:'색깔 — ڕەنگەکان', words:['빨간색=سوور','파란색=شین','초록색=سەوز','노란색=زەرد','검은색=ڕەش','흰색=سپی','주황색=نارەنجی','보라색=مۆر','분홍색=پەمبە','갈색=قاوەیی'] },
        { id:4, title:'가족 — خێزان', words:['어머니=دایک','아버지=باوک','자매=خوشک','형제=برا','할아버지=باپیر','할머니=دایبابا','아들=کوڕ','딸=کچ','배우자=هاوسەر','가족=خێزان'] },
        { id:5, title:'음식 — خواردن', words:['물=ئاو','빵=نان','밥=برنج','고기=گۆشت','차=چا','우유=شیر','달걀=هێلکە','과일=مێوە','야채=سەوزە','설탕=شەکر'] },
        { id:6, title:'여행 — گەشت', words:['공항=فڕۆکەخانە','호텔=هوتێل','여권=پاسپۆرت','티켓=بلیت','가방=جانتا','지도=نەخشە','택시=تاکسی','기차=شەمەندەفەر'] },
        { id:7, title:'일상 — ڕۆژانە', words:['아침=بەیانی','밤=شەو','날=ڕۆژ','주=هەفتە','달=مانگ','년=ساڵ','지금=ئێستا','내일=سبەینێ'] },
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

// ===== LANGUAGE THEMES =====
// Each language pair gets its own accent colour, hero gradient, shadow tint,
// victory badge emoji, and localised "mastery" label.
const LANG_THEMES = {
    'en-ku': { accent:'#4F46E5', grad:'135deg,#4F46E5,#6366F1', shadow:'rgba(79,70,229,.38)',   badge:'🏅', victory:'زمانزانی ئینگلیزی' },
    'ar-ku': { accent:'#059669', grad:'135deg,#059669,#10B981', shadow:'rgba(5,150,105,.38)',    badge:'🌙', victory:'زمانزانی عەرەبی'  },
    'tr-ku': { accent:'#DC2626', grad:'135deg,#B91C1C,#EF4444', shadow:'rgba(220,38,38,.38)',    badge:'⭐', victory:'زمانزانی تورکی'   },
    'fa-ku': { accent:'#0D9488', grad:'135deg,#0D9488,#14B8A6', shadow:'rgba(13,148,136,.38)',   badge:'🌺', victory:'زمانزانی فارسی'  },
    'de-ku': { accent:'#D97706', grad:'135deg,#92400E,#F59E0B', shadow:'rgba(217,119,6,.38)',    badge:'🦅', victory:'زمانزانی ئەڵمانی' },
    'fr-ku': { accent:'#1D4ED8', grad:'135deg,#1E40AF,#3B82F6', shadow:'rgba(29,78,216,.38)',    badge:'🗼', victory:'زمانزانی فەرەنسی' },
    'es-ku': { accent:'#E11D48', grad:'135deg,#9F1239,#F43F5E', shadow:'rgba(225,29,72,.38)',    badge:'🌹', victory:'زمانزانی ئیسپانی' },
    'ru-ku': { accent:'#7C3AED', grad:'135deg,#5B21B6,#8B5CF6', shadow:'rgba(124,58,237,.38)',   badge:'🏰', victory:'زمانزانی ڕووسی'  },
    'zh-ku': { accent:'#EA580C', grad:'135deg,#9A3412,#F97316', shadow:'rgba(234,88,12,.38)',    badge:'🐉', victory:'زمانزانی چینی'   },
    'ja-ku': { accent:'#DB2777', grad:'135deg,#9D174D,#EC4899', shadow:'rgba(219,39,119,.38)',   badge:'🌸', victory:'زمانزانی ژاپۆنی' },
    'ko-ku': { accent:'#0891B2', grad:'135deg,#164E63,#06B6D4', shadow:'rgba(8,145,178,.38)',    badge:'🎋', victory:'زمانزانی کۆری'  },
};

// ===== BADINI (KURMANJI) MAP =====
// Maps Sorani Kurdish target words → Badini/Kurmanji Latin equivalents.
// Used when state.settings.dialect === 'badini'.
const BADINI_MAP = {
    'سڵاو':'Silav',         'بەیانیت باش':'Sibatî xweş',  'ئێوارت باش':'Êvarî xweş',
    'سوپاس':'Spas',          'تکایە':'Ji kerema xwe',        'چۆنی':'Çawa yî',
    'باشم':'Baş im',          'خواحافیزی':"Xatirê te",        'تا دیکەوە':'Heta carê din',
    'بەخێربێی':'Bi xêr bêyî','خۆش بێی':'Spas',
    'یەک':'Yek',   'دوو':'Du',   'سێ':'Sê',      'چوار':'Çar',
    'پێنج':'Pênc', 'شەش':'Şeş', 'حەوت':'Heft',  'هەشت':'Heşt',
    'نۆ':'Neh',    'دە':'Deh',
    'سوور':'Sor',     'شین':'Şîn',       'سەوز':'Kesk',      'زەرد':'Zer',
    'ڕەش':'Reş',     'سپی':'Spî',       'نارەنجی':'Porteqalî','مۆر':'Mor',
    'پەمبە':'Pembe',  'قاوەیی':'Qehweyî',
    'دایک':'Dayik',   'باوک':'Bav',      'خوشک':'Xwişk',    'برا':'Bira',
    'باپیر':'Bapîr',  'دایبابا':'Dapîr', 'کوڕ':'Kur',        'کچ':'Keç',
    'هاوسەر':'Hevjîn','خێزان':'Malbat',
    'ئاو':'Av',        'نان':'Nan',       'برنج':'Birinc',    'گۆشت':'Goşt',
    'چا':'Çay',        'شیر':'Şîr',      'هێلکە':'Hêk',      'مێوە':'Fêkî',
    'سەوزە':'Sebze',   'شەکر':'Şekir',
    'فڕۆکەخانە':'Balafirge','هوتێل':'Hotel','پاسپۆرت':'Pasaport',
    'بلیت':'Bîlet',    'جانتا':'Çante',  'نەخشە':'Nexşe',
    'تاکسی':'Taksî',   'شەمەندەفەر':'Trên',
    'بەیانی':'Sibê',   'شەو':'Şev',      'ڕۆژ':'Roj',        'هەفتە':'Hefte',
    'مانگ':'Meh',      'ساڵ':'Sal',      'ئێستا':'Niha',     'سبەینێ':'Sibe',
};

// ===== LANGUAGE & DIALECT HELPERS =====

/** Returns the theme object for the currently selected language pair. */
function getLangTheme() {
    return LANG_THEMES[state.settings.currentLanguage] || LANG_THEMES['en-ku'];
}

/**
 * Given a raw word string "source=کوردیSorani", returns the display pair
 * respecting the active dialect. In Badini mode the Kurdish side is
 * transliterated via BADINI_MAP; unmapped words fall back to Sorani.
 */
function getDialectWord(wordStr) {
    const [src, sorani] = wordStr.split('=');
    if (state.settings.dialect === 'badini') {
        const badini = BADINI_MAP[sorani];
        return { src, target: badini || sorani, isBadini: !!badini };
    }
    return { src, target: sorani, isBadini: false };
}

/** Apply the current language's accent colour to CSS custom property. */
function applyLangAccent() {
    const t = getLangTheme();
    document.documentElement.style.setProperty('--lang-accent',  t.accent);
    document.documentElement.style.setProperty('--lang-shadow',  t.shadow);
}

// ===== CLOUD SYNC (real account, server-backed progress) =====
const cloudSync = { user: null, mode: 'login', lastSync: false, pushTimer: null };

async function cloudApi(url, opts = {}) {
    const res = await fetch(url, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        ...opts,
    });
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error((data && data.error) || 'هەڵەیەکی سێرڤەر ڕوویدا');
    return data;
}

function cloudSetMode(mode) {
    cloudSync.mode = mode;
    const card = document.getElementById('cloudAccountCard');
    if (card) card.innerHTML = renderCloudAccountSection();
}

async function cloudRegister() {
    const err = document.getElementById('cloudAuthErr');
    const name = document.getElementById('cloudName')?.value.trim();
    const email = document.getElementById('cloudEmail')?.value.trim();
    const password = document.getElementById('cloudPassword')?.value;
    try {
        const r = await cloudApi('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
        cloudSync.user = r.user;
        await pushProgress(true);
        toast('☁️ هەژمارەکەت دروستکرا و پەیوەست کرا');
        renderSettings(document.getElementById('mainContent'));
    } catch (e) { if (err) err.textContent = '❌ ' + e.message; }
}

async function cloudLogin() {
    const err = document.getElementById('cloudAuthErr');
    const email = document.getElementById('cloudEmail')?.value.trim();
    const password = document.getElementById('cloudPassword')?.value;
    try {
        const r = await cloudApi('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        cloudSync.user = r.user;
        await pullProgress();
        toast('☁️ چوویتە ژوورەوە');
        renderSettings(document.getElementById('mainContent'));
    } catch (e) { if (err) err.textContent = '❌ ' + e.message; }
}

async function cloudLogout() {
    try { await cloudApi('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    cloudSync.user = null;
    cloudSync.lastSync = false;
    renderSettings(document.getElementById('mainContent'));
}

/** Pull server progress and merge (take the higher value) into local state, then persist locally. */
async function pullProgress() {
    try {
        const p = await cloudApi('/api/progress');
        if (p) {
            state.user.xp         = Math.max(state.user.xp, p.xp || 0);
            state.user.level      = Math.max(state.user.level, p.level || 1);
            state.user.streak     = Math.max(state.user.streak, p.streak || 0);
            state.user.totalWords = Math.max(state.user.totalWords, p.total_words || 0);
            state.user.coins      = p.coins ?? state.user.coins;
            state.user.gems       = p.gems ?? state.user.gems;
            state.user.hearts     = p.hearts ?? state.user.hearts;
            if (Array.isArray(p.history) && p.history.length > state.learning.history.length) state.learning.history = p.history;
            if (Array.isArray(p.bookmarks) && p.bookmarks.length > state.learning.bookmarks.length) state.learning.bookmarks = p.bookmarks;
            save();
        }
        cloudSync.lastSync = true;
    } catch (e) { /* offline or not logged in — stay on local data */ }
}

/** Push local progress up to the server (debounced from save(), or immediate=true right after login/register). */
function pushProgress(immediate) {
    if (!cloudSync.user) return;
    if (cloudSync.pushTimer) clearTimeout(cloudSync.pushTimer);
    const doPush = async () => {
        try {
            await cloudApi('/api/progress', {
                method: 'PUT',
                body: JSON.stringify({
                    xp: state.user.xp, level: state.user.level, coins: state.user.coins,
                    gems: state.user.gems, hearts: state.user.hearts, streak: state.user.streak,
                    total_words: state.user.totalWords, last_login: state.user.lastLogin,
                    history: state.learning.history, bookmarks: state.learning.bookmarks, notes: state.learning.notes,
                }),
            });
            cloudSync.lastSync = true;
        } catch (e) { /* will retry on next save() */ }
    };
    if (immediate) return doPush();
    cloudSync.pushTimer = _trackTimeout(setTimeout(doPush, 2500));
}

/** Called once on boot: check for an existing server session and pull progress if logged in. */
async function initCloudSync() {
    try {
        const s = await cloudApi('/api/auth/session');
        if (s.user) {
            cloudSync.user = s.user;
            await pullProgress();
        }
    } catch (e) { /* backend unreachable — app still works fully offline */ }
}

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
    if (typeof pushProgress === 'function') pushProgress(false);
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
        const Ctx = window.AudioContext || window.webkitAudioContext;
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

/**
 * Play a rich multi-note chime via Web Audio API.
 * type: 'correct' | 'wrong' | 'levelup' | 'complete'
 */
function playChime(type = 'correct') {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const master = ctx.createGain();
        master.gain.value = 0.28;
        master.connect(ctx.destination);

        function note(freq, start, dur, vol = 1) {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.connect(gain);
            gain.connect(master);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur);
        }

        if (type === 'correct') {
            note(523, 0,    0.12); // C5
            note(659, 0.09, 0.12); // E5
            note(784, 0.18, 0.20); // G5
        } else if (type === 'wrong') {
            note(220, 0,    0.18);
            note(196, 0.15, 0.22);
        } else if (type === 'levelup') {
            [0,0.08,0.16,0.24,0.32].forEach((t,i) =>
                note([523,587,659,698,784][i], t, 0.28, 1));
        } else if (type === 'complete') {
            note(523, 0,    0.12);
            note(659, 0.10, 0.12);
            note(784, 0.20, 0.12);
            note(1047,0.30, 0.32);
        }
    } catch (e) { /* silent fail */ }
}

/**
 * Spawn a floating "+N XP" label near the element that triggered the reward.
 * Falls back to screen centre if no element given.
 */
function spawnXPLabel(amount, sourceEl) {
    const label = document.createElement('div');
    label.className = 'xp-float';
    label.textContent = `+${amount} XP ⭐`;

    // Position near source element or screen centre
    let x = window.innerWidth  / 2;
    let y = window.innerHeight / 2;
    if (sourceEl) {
        const r = sourceEl.getBoundingClientRect();
        x = r.left + r.width  / 2;
        y = r.top  + r.height / 2;
    }
    label.style.left = `${x}px`;
    label.style.top  = `${y}px`;
    label.style.transform = 'translateX(-50%)';
    document.body.appendChild(label);
    setTimeout(() => label.remove(), 1100);
}

/**
 * Add XP to the user, pulse the header XP chip, show floating label,
 * check for level-up, persist.  Returns the new XP total.
 */
function addXP(amount, sourceEl) {
    const prevLevel = state.user.level;
    state.user.xp  += amount;
    state.user.level = Math.floor(state.user.xp / 1000) + 1;
    save();
    spawnXPLabel(amount, sourceEl);

    // Pulse the header XP chip
    const xpEl = document.getElementById('hXP');
    if (xpEl) {
        xpEl.parentElement.classList.remove('xp-gained');
        void xpEl.parentElement.offsetWidth; // reflow
        xpEl.parentElement.classList.add('xp-gained');
        setTimeout(() => xpEl.parentElement.classList.remove('xp-gained'), 600);
    }

    if (state.user.level > prevLevel) celebrateLevelUp(state.user.level);
    return state.user.xp;
}

/**
 * Visually celebrate a correct answer on `el` (an HTMLElement).
 * Adds the CSS animation class and plays the chime.
 */
function celebrateCorrect(el, xp = 10) {
    playChime('correct');
    if (el) {
        el.classList.remove('correct-pop');
        void el.offsetWidth;
        el.classList.add('correct-pop');
        setTimeout(() => el.classList.remove('correct-pop'), 500);
    }
    // Pulse the lang-accent glow on the element
    const t = getLangTheme();
    if (el) {
        el.style.boxShadow = `0 0 0 4px ${t.accent}44`;
        setTimeout(() => { if (el) el.style.boxShadow = ''; }, 500);
    }
    addXP(xp, el);
}

/**
 * Visually indicate a wrong answer on `el`.
 * Plays the wrong chime and shakes the element.
 */
function celebrateWrong(el) {
    playChime('wrong');
    if (el) {
        el.classList.remove('wrong-shake');
        void el.offsetWidth;
        el.classList.add('wrong-shake');
        setTimeout(() => el.classList.remove('wrong-shake'), 450);
    }
}

/** Full-screen level-up celebration overlay. */
function celebrateLevelUp(newLevel) {
    playChime('levelup');
    spawnConfetti();

    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';

    const t = getLangTheme();
    overlay.innerHTML = `
        <div class="level-up-card">
            <span class="level-up-emoji">${t.badge}</span>
            <div class="level-up-title">ئاست ${newLevel}!</div>
            <p class="level-up-sub">${t.victory}</p>
            <p style="margin-top:8px;font-size:28px">🎉</p>
            <button class="btn btn-primary" style="margin-top:20px;background:linear-gradient(${t.grad})"
                    onclick="this.closest('.level-up-overlay').remove()">بەردەوام بە ▶</button>
        </div>`;

    document.body.appendChild(overlay);
    // Auto-dismiss after 5s
    setTimeout(() => overlay.remove(), 5000);
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
    community:       renderCommunity,
    instructors:     renderInstructors,
    'fill-blank':    renderFillBlank,
    'match-pairs':   renderMatchPairs,
    'sentence-order':renderSentenceOrder,
    packages:        renderPackages,
    sponsor:         renderSponsor,
    contact:         renderContact,
    settings:        renderSettings,
};

function navigateTo(page) {
    // 1. Clear any lingering timers from the previous page (e.g. speed-quiz countdown)
    _clearAllTimers();

    // 2. Close the side menu on mobile
    closeMenu();

    state.currentPage = page;
    const main = document.getElementById('mainContent');
    if (!main) return;

    // 3. Apply language accent to CSS root (keeps accent in sync after lang change)
    applyLangAccent();

    // 4. Render the requested page with spring-physics entrance animation
    if (pageRenderers[page]) {
        main.innerHTML = '';
        main.classList.remove('page-enter');
        void main.offsetWidth; // force reflow so animation retriggers
        main.classList.add('page-enter');
        pageRenderers[page](main);
    }

    // 5. Update active state in SIDE MENU
    document.querySelectorAll('.side-menu .menu-list li button').forEach(btn => {
        const isActive = btn.dataset.nav === page;
        btn.classList.toggle('active', isActive);
        if (isActive) btn.style.background = getLangTheme().accent;
        else          btn.style.background = '';
    });

    // 6. Update active state in BOTTOM NAV
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
        const isActive = btn.dataset.nav === page;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // 7. Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 8. Move focus to main content for keyboard/screen-reader users
    main.focus();
}

// ===== PAGE: HOME =====
function renderHome(c) {
    const u   = state.user;
    const th  = getLangTheme();
    const xpToNext  = 1000;
    const xpInLevel = u.xp % xpToNext;
    const xpPct     = (xpInLevel / xpToNext * 100).toFixed(1);
    const xpLeft    = xpToNext - xpInLevel;

    // SVG circular XP ring
    const R    = 42;
    const circ = 2 * Math.PI * R;
    const dash = (xpPct / 100 * circ).toFixed(1);

    // Apply language accent to CSS root
    applyLangAccent();

    // Language package info
    const langData = lessons[state.settings.currentLanguage];
    const langName = langData ? langData.name : 'ئینگلیزی → کوردی';
    const langIcon = langData ? langData.icon : '🇬🇧';
    const dialectLabel = state.settings.dialect === 'badini'
        ? '🔤 بادینی (کرمانجی)'
        : '📜 سۆرانی';

    const quickActions = [
        { page:'lessons',        icon:'📚', label:'وانەکان',      color: th.accent },
        { page:'quiz',           icon:'📝', label:'کویز',         color:'#0EA5E9' },
        { page:'flashcards',     icon:'🃏', label:'فلاشکارت',    color:'#10B981' },
        { page:'speed-quiz',     icon:'⚡', label:'کویزی خێرا',   color:'#F59E0B' },
        { page:'fill-blank',     icon:'✏️', label:'شوێنی بەتاڵ', color:'#6366F1' },
        { page:'match-pairs',    icon:'🔗', label:'جوت کردن',     color:'#EC4899' },
        { page:'sentence-order', icon:'🔀', label:'ڕیزکردن',      color:'#14B8A6' },
        { page:'listening',      icon:'🎧', label:'بیستن',        color:'#8B5CF6' },
        { page:'speaking',       icon:'🎤', label:'قسەکردن',      color:'#EF4444' },
        { page:'ai-teacher',     icon:'🤖', label:'مامۆستای AI', color:'#F97316' },
    ];

    c.innerHTML = `
        <!-- HERO CARD — language-themed gradient -->
        <div class="hero-card lang-themed" style="background:linear-gradient(${th.grad});color:#fff;box-shadow:0 8px 32px ${th.shadow};margin-bottom:14px">
            <div class="hero-left">
                <p class="hero-greeting">👋 سڵاو!</p>
                <h2 class="hero-name">${escHtml(u.name)}</h2>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
                    <div class="hero-level-badge" style="background:rgba(255,255,255,.22)">ئاست ${u.level}</div>
                    <div class="hero-level-badge" style="background:rgba(255,255,255,.15);font-size:11px">${langIcon} ${dialectLabel}</div>
                </div>
                <div class="hero-xp-bar">
                    <div class="hero-xp-fill" style="width:${xpPct}%;background:#fff"></div>
                </div>
                <p class="hero-xp-label">${xpLeft.toLocaleString()} XP بۆ ئاستی داهاتوو</p>
            </div>
            <div class="hero-right">
                <svg viewBox="0 0 100 100" class="xp-ring" aria-hidden="true" onclick="if(typeof _xpRingTap==='function')_xpRingTap()" style="cursor:default">
                    <circle cx="50" cy="50" r="${R}" fill="none"
                            stroke="rgba(255,255,255,0.18)" stroke-width="9"/>
                    <circle cx="50" cy="50" r="${R}" fill="none"
                            stroke="#fff" stroke-width="9"
                            stroke-linecap="round"
                            stroke-dasharray="${dash} ${(circ - parseFloat(dash)).toFixed(1)}"
                            stroke-dashoffset="${(circ / 4).toFixed(1)}"
                            class="xp-ring-fill"/>
                    <text x="50" y="44" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" font-family="var(--font)">${xpInLevel}</text>
                    <text x="50" y="57" text-anchor="middle" fill="rgba(255,255,255,.70)" font-size="9" font-family="var(--font)">XP</text>
                    <text x="50" y="70" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="8" font-family="var(--font)">${th.badge}</text>
                </svg>
            </div>
        </div>

        <!-- STAT STRIP -->
        <div class="stat-strip">
            <div class="stat-chip">
                <span class="stat-chip-icon streak-fire">🔥</span>
                <div>
                    <strong class="stat-chip-val">${u.streak}</strong>
                    <p class="stat-chip-lbl">ستریک</p>
                </div>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-icon">💎</span>
                <div>
                    <strong class="stat-chip-val">${u.gems}</strong>
                    <p class="stat-chip-lbl">گەوهەر</p>
                </div>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-icon">🪙</span>
                <div>
                    <strong class="stat-chip-val">${u.coins}</strong>
                    <p class="stat-chip-lbl">سکۆ</p>
                </div>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-icon">📖</span>
                <div>
                    <strong class="stat-chip-val">${u.totalWords}</strong>
                    <p class="stat-chip-lbl">وشە</p>
                </div>
            </div>
        </div>

        <!-- CONTINUE LEARNING CTA — uses lang accent border -->
        <button class="continue-card" onclick="navigateTo('lessons')"
                style="border-color:${th.accent}33">
            <div class="continue-icon">${langIcon}</div>
            <div class="continue-body">
                <strong>بەردەوام بە</strong>
                <p>${escHtml(langName)}</p>
            </div>
            <div class="continue-arrow" style="color:${th.accent}">▶</div>
        </button>

        <!-- QUICK ACTIONS GRID -->
        <p class="section-label">چالاکییەکان</p>
        <div class="quick-grid">
            ${quickActions.map(a => `
            <button class="quick-card" onclick="navigateTo('${escAttr(a.page)}')">
                <div class="quick-icon" style="background:${a.color}1a;color:${a.color}">${a.icon}</div>
                <span class="quick-label">${escHtml(a.label)}</span>
            </button>`).join('')}
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
    state.user.gems       += 5;
    state.user.totalWords += data.words.length;
    state.learning.history.push({ type:'lesson', lang, title:data.title, xp:15, date:new Date().toISOString() });
    save();
    playChime('complete');
    spawnConfetti();
    toast(`🎉 وانەی "${escHtml(data.title)}" تەواو بوو! +15 XP | +5 💎`);
    addXP(15);
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
    const w0 = getDialectWord(shuffled[0]);
    const th = getLangTheme();

    c.innerHTML = `
        <h2 style="margin-bottom:12px">🃏 فلاشکارت</h2>
        <div class="flashcard" id="fc" onclick="flipFC()" role="button" tabindex="0"
             aria-label="فلاشکارت — کلیک بکە بیگۆڕێت">
            <div class="flashcard-inner">
                <div class="flashcard-front"><span id="fcWord" class="ku-text">${escHtml(w0.src)}</span></div>
                <div class="flashcard-back" style="background:linear-gradient(${th.grad})">
                    <span id="fcTrans" class="ku-text" dir="auto">${escHtml(w0.target)}</span>
                </div>
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
    const d  = window._fc;
    const fc = document.getElementById('fc');
    if (r === 'correct') {
        celebrateCorrect(fc, 3);
    } else {
        celebrateWrong(fc);
    }
    d.idx++;
    d.flipped = false;
    if (d.idx >= d.words.length) {
        addXP(10, fc);
        playChime('complete');
        spawnConfetti();
        toast('🃏 فلاشکارت تەواو بوو! +10 XP');
        _trackTimeout(setTimeout(() => navigateTo('home'), 1500));
        return;
    }
    const fcWord  = document.getElementById('fcWord');
    const fcTrans = document.getElementById('fcTrans');
    const fcIdx   = document.getElementById('fcIdx');
    if (fcWord)  { const w = getDialectWord(d.words[d.idx]); fcWord.textContent  = w.src; }
    if (fcTrans) { const w = getDialectWord(d.words[d.idx]); fcTrans.textContent = w.target; }
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
    const th      = getLangTheme();
    const raw     = allWords[Math.floor(Math.random() * allWords.length)];
    const qw      = getDialectWord(raw);
    // Correct answer in active dialect
    const correctTarget = qw.target;
    // 3 distractors — also converted to active dialect
    const wrongOpts = allWords
        .filter(w => w.split('=')[1] !== raw.split('=')[1])
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => getDialectWord(w).target);
    const opts = [...wrongOpts, correctTarget].sort(() => Math.random() - 0.5);

    c.innerHTML = `
        <h2 style="margin-bottom:12px">📝 کویز</h2>
        <div class="card" style="text-align:center;padding:28px 20px;margin:0 0 16px;
             border-top:3px solid ${th.accent}">
            <p style="font-size:40px;margin-bottom:8px;unicode-bidi:isolate" dir="auto">${escHtml(qw.src)}</p>
            <p style="color:var(--text-secondary);margin-bottom:12px">واتای چییە؟</p>
            <button class="btn btn-sm" onclick="speakWord('${escAttr(qw.src)}')" aria-label="گوێ بگرە">🔊 گوێ بگرە</button>
        </div>
        <div class="options-grid" id="qzOpts" role="group" aria-label="وەڵامەکان">
            ${opts.map(o => `
            <button class="option-btn" dir="auto"
                    onclick="checkQuiz('${escAttr(o)}','${escAttr(correctTarget)}',this)">${escHtml(o)}</button>`).join('')}
        </div>`;
}

function checkQuiz(s, correct, btn) {
    const allBtns = document.querySelectorAll('#qzOpts .option-btn');
    allBtns.forEach(b => { b.disabled = true; });
    if (s === correct) {
        btn.classList.add('correct');
        celebrateCorrect(btn, 10);
        toast('✅ ڕاستە! +10 XP');
    } else {
        btn.classList.add('wrong');
        celebrateWrong(btn);
        allBtns.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    }
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
    const d   = window._sp;
    const all = document.querySelectorAll('#spOpts .option-btn');
    all.forEach(b => { b.disabled = true; });

    if (s === correct) {
        btn.classList.add('correct');
        celebrateCorrect(btn, 0); // XP added in bulk at finishSp
        d.score++;
        d.time += 2;
        const sc = document.getElementById('spScore');
        if (sc) sc.textContent = d.score;
    } else {
        btn.classList.add('wrong');
        celebrateWrong(btn);
        d.wrong++;
        d.time = Math.max(0, d.time - 3);
        const wr = document.getElementById('spWrong');
        if (wr) wr.textContent = d.wrong;
        all.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
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
    playChime('complete');
    spawnConfetti();
    toast(`⚡ کویزی خێرا تەواو بوو! +${xp} XP`);
    addXP(xp);
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
const AI_SYSTEM_PROMPT = `You are Ziman AI, a warm, expert Kurdish language tutor embedded in the Ziman language-learning app. You specialise in Sorani Kurdish (Central Kurdish, Arabic script) and Badini/Kurmanji (Northern Kurdish, Latin script).

## Core teaching guidelines
- Greet learners encouragingly — language learning is genuinely hard!
- Keep answers concise (2–4 sentences) unless depth is requested
- For vocabulary: show the Kurdish word, transliteration, English meaning, and one example sentence
- For grammar: explain the rule → give two contrasting examples → offer a mnemonic
- If the user writes in Kurdish, mirror their script and respond in Kurdish first, then English
- Flag dialect switches explicitly: "[Sorani]" vs "[Badini]" prefixes when both appear

## Script & dialect rules
- Sorani (Arabic script) glyphs to render correctly: ە ڕ ێ ۆ ی ک گ چ ژ
- Badini (Latin): use x, q, w, ê, î, û conventions (e.g. "silav" not "silaw")
- Never silently mix scripts in the same word

## Cultural depth
- Weave in Kurdish proverbs, geography, and cultural context when natural
- Mention historical/regional variation (Sulaymaniyah vs Erbil Sorani, Duhok Badini, etc.)`;

// Build the full per-request system prompt (dialect + language context injected at call time)
function buildSystemPrompt() {
    const dialect = state.settings.dialect || 'sorani';
    const lang    = state.settings.currentLanguage || 'en-ku';
    const langLabel = lessons[lang]?.name || lang;
    const dialectDesc = dialect === 'sorani'
        ? 'Sorani (Arabic script ە ڕ ێ ۆ). Use Arabic script for ALL Kurdish text.'
        : 'Badini/Kurmanji (Latin script: ê î û x q w). Use Latin for ALL Kurdish text.';

    return AI_SYSTEM_PROMPT +
        `\n\n## Session context\n- Language pair the learner is studying: ${langLabel}\n- Kurdish dialect preference: **${dialectDesc}**\n- Tailor vocabulary examples to this language pair where natural.`;
}

// Build conversation history array from rendered chat bubbles (for multi-turn context)
function buildChatHistory(chatEl) {
    const msgs = [];
    chatEl.querySelectorAll('[data-role]').forEach(el => {
        msgs.push({ role: el.dataset.role, content: el.dataset.text || el.textContent });
    });
    // Keep last 10 turns to stay within token budget
    return msgs.slice(-10);
}

function renderAITeacher(c) {
    const hasKey  = !!lsGet('zm_ai_key');
    const ttsOn   = lsGet('zm_tts', 'false') === 'true';
    const th      = getLangTheme();
    const dialect = state.settings.dialect || 'sorani';
    const hasMic  = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    c.innerHTML = `
        <!-- Header row -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap">
            <h2 style="margin:0;font-size:20px">🤖 مامۆستای AI</h2>
            <div style="display:flex;gap:6px;align-items:center">
                <span class="ai-dialect-tag" style="background:${th.accent}18;color:${th.accent}">
                    ${dialect === 'sorani' ? '📜 سۆرانی' : '🔤 بادینی'}
                </span>
                <button id="aiTTSBtn"
                        class="ai-icon-btn${ttsOn ? ' active' : ''}"
                        onclick="toggleTTS()"
                        title="${ttsOn ? 'دەنگ کوژاندنەوە' : 'دەنگی مامۆستا چالاک کە'}"
                        style="${ttsOn ? `background:${th.accent};color:#fff` : ''}">
                    ${ttsOn ? '🔊' : '🔇'}
                </button>
            </div>
        </div>

        <!-- Adaptive AI Shortcut Chips -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
            <button onclick="aiSuggestPlan()" style="background:${th.accent}15;color:${th.accent};
                    border:1px solid ${th.accent}40;padding:6px 12px;border-radius:99px;
                    font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">
                📋 پلانی هەفتەیی
            </button>
            <button onclick="aiAssessLevel()" style="background:#10B98115;color:#059669;
                    border:1px solid #10B98140;padding:6px 12px;border-radius:99px;
                    font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">
                🎯 پشکنینی ئاست
            </button>
            <button onclick="aiDailySentence()" style="background:#F59E0B15;color:#D97706;
                    border:1px solid #F59E0B40;padding:6px 12px;border-radius:99px;
                    font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">
                ✨ ڕستەی ئەمڕۆ
            </button>
            <button onclick="aiGrammarTip()" style="background:#8B5CF615;color:#7C3AED;
                    border:1px solid #8B5CF640;padding:6px 12px;border-radius:99px;
                    font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">
                📖 تێبینیی ڕێزمان
            </button>
        </div>

        <!-- API key card -->
        ${!hasKey ? `
        <div class="card ai-key-card" style="border:1.5px solid ${th.accent};margin-bottom:12px">
            <p style="font-weight:700;margin-bottom:6px">🔑 OpenAI API کی پێویستە</p>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:10px">
                بۆ ستریم + دەنگ + مامۆستای ڕاستەقینە، کلیلی API ی OpenAI دابنێ.
                <br><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener"
                       style="color:${th.accent}">platform.openai.com/api-keys</a>
            </p>
            <div style="display:flex;gap:8px">
                <input id="aiKeyInput" class="input" type="password" placeholder="sk-..."
                       style="flex:1;font-family:monospace;font-size:13px"
                       onkeydown="if(event.key==='Enter')saveAIKey()"
                       aria-label="OpenAI API Key">
                <button class="btn btn-primary" onclick="saveAIKey()"
                        style="background:${th.accent}">✅ خەزن</button>
            </div>
        </div>` : `
        <div class="ai-key-active">
            <span>✅ API دامەزراوە — <strong>⚡ ستریم چالاکە</strong></span>
            <button class="btn btn-sm" onclick="removeAIKey()">لابردن</button>
        </div>`}

        <!-- Quick prompt chips -->
        <div class="ai-prompts-row" id="aiPrompts">
            <button class="ai-chip" onclick="useAIPrompt(this,'${dialect === 'sorani' ? 'چۆن دەگووترێت: خۆشم دەوێت؟' : 'Ev bi Kurdî çawa tê gotin: ez ji te hez dikim?'}')">
                ${dialect === 'sorani' ? 'خۆشم دەوێت — چۆن؟' : 'ez ji te hez dikim'}
            </button>
            <button class="ai-chip" onclick="useAIPrompt(this,'explain Kurdish verb conjugation with examples')">Kurdish verbs</button>
            <button class="ai-chip" onclick="useAIPrompt(this,'teach me 5 Kurdish proverbs with meanings')">Kurdish proverbs 📖</button>
            <button class="ai-chip" onclick="useAIPrompt(this,'${dialect === 'sorani' ? 'جیاوازی سۆرانی و بادینی چییە؟' : 'Ferqa Soranî û Badînî çi ye?'}')">
                ${dialect === 'sorani' ? 'سۆرانی vs بادینی' : 'Soranî vs Badînî'}
            </button>
            <button class="ai-chip" onclick="useAIPrompt(this,'give me a 5-sentence Kurdish story for beginners')">کچکە چیرۆک 📚</button>
        </div>

        <!-- Chat window -->
        <div id="aiChat" class="ai-chat-area" aria-live="polite" aria-label="چاتی AI">
            <div class="ai-chat-empty" id="aiChatEmpty">
                <div class="ai-robot-anim">🤖</div>
                <p style="font-weight:700;font-size:16px;margin-bottom:6px">سڵاو! من Ziman AI ی زمانم.</p>
                <p style="font-size:13px;color:var(--text-secondary)">
                    ${hasKey
                        ? '⚡ وەڵامم وشە بە وشە دێت — پرسیارت بکە!'
                        : '🔑 کلیلی API دابنێ بۆ وەڵامی ڕاستەقینە'}
                </p>
            </div>
        </div>

        <!-- Input bar -->
        <div class="ai-input-bar">
            ${hasMic ? `
            <button id="aiMicBtn" class="ai-mic-btn"
                    onclick="startVoiceInput()"
                    data-listening="false"
                    title="قسەکردن — دەنگت تۆمار بکە"
                    aria-label="دەستپێکردنی قسەکردن">🎙️</button>` : ''}
            <input id="aiInput" class="input ai-text-input"
                   placeholder="پرسیارت بکە… (کوردی یان ئینگلیزی)"
                   onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();askAI();}"
                   aria-label="پیامت بنووسە">
            <button class="ai-send-btn" onclick="askAI()"
                    aria-label="بنێرە"
                    style="background:${th.accent}">📤</button>
        </div>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px;text-align:center">
            Enter بنووسە بۆ ناردن${hasMic ? ' · 🎙️ بۆ قسەکردن' : ''}${ttsOn ? ' · 🔊 دەنگ چالاکە' : ''}
        </p>`;

    _trackTimeout(setTimeout(() => document.getElementById('aiInput')?.focus(), 100));
}

function saveAIKey() {
    const inp = document.getElementById('aiKeyInput');
    const key = inp?.value.trim();
    if (!key || !key.startsWith('sk-')) {
        toast('❌ کلیلی دروست نییە. دەبێت بە sk- دەست پێبکات');
        return;
    }
    lsSet('zm_ai_key', key);
    toast('✅ کلیلی API خەزن کرا!');
    navigateTo('ai-teacher');
}

function removeAIKey() {
    try { localStorage.removeItem('zm_ai_key'); } catch(e) {}
    toast('✅ کلیل لابرا');
    navigateTo('ai-teacher');
}

function useAIPrompt(btn, text) {
    const inp = document.getElementById('aiInput');
    if (inp) { inp.value = text; inp.focus(); }
    // Fade out prompt row after one is chosen
    btn?.closest('.ai-prompts-row')?.classList.add('hidden');
}

// ===== CHAT BUBBLE HELPERS =====

function _appendBubble(chat, html, isUser) {
    document.getElementById('aiChatEmpty')?.remove();
    const th = getLangTheme();
    const wrap = document.createElement('div');
    wrap.className = isUser ? 'ai-msg-user' : 'ai-msg-bot';
    wrap.dataset.role = isUser ? 'user' : 'assistant';
    const bubble = document.createElement('span');
    bubble.className = 'ai-bubble-inner';
    if (isUser) bubble.style.background = th.accent;
    bubble.dataset.text = html.replace(/<[^>]*>/g, ''); // plain text for history
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
    return bubble;
}

/** Creates a streaming bubble that can receive token deltas in real-time */
function _createStreamingBubble(chat) {
    document.getElementById('aiChatEmpty')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'ai-msg-bot';
    wrap.dataset.role = 'assistant';
    const bubble = document.createElement('span');
    bubble.className = 'ai-bubble-inner streaming';
    bubble.innerHTML = '<span class="stream-cursor"></span>';
    wrap.appendChild(bubble);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;

    let accumulated = '';

    return {
        append(delta) {
            accumulated += delta;
            bubble.dataset.text = accumulated;
            // Render with preserved line-breaks; cursor stays at end
            bubble.innerHTML = escHtml(accumulated).replace(/\n/g, '<br>') +
                               '<span class="stream-cursor"></span>';
            chat.scrollTop = chat.scrollHeight;
        },
        finish(override) {
            if (override !== undefined) accumulated = override;
            bubble.dataset.text = accumulated;
            bubble.classList.remove('streaming');
            bubble.innerHTML = escHtml(accumulated).replace(/\n/g, '<br>');
            chat.scrollTop = chat.scrollHeight;
        },
        get text() { return accumulated; },
    };
}

// ===== STREAMING ASK =====

async function askAI() {
    const inp  = document.getElementById('aiInput');
    const chat = document.getElementById('aiChat');
    if (!inp || !chat) return;

    const q = inp.value.trim();
    if (!q) { inp.focus(); return; }

    inp.value   = '';
    inp.disabled = true;

    // Stop any ongoing TTS before new response
    window.speechSynthesis?.cancel();

    // Dismiss prompt chips
    document.getElementById('aiPrompts')?.classList.add('hidden');

    // User bubble — store plain text in dataset for history
    _appendBubble(chat, escHtml(q), true);

    const apiKey = lsGet('zm_ai_key');

    // ── Fallback (no API key) ──────────────────────────────────────────────
    if (!apiKey) {
        const demos = [
            'بۆ وەڵامی ڕاستەقینە کلیلی OpenAI API دابنێ. بۆ نموونە: "سڵاو چۆن دەگووترێت؟" وەڵامی دەدەمەوە.',
            'زمانی کوردی زۆر شیرینە! گرووپی سۆرانی و بادینی هەردووک پشتگیری دەکرێن. کلیلی API دابنێ.',
            'ئەمە نموونەیەکە بەبێ کلیل. لە ڕێکخستن → کلیلی API دابنێ بۆ مامۆستای ڕاستەقینە.',
        ];
        const reply = demos[Math.floor(Math.random() * demos.length)];
        _trackTimeout(setTimeout(() => {
            inp.disabled = false;
            const chatNow = document.getElementById('aiChat');
            if (chatNow) _appendBubble(chatNow, '🤖 ' + escHtml(reply), false);
        }, 700));
        return;
    }

    // ── Real AI — streaming ────────────────────────────────────────────────
    const streamBubble = _createStreamingBubble(chat);

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model:       'gpt-4o-mini',
                max_tokens:  700,
                temperature: 0.72,
                stream:      true,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    ...buildChatHistory(chat),
                    { role: 'user', content: q },
                ],
            }),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const msg = errData?.error?.message || `کێشەیەک هەبوو (${res.status})`;
            streamBubble.finish(`❌ ${msg}`);
            inp.disabled = false;
            return;
        }

        // Read SSE stream chunk-by-chunk
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();

        outer: while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });

            for (const line of text.split('\n')) {
                if (!line.startsWith('data: ')) continue;
                const payload = line.slice(6).trim();
                if (payload === '[DONE]') break outer;

                try {
                    const json  = JSON.parse(payload);
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) streamBubble.append(delta);
                } catch { /* skip malformed SSE chunk */ }
            }
        }

        streamBubble.finish();

        // TTS playback if enabled
        if (lsGet('zm_tts', 'false') === 'true' && streamBubble.text) {
            speakAIResponse(streamBubble.text);
        }

        addXP(10);

    } catch (err) {
        streamBubble.finish(`❌ ${err.message || 'کێشەیەک هەبوو. دووبارە هەوڵ بدەرەوە.'}`);
    }

    inp.disabled = false;
    inp.focus();
}

// ===== VOICE INPUT (Web Speech API) =====

function startVoiceInput() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { toast('❌ براوزەرەکەت بیستنی دەنگ پشتگیری ناکات'); return; }

    const micBtn = document.getElementById('aiMicBtn');

    // Toggle off if already listening
    if (micBtn?.dataset.listening === 'true') {
        window._aiRec?.stop();
        return;
    }

    const rec = new SpeechRec();
    window._aiRec = rec;

    // Use Arabic for Sorani (closest), 'ku' for Badini (Kurmanji)
    const dialect = state.settings.dialect || 'sorani';
    rec.lang            = dialect === 'sorani' ? 'ar' : 'ku';
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.maxAlternatives = 1;

    function setMic(listening) {
        if (!micBtn) return;
        micBtn.dataset.listening = listening ? 'true' : 'false';
        micBtn.classList.toggle('listening', listening);
        micBtn.textContent = listening ? '⏹️' : '🎙️';
        micBtn.title = listening ? 'وەستان' : 'قسەکردن';
    }

    setMic(true);
    toast('🎙️ گوێ دەگرم…');

    rec.onresult = e => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        const inp = document.getElementById('aiInput');
        if (inp) inp.value = transcript;
    };

    rec.onend = () => {
        setMic(false);
        const inp = document.getElementById('aiInput');
        if (inp?.value.trim()) _trackTimeout(setTimeout(askAI, 300));
    };

    rec.onerror = e => {
        setMic(false);
        if (e.error !== 'no-speech') toast(`❌ دەنگ: ${e.error}`);
    };

    try { rec.start(); } catch { setMic(false); toast('❌ دەستپێکردن شکست'); }
}

// ===== TTS (Web Speech Synthesis) =====

function speakAIResponse(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip markdown-ish tokens before speaking
    const clean = text.replace(/\*\*?|__|`{1,3}|\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    const utter = new SpeechSynthesisUtterance(clean.slice(0, 500)); // cap length

    const dialect = state.settings.dialect || 'sorani';
    // Arabic-Iraq for Sorani; Turkish is phonetically closest available for Badini Latin
    utter.lang  = dialect === 'sorani' ? 'ar-IQ' : 'tr-TR';
    utter.rate  = 0.88;
    utter.pitch = 1.05;

    // Prefer a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const match  = voices.find(v => v.lang.startsWith(utter.lang.slice(0, 2)) && /female|woman/i.test(v.name))
                || voices.find(v => v.lang.startsWith(utter.lang.slice(0, 2)));
    if (match) utter.voice = match;

    window.speechSynthesis.speak(utter);
}

function toggleTTS() {
    const isOn = lsGet('zm_tts', 'false') === 'true';
    lsSet('zm_tts', isOn ? 'false' : 'true');

    if (isOn) window.speechSynthesis?.cancel();

    const btn = document.getElementById('aiTTSBtn');
    const th  = getLangTheme();
    if (btn) {
        btn.textContent = isOn ? '🔇' : '🔊';
        btn.title       = isOn ? 'دەنگی مامۆستا چالاک کە' : 'دەنگ کوژاندنەوە';
        btn.classList.toggle('active', !isOn);
        btn.style.background = !isOn ? th.accent : '';
        btn.style.color      = !isOn ? '#fff'    : '';
    }
    toast(isOn ? '🔇 دەنگی مامۆستا کوژاندرا' : '🔊 دەنگی مامۆستا چالاک کرا');
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
    const xp     = state.user.xp;
    const streak = state.user.streak;
    const badges = [
        { n:'برۆنزی',  i:'🥉', req:100,   val:xp,     unit:'XP',    color:'#CD7F32' },
        { n:'زیوی',    i:'🥈', req:1000,  val:xp,     unit:'XP',    color:'#94A3B8' },
        { n:'زێڕین',  i:'🥇', req:5000,  val:xp,     unit:'XP',    color:'#F59E0B' },
        { n:'ئەڵماسی',i:'💎', req:10000, val:xp,     unit:'XP',    color:'#0EA5E9' },
        { n:'شاهانە', i:'👑', req:50000, val:xp,     unit:'XP',    color:'#8B5CF6' },
        { n:'سووتاو', i:'🔥', req:7,     val:streak, unit:'ستریک', color:'#EF4444' },
        { n:'زمانزان',i:'🌍', req:100,   val:state.user.totalWords, unit:'وشە', color:'#10B981' },
        { n:'پیادەڕۆ',i:'🎯', req:10,   val:state.learning.history.length, unit:'وانە', color:'#4F46E5' },
    ];

    c.innerHTML = `
        <h2 style="margin-bottom:4px">🏆 دەستکەوتەکان</h2>
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">${badges.filter(b => b.val >= b.req).length} / ${badges.length} کردەوەی</p>
        <div class="grid-2">
            ${badges.map(b => {
                const earned  = b.val >= b.req;
                const pct     = Math.min(100, Math.round(b.val / b.req * 100));
                return `
                <div class="card achievement-card ${earned ? 'earned' : ''}" style="${earned ? `border-color:${b.color}40;` : ''}">
                    <div class="achievement-icon" style="background:${earned ? b.color + '22' : 'var(--surface-hover)'}">
                        <span style="font-size:28px;${earned ? '' : 'filter:grayscale(1);opacity:.4'}">${earned ? b.i : '🔒'}</span>
                    </div>
                    <strong style="display:block;margin:8px 0 2px;font-size:13px${earned ? `;color:${b.color}` : ''}">${escHtml(b.n)}</strong>
                    ${earned
                        ? `<p style="color:var(--success);font-size:11px;font-weight:600">✅ کردەوەی</p>`
                        : `<div style="margin-top:6px">
                               <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:3px">
                                   <span>${b.val.toLocaleString()} / ${b.req.toLocaleString()} ${b.unit}</span>
                                   <span>${pct}%</span>
                               </div>
                               <div class="progress-bar" style="height:5px">
                                   <div class="progress-fill" style="width:${pct}%;background:${b.color}"></div>
                               </div>
                           </div>`}
                </div>`;
            }).join('')}
        </div>`;
}

// ===== PAGE: COMMUNITY =====
function renderCommunity(c) {
    const users = [
        { n:'دلشاد', l:15, xp:6200, streak:14, a:'🧔', isMe:false },
        { n:'سارا',   l:12, xp:4500, streak:9,  a:'👩', isMe:false },
        { n:'ئارام',  l:8,  xp:2800, streak:5,  a:'👨', isMe:false },
        { n:'تۆ',    l:state.user.level, xp:state.user.xp, streak:state.user.streak, a:'👤', isMe:true },
    ].sort((a, b) => b.xp - a.xp);

    const medals    = ['🥇','🥈','🥉'];
    const podiumBg  = ['rgba(245,158,11,.12)','rgba(148,163,184,.12)','rgba(205,127,50,.12)'];
    const podiumBdr = ['#F59E0B','#94A3B8','#CD7F32'];

    const myRank = users.findIndex(u => u.isMe) + 1;

    c.innerHTML = `
        <h2 style="margin-bottom:4px">👥 کۆمەڵگا</h2>
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">جێگەی تۆ: #${myRank} لە هەفتەی ئەمەدا</p>

        <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:16px 20px 12px;border-bottom:1px solid var(--border-light)">
                <h3 style="font-size:15px">🏆 ڕیزبەندی هەفتانە</h3>
            </div>
            ${users.map((u, i) => `
                <div class="leaderboard-row ${u.isMe ? 'leaderboard-me' : ''}"
                     style="${i < 3 ? `background:${podiumBg[i]};` : ''}${u.isMe ? 'background:var(--primary-alpha);' : ''}">
                    <div class="lb-rank" style="${i < 3 ? `color:${podiumBdr[i]};font-size:22px` : 'color:var(--text-muted);font-size:14px;font-weight:700'}">
                        ${medals[i] || `#${i + 1}`}
                    </div>
                    <div class="lb-avatar">${u.a}</div>
                    <div class="lb-info">
                        <strong style="${u.isMe ? 'color:var(--primary)' : ''}">${escHtml(u.n)}</strong>
                        <p>ئاست ${u.l} · 🔥 ${u.streak} ڕۆژ</p>
                    </div>
                    <div class="lb-xp">
                        <strong>${u.xp.toLocaleString()}</strong>
                        <p>XP</p>
                    </div>
                </div>`).join('')}
        </div>

        <div class="card" style="margin-top:12px;text-align:center;padding:20px">
            <p style="font-size:32px;margin-bottom:6px">🌍</p>
            <p style="font-weight:600;margin-bottom:4px">دەستەی زمانی تۆ</p>
            <p style="font-size:13px;color:var(--text-secondary)">بانگهێشتی هاوڕێکانت بکە و پێکەوە فێربن</p>
            <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="toast('بەزووی دێت! 🚀')">بانگهێشت بکە</button>
        </div>`;
}

// ===== PAGE: PACKAGES =====
function renderPackages(c) {
    // Check activated packages from auth session
    let activatedPkgs = [];
    try {
        const session = JSON.parse(localStorage.getItem('zm_auth_session') || 'null');
        if (session && session.activatedPackages) activatedPkgs = session.activatedPackages;
    } catch {}

    let html = `
        <h2 style="margin-bottom:4px">💳 پاکێجەکان</h2>
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:8px">کلیلی مەجازت هەیە؟ یان بە پارەدان چالاک بکە</p>
        <button class="btn btn-block" style="background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;margin-bottom:18px;font-weight:700;border-radius:var(--radius-sm);padding:13px;font-size:14px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(79,70,229,.35)"
                onclick="typeof showActivateModal==='function'?showActivateModal():toast('بارکردن...')">
            🔑 چالاکردنی پاکێج بە کلیلی مەجاز
        </button>`;

    for (const k in packages) {
        const p = packages[k];
        const isActive = activatedPkgs.includes(k);
        html += `
            <div class="card ${p.featured ? 'featured' : ''}" style="border-right:4px solid ${p.color};${isActive ? 'box-shadow:0 0 0 2px ' + p.color + '55,var(--shadow);' : ''}">
                ${isActive ? `<span class="badge" style="background:${p.color};color:#fff;margin-bottom:8px;display:inline-block;padding:4px 10px;border-radius:99px;font-size:11px">✅ چالاککراو</span>` : ''}
                ${p.featured && !isActive ? '<span class="badge badge-premium" style="margin-bottom:8px;display:inline-block">⭐ پێشنیارکراو</span>' : ''}
                <h3 style="color:${p.color};margin-bottom:4px">${escHtml(p.name)}</h3>
                <p style="font-size:28px;font-weight:800;margin-bottom:8px">
                    ${escHtml(p.price)}<small style="font-size:14px;font-weight:500;color:var(--text-secondary)"> / ${escHtml(p.period)}</small>
                </p>
                <ul style="list-style:none;padding:0;margin-bottom:16px">
                    ${p.features.map(f => `<li style="padding:3px 0;font-size:14px">✅ ${escHtml(f)}</li>`).join('')}
                </ul>
                ${isActive
                    ? `<button class="btn btn-block" style="background:${p.color}22;color:${p.color};border:1.5px solid ${p.color}55;font-weight:700" disabled>✅ چالاککراوە</button>`
                    : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                           <button class="btn btn-primary btn-block" onclick="buyPackage('${escAttr(k)}')">${escHtml(p.btnText)}</button>
                           ${k !== 'free' ? `<button class="btn btn-block" style="background:var(--surface-hover);border:1.5px solid var(--border);font-size:12px" onclick="typeof showActivateModal==='function'?showActivateModal():toast('بارکردن...')">🔑 کلیل</button>` : ''}
                       </div>`}
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

// ===== PAGE: FILL-IN-THE-BLANK QUIZ =====
function renderFillBlank(c) {
    const allWords = getAllWords();
    if (allWords.length < 4) {
        c.innerHTML = '<h2>✏️ شوێنی بەتاڵ</h2><div class="card"><p>وشەی پێویست نییە. پێشتر وانەیەک دابگرە.</p></div>';
        return;
    }
    const th  = getLangTheme();
    const raw = allWords[Math.floor(Math.random() * allWords.length)];
    const { src, target } = getDialectWord(raw);

    // Alternate: ask for source or target
    const askForSource = Math.random() > 0.5;
    const correctAns   = askForSource ? src : target;
    const displayWord  = askForSource ? target : src;
    const hint         = askForSource
        ? 'بە ئینگلیزی/زمانی فێرخواز چۆن دەنووسرێت؟'
        : 'واتای کوردی چییە؟';

    const wrongs = allWords
        .filter(w => w !== raw)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => askForSource ? getDialectWord(w).src : getDialectWord(w).target);
    const opts = [...wrongs, correctAns].sort(() => Math.random() - 0.5);

    const blank = `<span style="background:${th.accent}22;padding:2px 20px;border-radius:6px;
                               border-bottom:2.5px solid ${th.accent};font-weight:700">_____</span>`;

    c.innerHTML = `
        <h2 style="margin-bottom:12px">✏️ شوێنی بەتاڵ پڕبکەرەوە</h2>
        <div class="card" style="text-align:center;padding:28px 20px;margin:0 0 16px;
             border-top:3px solid ${th.accent}">
            <p style="font-size:32px;font-weight:800;margin-bottom:8px;unicode-bidi:isolate" dir="auto">
                ${escHtml(displayWord)}
            </p>
            <p style="color:var(--text-secondary);margin-bottom:10px;font-size:14px">${hint}</p>
            <p style="font-size:22px">${blank}</p>
            <button class="btn btn-sm" style="margin-top:10px"
                    onclick="speakWord('${escAttr(src)}')" aria-label="گوێ بگرە">🔊 گوێ بگرە</button>
        </div>
        <div class="options-grid" id="fbOpts" role="group" aria-label="وەڵامەکان">
            ${opts.map(o => `
            <button class="option-btn" dir="auto"
                    onclick="checkFillBlank('${escAttr(o)}','${escAttr(correctAns)}',this)">
                ${escHtml(o)}
            </button>`).join('')}
        </div>`;
}

function checkFillBlank(sel, correct, btn) {
    document.querySelectorAll('#fbOpts .option-btn').forEach(b => { b.disabled = true; });
    if (sel === correct) {
        btn.classList.add('correct');
        celebrateCorrect(btn, 12);
        toast('✅ ڕاستە! +12 XP');
    } else {
        btn.classList.add('wrong');
        celebrateWrong(btn);
        document.querySelectorAll('#fbOpts .option-btn').forEach(b => {
            if (b.textContent.trim() === correct) b.classList.add('correct');
        });
    }
    _trackTimeout(setTimeout(() => renderFillBlank(document.getElementById('mainContent')), 1600));
}

// ===== PAGE: MATCH PAIRS QUIZ =====
function renderMatchPairs(c) {
    const allWords = getAllWords();
    if (allWords.length < 5) {
        c.innerHTML = '<h2>🔗 جوت کردنەوە</h2><div class="card"><p>وشەی پێویست نییە. پێشتر وانەیەک دابگرە.</p></div>';
        return;
    }
    const th     = getLangTheme();
    const count  = Math.min(5, allWords.length);
    const chosen = allWords.sort(() => Math.random() - 0.5).slice(0, count);
    const pairs  = chosen.map(w => getDialectWord(w));
    const lefts  = pairs.map(p => p.src).sort(() => Math.random() - 0.5);
    const rights = pairs.map(p => p.target).sort(() => Math.random() - 0.5);

    window._mp = { pairs, selected: null, matched: 0, total: count, startTime: Date.now() };

    c.innerHTML = `
        <h2 style="margin-bottom:8px">🔗 جوت کردنەوە</h2>
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">
            ✅ <span id="mpMatched">0</span> / ${count} — وشەکان بجوت بکەرەوە
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="mpGrid">
            ${lefts.map(l => `
                <button class="option-btn mp-btn" data-word="${escAttr(l)}" data-side="left"
                        onclick="selectMP(this,'${escAttr(l)}','left')"
                        style="min-height:52px;text-align:center;font-size:14px">${escHtml(l)}</button>`).join('')}
            ${rights.map(r => `
                <button class="option-btn mp-btn" data-word="${escAttr(r)}" data-side="right"
                        onclick="selectMP(this,'${escAttr(r)}','right')"
                        style="min-height:52px;text-align:center;font-size:14px;color:${th.accent}">${escHtml(r)}</button>`).join('')}
        </div>
        <p style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:12px">
            لایەکی چەپ هەڵبژێرە، دواتر لایەکی ڕاست
        </p>`;
}

function selectMP(btn, word, side) {
    const d  = window._mp;
    const th = getLangTheme();
    if (!d || btn.disabled) return;

    if (!d.selected) {
        d.selected = { btn, word, side };
        btn.style.boxShadow  = `0 0 0 3px ${th.accent}`;
        btn.style.background = `${th.accent}22`;
        return;
    }

    const prev = d.selected;
    d.selected = null;

    // Must pick from opposite sides; if same side → switch selection
    if (prev.side === side) {
        prev.btn.style.boxShadow  = '';
        prev.btn.style.background = '';
        d.selected = { btn, word, side };
        btn.style.boxShadow  = `0 0 0 3px ${th.accent}`;
        btn.style.background = `${th.accent}22`;
        return;
    }

    const leftWord  = side === 'left' ? word : prev.word;
    const rightWord = side === 'right' ? word : prev.word;
    const leftBtn   = side === 'left' ? btn  : prev.btn;
    const rightBtn  = side === 'right' ? btn  : prev.btn;

    const isMatch = d.pairs.some(p => p.src === leftWord && p.target === rightWord);

    if (isMatch) {
        [leftBtn, rightBtn].forEach(b => {
            b.classList.add('correct');
            b.style.boxShadow  = '';
            b.disabled = true;
        });
        d.matched++;
        state.user.xp += 15;
        playBeep(800, 0.1);
        const sc = document.getElementById('mpMatched');
        if (sc) sc.textContent = d.matched;
        save();
        if (d.matched === d.total) {
            const secs = Math.round((Date.now() - d.startTime) / 1000);
            playChime('complete');
            spawnConfetti();
            toast(`🎉 هەموویان جوت کران! ${secs}ث — +${d.total * 15} XP`);
            _trackTimeout(setTimeout(() => navigateTo('home'), 1800));
        }
    } else {
        [leftBtn, rightBtn].forEach(b => {
            b.classList.add('wrong');
            b.style.boxShadow  = '';
            b.style.background = '';
        });
        celebrateWrong(leftBtn);
        _trackTimeout(setTimeout(() => {
            [leftBtn, rightBtn].forEach(b => b.classList.remove('wrong'));
        }, 600));
    }
}

// ===== PAGE: SENTENCE ORDER QUIZ =====
function renderSentenceOrder(c) {
    const th = getLangTheme();
    const sentences = [
        { words:['زمانی','کوردی','زۆر','جوانە'],             answer:'زمانی کوردی زۆر جوانە',             meaning:'Kurdish language is very beautiful' },
        { words:['بەیانیت','باش','مامۆستا'],                  answer:'بەیانیت باش مامۆستا',                meaning:'Good morning, teacher' },
        { words:['ناوم','ئارامە','و','خۆشحاڵم'],             answer:'ناوم ئارامە و خۆشحاڵم',             meaning:'My name is Aram and I am happy' },
        { words:['فێربوونی','زمان','سوودمەندە'],             answer:'فێربوونی زمان سوودمەندە',             meaning:'Learning a language is beneficial' },
        { words:['ئەمڕۆ','کویزی','نوێم','هەیە'],             answer:'ئەمڕۆ کویزی نوێم هەیە',             meaning:'Today I have a new quiz' },
        { words:['دڵم','لە','کوردستان','خۆشە'],             answer:'دڵم لە کوردستان خۆشە',               meaning:'I love Kurdistan' },
        { words:['ڕۆژانە','زمانی','کوردی','دەخوێنم'],       answer:'ڕۆژانە زمانی کوردی دەخوێنم',         meaning:'I study Kurdish daily' },
        { words:['مامۆستام','زۆر','باشە'],                    answer:'مامۆستام زۆر باشە',                   meaning:'My teacher is very good' },
        { words:['ئاوی','سارد','دەمەوێت'],                   answer:'ئاوی سارد دەمەوێت',                   meaning:'I want cold water' },
        { words:['کتێبەکە','لەسەر','مێزە'],                  answer:'کتێبەکە لەسەر مێزە',                  meaning:'The book is on the table' },
    ];
    const s       = sentences[Math.floor(Math.random() * sentences.length)];
    const shuffled = [...s.words].sort(() => Math.random() - 0.5);
    window._so    = { answer: s.answer, selected: [], meaning: s.meaning };

    c.innerHTML = `
        <h2 style="margin-bottom:8px">🔀 ڕیزکردنی ڕستە</h2>
        <p style="color:var(--text-secondary);font-size:13px;margin-bottom:12px">
            وشەکان بەکرتەکردن هەڵبژێرە بەم ڕیزانەی درووست:
        </p>
        <div class="card" style="min-height:64px;display:flex;flex-wrap:wrap;gap:8px;
             align-items:center;padding:16px;margin-bottom:14px;
             border-top:3px solid ${th.accent}" id="soAnswer" dir="rtl">
            <span id="soPlaceholder" style="color:var(--text-muted);font-size:13px">
                لێرە ئامادە دەبێت...
            </span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;
                    justify-content:center" id="soWords">
            ${shuffled.map(w => `
            <button onclick="soSelect('${escAttr(w)}',this)"
                    style="background:${th.accent}18;color:${th.accent};
                           border:1.5px solid ${th.accent}40;padding:8px 14px;
                           border-radius:var(--radius-sm);font-size:15px;cursor:pointer">
                ${escHtml(w)}
            </button>`).join('')}
        </div>
        <div style="display:flex;gap:8px">
            <button class="btn btn-sm" style="background:var(--surface-hover)"
                    onclick="renderSentenceOrder(document.getElementById('mainContent'))">
                ↺ دووبارە
            </button>
            <button class="btn btn-primary btn-sm" onclick="soCheck()">✅ پشکنین</button>
        </div>
        <div id="soFeedback" style="margin-top:12px"></div>`;
}

function soSelect(word, btn) {
    const d = window._so;
    if (!d || btn.disabled) return;
    btn.disabled     = true;
    btn.style.opacity = '0.35';
    d.selected.push(word);

    const ans = document.getElementById('soAnswer');
    const ph  = document.getElementById('soPlaceholder');
    if (ph) ph.style.display = 'none';
    if (ans) {
        const chip = document.createElement('span');
        chip.style.cssText = 'background:var(--primary-alpha);color:var(--primary);padding:4px 12px;' +
                             'border-radius:99px;font-size:14px;cursor:pointer;user-select:none';
        chip.textContent = word;
        chip.title       = 'کرتە بکە بۆ سڕینەوە';
        chip.onclick     = () => {
            const idx = d.selected.lastIndexOf(word);
            if (idx !== -1) d.selected.splice(idx, 1);
            chip.remove();
            btn.disabled      = false;
            btn.style.opacity = '1';
            if (!ans.querySelector('span') && ph) ph.style.display = '';
        };
        ans.appendChild(chip);
    }
}

function soCheck() {
    const d  = window._so;
    const fb = document.getElementById('soFeedback');
    if (!d || !d.selected.length) { toast('ئەولا وشەیەک هەڵبژێرە'); return; }
    const attempt = d.selected.join(' ');
    if (attempt === d.answer) {
        if (fb) fb.innerHTML = `<div class="card" style="background:var(--success-light);color:var(--success);
            text-align:center;padding:14px">
            ✅ ڕاستە! واتا: <em>${escHtml(d.meaning)}</em></div>`;
        celebrateCorrect(fb, 20);
        toast('🎉 ڕاست! +20 XP');
        _trackTimeout(setTimeout(() => renderSentenceOrder(document.getElementById('mainContent')), 2000));
    } else {
        if (fb) fb.innerHTML = `<div class="card" style="background:var(--danger-light);color:var(--danger);padding:14px">
            ❌ هەڵەیە. وەڵامی درووست: <strong dir="rtl">${escHtml(d.answer)}</strong></div>`;
        celebrateWrong(fb);
    }
}

// ===== AI TEACHER: ADAPTIVE HELPER CALLS =====
function aiSuggestPlan() {
    const lang = lessons[state.settings.currentLanguage]?.name || 'کوردی';
    const q = `زمانی فێربووم: ${lang}. ئاستم ${state.user.level} و ${state.user.totalWords} وشەم فێربووە و ${state.user.xp} XPم هەیە. پلانی فێربوونی هەفتەیەکم بنووسە بە کوردی — ڕۆژ بە ڕۆژ.`;
    const inp = document.getElementById('aiInput');
    if (inp) inp.value = q;
    askAI(q);
}

function aiAssessLevel() {
    const lang = lessons[state.settings.currentLanguage]?.name || 'کوردی';
    const q = `فێرخوازم لە ${lang}. ${state.user.totalWords} وشەم فێربووە و ئاستم ${state.user.level}ە. ٣ پرسیاری پشکنین دروست بکە (جۆراوجۆر: هەڵبژاردەیی، ڕستەسازی)، لەپاش وەڵامیان ئاستم دیاری بکە و پێشنیارم بدە.`;
    const inp = document.getElementById('aiInput');
    if (inp) inp.value = q;
    askAI(q);
}

function aiDailySentence() {
    const lang = lessons[state.settings.currentLanguage]?.name || 'کوردی';
    const q = `ڕستەی ئەمڕۆم بنووسە لە ${lang} — ئاستی ئاسانی مامناوەند، نە زۆر ئاسان نە زۆر سەخت. پاشان ڕووناکی بکەرەوە (ڕێزمان + واژە) و ٢ ڕستەی پەیوەندیدار هاوتا فێر بکە.`;
    const inp = document.getElementById('aiInput');
    if (inp) inp.value = q;
    askAI(q);
}

function aiGrammarTip() {
    const lang = lessons[state.settings.currentLanguage]?.name || 'کوردی';
    const q = `تێبینییەکی ڕێزمانی گرنگ بمدە لە ${lang} کە زیاتر فێرخوازان هەڵەی تێدا دەکەن. نموونەی ڕاست و هەڵە بنووسە و ڕووناکی بکەرەوە.`;
    const inp = document.getElementById('aiInput');
    if (inp) inp.value = q;
    askAI(q);
}

// ===== PAGE: INSTRUCTOR PORTAL =====
function renderInstructors(c) {
    const th  = getLangTheme();
    const wa  = AppConfig.contact.whatsapp;
    const tg  = AppConfig.contact.telegram;

    const checklist = [
        { n:'١', i:'👤', t:'ناوی تەواو',             d:'ناو و بوکی تەواو بنووسە (وەک لە بڕوانامەکەتدایە)' },
        { n:'٢', i:'📧', t:'ئیمەیڵ و ژمارەی تەلەفۆن',d:'ئیمەیڵی کارکردن + ژمارەی واتسئاپ کارا' },
        { n:'٣', i:'📄', t:'CV / ڕێزوانامە',          d:'فایلی PDF یان Word ی ژیاننامەی کارکردنت' },
        { n:'٤', i:'📸', t:'وێنەی تایبەتی',            d:'وێنەی ئەندازەی پاسپۆرت، شتاو و ڕوون' },
        { n:'٥', i:'📚', t:'بابەتی فێرکاری',           d:'زمانی تایبەتمەندیت (ئینگلیزی، عەرەبی، تورکی…)' },
        { n:'٦', i:'💰', t:'نرخی وانە (بهایێ خوله)',   d:'نرخی هەر وانەیەک یان پاکێجی مانگانە' },
        { n:'٧', i:'🗓️', t:'خشتەی کاتی (دێمێ وانەگوتنێ)', d:'ئەی کام ڕۆژ و کام کاتژمێر بەردەستی' },
        { n:'٨', i:'🎯', t:'شێوازی وانەگوتن',         d:'شێوازی فێرکاریت — تیۆری، پراکتیکی، ئۆنلاین…' },
    ];

    const features = [
        { i:'📝', t:'نووسینی وانە',     d:'وانەی تایبەت بنووسە' },
        { i:'🎥', t:'ئەپلۆدی ڤیدیۆ',   d:'ڤیدیۆ بارکە ڕاستەوخۆ' },
        { i:'❓', t:'دروستکردنی کویز',  d:'تاقیکردنەوەی تایبەت' },
        { i:'📊', t:'شوپاندنی خوێندکار',d:'پێشکەوتنی قوتابییان ببینە' },
        { i:'💬', t:'چاتی ڕاستەوخۆ',   d:'سوالی قوتابی وەڵام بدەرەوە' },
        { i:'💰', t:'٧٠٪ داهاتت',      d:'٧٠٪ بۆ مامۆستا · ٣٠٪ بۆ پلاتفۆرم' },
    ];

    c.innerHTML = `
    <div style="text-align:right;padding-bottom:24px">

        <!-- ══ HERO ══ -->
        <div style="background:linear-gradient(135deg,${th.accent}18,${th.accent}05);
                    border-radius:var(--radius);padding:28px 20px 24px;margin-bottom:16px;
                    border:1.5px solid ${th.accent}28;position:relative;overflow:hidden;text-align:center">
            <div style="position:absolute;top:-40px;left:-40px;width:150px;height:150px;
                        background:${th.accent}06;border-radius:50%;pointer-events:none"></div>
            <div style="position:absolute;bottom:-30px;right:-30px;width:100px;height:100px;
                        background:${th.accent}05;border-radius:50%;pointer-events:none"></div>
            <div style="font-size:56px;margin-bottom:8px">🎓</div>
            <h2 style="font-size:22px;margin-bottom:4px">بەشی مامۆستایان</h2>
            <p style="font-size:14px;color:var(--text-secondary);max-width:310px;
                      margin:0 auto 14px;line-height:1.7">
                مامۆستا یان پیشەیی؟ لەگەڵ زیمان یەکبکەوە و هەزاران فێرخوازی کوردستان و جیهان فێربکە.
                ٧٠٪ی داهات ڕاستەوخۆ بۆ تۆ دێت.
            </p>
            <!-- Contact buttons -->
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                <a href="https://wa.me/${wa}?text=${encodeURIComponent('سڵاو! دەمەوێت وەک مامۆستا لە زیمان تۆمار ببم.')}"
                   target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;gap:8px;
                          background:#25D366;color:#fff;border-radius:99px;
                          padding:11px 22px;font-size:13px;font-weight:700;
                          text-decoration:none;box-shadow:0 4px 14px #25D36640">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    پەیوەندی واتسئاپ
                </a>
                <a href="https://t.me/${tg}"
                   target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;gap:8px;
                          background:#229ED9;color:#fff;border-radius:99px;
                          padding:11px 22px;font-size:13px;font-weight:700;
                          text-decoration:none;box-shadow:0 4px 14px #229ED940">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    پەیوەندی تێلێگرام
                </a>
            </div>
        </div>

        <!-- ══ CHECKLIST SECTION ══ -->
        <div style="margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                <span style="font-size:20px">📋</span>
                <h3 style="font-size:16px;font-weight:800;margin:0">
                    زانیارییەکانت ئامادە بکە — پێش پەیوەندیکردن
                </h3>
            </div>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;line-height:1.65">
                کاتێک پەیوەندیمان پێوە دەکەیت، تکایە ئەم زانیارییانە ئامادە بکە. ئەمانە پێویستن بۆ
                پروسەی پشکنین و تۆمارکردنت وەک مامۆستای زیمان.
            </p>
            <div style="display:grid;gap:10px">
                ${checklist.map(item => `
                <div style="display:flex;align-items:flex-start;gap:12px;
                            background:var(--surface);border-radius:var(--radius);
                            padding:14px 16px;border:1px solid var(--border);
                            border-right:3px solid ${th.accent}88">
                    <div style="min-width:32px;height:32px;border-radius:50%;
                                background:${th.accent}18;color:${th.accent};
                                display:flex;align-items:center;justify-content:center;
                                font-size:16px;font-weight:900;flex-shrink:0">
                        ${item.i}
                    </div>
                    <div>
                        <strong style="display:block;font-size:14px;margin-bottom:3px">
                            ${item.n}. ${item.t}
                        </strong>
                        <span style="font-size:12px;color:var(--text-secondary);line-height:1.6">
                            ${item.d}
                        </span>
                    </div>
                </div>`).join('')}
            </div>
        </div>

        <!-- ══ HOW TO APPLY ══ -->
        <div class="card" style="background:linear-gradient(135deg,${th.accent}10,${th.accent}04);
                                  border:1.5px solid ${th.accent}30;margin-bottom:16px;text-align:center">
            <p style="font-size:15px;font-weight:800;margin-bottom:8px">📨 چۆن دەتۆمارم؟</p>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:16px">
                ئامادەی زانیارییەکانت کە بوو، بەیەکێکی ئەم ڕێگایانە پەیوەندیمان پێوە بکە.
                تیمی زیمان لە ناوبازنەی <strong>٢٤ کاتژمێر</strong> وەڵامت دەداتەوە.
            </p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                <a href="https://wa.me/${wa}?text=${encodeURIComponent('سڵاو! ناوم [ناوت] ئە. دەمەوێت وەک مامۆستای [زمانی تایبەتمەندیت] لە زیمان تۆمار ببم. ئامادەی ناردنی CV و زانیارییەکانم.')}"
                   target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;gap:7px;
                          background:#25D366;color:#fff;border-radius:99px;
                          padding:10px 20px;font-size:13px;font-weight:700;
                          text-decoration:none">
                    📱 واتسئاپ — ${wa}
                </a>
                <a href="https://t.me/${tg}"
                   target="_blank" rel="noopener"
                   style="display:inline-flex;align-items:center;gap:7px;
                          background:#229ED9;color:#fff;border-radius:99px;
                          padding:10px 20px;font-size:13px;font-weight:700;
                          text-decoration:none">
                    ✈️ تێلێگرام — @${tg}
                </a>
            </div>
        </div>

        <!-- ══ WHAT YOU GET ══ -->
        <h3 style="font-size:15px;font-weight:800;margin-bottom:12px">
            🌟 مامۆستا لە زیمان دەتوانێت:
        </h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            ${features.map(f => `
            <div style="background:var(--surface);border-radius:var(--radius);
                        padding:14px 12px;border:1px solid var(--border);
                        border-top:3px solid ${th.accent}77;text-align:center">
                <div style="font-size:26px;margin-bottom:6px">${f.i}</div>
                <strong style="font-size:13px;display:block;margin-bottom:3px">${f.t}</strong>
                <span style="font-size:11px;color:var(--text-secondary)">${f.d}</span>
            </div>`).join('')}
        </div>

        <!-- ══ REVENUE MODEL ══ -->
        <div class="card" style="border:1.5px solid #22C55E44;background:#22C55E08;margin-bottom:16px;text-align:center">
            <div style="font-size:32px;margin-bottom:6px">💰</div>
            <p style="font-size:15px;font-weight:800;margin-bottom:6px">مۆدێلی داهات</p>
            <div style="display:flex;justify-content:center;gap:20px;margin-bottom:8px">
                <div style="text-align:center">
                    <div style="font-size:28px;font-weight:900;color:#22C55E">٧٠٪</div>
                    <div style="font-size:12px;color:var(--text-secondary)">بۆ مامۆستا</div>
                </div>
                <div style="font-size:28px;color:var(--border);align-self:center">|</div>
                <div style="text-align:center">
                    <div style="font-size:28px;font-weight:900;color:${th.accent}">٣٠٪</div>
                    <div style="font-size:12px;color:var(--text-secondary)">بۆ پلاتفۆرم</div>
                </div>
            </div>
            <p style="font-size:12px;color:var(--text-secondary);margin:0;line-height:1.6">
                پارە هەر مانگ بۆ حیسابی بانکیت یان واتسئاپ دەنێردرێت.
                هیچ پارەی دەستپێکیشکی نییە.
            </p>
        </div>

        <!-- ══ QUICK INTEREST FORM ══ -->
        <div class="card" style="border:1.5px dashed ${th.accent}55;background:${th.accent}06">
            <p style="font-size:15px;font-weight:800;margin-bottom:4px">🙋 ناوت تۆمار بکە — پێت ئاگادار دەبینەوە</p>
            <p style="font-size:12px;color:var(--text-secondary);margin-bottom:14px;line-height:1.6">
                ئامادە نیت هەنووکە؟ ناو و زمانت بنووسە، کاتێک پۆرتاڵ ئامادە بوو یەکەم ئاگادارات دەکەینەوە.
            </p>
            <input id="instrName"  class="input" type="text"
                   placeholder="ناوی تەواوت"           style="margin-bottom:8px" />
            <input id="instrPhone" class="input" type="tel"
                   placeholder="ژمارەی واتسئاپ (+964…)" style="margin-bottom:8px" />
            <input id="instrEmail" class="input" type="email"
                   placeholder="ئیمەیڵ (ئیختیاری)"    style="margin-bottom:8px" />
            <select id="instrLang" class="input" style="margin-bottom:12px">
                <option value="">زمانی تایبەتمەندیت هەڵبژێرە</option>
                <option>ئینگلیزی 🇬🇧</option>
                <option>عەرەبی 🇸🇦</option>
                <option>تورکی 🇹🇷</option>
                <option>فارسی 🇮🇷</option>
                <option>فەرەنسی 🇫🇷</option>
                <option>ئەڵمانی 🇩🇪</option>
                <option>ئیسپانی 🇪🇸</option>
                <option>ئیتاڵی 🇮🇹</option>
                <option>ڕووسی 🇷🇺</option>
                <option>چینی 🇨🇳</option>
                <option>ژاپۆنی 🇯🇵</option>
                <option>کۆری 🇰🇷</option>
                <option>پۆرتوگالی 🇵🇹</option>
                <option>هیندی 🇮🇳</option>
                <option>زمانێکی تر</option>
            </select>
            <button class="btn btn-primary btn-block" onclick="submitInstructorInterest()"
                    style="background:linear-gradient(135deg,${th.accent},${th.accent}cc);font-size:14px">
                ✅ ناوم تۆمار بکە — زووی پێم ئاگادار بکەرەوە
            </button>
        </div>
    </div>`;
}

function submitInstructorInterest() {
    const name  = (document.getElementById('instrName')?.value  || '').trim();
    const phone = (document.getElementById('instrPhone')?.value || '').trim();
    const email = (document.getElementById('instrEmail')?.value || '').trim();
    const lang  = document.getElementById('instrLang')?.value   || '';
    if (!name || !phone) { toast('تکایە ناو و ژمارەی واتسئاپت داخڵ بکە'); return; }
    const list = JSON.parse(localStorage.getItem('zm_instructor_list') || '[]');
    list.push({ name, phone, email, lang, date: new Date().toISOString() });
    localStorage.setItem('zm_instructor_list', JSON.stringify(list));
    // Also open WhatsApp with pre-filled message
    const msg = `سڵاو! ناوم ${name} ئە. دەمەوێت وەک مامۆستای ${lang || 'زمان'} لە زیمان تۆمار ببم. ژمارەم: ${phone}`;
    window.open(`https://wa.me/${AppConfig.contact.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    toast('✅ سوپاس! واتسئاپ کراوەتەوە — تیم لە ٢٤ کاتژمێر وەڵامت دەداتەوە 🎓');
    ['instrName','instrPhone','instrEmail'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const sel = document.getElementById('instrLang');
    if (sel) sel.selectedIndex = 0;
}

// ===== PAGE: SETTINGS =====
function renderSettings(c) {
    const th  = getLangTheme();
    const isSorani = state.settings.dialect === 'sorani';
    const isLight  = !state.settings.darkMode && !state.settings.amoledMode;
    const isDark   = state.settings.darkMode  && !state.settings.amoledMode;

    c.innerHTML = `
        <h2 style="margin-bottom:12px">⚙️ ڕێکخستن</h2>

        <!-- THEME -->
        <div class="card">
            <h3 style="margin-bottom:12px">🌗 ڕووکاری ئاپ</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="btn ${isLight ? 'btn-primary' : ''}"
                        onclick="setTheme('light')"  aria-pressed="${isLight}">☀️ ڕووناک</button>
                <button class="btn ${isDark  ? 'btn-primary' : ''}"
                        onclick="setTheme('dark')"   aria-pressed="${isDark}">🌙 تاریک</button>
                <button class="btn ${state.settings.amoledMode ? 'btn-primary' : ''}"
                        onclick="setTheme('amoled')" aria-pressed="${state.settings.amoledMode}">🖤 AMOLED</button>
            </div>
        </div>

        <!-- DIALECT TOGGLE -->
        <div class="card">
            <h3 style="margin-bottom:4px">🗣️ شێوازی زمان</h3>
            <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
                سۆرانی — کتێبی کوردی ناوەڕاست · بادینی — کرمانجی بە لاتینی
            </p>
            <div class="dialect-toggle" role="group" aria-label="شێوازی زمان">
                <button class="dialect-btn ${isSorani ? 'active' : ''}"
                        onclick="setDialect('sorani')"
                        aria-pressed="${isSorani}"
                        style="${isSorani ? `background:${th.accent};box-shadow:0 2px 10px ${th.shadow}` : ''}">
                    📜 سۆرانی
                </button>
                <button class="dialect-btn ${!isSorani ? 'active' : ''}"
                        onclick="setDialect('badini')"
                        aria-pressed="${!isSorani}"
                        style="${!isSorani ? `background:${th.accent};box-shadow:0 2px 10px ${th.shadow}` : ''}">
                    🔤 بادینی (کرمانجی)
                </button>
            </div>
            <p style="margin-top:10px;font-size:11px;color:var(--text-muted)">
                ${isSorani
                    ? '📜 وشەکان بە کتێبی کوردی سۆرانی دەردەکەوێن'
                    : '🔤 وشەکان بە لاتینی کرمانجی (بادینی) دەردەکەوێن'}
            </p>
        </div>

        <!-- PROFILE -->
        <div class="card">
            <h3 style="margin-bottom:12px">👤 پروفایل</h3>
            <label for="nameInput" style="font-size:13px;color:var(--text-secondary);display:block;margin-bottom:6px">ناوی تۆ</label>
            <div style="display:flex;gap:8px">
                <input id="nameInput" class="input" value="${escAttr(state.user.name)}"
                       placeholder="ناوت بنووسە" maxlength="30"
                       autocorrect="off" autocapitalize="off">
                <button class="btn btn-primary" onclick="saveName()" aria-label="ناو خەزن بکە">✅</button>
            </div>
        </div>

        <!-- CURRENT LANGUAGE PACKAGE — visual card -->
        <div class="card lang-pkg-card" style="padding:0;margin-bottom:12px">
            <div class="lang-pkg-header" style="background:linear-gradient(${th.grad})">
                <div class="lang-pkg-icon">${lessons[state.settings.currentLanguage]?.icon || '🌍'}</div>
                <div class="lang-pkg-name">${escHtml(lessons[state.settings.currentLanguage]?.name || '')}</div>
                <div class="lang-pkg-stats">
                    ${lessons[state.settings.currentLanguage]?.topics.length || 0} تۆپیک ·
                    ${(lessons[state.settings.currentLanguage]?.topics.reduce((a,t)=>a+t.words.length,0)) || 0} وشە
                </div>
            </div>
            <div class="lang-pkg-body">
                <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">پاکێجی ئێستا</p>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                    <span class="victory-badge" style="background:${th.accent}18;color:${th.accent}">
                        ${th.badge} ${th.victory}
                    </span>
                </div>
                <button class="btn btn-sm" style="margin-top:10px;border:1.5px solid ${th.accent};color:${th.accent};background:transparent"
                        onclick="navigateTo('lessons')">گۆڕینی زمان</button>
            </div>
        </div>

        <!-- CLOUD ACCOUNT / SYNC -->
        <div class="card" id="cloudAccountCard">
            ${renderCloudAccountSection()}
        </div>

        <!-- DATA RESET -->
        <div class="card">
            <h3 style="margin-bottom:8px">🗑️ داتا</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
                ئەگەر داتاکەت دەیەوێت سڕیتەوە، ئەمە کلیک بکە. ئەم کارە گەڕاندنەوەی نییە.
            </p>
            <button class="btn btn-danger btn-sm" onclick="confirmReset()">🗑️ سڕینەوەی داتا</button>
        </div>`;
}

/** Renders the login/register form, or account info + sync status, for the settings page. */
function renderCloudAccountSection() {
    if (cloudSync.user) {
        return `
            <h3 style="margin-bottom:8px">☁️ هەژماری تۆ</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:4px">👤 ${escHtml(cloudSync.user.name)}</p>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">📧 ${escHtml(cloudSync.user.email)}</p>
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">
                ${cloudSync.lastSync ? '✅ داتاکەت هاوکاتە لەگەڵ هەژمارەکەت (XP، ستریک، گەوهەر)' : '⏳ چاوەڕوانی هاوکاتکردن...'}
            </p>
            <button class="btn btn-ghost btn-sm" onclick="cloudLogout()">🔒 دەرچوون لە هەژمار</button>
        `;
    }
    return `
        <h3 style="margin-bottom:4px">☁️ هەژماری کلاود</h3>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">
            بچۆرە ژوورەوە بۆ ئەوەی XP، ستریک و پێشکەوتنت لەسەر هەموو ئامێرەکانت پارێزراو بمێنێت.
        </p>
        <div id="cloudAuthTabs" style="display:flex;gap:6px;margin-bottom:10px">
            <button class="btn btn-sm ${cloudSync.mode==='login'?'btn-primary':''}" onclick="cloudSetMode('login')">چوونەژوورەوە</button>
            <button class="btn btn-sm ${cloudSync.mode==='register'?'btn-primary':''}" onclick="cloudSetMode('register')">هەژماری نوێ</button>
        </div>
        ${cloudSync.mode === 'register' ? `
            <input id="cloudName" class="input" placeholder="ناوی تۆ" style="margin-bottom:8px">
        ` : ''}
        <input id="cloudEmail" type="email" class="input" placeholder="ئیمەیل" style="margin-bottom:8px">
        <input id="cloudPassword" type="password" class="input" placeholder="پاسورد" style="margin-bottom:8px">
        <button class="btn btn-primary btn-sm" onclick="${cloudSync.mode==='register' ? 'cloudRegister()' : 'cloudLogin()'}">
            ${cloudSync.mode==='register' ? '✅ دروستکردنی هەژمار' : '🔓 چوونەژوورەوە'}
        </button>
        <p id="cloudAuthErr" style="color:#EF4444;font-size:12px;margin-top:8px;min-height:16px"></p>
    `;
}

function setDialect(d) {
    state.settings.dialect = d;
    lsSet('zm_dialect', d);
    toast(d === 'sorani' ? '📜 سۆرانی چالاک کرا' : '🔤 بادینی چالاک کرا');
    renderSettings(document.getElementById('mainContent'));
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

// ===== ONBOARDING CAROUSEL =====
// Shows a full-screen multi-step first-launch flow.
// Returns true if onboarding was shown (caller should NOT navigate home).

const OB_STEPS = [
    { id: 'welcome',  title: 'بەخێربێیت بۆ Ziman 🌍', sub: 'فێربوونی زمانی جیهان — شێوازی کارلێکەر' },
    { id: 'language', title: 'کام زمانی تر فێری بیت؟', sub: 'یەکێک هەڵبژێرە — دواتر دەیگۆڕیت' },
    { id: 'dialect',  title: 'کام شێوازی کوردی؟',       sub: 'ئەمە کاریگەری لەسەر نووسینی وشەکان دەکات' },
    { id: 'name',     title: 'ناوت چییە؟',              sub: 'مامۆستاکەت پێیت دەوترێت' },
];

function showOnboarding() {
    if (lsGet('zm_onboarded') === 'true') return false;

    let step     = 0;
    let selLang  = lsGet('zm_lang', 'en-ku');
    let selDial  = lsGet('zm_dialect', 'sorani');
    let userName = lsGet('zm_name', '');
    if (userName === 'فێرخواز') userName = ''; // treat default as blank

    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.className = 'ob-overlay';
    document.body.appendChild(overlay);

    // Small delay so CSS transition fires
    requestAnimationFrame(() => overlay.classList.add('ob-visible'));

    function render(s) {
        const info = OB_STEPS[s];
        const isLast = s === OB_STEPS.length - 1;
        const dots = OB_STEPS.map((_, i) =>
            `<span class="ob-dot${i === s ? ' active' : i < s ? ' done' : ''}"></span>`
        ).join('');

        let body = '';
        if (s === 0) {
            body = `
            <div class="ob-welcome-wrap">
                <div class="ob-globe">🌍</div>
                <p class="ob-brand">Ziman</p>
                <div class="ob-features">
                    <div class="ob-feat"><span>🤖</span><span>مامۆستای AI — ستریم + دەنگ</span></div>
                    <div class="ob-feat"><span>🃏</span><span>فلاشکارت · کویز · قسەکردن</span></div>
                    <div class="ob-feat"><span>📜</span><span>سۆرانی و بادینی هەردووک</span></div>
                    <div class="ob-feat"><span>🏆</span><span>دەستکەوتەکان و پێشبرکێی جیهانی</span></div>
                </div>
            </div>`;
        } else if (s === 1) {
            const keys = Object.keys(lessons);
            body = `<div class="ob-lang-grid">
                ${keys.map(k => `
                <button class="ob-lang-btn${k === selLang ? ' sel' : ''}"
                        onclick="window._obSelLang('${escAttr(k)}')"
                        aria-pressed="${k === selLang}">
                    <span class="ob-lang-flag">${lessons[k].icon}</span>
                    <span class="ob-lang-nm" dir="auto">${escHtml(lessons[k].name)}</span>
                </button>`).join('')}
            </div>`;
        } else if (s === 2) {
            const th = LANG_THEMES[selLang] || LANG_THEMES['en-ku'];
            body = `<div class="ob-dialect-row">
                <button class="ob-dial-card${selDial === 'sorani' ? ' sel' : ''}"
                        onclick="window._obSelDial('sorani')"
                        style="${selDial === 'sorani' ? `border-color:${th.accent};box-shadow:0 0 0 3px ${th.shadow}` : ''}">
                    <div class="ob-dial-icon">📜</div>
                    <div class="ob-dial-name">سۆرانی</div>
                    <div class="ob-dial-en">Central Kurdish</div>
                    <div class="ob-dial-sample ku-text">کوردستان · خۆشویستی · سڵاو</div>
                    <div class="ob-dial-note">کتێبی عەرەبی · ناوەڕاست و باشووری کوردستان</div>
                </button>
                <button class="ob-dial-card${selDial === 'badini' ? ' sel' : ''}"
                        onclick="window._obSelDial('badini')"
                        style="${selDial === 'badini' ? `border-color:${th.accent};box-shadow:0 0 0 3px ${th.shadow}` : ''}">
                    <div class="ob-dial-icon">🔤</div>
                    <div class="ob-dial-name">بادینی</div>
                    <div class="ob-dial-en">Northern Kurdish (Kurmanji)</div>
                    <div class="ob-dial-sample">Kurdistan · Silav · Xweşî</div>
                    <div class="ob-dial-note">لاتین · باکووری کوردستان</div>
                </button>
            </div>
            <p class="ob-note">دواتر لە ڕێکخستن دەتوانیت بیگۆڕیت</p>`;
        } else if (s === 3) {
            const th = LANG_THEMES[selLang] || LANG_THEMES['en-ku'];
            body = `
            <div class="ob-name-wrap">
                <div class="ob-avatar" style="background:linear-gradient(${th.grad})">
                    ${userName ? userName.charAt(0).toUpperCase() : '😊'}
                </div>
                <input id="obNameInp" class="input ob-name-input"
                       type="text" placeholder="ناوت بنووسە…" maxlength="30"
                       value="${escAttr(userName)}"
                       autocorrect="off" autocapitalize="off"
                       oninput="window._obName(this.value)"
                       aria-label="ناوت">
            </div>
            <div class="ob-summary">
                <div class="ob-sum-row">
                    <span>🌍 زمان</span>
                    <strong>${lessons[selLang].icon} ${escHtml(lessons[selLang].name)}</strong>
                </div>
                <div class="ob-sum-row">
                    <span>🗣️ شێواز</span>
                    <strong>${selDial === 'sorani' ? '📜 سۆرانی' : '🔤 بادینی'}</strong>
                </div>
            </div>`;
        }

        overlay.innerHTML = `
        <div class="ob-card ob-card-enter">
            <div class="ob-dots" role="progressbar" aria-valuenow="${s+1}" aria-valuemax="${OB_STEPS.length}">
                ${dots}
            </div>
            <h2 class="ob-title">${escHtml(info.title)}</h2>
            <p class="ob-sub">${escHtml(info.sub)}</p>
            <div class="ob-body">${body}</div>
            <div class="ob-actions">
                ${s > 0
                    ? `<button class="btn ob-back-btn" onclick="window._obBack()">← گەڕانەوە</button>`
                    : `<button class="btn ob-skip-btn" onclick="window._obFinish()">تێپەڕکردن</button>`}
                <button class="btn btn-primary ob-next-btn" onclick="window._obNext()">
                    ${isLast ? '🚀 دەستپێبکە!' : 'دواتر →'}
                </button>
            </div>
        </div>`;

        // Auto-focus name input on step 3
        if (s === 3) _trackTimeout(setTimeout(() => document.getElementById('obNameInp')?.focus(), 180));
    }

    // Expose handlers — closures keep selLang/selDial/userName in scope
    window._obSelLang = k => { selLang = k; render(step); };
    window._obSelDial = d => { selDial = d; render(step); };
    window._obName    = v => { userName = v; };
    window._obBack    = ()  => { step = Math.max(0, step - 1); render(step); };
    window._obNext    = ()  => {
        if (step < OB_STEPS.length - 1) { step++; render(step); }
        else window._obFinish();
    };
    window._obFinish  = ()  => {
        const finalName = (userName.trim() || 'فێرخواز');
        // Commit all choices
        state.user.name              = finalName;
        state.settings.currentLanguage = selLang;
        state.settings.dialect         = selDial;
        lsSet('zm_name',       finalName);
        lsSet('zm_lang',       selLang);
        lsSet('zm_dialect',    selDial);
        lsSet('zm_onboarded',  'true');
        save();

        // Animate out then boot the app
        overlay.classList.add('ob-exit');
        _trackTimeout(setTimeout(() => {
            overlay.remove();
            // Clean up global handlers
            delete window._obSelLang; delete window._obSelDial;
            delete window._obName;    delete window._obBack;
            delete window._obNext;    delete window._obFinish;
            updateUI();
            applyLangAccent();
            navigateTo('home');
        }, 420));
    };

    render(step);
    return true;
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

    // Boot sequence — show onboarding on first launch; otherwise go straight home
    checkStreak();
    updateUI();
    if (!showOnboarding()) {
        applyLangAccent();
        navigateTo('home');
    }
    initCloudSync();
});
