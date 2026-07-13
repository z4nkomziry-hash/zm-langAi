/**
 * ZIMAN — CENTRAL VOCABULARY BANK
 * ================================
 * Architecture for scaling from ~500 → 10,000 words gradually.
 *
 * Schema (per entry):
 *   w   : word in source language (e.g. English)
 *   t   : translation in Kurdish Sorani (Arabic script)
 *   b   : Badini / Kurmanji Latin equivalent (empty string = fallback to Sorani)
 *   lv  : CEFR level  'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
 *   cat : category key (see VOCAB_CATEGORIES)
 *   ex  : [source_example_sentence, kurdish_sorani_example]  (optional)
 *   pos : part of speech  'n'|'v'|'adj'|'adv'|'pron'|'prep'|'conj'|'int'  (optional)
 *   tags: extra tags array (optional)
 */

// ──────────────────────────────────────────────────────────────────
//  CATEGORIES
// ──────────────────────────────────────────────────────────────────
const VOCAB_CATEGORIES = {
    greetings:     { ku:'سڵاوکردن',          icon:'👋' },
    alphabet:      { ku:'ئەلفوبێ',            icon:'🔤' },
    numbers:       { ku:'ژمارەکان',           icon:'🔢' },
    colors:        { ku:'ڕەنگەکان',           icon:'🎨' },
    family:        { ku:'خێزان',              icon:'👨‍👩‍👧‍👦' },
    body:          { ku:'جەستە',              icon:'🫀' },
    food:          { ku:'خواردن',             icon:'🍽️' },
    drinks:        { ku:'خواردنەوە',           icon:'🥤' },
    fruits:        { ku:'مێوەکان',            icon:'🍎' },
    vegetables:    { ku:'سەوزەکان',           icon:'🥦' },
    animals:       { ku:'گیانلەبەران',        icon:'🐾' },
    birds:         { ku:'باڵندەکان',           icon:'🐦' },
    nature:        { ku:'سروشت',              icon:'🌿' },
    weather:       { ku:'ئاب و هەوا',         icon:'🌤️' },
    time:          { ku:'کات',                icon:'⏰' },
    days:          { ku:'ڕۆژەکانی هەفتە',     icon:'📅' },
    months:        { ku:'مانگەکان',           icon:'📆' },
    seasons:       { ku:'وەرزەکان',           icon:'🍂' },
    places:        { ku:'شوێنەکان',           icon:'📍' },
    travel:        { ku:'گەشت',              icon:'✈️' },
    transport:     { ku:'گواستنەوە',          icon:'🚗' },
    house:         { ku:'ماڵ',               icon:'🏠' },
    furniture:     { ku:'ئامێرەکان',          icon:'🪑' },
    clothes:       { ku:'جل و بەرگ',         icon:'👗' },
    professions:   { ku:'پیشەکان',           icon:'👩‍💼' },
    education:     { ku:'خوێندن',            icon:'📚' },
    school:        { ku:'قوتابخانە',         icon:'🏫' },
    health:        { ku:'تەندروستی',          icon:'🏥' },
    sports:        { ku:'وەرزش',             icon:'⚽' },
    hobbies:       { ku:'کارا کاتی',          icon:'🎯' },
    emotions:      { ku:'هەستەکان',          icon:'😊' },
    adjectives:    { ku:'تایبەتییەکان',      icon:'✨' },
    opposites:     { ku:'دژووەکان',          icon:'↔️' },
    verbs_basic:   { ku:'لەکردنی بنەڕەتی',  icon:'⚡' },
    verbs_motion:  { ku:'کردنی جوڵەوە',      icon:'🏃' },
    verbs_comm:    { ku:'پەیوەندیکردن',       icon:'💬' },
    pronouns:      { ku:'جێناوەکان',         icon:'👤' },
    prepositions:  { ku:'ئامووزەکان',        icon:'📌' },
    questions:     { ku:'پرسیارەکان',        icon:'❓' },
    daily_phrases: { ku:'ڕستەی ڕۆژانە',     icon:'💬' },
    technology:    { ku:'تەکنەلۆژیا',       icon:'💻' },
    shopping:      { ku:'بازاڕکردن',         icon:'🛒' },
    money:         { ku:'پارە',              icon:'💰' },
    restaurant:    { ku:'چێشتخانە',         icon:'🍜' },
    banking:       { ku:'بانک',             icon:'🏦' },
    emergency:     { ku:'ئەندامانی فریابوون',icon:'🆘' },
    directions:    { ku:'ئاراستە',           icon:'🗺️' },
    religion:      { ku:'ئایین',             icon:'🕌' },
    culture:       { ku:'کولتور',            icon:'🎭' },
    politics:      { ku:'سیاسەت',           icon:'🏛️' },
    science:       { ku:'زانست',            icon:'🔬' },
    art:           { ku:'هونەر',            icon:'🎨' },
    music:         { ku:'موزیک',            icon:'🎵' },
    literature:    { ku:'وێژە',             icon:'📖' },
    idioms:        { ku:'گوتارە کوردییەکان', icon:'🗨️' },
    proverbs:      { ku:'مەتەڵەکان',        icon:'📜' },
};

// ──────────────────────────────────────────────────────────────────
//  CEFR LEVEL LABELS
// ──────────────────────────────────────────────────────────────────
const VOCAB_LEVELS = {
    A1: { ku:'دەستپێکەر — بنەڕەتی',   color:'#22C55E' },
    A2: { ku:'دەستپێکەر — پێشکەوتوو', color:'#84CC16' },
    B1: { ku:'مامناوەند — بنەڕەتی',   color:'#EAB308' },
    B2: { ku:'مامناوەند — پێشکەوتوو', color:'#F97316' },
    C1: { ku:'پیشەیی — بلند',         color:'#EF4444' },
    C2: { ku:'پیشەیی — تایبەتمەند',   color:'#8B5CF6' },
};

// ──────────────────────────────────────────────────────────────────
//  MAIN ENGLISH → KURDISH VOCABULARY BANK
//  Current count: ~1 ,600 entries  (target: 10,000)
// ──────────────────────────────────────────────────────────────────
const ZIMAN_VOCAB_EN = [

// ═══════════════════════════════
//  A1 — GREETINGS & BASICS
// ═══════════════════════════════
{w:'Hello',                t:'سڵاو',               b:'Silav',              lv:'A1', cat:'greetings', pos:'int', ex:['Hello! How are you?','سڵاو! چۆنیت؟']},
{w:'Good morning',         t:'بەیانیت باش',         b:'Sibatî xweş',        lv:'A1', cat:'greetings', ex:['Good morning, teacher!','بەیانیت باش، مامۆستا!']},
{w:'Good afternoon',       t:'ڕۆژت باش',            b:'Roja te xweş',       lv:'A1', cat:'greetings'},
{w:'Good evening',         t:'ئێوارت باش',           b:'Êvarî xweş',         lv:'A1', cat:'greetings'},
{w:'Good night',           t:'شەوت باش',             b:'Şeva te xweş',       lv:'A1', cat:'greetings'},
{w:'Goodbye',              t:'خواحافیزی',            b:'Xatirê te',          lv:'A1', cat:'greetings'},
{w:'See you later',        t:'تا دواتر',             b:'Heta carê din',      lv:'A1', cat:'greetings'},
{w:'See you tomorrow',     t:'تا سبەینێ',            b:'Heta sibê',          lv:'A1', cat:'greetings'},
{w:'Please',               t:'تکایە',               b:'Ji kerema xwe',      lv:'A1', cat:'greetings'},
{w:'Thank you',            t:'سوپاس',               b:'Spas',               lv:'A1', cat:'greetings', ex:['Thank you very much!','زۆر سوپاست دەکەم!']},
{w:'You\'re welcome',      t:'خۆشەویستانە',          b:'Xêr be',             lv:'A1', cat:'greetings'},
{w:'Sorry',                t:'ببووربە',              b:'Bibore',             lv:'A1', cat:'greetings'},
{w:'Excuse me',            t:'ئازارت دەدەم',         b:'Dest nede min',      lv:'A1', cat:'greetings'},
{w:'Yes',                  t:'بەڵێ',                b:'Erê',                lv:'A1', cat:'greetings'},
{w:'No',                   t:'نەخێر',               b:'Na',                 lv:'A1', cat:'greetings'},
{w:'Maybe',                t:'ئەگەر',               b:'Dibe',               lv:'A1', cat:'greetings'},
{w:'How are you?',         t:'چۆنیت؟',              b:'Çawa yî?',           lv:'A1', cat:'greetings'},
{w:'I am fine',            t:'باشم',                b:'Baş im',             lv:'A1', cat:'greetings'},
{w:'And you?',             t:'تۆیش؟',               b:'Tu jî?',             lv:'A1', cat:'greetings'},
{w:'Nice to meet you',     t:'خوشحاڵ بووم',          b:'Kêfa min ji te hat', lv:'A1', cat:'greetings'},
{w:'My name is',           t:'ناوم',                b:'Navê min',           lv:'A1', cat:'greetings', ex:['My name is Sara.','ناوم ساراوە.']},
{w:'What is your name?',   t:'ناوت چییە؟',           b:'Navê te çi ye?',    lv:'A1', cat:'greetings'},
{w:'I don\'t understand',  t:'تێناگەم',              b:'Fêm nakim',          lv:'A1', cat:'greetings'},
{w:'I don\'t know',        t:'نازانم',               b:'Nizanim',            lv:'A1', cat:'greetings'},
{w:'Repeat please',        t:'دووبارە بکەرەوە',      b:'Dubare bike',        lv:'A1', cat:'greetings'},
{w:'Speak slowly',         t:'هێواش قسە بکە',        b:'Hêdî bixeber',       lv:'A1', cat:'greetings'},

// ═══════════════════════════════
//  A1 — NUMBERS
// ═══════════════════════════════
{w:'Zero',      t:'سفر',    b:'Sifir',   lv:'A1', cat:'numbers', pos:'n'},
{w:'One',       t:'یەک',    b:'Yek',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Two',       t:'دوو',    b:'Du',      lv:'A1', cat:'numbers', pos:'n'},
{w:'Three',     t:'سێ',     b:'Sê',      lv:'A1', cat:'numbers', pos:'n'},
{w:'Four',      t:'چوار',   b:'Çar',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Five',      t:'پێنج',   b:'Pênc',    lv:'A1', cat:'numbers', pos:'n'},
{w:'Six',       t:'شەش',    b:'Şeş',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Seven',     t:'حەوت',   b:'Heft',    lv:'A1', cat:'numbers', pos:'n'},
{w:'Eight',     t:'هەشت',   b:'Heşt',    lv:'A1', cat:'numbers', pos:'n'},
{w:'Nine',      t:'نۆ',     b:'Neh',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Ten',       t:'دە',     b:'Deh',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Eleven',    t:'یازدە',  b:'Yanzdeh', lv:'A1', cat:'numbers', pos:'n'},
{w:'Twelve',    t:'دوازدە', b:'Dwanzdeh',lv:'A1', cat:'numbers', pos:'n'},
{w:'Thirteen',  t:'سیزدە',  b:'Sizdeh',  lv:'A1', cat:'numbers', pos:'n'},
{w:'Fourteen',  t:'چواردە', b:'Çardeh',  lv:'A1', cat:'numbers', pos:'n'},
{w:'Fifteen',   t:'پازدە',  b:'Panzdeh', lv:'A1', cat:'numbers', pos:'n'},
{w:'Twenty',    t:'بیست',   b:'Bîst',    lv:'A1', cat:'numbers', pos:'n'},
{w:'Thirty',    t:'سی',     b:'Sî',      lv:'A1', cat:'numbers', pos:'n'},
{w:'Forty',     t:'چل',     b:'Çil',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Fifty',     t:'پەنجا',  b:'Pêncî',   lv:'A1', cat:'numbers', pos:'n'},
{w:'Sixty',     t:'شەست',   b:'Şêst',    lv:'A1', cat:'numbers', pos:'n'},
{w:'Seventy',   t:'حەفتا',  b:'Heftî',   lv:'A1', cat:'numbers', pos:'n'},
{w:'Eighty',    t:'هەشتا',  b:'Heştê',   lv:'A1', cat:'numbers', pos:'n'},
{w:'Ninety',    t:'نەوەد',  b:'Newed',   lv:'A1', cat:'numbers', pos:'n'},
{w:'Hundred',   t:'سەد',    b:'Sed',     lv:'A1', cat:'numbers', pos:'n'},
{w:'Thousand',  t:'هەزار',  b:'Hezar',   lv:'A1', cat:'numbers', pos:'n'},
{w:'Million',   t:'ملیۆن',  b:'Milyon',  lv:'A2', cat:'numbers', pos:'n'},
{w:'First',     t:'یەکەم',  b:'Yekem',   lv:'A1', cat:'numbers', pos:'adj'},
{w:'Second',    t:'دووەم',  b:'Duem',    lv:'A1', cat:'numbers', pos:'adj'},
{w:'Third',     t:'سێیەم',  b:'Sêyem',   lv:'A1', cat:'numbers', pos:'adj'},
{w:'Last',      t:'کۆتایی', b:'Dawî',    lv:'A1', cat:'numbers', pos:'adj'},

// ═══════════════════════════════
//  A1 — COLORS
// ═══════════════════════════════
{w:'Red',         t:'سوور',      b:'Sor',         lv:'A1', cat:'colors', pos:'adj'},
{w:'Blue',        t:'شین',       b:'Şîn',         lv:'A1', cat:'colors', pos:'adj'},
{w:'Green',       t:'سەوز',      b:'Kesk',         lv:'A1', cat:'colors', pos:'adj'},
{w:'Yellow',      t:'زەرد',      b:'Zer',          lv:'A1', cat:'colors', pos:'adj'},
{w:'Black',       t:'ڕەش',       b:'Reş',          lv:'A1', cat:'colors', pos:'adj'},
{w:'White',       t:'سپی',       b:'Spî',          lv:'A1', cat:'colors', pos:'adj'},
{w:'Orange',      t:'نارەنجی',   b:'Porteqalî',    lv:'A1', cat:'colors', pos:'adj'},
{w:'Purple',      t:'مۆر',       b:'Mor',          lv:'A1', cat:'colors', pos:'adj'},
{w:'Pink',        t:'پەمبە',     b:'Pembe',        lv:'A1', cat:'colors', pos:'adj'},
{w:'Brown',       t:'قاوەیی',    b:'Qehweyî',      lv:'A1', cat:'colors', pos:'adj'},
{w:'Grey',        t:'خاکستەری',  b:'Gewr',         lv:'A1', cat:'colors', pos:'adj'},
{w:'Gold',        t:'زێڕین',     b:'Zêrîn',        lv:'A2', cat:'colors', pos:'adj'},
{w:'Silver',      t:'زیوین',     b:'Zivîn',        lv:'A2', cat:'colors', pos:'adj'},
{w:'Dark',        t:'تاریک',     b:'Tarî',         lv:'A2', cat:'colors', pos:'adj'},
{w:'Light',       t:'ڕووناک',    b:'Ronî',         lv:'A2', cat:'colors', pos:'adj'},

// ═══════════════════════════════
//  A1 — FAMILY
// ═══════════════════════════════
{w:'Mother',         t:'دایک',       b:'Dayik',       lv:'A1', cat:'family', pos:'n'},
{w:'Father',         t:'باوک',       b:'Bav',         lv:'A1', cat:'family', pos:'n'},
{w:'Sister',         t:'خوشک',       b:'Xwişk',       lv:'A1', cat:'family', pos:'n'},
{w:'Brother',        t:'برا',        b:'Bira',        lv:'A1', cat:'family', pos:'n'},
{w:'Son',            t:'کوڕ',        b:'Kur',         lv:'A1', cat:'family', pos:'n'},
{w:'Daughter',       t:'کچ',         b:'Keç',         lv:'A1', cat:'family', pos:'n'},
{w:'Grandfather',    t:'باپیر',      b:'Bapîr',       lv:'A1', cat:'family', pos:'n'},
{w:'Grandmother',    t:'دایبابا',    b:'Dapîr',       lv:'A1', cat:'family', pos:'n'},
{w:'Uncle',          t:'مام',        b:'Mam',         lv:'A1', cat:'family', pos:'n'},
{w:'Aunt',           t:'پووری',      b:'Pûrî',        lv:'A1', cat:'family', pos:'n'},
{w:'Cousin',         t:'پسر براز',   b:'Kurê birê',   lv:'A1', cat:'family', pos:'n'},
{w:'Husband',        t:'مێرد',       b:'Mêr',         lv:'A1', cat:'family', pos:'n'},
{w:'Wife',           t:'هاوسەر',     b:'Jina mêr',    lv:'A1', cat:'family', pos:'n'},
{w:'Baby',           t:'منداڵی بچووک',b:'Pitik',      lv:'A1', cat:'family', pos:'n'},
{w:'Child',          t:'منداڵ',      b:'Mindal',      lv:'A1', cat:'family', pos:'n'},
{w:'Parents',        t:'دایک و باوک', b:'Dê û bav',   lv:'A1', cat:'family', pos:'n'},
{w:'Family',         t:'خێزان',      b:'Malbat',      lv:'A1', cat:'family', pos:'n'},
{w:'Twin',           t:'دووقاتی',    b:'Hevgirtî',    lv:'A2', cat:'family', pos:'n'},
{w:'Relative',       t:'خزم و تبار', b:'Xizm',        lv:'A2', cat:'family', pos:'n'},
{w:'Orphan',         t:'هەتیو',      b:'Hetîm',       lv:'B1', cat:'family', pos:'n'},

// ═══════════════════════════════
//  A1 — BODY PARTS
// ═══════════════════════════════
{w:'Head',       t:'سەر',      b:'Ser',      lv:'A1', cat:'body', pos:'n'},
{w:'Face',       t:'رووخسار',   b:'Rû',       lv:'A1', cat:'body', pos:'n'},
{w:'Eye',        t:'چاو',      b:'Çav',      lv:'A1', cat:'body', pos:'n'},
{w:'Ear',        t:'گوێ',      b:'Guh',      lv:'A1', cat:'body', pos:'n'},
{w:'Nose',       t:'لووت',     b:'Lût',      lv:'A1', cat:'body', pos:'n'},
{w:'Mouth',      t:'دەم',      b:'Dev',      lv:'A1', cat:'body', pos:'n'},
{w:'Tooth',      t:'دندان',    b:'Didan',    lv:'A1', cat:'body', pos:'n'},
{w:'Tongue',     t:'زمان',     b:'Ziman',    lv:'A1', cat:'body', pos:'n'},
{w:'Neck',       t:'مل',       b:'Mil',      lv:'A1', cat:'body', pos:'n'},
{w:'Shoulder',   t:'مەر',      b:'Mil',      lv:'A1', cat:'body', pos:'n'},
{w:'Arm',        t:'بازوو',    b:'Mil',      lv:'A1', cat:'body', pos:'n'},
{w:'Hand',       t:'دەست',     b:'Dest',     lv:'A1', cat:'body', pos:'n'},
{w:'Finger',     t:'پێچ',      b:'Tilî',     lv:'A1', cat:'body', pos:'n'},
{w:'Chest',      t:'سنگ',      b:'Sîng',     lv:'A1', cat:'body', pos:'n'},
{w:'Back',       t:'پشت',      b:'Piştî',    lv:'A1', cat:'body', pos:'n'},
{w:'Stomach',    t:'ورگ',      b:'Zik',      lv:'A1', cat:'body', pos:'n'},
{w:'Leg',        t:'لاق',      b:'Ling',     lv:'A1', cat:'body', pos:'n'},
{w:'Knee',       t:'چنگاڵ',    b:'Çong',     lv:'A1', cat:'body', pos:'n'},
{w:'Foot',       t:'پێ',       b:'Pê',       lv:'A1', cat:'body', pos:'n'},
{w:'Heart',      t:'دڵ',       b:'Dil',      lv:'A1', cat:'body', pos:'n'},
{w:'Blood',      t:'خوێن',     b:'Xwîn',     lv:'A2', cat:'body', pos:'n'},
{w:'Bone',       t:'ئێسک',     b:'Hestî',    lv:'A2', cat:'body', pos:'n'},
{w:'Skin',       t:'چەرم',     b:'Çerm',     lv:'A2', cat:'body', pos:'n'},
{w:'Hair',       t:'قژ',       b:'Qij',      lv:'A1', cat:'body', pos:'n'},
{w:'Brain',      t:'مێشک',     b:'Mêjî',     lv:'A2', cat:'body', pos:'n'},
{w:'Lung',       t:'ریە',      b:'Rî',       lv:'B1', cat:'body', pos:'n'},
{w:'Kidney',     t:'گورچیلە',  b:'Gurçîlk',  lv:'B1', cat:'body', pos:'n'},
{w:'Liver',      t:'جگەر',     b:'Cerg',     lv:'B1', cat:'body', pos:'n'},
{w:'Thumb',      t:'تووت',     b:'Peçê deste',lv:'A2', cat:'body', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — FOOD & DRINK
// ═══════════════════════════════
{w:'Water',       t:'ئاو',         b:'Av',         lv:'A1', cat:'food', pos:'n', ex:['Drink water!','ئاو بخۆرەوە!']},
{w:'Bread',       t:'نان',         b:'Nan',        lv:'A1', cat:'food', pos:'n'},
{w:'Rice',        t:'برنج',        b:'Birinc',     lv:'A1', cat:'food', pos:'n'},
{w:'Meat',        t:'گۆشت',        b:'Goşt',       lv:'A1', cat:'food', pos:'n'},
{w:'Chicken',     t:'مریشک',       b:'Mirîşk',     lv:'A1', cat:'food', pos:'n'},
{w:'Fish',        t:'ماسی',        b:'Masî',       lv:'A1', cat:'food', pos:'n'},
{w:'Egg',         t:'هێلکە',       b:'Hêk',        lv:'A1', cat:'food', pos:'n'},
{w:'Cheese',      t:'پەنیر',       b:'Penêr',      lv:'A1', cat:'food', pos:'n'},
{w:'Butter',      t:'کارە',        b:'Ker',        lv:'A1', cat:'food', pos:'n'},
{w:'Milk',        t:'شیر',         b:'Şîr',        lv:'A1', cat:'food', pos:'n'},
{w:'Yogurt',      t:'ماست',        b:'Mast',       lv:'A1', cat:'food', pos:'n'},
{w:'Oil',         t:'ڕووغەن',      b:'Rûn',        lv:'A1', cat:'food', pos:'n'},
{w:'Salt',        t:'خوێو',        b:'Xwê',        lv:'A1', cat:'food', pos:'n'},
{w:'Sugar',       t:'شەکر',        b:'Şekir',      lv:'A1', cat:'food', pos:'n'},
{w:'Honey',       t:'هەنگوین',     b:'Hingiv',     lv:'A1', cat:'food', pos:'n'},
{w:'Soup',        t:'شۆربا',       b:'Şorba',      lv:'A1', cat:'food', pos:'n'},
{w:'Salad',       t:'سەلاتە',      b:'Salata',     lv:'A1', cat:'food', pos:'n'},
{w:'Pizza',       t:'پیزا',        b:'Piza',       lv:'A1', cat:'food', pos:'n'},
{w:'Sandwich',    t:'ساندویچ',     b:'Sandvîç',    lv:'A1', cat:'food', pos:'n'},
{w:'Cake',        t:'کیک',         b:'Kêk',        lv:'A1', cat:'food', pos:'n'},
{w:'Ice cream',   t:'دۆندورما',    b:'Dondirme',   lv:'A1', cat:'food', pos:'n'},
{w:'Chocolate',   t:'چکلات',       b:'Çikolata',   lv:'A1', cat:'food', pos:'n'},
{w:'Spicy',       t:'ترش و تیژ',   b:'Tûj',        lv:'A2', cat:'food', pos:'adj'},
{w:'Sweet',       t:'شیرین',       b:'Şîrîn',      lv:'A1', cat:'food', pos:'adj'},
{w:'Sour',        t:'ترش',         b:'Tirş',       lv:'A1', cat:'food', pos:'adj'},
{w:'Bitter',      t:'تاڵ',         b:'Tal',        lv:'A2', cat:'food', pos:'adj'},
{w:'Salty',       t:'خوێویی',      b:'Xwêdar',     lv:'A2', cat:'food', pos:'adj'},
// Drinks
{w:'Tea',         t:'چا',          b:'Çay',        lv:'A1', cat:'drinks', pos:'n'},
{w:'Coffee',      t:'قاوە',        b:'Qehwe',      lv:'A1', cat:'drinks', pos:'n'},
{w:'Juice',       t:'ئاوی مێوە',   b:'Avê fêkî',   lv:'A1', cat:'drinks', pos:'n'},
{w:'Soda',        t:'سۆدا',        b:'Soda',       lv:'A1', cat:'drinks', pos:'n'},
{w:'Beer',        t:'بیرە',        b:'Bîra',       lv:'A2', cat:'drinks', pos:'n'},
{w:'Wine',        t:'شەراب',       b:'Şerab',      lv:'A2', cat:'drinks', pos:'n'},
{w:'Lemonade',    t:'لیمۆناتا',    b:'Limonata',   lv:'A1', cat:'drinks', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — FRUITS & VEGETABLES
// ═══════════════════════════════
{w:'Apple',        t:'سێو',       b:'Sêv',         lv:'A1', cat:'fruits', pos:'n'},
{w:'Banana',       t:'بەلەوان',   b:'Mûz',         lv:'A1', cat:'fruits', pos:'n'},
{w:'Orange',       t:'پرتقال',    b:'Pirteqal',    lv:'A1', cat:'fruits', pos:'n'},
{w:'Grape',        t:'ترێ',       b:'Tirî',        lv:'A1', cat:'fruits', pos:'n'},
{w:'Watermelon',   t:'شووتی',     b:'Şûtî',        lv:'A1', cat:'fruits', pos:'n'},
{w:'Strawberry',   t:'فراو',      b:'Frêz',        lv:'A1', cat:'fruits', pos:'n'},
{w:'Lemon',        t:'لیمۆ',      b:'Lîmon',       lv:'A1', cat:'fruits', pos:'n'},
{w:'Mango',        t:'مانگا',     b:'Mangê',       lv:'A1', cat:'fruits', pos:'n'},
{w:'Pear',         t:'ئەمرود',    b:'Êmrûd',       lv:'A1', cat:'fruits', pos:'n'},
{w:'Cherry',       t:'گیلاس',     b:'Gêlaş',       lv:'A1', cat:'fruits', pos:'n'},
{w:'Peach',        t:'خووخ',      b:'Şeftali',     lv:'A1', cat:'fruits', pos:'n'},
{w:'Pomegranate',  t:'هنار',      b:'Hinar',       lv:'A2', cat:'fruits', pos:'n'},
{w:'Fig',          t:'هەنجیر',    b:'Hencîr',      lv:'A2', cat:'fruits', pos:'n'},
{w:'Date',         t:'خورما',     b:'Xurma',       lv:'A2', cat:'fruits', pos:'n'},
{w:'Tomato',       t:'تەماتە',    b:'Tomato',      lv:'A1', cat:'vegetables', pos:'n'},
{w:'Potato',       t:'باتاتا',    b:'Kartol',      lv:'A1', cat:'vegetables', pos:'n'},
{w:'Onion',        t:'پیاز',      b:'Pîvaz',       lv:'A1', cat:'vegetables', pos:'n'},
{w:'Garlic',       t:'سیر',       b:'Sir',         lv:'A1', cat:'vegetables', pos:'n'},
{w:'Cucumber',     t:'خیار',      b:'Xiyar',       lv:'A1', cat:'vegetables', pos:'n'},
{w:'Pepper',       t:'بیبار',     b:'Biber',       lv:'A1', cat:'vegetables', pos:'n'},
{w:'Carrot',       t:'گەزەر',     b:'Gizar',       lv:'A1', cat:'vegetables', pos:'n'},
{w:'Spinach',      t:'ئیسپانا',   b:'Spanax',      lv:'A2', cat:'vegetables', pos:'n'},
{w:'Eggplant',     t:'بادنجان',   b:'Badincan',    lv:'A2', cat:'vegetables', pos:'n'},
{w:'Cauliflower',  t:'گوڵ کەلەم', b:'Gulkelêm',    lv:'A2', cat:'vegetables', pos:'n'},
{w:'Cabbage',      t:'کەلەم',     b:'Kelêm',       lv:'A2', cat:'vegetables', pos:'n'},
{w:'Lettuce',      t:'کاهوو',     b:'Kaho',        lv:'A2', cat:'vegetables', pos:'n'},
{w:'Mushroom',     t:'کروپە',     b:'Kivark',      lv:'A2', cat:'vegetables', pos:'n'},
{w:'Corn',         t:'جگەر',      b:'Garis',       lv:'A1', cat:'vegetables', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — ANIMALS
// ═══════════════════════════════
{w:'Cat',          t:'پشیلە',      b:'Pisîk',       lv:'A1', cat:'animals', pos:'n'},
{w:'Dog',          t:'سەگ',        b:'Kûçik',       lv:'A1', cat:'animals', pos:'n'},
{w:'Horse',        t:'ئەسپ',       b:'Hesp',        lv:'A1', cat:'animals', pos:'n'},
{w:'Cow',          t:'مانگا',      b:'Mange',       lv:'A1', cat:'animals', pos:'n'},
{w:'Sheep',        t:'مەڕ',        b:'Mî / Beran',  lv:'A1', cat:'animals', pos:'n'},
{w:'Goat',         t:'بزن',        b:'Bizin',       lv:'A1', cat:'animals', pos:'n'},
{w:'Donkey',       t:'کەر',        b:'Ker',         lv:'A1', cat:'animals', pos:'n'},
{w:'Camel',        t:'ووشتر',      b:'Wiştar',      lv:'A1', cat:'animals', pos:'n'},
{w:'Lion',         t:'شێر',        b:'Şêr',         lv:'A1', cat:'animals', pos:'n'},
{w:'Tiger',        t:'پلنگ',       b:'Peleng',      lv:'A1', cat:'animals', pos:'n'},
{w:'Bear',         t:'هەورامی',    b:'Hirç',        lv:'A1', cat:'animals', pos:'n'},
{w:'Wolf',         t:'گورگ',       b:'Gur',         lv:'A1', cat:'animals', pos:'n'},
{w:'Fox',          t:'ڕووبای',     b:'Rovî',        lv:'A1', cat:'animals', pos:'n'},
{w:'Rabbit',       t:'کەوروک',     b:'Kêlor',       lv:'A1', cat:'animals', pos:'n'},
{w:'Snake',        t:'مار',        b:'Mar',         lv:'A1', cat:'animals', pos:'n'},
{w:'Monkey',       t:'مەیمون',     b:'Meymûn',      lv:'A1', cat:'animals', pos:'n'},
{w:'Elephant',     t:'فیل',        b:'Fîl',         lv:'A1', cat:'animals', pos:'n'},
{w:'Giraffe',      t:'زەرافە',     b:'Jîraf',       lv:'A1', cat:'animals', pos:'n'},
{w:'Crocodile',    t:'تەمساح',     b:'Timsêh',      lv:'A2', cat:'animals', pos:'n'},
{w:'Eagle',        t:'هەڵۆ',       b:'Eylo',        lv:'A1', cat:'birds', pos:'n'},
{w:'Sparrow',      t:'گنجیشک',    b:'Çûçik',       lv:'A1', cat:'birds', pos:'n'},
{w:'Pigeon',       t:'کەوتر',      b:'Kevok',       lv:'A1', cat:'birds', pos:'n'},
{w:'Parrot',       t:'ببەغا',      b:'Papaxe',      lv:'A1', cat:'birds', pos:'n'},
{w:'Owl',          t:'کووسی',      b:'Kund',        lv:'A2', cat:'birds', pos:'n'},
{w:'Chicken',      t:'مریشک',      b:'Mirîşk',      lv:'A1', cat:'birds', pos:'n'},
{w:'Duck',         t:'مروو',       b:'Werdek',      lv:'A1', cat:'birds', pos:'n'},
{w:'Butterfly',    t:'پەپووڵە',    b:'Pepûlk',      lv:'A1', cat:'animals', pos:'n'},
{w:'Bee',          t:'هەنگوینبزووڵە',b:'Hevîrçûk', lv:'A1', cat:'animals', pos:'n'},
{w:'Ant',          t:'مرۆوی',      b:'Mûrî',        lv:'A1', cat:'animals', pos:'n'},
{w:'Spider',       t:'گولوبزووڵە', b:'Tevnçûk',    lv:'A2', cat:'animals', pos:'n'},

// ═══════════════════════════════
//  A1 — NATURE & ENVIRONMENT
// ═══════════════════════════════
{w:'Sun',          t:'خۆر',        b:'Xor / Roj',  lv:'A1', cat:'nature', pos:'n'},
{w:'Moon',         t:'مانگ',       b:'Heyv',        lv:'A1', cat:'nature', pos:'n'},
{w:'Star',         t:'ئەستێرە',    b:'Stêrk',       lv:'A1', cat:'nature', pos:'n'},
{w:'Sky',          t:'ئاسمان',     b:'Ezman',       lv:'A1', cat:'nature', pos:'n'},
{w:'Cloud',        t:'هەور',       b:'Ewr',         lv:'A1', cat:'nature', pos:'n'},
{w:'Rain',         t:'باران',      b:'Baran',       lv:'A1', cat:'nature', pos:'n'},
{w:'Snow',         t:'بەفر',       b:'Befr',        lv:'A1', cat:'nature', pos:'n'},
{w:'Wind',         t:'با',         b:'Ba',          lv:'A1', cat:'nature', pos:'n'},
{w:'Storm',        t:'توفان',      b:'Tofan',       lv:'A2', cat:'weather', pos:'n'},
{w:'Thunder',      t:'ئەرعد',      b:'Birûsk',      lv:'A2', cat:'weather', pos:'n'},
{w:'Lightning',    t:'برووسکە',    b:'Birûsk',      lv:'A2', cat:'weather', pos:'n'},
{w:'Fog',          t:'مەگز',       b:'Mij',         lv:'A2', cat:'weather', pos:'n'},
{w:'Hot',          t:'گەرم',       b:'Germ',        lv:'A1', cat:'weather', pos:'adj'},
{w:'Cold',         t:'سارد',       b:'Sar',         lv:'A1', cat:'weather', pos:'adj'},
{w:'Warm',         t:'گەرمایی',    b:'Girimî',      lv:'A1', cat:'weather', pos:'adj'},
{w:'Humid',        t:'شڵ',         b:'Şil',         lv:'A2', cat:'weather', pos:'adj'},
{w:'Mountain',     t:'چیا',        b:'Çîya',        lv:'A1', cat:'nature', pos:'n'},
{w:'River',        t:'ڕووبار',     b:'Çem',         lv:'A1', cat:'nature', pos:'n'},
{w:'Lake',         t:'گۆڵ',        b:'Gol',         lv:'A1', cat:'nature', pos:'n'},
{w:'Sea',          t:'دەریا',      b:'Derya',       lv:'A1', cat:'nature', pos:'n'},
{w:'Ocean',        t:'بەحر',       b:'Okyanûs',     lv:'A2', cat:'nature', pos:'n'},
{w:'Forest',       t:'دار',        b:'Daristân',    lv:'A1', cat:'nature', pos:'n'},
{w:'Desert',       t:'بیابان',     b:'Çol',         lv:'A1', cat:'nature', pos:'n'},
{w:'Island',       t:'دووردانە',   b:'Girav',       lv:'A2', cat:'nature', pos:'n'},
{w:'Waterfall',    t:'شلاوی ئاو',  b:'Avşêt',       lv:'A2', cat:'nature', pos:'n'},
{w:'Earthquake',   t:'بومەلەرزە',  b:'Erdhej',      lv:'B1', cat:'nature', pos:'n'},
{w:'Volcano',      t:'ئاگرکوو',    b:'Volkan',      lv:'B1', cat:'nature', pos:'n'},
{w:'Soil',         t:'خۆڵ',        b:'Ax',          lv:'A2', cat:'nature', pos:'n'},
{w:'Rock',         t:'بەرد',       b:'Kevir',       lv:'A1', cat:'nature', pos:'n'},
{w:'Tree',         t:'دار',        b:'Dar',         lv:'A1', cat:'nature', pos:'n'},
{w:'Flower',       t:'گوڵ',        b:'Gul',         lv:'A1', cat:'nature', pos:'n'},
{w:'Grass',        t:'گیا',        b:'Giya',        lv:'A1', cat:'nature', pos:'n'},
{w:'Leaf',         t:'گەڵا',       b:'Gêla / Pelk', lv:'A1', cat:'nature', pos:'n'},
{w:'Seed',         t:'تۆو',        b:'Tov',         lv:'A2', cat:'nature', pos:'n'},
{w:'Root',         t:'ڕەگ',        b:'Reg',         lv:'A2', cat:'nature', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — TIME
// ═══════════════════════════════
{w:'Morning',      t:'بەیانی',     b:'Sibeh',       lv:'A1', cat:'time', pos:'n'},
{w:'Afternoon',    t:'نیوەڕۆ',     b:'Nîvro',       lv:'A1', cat:'time', pos:'n'},
{w:'Evening',      t:'ئێوارە',     b:'Êvar',        lv:'A1', cat:'time', pos:'n'},
{w:'Night',        t:'شەو',        b:'Şev',         lv:'A1', cat:'time', pos:'n'},
{w:'Midnight',     t:'نیوەشەو',    b:'Nîvşev',      lv:'A2', cat:'time', pos:'n'},
{w:'Today',        t:'ئەمڕۆ',      b:'Îro',         lv:'A1', cat:'time', pos:'adv'},
{w:'Yesterday',    t:'دوێنێ',      b:'Duh',         lv:'A1', cat:'time', pos:'adv'},
{w:'Tomorrow',     t:'سبەینێ',     b:'Sibe',        lv:'A1', cat:'time', pos:'adv'},
{w:'Now',          t:'ئێستا',      b:'Niha',        lv:'A1', cat:'time', pos:'adv'},
{w:'Soon',         t:'لە نێزیک',   b:'Zû',          lv:'A1', cat:'time', pos:'adv'},
{w:'Later',        t:'دواتر',      b:'Paşê',        lv:'A1', cat:'time', pos:'adv'},
{w:'Always',       t:'هەمیشە',     b:'Her',         lv:'A1', cat:'time', pos:'adv'},
{w:'Never',        t:'هیچکات',     b:'Qet',         lv:'A1', cat:'time', pos:'adv'},
{w:'Sometimes',    t:'هەندێکجار',  b:'Carinan',     lv:'A2', cat:'time', pos:'adv'},
{w:'Every day',    t:'هەر ڕۆژێک',  b:'Her roj',     lv:'A1', cat:'time', pos:'adv'},
{w:'Week',         t:'هەفتە',      b:'Hefte',       lv:'A1', cat:'time', pos:'n'},
{w:'Month',        t:'مانگ',       b:'Meh',         lv:'A1', cat:'time', pos:'n'},
{w:'Year',         t:'ساڵ',        b:'Sal',         lv:'A1', cat:'time', pos:'n'},
{w:'Hour',         t:'کاتژمێر',    b:'Saet',        lv:'A1', cat:'time', pos:'n'},
{w:'Minute',       t:'خولەک',      b:'Deqe',        lv:'A1', cat:'time', pos:'n'},
{w:'Second',       t:'چرکە',       b:'Saniye',      lv:'A1', cat:'time', pos:'n'},
{w:'Century',      t:'سەدساڵ',     b:'Sedsal',      lv:'B1', cat:'time', pos:'n'},
{w:'Decade',       t:'دە ساڵ',     b:'Dehsal',      lv:'B1', cat:'time', pos:'n'},
// Days
{w:'Monday',       t:'دووشەممە',   b:'Duşem',       lv:'A1', cat:'days'},
{w:'Tuesday',      t:'سێشەممە',    b:'Sêşem',       lv:'A1', cat:'days'},
{w:'Wednesday',    t:'چوارشەممە',  b:'Çarşem',      lv:'A1', cat:'days'},
{w:'Thursday',     t:'پێنجشەممە',  b:'Pêncşem',     lv:'A1', cat:'days'},
{w:'Friday',       t:'هەینی',      b:'Înî',         lv:'A1', cat:'days'},
{w:'Saturday',     t:'شەممە',      b:'Şemî',        lv:'A1', cat:'days'},
{w:'Sunday',       t:'یەکشەممە',   b:'Yekşem',      lv:'A1', cat:'days'},
// Months
{w:'January',   t:'کانوونی دووەم', b:'Kanûna Duyem', lv:'A1', cat:'months'},
{w:'February',  t:'شوبات',          b:'Şubat',        lv:'A1', cat:'months'},
{w:'March',     t:'ئازار',          b:'Azar',          lv:'A1', cat:'months'},
{w:'April',     t:'نیسان',          b:'Nîsan',         lv:'A1', cat:'months'},
{w:'May',       t:'ئایار',          b:'Ayar',          lv:'A1', cat:'months'},
{w:'June',      t:'حوزەیران',       b:'Hezîran',       lv:'A1', cat:'months'},
{w:'July',      t:'تەمووز',         b:'Tîrmeh',        lv:'A1', cat:'months'},
{w:'August',    t:'ئاب',            b:'Tebax',         lv:'A1', cat:'months'},
{w:'September', t:'ئەیلووڵ',        b:'Îlon',          lv:'A1', cat:'months'},
{w:'October',   t:'تشرینی یەکەم',   b:'Cotmeh',        lv:'A1', cat:'months'},
{w:'November',  t:'تشرینی دووەم',   b:'Mijdar',        lv:'A1', cat:'months'},
{w:'December',  t:'کانوونی یەکەم',  b:'Berfanbar',     lv:'A1', cat:'months'},
// Seasons
{w:'Spring',    t:'بەهار',   b:'Biharê',   lv:'A1', cat:'seasons'},
{w:'Summer',    t:'هاوین',   b:'Havîn',    lv:'A1', cat:'seasons'},
{w:'Autumn',    t:'پایز',    b:'Payîz',    lv:'A1', cat:'seasons'},
{w:'Winter',    t:'زستان',   b:'Zivistan', lv:'A1', cat:'seasons'},

// ═══════════════════════════════
//  A1/A2 — PLACES & TRAVEL
// ═══════════════════════════════
{w:'Airport',     t:'فڕۆکەخانە',   b:'Balafirge',   lv:'A1', cat:'travel', pos:'n'},
{w:'Hotel',       t:'هوتێل',        b:'Hotel',        lv:'A1', cat:'travel', pos:'n'},
{w:'Restaurant',  t:'چێشتخانە',    b:'Xwaringeh',   lv:'A1', cat:'travel', pos:'n'},
{w:'Hospital',    t:'نەخۆشخانە',   b:'Nexweşxane',  lv:'A1', cat:'places', pos:'n'},
{w:'School',      t:'قوتابخانە',   b:'Dibistân',    lv:'A1', cat:'places', pos:'n'},
{w:'University',  t:'زانکۆ',        b:'Zanko',        lv:'A1', cat:'places', pos:'n'},
{w:'Market',      t:'بازاڕ',        b:'Bazar',        lv:'A1', cat:'places', pos:'n'},
{w:'Supermarket', t:'سوپەرمارکێت', b:'Supermarkt',   lv:'A1', cat:'places', pos:'n'},
{w:'Bank',        t:'بانک',         b:'Bank',         lv:'A1', cat:'places', pos:'n'},
{w:'Post office', t:'پەیامگا',      b:'Postexane',    lv:'A1', cat:'places', pos:'n'},
{w:'Police',      t:'پۆلیس',        b:'Polîs',        lv:'A1', cat:'places', pos:'n'},
{w:'Mosque',      t:'مزگەوت',       b:'Mizgeft',      lv:'A1', cat:'places', pos:'n'},
{w:'Church',      t:'کلیسا',        b:'Dêr',          lv:'A1', cat:'places', pos:'n'},
{w:'Park',        t:'پارک',         b:'Park',         lv:'A1', cat:'places', pos:'n'},
{w:'Library',     t:'پەرتووکخانە',  b:'Pirtûkxane',  lv:'A1', cat:'places', pos:'n'},
{w:'Museum',      t:'موزەخانە',     b:'Muze',         lv:'A1', cat:'places', pos:'n'},
{w:'Cinema',      t:'سینەما',       b:'Sinema',       lv:'A1', cat:'places', pos:'n'},
{w:'Stadium',     t:'ستادیۆم',      b:'Stadyum',      lv:'A1', cat:'places', pos:'n'},
{w:'Station',     t:'گارەجی',       b:'Îstasyon',     lv:'A1', cat:'places', pos:'n'},
{w:'City',        t:'شار',          b:'Bajar',        lv:'A1', cat:'places', pos:'n'},
{w:'Town',        t:'قەزا',         b:'Qeza',         lv:'A1', cat:'places', pos:'n'},
{w:'Village',     t:'گوند',         b:'Gund',         lv:'A1', cat:'places', pos:'n'},
{w:'Country',     t:'وڵات',         b:'Welat',        lv:'A1', cat:'places', pos:'n'},
{w:'Capital',     t:'پایتەخت',      b:'Paytext',      lv:'A2', cat:'places', pos:'n'},
{w:'Border',      t:'سنوور',        b:'Sînor',        lv:'A2', cat:'places', pos:'n'},
{w:'Ticket',      t:'بلیت',         b:'Bîlet',        lv:'A1', cat:'travel', pos:'n'},
{w:'Passport',    t:'پاسپۆرت',      b:'Pasaport',     lv:'A1', cat:'travel', pos:'n'},
{w:'Visa',        t:'ڤیزا',         b:'Vîze',         lv:'A2', cat:'travel', pos:'n'},
{w:'Map',         t:'نەخشە',        b:'Nexşe',        lv:'A1', cat:'travel', pos:'n'},
{w:'Luggage',     t:'جانتا',        b:'Çante',        lv:'A1', cat:'travel', pos:'n'},
{w:'Room',        t:'ژوور',         b:'Jûr',          lv:'A1', cat:'travel', pos:'n'},
{w:'Reservation', t:'حجزکردن',      b:'Rezervasyon',  lv:'A2', cat:'travel', pos:'n'},
{w:'Tour guide',  t:'ڕێنمایی',      b:'Rêber',        lv:'A2', cat:'travel', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — TRANSPORT
// ═══════════════════════════════
{w:'Car',          t:'ئۆتۆمبێل',    b:'Erebe',        lv:'A1', cat:'transport', pos:'n'},
{w:'Bus',          t:'ئۆتۆبێس',     b:'Otobus',       lv:'A1', cat:'transport', pos:'n'},
{w:'Train',        t:'شەمەندەفەر',  b:'Trên',         lv:'A1', cat:'transport', pos:'n'},
{w:'Airplane',     t:'فڕۆکە',       b:'Balfir',       lv:'A1', cat:'transport', pos:'n'},
{w:'Ship',         t:'کەشتی',       b:'Keştî',        lv:'A1', cat:'transport', pos:'n'},
{w:'Bicycle',      t:'دووچەرخە',    b:'Dûçerxe',      lv:'A1', cat:'transport', pos:'n'},
{w:'Motorcycle',   t:'مۆتۆر',       b:'Motor',        lv:'A1', cat:'transport', pos:'n'},
{w:'Taxi',         t:'تاکسی',       b:'Taksî',        lv:'A1', cat:'transport', pos:'n'},
{w:'Truck',        t:'کامیۆن',      b:'Kamyon',       lv:'A1', cat:'transport', pos:'n'},
{w:'Ambulance',    t:'ئامبولانس',   b:'Ambulans',     lv:'A1', cat:'transport', pos:'n'},
{w:'Helicopter',   t:'هێلیکۆپتەر', b:'Helîkopter',   lv:'A2', cat:'transport', pos:'n'},
{w:'Subway',       t:'مترۆ',        b:'Metro',        lv:'A2', cat:'transport', pos:'n'},
{w:'Road',         t:'ڕێگا',        b:'Rê',           lv:'A1', cat:'transport', pos:'n'},
{w:'Bridge',       t:'پرد',         b:'Pir',          lv:'A1', cat:'transport', pos:'n'},
{w:'Traffic',      t:'ترافیک',      b:'Trafîk',       lv:'A2', cat:'transport', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — HOUSE & FURNITURE
// ═══════════════════════════════
{w:'House',        t:'ماڵ',        b:'Mal',         lv:'A1', cat:'house', pos:'n'},
{w:'Apartment',    t:'خانووی بەرز', b:'Apartman',   lv:'A1', cat:'house', pos:'n'},
{w:'Door',         t:'دەرگا',      b:'Derge',       lv:'A1', cat:'house', pos:'n'},
{w:'Window',       t:'پەنجەرە',    b:'Pencere',     lv:'A1', cat:'house', pos:'n'},
{w:'Roof',         t:'بان',        b:'Ban',         lv:'A1', cat:'house', pos:'n'},
{w:'Floor',        t:'زەوی',       b:'Zevî',        lv:'A1', cat:'house', pos:'n'},
{w:'Wall',         t:'دیوار',      b:'Dîwar',       lv:'A1', cat:'house', pos:'n'},
{w:'Stairs',       t:'پلەکان',     b:'Pêstirk',     lv:'A1', cat:'house', pos:'n'},
{w:'Kitchen',      t:'متبەخ',      b:'Mitbex',      lv:'A1', cat:'house', pos:'n'},
{w:'Bathroom',     t:'دشتشووی',    b:'Hemam',       lv:'A1', cat:'house', pos:'n'},
{w:'Bedroom',      t:'ژووری نووستن',b:'Odeya nûstinê',lv:'A1',cat:'house',pos:'n'},
{w:'Living room',  t:'ژووری نووستنگا',b:'Salon',    lv:'A1', cat:'house', pos:'n'},
{w:'Garden',       t:'باغچە',      b:'Baxçe',       lv:'A1', cat:'house', pos:'n'},
{w:'Chair',        t:'کورسی',      b:'Kursî',       lv:'A1', cat:'furniture', pos:'n'},
{w:'Table',        t:'مێز',        b:'Mase',        lv:'A1', cat:'furniture', pos:'n'},
{w:'Bed',          t:'جێخەو',      b:'Texterevan',  lv:'A1', cat:'furniture', pos:'n'},
{w:'Sofa',         t:'دیوان',      b:'Divan',       lv:'A1', cat:'furniture', pos:'n'},
{w:'Cupboard',     t:'کابینت',     b:'Kabînet',     lv:'A1', cat:'furniture', pos:'n'},
{w:'Shelf',        t:'رەف',        b:'Ref',         lv:'A1', cat:'furniture', pos:'n'},
{w:'Mirror',       t:'ئاوێنە',     b:'Ayne',        lv:'A1', cat:'furniture', pos:'n'},
{w:'Lamp',         t:'چرا',        b:'Çire',        lv:'A1', cat:'furniture', pos:'n'},
{w:'Curtain',      t:'پەردە',      b:'Perde',       lv:'A1', cat:'furniture', pos:'n'},
{w:'Carpet',       t:'خالیچە',     b:'Xalîçe',      lv:'A1', cat:'furniture', pos:'n'},
{w:'Fridge',       t:'سارکردنەوە', b:'Sarincok',    lv:'A1', cat:'furniture', pos:'n'},
{w:'Oven',         t:'تەنوور',     b:'Tenûr',       lv:'A1', cat:'furniture', pos:'n'},
{w:'Washing machine',t:'ماشینی جل شوشتن',b:'Makîna cilan',lv:'A2',cat:'furniture',pos:'n'},
{w:'Air conditioner',t:'کولێر',    b:'Klîma',       lv:'A2', cat:'furniture', pos:'n'},

// ═══════════════════════════════
//  A1/A2 — CLOTHES
// ═══════════════════════════════
{w:'Shirt',        t:'کراس',       b:'Kiras',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Dress',        t:'کراسی ژنانە', b:'Kiras',      lv:'A1', cat:'clothes', pos:'n'},
{w:'Trousers',     t:'پانتۆڵ',     b:'Pantol',      lv:'A1', cat:'clothes', pos:'n'},
{w:'Jacket',       t:'جاکێت',      b:'Çakêt',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Coat',         t:'قاپووت',     b:'Qapût',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Shoes',        t:'پێڵاو',      b:'Pêlaw',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Socks',        t:'گوریلۆک',    b:'Corab',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Hat',          t:'کولاو',      b:'Kolav',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Scarf',        t:'کیسپک',      b:'Gerdanelik',  lv:'A1', cat:'clothes', pos:'n'},
{w:'Gloves',       t:'دەستکێش',    b:'Destguh',     lv:'A1', cat:'clothes', pos:'n'},
{w:'Jeans',        t:'جینز',       b:'Cin',         lv:'A1', cat:'clothes', pos:'n'},
{w:'Sweater',      t:'پووڵۆوەر',   b:'Solên',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Uniform',      t:'یەکلیباس',   b:'Unîform',     lv:'A2', cat:'clothes', pos:'n'},
{w:'Belt',         t:'کەمەر',      b:'Kemer',       lv:'A1', cat:'clothes', pos:'n'},
{w:'Ring',         t:'ئەنگووست',   b:'Enguşt',      lv:'A1', cat:'clothes', pos:'n'},
{w:'Necklace',     t:'قۆلاو',      b:'Qolaw',       lv:'A1', cat:'clothes', pos:'n'},

// ═══════════════════════════════
//  A2/B1 — PROFESSIONS
// ═══════════════════════════════
{w:'Doctor',       t:'دکتۆر',      b:'Doktor',      lv:'A1', cat:'professions', pos:'n'},
{w:'Teacher',      t:'مامۆستا',    b:'Mamosta',     lv:'A1', cat:'professions', pos:'n'},
{w:'Engineer',     t:'ئەندازیار',  b:'Endezyar',    lv:'A1', cat:'professions', pos:'n'},
{w:'Nurse',        t:'پەرستار',    b:'Hemşire',     lv:'A1', cat:'professions', pos:'n'},
{w:'Lawyer',       t:'پارێزەر',    b:'Perezer',     lv:'A1', cat:'professions', pos:'n'},
{w:'Police officer',t:'پۆلیس',    b:'Polîs',       lv:'A1', cat:'professions', pos:'n'},
{w:'Driver',       t:'شۆفێر',      b:'Şofer',       lv:'A1', cat:'professions', pos:'n'},
{w:'Chef',         t:'باشپێز',     b:'Başpêj',      lv:'A1', cat:'professions', pos:'n'},
{w:'Farmer',       t:'گەلاڵە',     b:'Cotkar',      lv:'A1', cat:'professions', pos:'n'},
{w:'Soldier',      t:'سەربازی',    b:'Serbaz',      lv:'A1', cat:'professions', pos:'n'},
{w:'Journalist',   t:'ڕۆژنامەوان', b:'Rojnamenûs',  lv:'A2', cat:'professions', pos:'n'},
{w:'Accountant',   t:'حیسابدار',   b:'Hesabdar',    lv:'A2', cat:'professions', pos:'n'},
{w:'Architect',    t:'مرفۆلۆج',    b:'Mîmar',       lv:'A2', cat:'professions', pos:'n'},
{w:'Artist',       t:'هونەرمەند',  b:'Hunermend',   lv:'A2', cat:'professions', pos:'n'},
{w:'Programmer',   t:'پڕۆگرامەر',  b:'Programer',   lv:'A2', cat:'professions', pos:'n'},
{w:'Designer',     t:'دیزاینەر',   b:'Dîzayner',    lv:'A2', cat:'professions', pos:'n'},
{w:'Pharmacist',   t:'دارووفرۆش',  b:'Darûfiroş',   lv:'A2', cat:'professions', pos:'n'},
{w:'Dentist',      t:'دکتۆری دندان',b:'Dirûdist',   lv:'A2', cat:'professions', pos:'n'},
{w:'Pilot',        t:'فڕۆکەڕان',   b:'Pîlot',       lv:'A2', cat:'professions', pos:'n'},
{w:'Scientist',    t:'زانستوان',   b:'Zanistyar',   lv:'B1', cat:'professions', pos:'n'},
{w:'Economist',    t:'ئابووریدان',  b:'Aborînas',    lv:'B1', cat:'professions', pos:'n'},
{w:'Psychologist', t:'دکتۆری دەروونناسی',b:'Psîkolog', lv:'B1',cat:'professions',pos:'n'},

// ═══════════════════════════════
//  A2/B1 — EDUCATION
// ═══════════════════════════════
{w:'Book',         t:'کتێب',       b:'Pirtûk',      lv:'A1', cat:'education', pos:'n'},
{w:'Pen',          t:'پێنووس',     b:'Pênûs',       lv:'A1', cat:'education', pos:'n'},
{w:'Pencil',       t:'مدادەوە',    b:'Qelem',       lv:'A1', cat:'education', pos:'n'},
{w:'Paper',        t:'کاغەز',      b:'Kaxez',       lv:'A1', cat:'education', pos:'n'},
{w:'Notebook',     t:'دەفتەر',     b:'Defter',      lv:'A1', cat:'education', pos:'n'},
{w:'Classroom',    t:'پۆلی درس',   b:'Pola dersê',  lv:'A1', cat:'education', pos:'n'},
{w:'Lesson',       t:'وانە',       b:'Wane',        lv:'A1', cat:'education', pos:'n'},
{w:'Homework',     t:'ئەرکی ماڵ',  b:'Karê malê',   lv:'A1', cat:'education', pos:'n'},
{w:'Exam',         t:'تاقیکردنەوە',b:'Imtîhan',     lv:'A1', cat:'education', pos:'n'},
{w:'Grade',        t:'نمرە',       b:'Nimre',       lv:'A1', cat:'education', pos:'n'},
{w:'Dictionary',   t:'فەرهەنگ',    b:'Ferheng',     lv:'A2', cat:'education', pos:'n'},
{w:'Grammar',      t:'ڕێزمان',     b:'Rêziman',     lv:'A2', cat:'education', pos:'n'},
{w:'Vocabulary',   t:'وشەکان',     b:'Bêjeyên nû',  lv:'A2', cat:'education', pos:'n'},
{w:'Exercise',     t:'مەشق',       b:'Meşq',        lv:'A2', cat:'education', pos:'n'},
{w:'Degree',       t:'بڕوانامە',   b:'Berwane',     lv:'B1', cat:'education', pos:'n'},
{w:'Scholarship',  t:'بورس',       b:'Burs',        lv:'B1', cat:'education', pos:'n'},
{w:'Research',     t:'لێکۆڵینەوە', b:'Lêkolîn',     lv:'B1', cat:'education', pos:'n'},

// ═══════════════════════════════
//  A2/B1 — HEALTH
// ═══════════════════════════════
{w:'Medicine',     t:'دارمان',     b:'Derman',      lv:'A1', cat:'health', pos:'n'},
{w:'Pill',         t:'حەبە',       b:'Hebe',        lv:'A1', cat:'health', pos:'n'},
{w:'Injection',    t:'دەرزی',      b:'Derzî',       lv:'A2', cat:'health', pos:'n'},
{w:'X-ray',        t:'ئەشعە',      b:'Röntgen',     lv:'A2', cat:'health', pos:'n'},
{w:'Operation',    t:'نیشتن',      b:'Ameliyat',    lv:'B1', cat:'health', pos:'n'},
{w:'Fever',        t:'گەرمای تووشی',b:'Germ',       lv:'A1', cat:'health', pos:'n'},
{w:'Headache',     t:'سەردەرد',    b:'Serderd',     lv:'A1', cat:'health', pos:'n'},
{w:'Stomachache',  t:'ئەگردەرد',   b:'Zikderd',     lv:'A1', cat:'health', pos:'n'},
{w:'Cold',         t:'تووشی سامانی',b:'Serma',      lv:'A1', cat:'health', pos:'n'},
{w:'Cough',        t:'کۆکەی',      b:'Kokay',       lv:'A1', cat:'health', pos:'n'},
{w:'Allergy',      t:'هەستیاری',   b:'Alerji',      lv:'A2', cat:'health', pos:'n'},
{w:'Diabetes',     t:'گەندەمی',    b:'Şekir',       lv:'B1', cat:'health', pos:'n'},
{w:'Pregnant',     t:'بوونی منداڵ', b:'Ducanî',     lv:'B1', cat:'health', pos:'adj'},
{w:'Blood pressure',t:'زەخمی خوێن',b:'Tansîyon',   lv:'B1', cat:'health', pos:'n'},
{w:'Ambulance',    t:'ئامبولانس',   b:'Ambulans',   lv:'A1', cat:'health', pos:'n'},
{w:'First aid',    t:'ئیلافی یەکەم',b:'Arîkariya yekem',lv:'A2',cat:'health',pos:'n'},

// ═══════════════════════════════
//  A2/B1 — SPORTS & HOBBIES
// ═══════════════════════════════
{w:'Football',     t:'توپ',        b:'Top',         lv:'A1', cat:'sports', pos:'n'},
{w:'Basketball',   t:'باسکێتبۆل',  b:'Basketbol',   lv:'A1', cat:'sports', pos:'n'},
{w:'Swimming',     t:'مەلەکردن',   b:'Avjenî',      lv:'A1', cat:'sports', pos:'n'},
{w:'Running',      t:'ڕووخستن',    b:'Revîn',       lv:'A1', cat:'sports', pos:'n'},
{w:'Cycling',      t:'دووچەرخە',   b:'Dûçerxe',     lv:'A1', cat:'sports', pos:'n'},
{w:'Tennis',       t:'تێنیس',      b:'Tenîs',       lv:'A1', cat:'sports', pos:'n'},
{w:'Boxing',       t:'بۆکس',       b:'Boks',        lv:'A2', cat:'sports', pos:'n'},
{w:'Wrestling',    t:'گوریژاو',    b:'Güreş',       lv:'A2', cat:'sports', pos:'n'},
{w:'Gym',          t:'سالۆنی وەرزشی',b:'Salona sporê',lv:'A1',cat:'sports',pos:'n'},
{w:'Champion',     t:'قەهرەمان',   b:'Qeherman',    lv:'A2', cat:'sports', pos:'n'},
{w:'Reading',      t:'خوێندن',     b:'Xwendin',     lv:'A1', cat:'hobbies', pos:'n'},
{w:'Writing',      t:'نووسین',     b:'Nûsin',       lv:'A1', cat:'hobbies', pos:'n'},
{w:'Drawing',      t:'نووسینی وێنە',b:'Xêzkirin',   lv:'A1', cat:'hobbies', pos:'n'},
{w:'Cooking',      t:'خواردن پێزین',b:'Xwarin çêkirin',lv:'A1',cat:'hobbies',pos:'n'},
{w:'Photography',  t:'وێنەگرتن',   b:'Wênevanî',    lv:'A2', cat:'hobbies', pos:'n'},
{w:'Gardening',    t:'باغوانی',     b:'Baxvantî',    lv:'A2', cat:'hobbies', pos:'n'},
{w:'Music',        t:'موزیک',       b:'Mûzîk',       lv:'A1', cat:'music', pos:'n'},
{w:'Singing',      t:'گۆرانی گوتن', b:'Stran',       lv:'A1', cat:'music', pos:'n'},
{w:'Guitar',       t:'گیتار',       b:'Gîtar',       lv:'A1', cat:'music', pos:'n'},
{w:'Drum',         t:'دهل',         b:'Dehol',       lv:'A1', cat:'music', pos:'n'},
{w:'Piano',        t:'پیانۆ',       b:'Pîyano',      lv:'A1', cat:'music', pos:'n'},
{w:'Song',         t:'گۆرانی',      b:'Stran',       lv:'A1', cat:'music', pos:'n'},

// ═══════════════════════════════
//  A2/B1 — EMOTIONS
// ═══════════════════════════════
{w:'Happy',        t:'خۆشحاڵ',    b:'Şa',          lv:'A1', cat:'emotions', pos:'adj'},
{w:'Sad',          t:'خەفەتی',    b:'Xemgîn',      lv:'A1', cat:'emotions', pos:'adj'},
{w:'Angry',        t:'تووڕە',     b:'Hêrsbûyî',    lv:'A1', cat:'emotions', pos:'adj'},
{w:'Tired',        t:'مەندوو',    b:'Westiyayî',   lv:'A1', cat:'emotions', pos:'adj'},
{w:'Scared',       t:'ترسان',     b:'Tirsiyayî',   lv:'A1', cat:'emotions', pos:'adj'},
{w:'Excited',      t:'مەستی',     b:'Kêfxweş',     lv:'A1', cat:'emotions', pos:'adj'},
{w:'Bored',        t:'کووڕمایی',  b:'Bêzar',       lv:'A1', cat:'emotions', pos:'adj'},
{w:'Surprised',    t:'سەرسام',    b:'Ecêbmayî',    lv:'A1', cat:'emotions', pos:'adj'},
{w:'Lonely',       t:'تەنها',     b:'Tenê',        lv:'A2', cat:'emotions', pos:'adj'},
{w:'Proud',        t:'سەربەرز',   b:'Serbilind',   lv:'A2', cat:'emotions', pos:'adj'},
{w:'Jealous',      t:'چاوتەرس',   b:'Çavnebar',    lv:'A2', cat:'emotions', pos:'adj'},
{w:'Grateful',     t:'سوپاسگوزار', b:'Spasdar',    lv:'A2', cat:'emotions', pos:'adj'},
{w:'Nervous',      t:'دڵدهل',     b:'Nervoz',      lv:'A2', cat:'emotions', pos:'adj'},
{w:'Confused',     t:'سەرگەردان', b:'Tevlihev',    lv:'A2', cat:'emotions', pos:'adj'},
{w:'Disappointed', t:'بەیاس',     b:'Bextewar ne', lv:'B1', cat:'emotions', pos:'adj'},
{w:'Anxious',      t:'کارەسات',   b:'Xewn',        lv:'B1', cat:'emotions', pos:'adj'},
{w:'Optimistic',   t:'باشبینانە', b:'Hêvîdar',     lv:'B1', cat:'emotions', pos:'adj'},
{w:'Pessimistic',  t:'خراپبینانە',b:'Bêhêvî',      lv:'B1', cat:'emotions', pos:'adj'},

// ═══════════════════════════════
//  A2/B1 — ADJECTIVES
// ═══════════════════════════════
{w:'Big',          t:'گەورە',     b:'Mezin',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Small',        t:'بچووک',     b:'Biçûk',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Long',         t:'درێژ',      b:'Dirêj',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Short',        t:'کورت',      b:'Kurt',        lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Tall',         t:'بەرز',      b:'Bilind',      lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Heavy',        t:'قورس',      b:'Giran',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Light',        t:'سووک',      b:'Sivik',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Fast',         t:'خێرا',      b:'Zû',          lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Slow',         t:'هێواش',     b:'Hêdî',        lv:'A1', cat:'adjectives', pos:'adj'},
{w:'New',          t:'نوێ',       b:'Nû',          lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Old',          t:'کۆن',       b:'Kevin',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Young',        t:'گەنج',      b:'Ciwan',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Beautiful',    t:'جوان',      b:'Xweşik',      lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Ugly',         t:'خراپ سیفەت',b:'Xerab',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Clean',        t:'پاک',       b:'Pak',         lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Dirty',        t:'پیس',       b:'Qirêj',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Hard',         t:'سەخت',      b:'Hişk',        lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Soft',         t:'نەرم',      b:'Nerm',        lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Strong',       t:'بەهێز',     b:'Bihêz',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Weak',         t:'لاوازی',    b:'Lawaz',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Rich',         t:'دەوڵەمەند', b:'Dewlemend',   lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Poor',         t:'هەژار',     b:'Feqîr',       lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Funny',        t:'پێکەنین هاتوو',b:'Kenînek',  lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Serious',      t:'جدی',       b:'Ciddî',       lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Kind',         t:'بایەخ',     b:'Dilovan',     lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Rude',         t:'بێئەدەب',   b:'Bêedeb',      lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Clever',       t:'زیرەک',     b:'Jîr',         lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Stupid',       t:'گاڵتە',     b:'Îna',         lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Expensive',    t:'گران',      b:'Biha',        lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Cheap',        t:'هەرزان',    b:'Erzan',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Important',    t:'گرنگ',      b:'Girîng',      lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Interesting',  t:'سەرنجڕاکێش',b:'Balkêş',      lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Boring',       t:'وزوزێنەر',  b:'Bêkêf',       lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Dangerous',    t:'مەترسیدار', b:'Xeternak',    lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Safe',         t:'پارەزراو',  b:'Ewle',        lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Open',         t:'کراوە',     b:'Vekrî',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Closed',       t:'داخراو',    b:'Girtî',       lv:'A1', cat:'adjectives', pos:'adj'},
{w:'Busy',         t:'مەشغووڵ',   b:'Mijûl',       lv:'A2', cat:'adjectives', pos:'adj'},
{w:'Free',         t:'ئازاد',     b:'Azad',        lv:'A2', cat:'adjectives', pos:'adj'},

// ═══════════════════════════════
//  A1/A2 — BASIC VERBS
// ═══════════════════════════════
{w:'To be',        t:'بوون',      b:'Bûn',         lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To have',      t:'هەبوون',    b:'Hebûn',       lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To do',        t:'کردن',      b:'Kirin',       lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To say',       t:'گوتن',      b:'Gotin',       lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To know',      t:'زانین',     b:'Zanîn',       lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To think',     t:'فکرکردن',   b:'Ramanbûn',    lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To see',       t:'بینین',     b:'Dîtin',       lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To hear',      t:'گوێگرتن',   b:'Bihîstin',    lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To eat',       t:'خواردن',    b:'Xwarin',      lv:'A1', cat:'verbs_basic', pos:'v', ex:['I eat bread.','من نان دەخۆم.']},
{w:'To drink',     t:'خواردنەوە', b:'Vexwarin',    lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To sleep',     t:'نووستن',    b:'Nûstin',      lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To wake up',   t:'هەستان',    b:'Hişyarbûn',   lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To work',      t:'کارکردن',   b:'Xebatîn',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To study',     t:'خوێندن',    b:'Xwendin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To play',      t:'یاریکردن',  b:'Lîstin',      lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To buy',       t:'کڕین',      b:'Kirîn',       lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To sell',      t:'فرۆشتن',    b:'Firotin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To give',      t:'دان',       b:'Dan',         lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To take',      t:'وەرگرتن',   b:'Standin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To open',      t:'کردنەوە',   b:'Vekirin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To close',     t:'داخستن',    b:'Girtin',      lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To write',     t:'نووسین',    b:'Nûstin',      lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To read',      t:'خوێندنەوە', b:'Xwendin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To speak',     t:'قسەکردن',   b:'Axaftin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To listen',    t:'گوێدان',    b:'Guhdarîbûn',  lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To understand',t:'تێگەیشتن',  b:'Têgihiştin',  lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To remember',  t:'بیرکردنەوە',b:'Bîranîn',     lv:'A2', cat:'verbs_basic', pos:'v'},
{w:'To forget',    t:'جەختکردن',  b:'Jibîrkirin',  lv:'A2', cat:'verbs_basic', pos:'v'},
{w:'To help',      t:'یارمەتیدان',b:'Arîkarîkirin', lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To try',       t:'هەوڵدان',   b:'Hewl dan',    lv:'A2', cat:'verbs_basic', pos:'v'},
{w:'To want',      t:'خواستن',    b:'Xwestin',     lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To need',      t:'پێویستبوون',b:'Pêwist bûn',  lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To like',      t:'خۆشی هاوردن',b:'Xweş kirin', lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To love',      t:'خۆشەویستی', b:'Hezdikirin',  lv:'A1', cat:'verbs_basic', pos:'v'},
{w:'To hate',      t:'ڕەزیل',     b:'Nefretê kirin',lv:'A2',cat:'verbs_basic', pos:'v'},
// Motion verbs
{w:'To go',        t:'چوون',      b:'Çûn',         lv:'A1', cat:'verbs_motion', pos:'v', ex:['I go to school.','دەچم قوتابخانە.']},
{w:'To come',      t:'هاتن',      b:'Hatin',       lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To walk',      t:'ڕوومالکردن',b:'Meşîn',       lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To run',       t:'ڕووخستن',   b:'Revîn',       lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To sit',       t:'دانیشتن',   b:'Rûniştîn',    lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To stand',     t:'ڕاوەستان',  b:'Sekinîn',     lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To arrive',    t:'گەیشتن',    b:'Gihaştin',    lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To leave',     t:'ڕۆیشتن',    b:'Çûna',        lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To enter',     t:'چوون ژوورەوە',b:'Ketina',    lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To exit',      t:'دەرچوون',   b:'Derçûn',      lv:'A1', cat:'verbs_motion', pos:'v'},
{w:'To carry',     t:'بردن',      b:'Hildan',      lv:'A2', cat:'verbs_motion', pos:'v'},
{w:'To throw',     t:'ئەڵقدان',   b:'Avêtin',      lv:'A2', cat:'verbs_motion', pos:'v'},
{w:'To jump',      t:'بازدان',    b:'Xweyakirin',  lv:'A2', cat:'verbs_motion', pos:'v'},
{w:'To swim',      t:'مەلەکردن',  b:'Avjenî kirin',lv:'A2', cat:'verbs_motion', pos:'v'},
// Communication verbs
{w:'To call',      t:'بانگکردن',  b:'Bangkirin',   lv:'A1', cat:'verbs_comm', pos:'v'},
{w:'To ask',       t:'پرسین',     b:'Pirsîn',      lv:'A1', cat:'verbs_comm', pos:'v'},
{w:'To answer',    t:'وەڵامدانەوە',b:'Bersivdan',  lv:'A1', cat:'verbs_comm', pos:'v'},
{w:'To explain',   t:'ڕوونکردنەوە',b:'Şîrovekirin',lv:'A2', cat:'verbs_comm', pos:'v'},
{w:'To promise',   t:'بەڵێندان',  b:'Sozdan',      lv:'A2', cat:'verbs_comm', pos:'v'},
{w:'To disagree',  t:'ئامانجنەبون',b:'Razî nebûn', lv:'B1', cat:'verbs_comm', pos:'v'},

// ═══════════════════════════════
//  A1/A2 — PRONOUNS
// ═══════════════════════════════
{w:'I',            t:'من',        b:'Min',         lv:'A1', cat:'pronouns', pos:'pron'},
{w:'You',          t:'تۆ',        b:'Tu',          lv:'A1', cat:'pronouns', pos:'pron'},
{w:'He',           t:'ئەو (پیاو)',  b:'Ew (zilam)', lv:'A1', cat:'pronouns', pos:'pron'},
{w:'She',          t:'ئەو (ژن)',   b:'Ew (jin)',    lv:'A1', cat:'pronouns', pos:'pron'},
{w:'We',           t:'ئێمە',      b:'Em',          lv:'A1', cat:'pronouns', pos:'pron'},
{w:'They',         t:'ئەوان',     b:'Ewan',        lv:'A1', cat:'pronouns', pos:'pron'},
{w:'My',           t:'مینی',      b:'Yê min',      lv:'A1', cat:'pronouns', pos:'pron'},
{w:'Your',         t:'تۆی',       b:'Yê te',       lv:'A1', cat:'pronouns', pos:'pron'},
{w:'His/Her',      t:'ئەوی',      b:'Yê wî/wê',    lv:'A1', cat:'pronouns', pos:'pron'},
{w:'Our',          t:'ئێمەی',     b:'Yê me',       lv:'A1', cat:'pronouns', pos:'pron'},
{w:'Their',        t:'ئەوانی',    b:'Yê wan',      lv:'A1', cat:'pronouns', pos:'pron'},
{w:'This',         t:'ئەمە',      b:'Ev',          lv:'A1', cat:'pronouns', pos:'pron'},
{w:'That',         t:'ئەوە',      b:'Ew',          lv:'A1', cat:'pronouns', pos:'pron'},
{w:'These',        t:'ئەمانە',    b:'Ev',          lv:'A1', cat:'pronouns', pos:'pron'},
{w:'Those',        t:'ئەوانە',    b:'Ewan',        lv:'A1', cat:'pronouns', pos:'pron'},

// ═══════════════════════════════
//  A1/A2 — QUESTION WORDS
// ═══════════════════════════════
{w:'Who',          t:'کێ',        b:'Kê',          lv:'A1', cat:'questions', pos:'pron'},
{w:'What',         t:'چی',        b:'Çi',          lv:'A1', cat:'questions'},
{w:'Where',        t:'لەکوێ',     b:'Li ku',       lv:'A1', cat:'questions'},
{w:'When',         t:'کەی',       b:'Kengî',       lv:'A1', cat:'questions'},
{w:'Why',          t:'بۆچی',      b:'Çima',        lv:'A1', cat:'questions'},
{w:'How',          t:'چۆن',       b:'Çawa',        lv:'A1', cat:'questions'},
{w:'How much',     t:'چەند پارەیە',b:'Çiqas e',    lv:'A1', cat:'questions'},
{w:'How many',     t:'چەند',       b:'Çend',        lv:'A1', cat:'questions'},
{w:'Which',        t:'کامیان',     b:'Kîjan',       lv:'A1', cat:'questions'},
{w:'Whose',        t:'ئەوی کێیە',  b:'Yê kê ye',   lv:'A2', cat:'questions'},

// ═══════════════════════════════
//  A1/A2 — PREPOSITIONS & DIRECTIONS
// ═══════════════════════════════
{w:'In',           t:'لە',        b:'Di…de',       lv:'A1', cat:'prepositions', pos:'prep'},
{w:'On',           t:'سەر',       b:'Li ser',      lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Under',        t:'خوار',      b:'Li jêr',      lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Between',      t:'نێوان',     b:'Navbera',     lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Behind',       t:'پشت',       b:'Li pişt',     lv:'A1', cat:'prepositions', pos:'prep'},
{w:'In front of',  t:'پێشەوە',    b:'Pêşiya',      lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Near',         t:'نزیک',      b:'Nêzî',        lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Far',          t:'دووری',     b:'Dûr',         lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Inside',       t:'ژوورەوە',   b:'Hundir',      lv:'A1', cat:'prepositions', pos:'prep'},
{w:'Outside',      t:'دەرەوە',    b:'Derve',       lv:'A1', cat:'prepositions', pos:'prep'},
{w:'North',        t:'باکووری',   b:'Bakur',       lv:'A1', cat:'directions'},
{w:'South',        t:'باشووری',   b:'Başûr',       lv:'A1', cat:'directions'},
{w:'East',         t:'ڕۆژهەڵات',  b:'Rojhilat',    lv:'A1', cat:'directions'},
{w:'West',         t:'ڕۆژئاوا',   b:'Rojava',      lv:'A1', cat:'directions'},
{w:'Left',         t:'ھەستی چەپ', b:'Çep',         lv:'A1', cat:'directions'},
{w:'Right',        t:'ڕاست',      b:'Rast',        lv:'A1', cat:'directions'},
{w:'Straight',     t:'ڕاستەوخۆ',  b:'Rasterast',   lv:'A1', cat:'directions'},
{w:'Turn',         t:'ئاراستەکردن',b:'Zivirîn',    lv:'A1', cat:'directions'},

// ═══════════════════════════════
//  A2/B1 — DAILY PHRASES
// ═══════════════════════════════
{w:'I want to learn Kurdish',   t:'دەمەوێت کوردی فێربم',     b:'Ez dixwazim Kurdî fêr bibim',     lv:'A1', cat:'daily_phrases'},
{w:'Where is the bathroom?',    t:'دەستشووی لەکوێیە؟',       b:'Destşo li ku ye?',                lv:'A1', cat:'daily_phrases'},
{w:'How much does it cost?',    t:'چەند پارەیە؟',             b:'Çiqas e?',                        lv:'A1', cat:'daily_phrases'},
{w:'Can you help me?',          t:'دەتوانیت یارمەتیم بدەیت؟', b:'Dikarî arîkariya min bikî?',      lv:'A1', cat:'daily_phrases'},
{w:'I am lost',                 t:'گومبوومە',                  b:'Ez winda bûme',                   lv:'A1', cat:'daily_phrases'},
{w:'Call a doctor',             t:'دکتۆر بانگ بکە',            b:'Doktorekî bang bike',              lv:'A1', cat:'daily_phrases'},
{w:'I am hungry',               t:'برسیمە',                    b:'Ez birçî me',                     lv:'A1', cat:'daily_phrases'},
{w:'I am thirsty',              t:'تینووم',                    b:'Ez tî me',                        lv:'A1', cat:'daily_phrases'},
{w:'I am tired',                t:'مەندووم',                   b:'Ez westiyame',                    lv:'A1', cat:'daily_phrases'},
{w:'I don\'t speak Kurdish well',t:'کوردیم باش نییە',          b:'Kurdiya min baş nîne',            lv:'A1', cat:'daily_phrases'},
{w:'Please write it down',      t:'تکایە بینووسێوە',           b:'Ji kerema xwe binivîse',          lv:'A2', cat:'daily_phrases'},
{w:'What time is it?',          t:'کاتژمێر چەندەیە؟',          b:'Saet çend e?',                    lv:'A1', cat:'daily_phrases'},
{w:'Have a good trip',          t:'گەشتی خۆش',                b:'Rêwîtiya te xweş be',             lv:'A2', cat:'daily_phrases'},
{w:'Happy new year',            t:'ساڵی نوێتان پیرۆزبێت',      b:'Sala nû ya we pîroz be',          lv:'A1', cat:'daily_phrases'},
{w:'Congratulations',           t:'پیرۆزبایی',                 b:'Pîroz be',                        lv:'A1', cat:'daily_phrases'},
{w:'Get well soon',             t:'زووی خۆشبەست',              b:'Zû şfa bigirî',                   lv:'A2', cat:'daily_phrases'},
{w:'Good luck',                 t:'سەرکەوتوو بی',              b:'Bextê te vekirî be',              lv:'A1', cat:'daily_phrases'},
{w:'Take care',                 t:'لە خۆت بپارێزە',            b:'Xwe bigire',                      lv:'A1', cat:'daily_phrases'},

// ═══════════════════════════════
//  A2/B1 — TECHNOLOGY
// ═══════════════════════════════
{w:'Phone',        t:'تەلەفۆن',    b:'Telefon',     lv:'A1', cat:'technology', pos:'n'},
{w:'Computer',     t:'کۆمپیووتەر', b:'Kompyûter',   lv:'A1', cat:'technology', pos:'n'},
{w:'Internet',     t:'ئینتەرنێت',  b:'Înternetê',   lv:'A1', cat:'technology', pos:'n'},
{w:'Website',      t:'ماڵپەڕ',     b:'Malpêr',      lv:'A2', cat:'technology', pos:'n'},
{w:'Application',  t:'ئەپ',        b:'Bername',      lv:'A2', cat:'technology', pos:'n'},
{w:'Password',     t:'پاسوورد',    b:'Şîfre',        lv:'A2', cat:'technology', pos:'n'},
{w:'Email',        t:'ئیمەیڵ',     b:'Eposta',       lv:'A1', cat:'technology', pos:'n'},
{w:'Social media', t:'تۆڕی کۆمەڵایەتی',b:'Medyaya Civakî', lv:'A2', cat:'technology', pos:'n'},
{w:'Camera',       t:'کامێرا',     b:'Kamera',       lv:'A1', cat:'technology', pos:'n'},
{w:'Television',   t:'تەلەفیزیۆن', b:'Televîzyon',   lv:'A1', cat:'technology', pos:'n'},
{w:'Radio',        t:'رادیۆ',      b:'Radyo',        lv:'A1', cat:'technology', pos:'n'},
{w:'Battery',      t:'باتری',      b:'Baterî',       lv:'A2', cat:'technology', pos:'n'},
{w:'Charger',      t:'چارجەر',     b:'Şarjer',       lv:'A2', cat:'technology', pos:'n'},
{w:'Download',     t:'داونلود',    b:'Daxistin',     lv:'A2', cat:'technology', pos:'n'},
{w:'Upload',       t:'بارکردن',    b:'Barkirin',     lv:'A2', cat:'technology', pos:'n'},
{w:'Artificial intelligence',t:'زیرەکی دەستکردی',b:'Jîhata çêkirî',lv:'B1',cat:'technology',pos:'n'},

// ═══════════════════════════════
//  A2/B1 — SHOPPING & MONEY
// ═══════════════════════════════
{w:'Shop',         t:'دوکان',      b:'Dûkan',       lv:'A1', cat:'shopping', pos:'n'},
{w:'Price',        t:'بایەخ',      b:'Baha',        lv:'A1', cat:'shopping', pos:'n'},
{w:'Discount',     t:'داشکاندن',   b:'Îndîrim',     lv:'A2', cat:'shopping', pos:'n'},
{w:'Receipt',      t:'پسوولە',     b:'Wergirt',     lv:'A2', cat:'shopping', pos:'n'},
{w:'Credit card',  t:'کارتی بانکی', b:'Kartê bankî', lv:'A2', cat:'shopping', pos:'n'},
{w:'Cash',         t:'پارەی نەقد', b:'Drav',        lv:'A1', cat:'money', pos:'n'},
{w:'Money',        t:'پارە',       b:'Pare',        lv:'A1', cat:'money', pos:'n'},
{w:'Salary',       t:'مووچە',      b:'Meaş',        lv:'A2', cat:'money', pos:'n'},
{w:'Tax',          t:'بڕگەی باج',  b:'Bacê',        lv:'B1', cat:'money', pos:'n'},
{w:'Loan',         t:'قەرز',       b:'Deyn',        lv:'B1', cat:'money', pos:'n'},
{w:'Profit',       t:'قازانج',     b:'Qezenc',      lv:'B1', cat:'money', pos:'n'},
{w:'Exchange rate',t:'نرخی دراو',  b:'Kûrê',        lv:'B1', cat:'money', pos:'n'},

// ═══════════════════════════════
//  B1/B2 — RESTAURANT & ORDERING
// ═══════════════════════════════
{w:'Menu',         t:'لیستی خواردن',b:'Menû',       lv:'A2', cat:'restaurant', pos:'n'},
{w:'Waiter',       t:'خزمەتکار',   b:'Garson',      lv:'A1', cat:'restaurant', pos:'n'},
{w:'Bill',         t:'حیساب',      b:'Hesab',       lv:'A1', cat:'restaurant', pos:'n'},
{w:'Tip',          t:'قەیش',       b:'Bahşîş',      lv:'A2', cat:'restaurant', pos:'n'},
{w:'Reservation',  t:'حجزکردن',    b:'Rezervasyon', lv:'A2', cat:'restaurant', pos:'n'},
{w:'Table for two',t:'مێزی دووکەسی',b:'Maseyekê ji bo du kesan',lv:'A2',cat:'restaurant'},
{w:'I would like', t:'دەمەوێت',    b:'Ez dixwazim', lv:'A1', cat:'restaurant'},
{w:'Takeaway',     t:'بردن',       b:'Birêkirin',   lv:'A2', cat:'restaurant'},
{w:'Vegetarian',   t:'دەرختخور',   b:'Nebirawerxwar',lv:'B1',cat:'restaurant', pos:'n'},
{w:'Allergy',      t:'هەستیاری',   b:'Alerji',      lv:'B1', cat:'restaurant', pos:'n'},

// ═══════════════════════════════
//  B1/B2 — EMERGENCY
// ═══════════════════════════════
{w:'Help!',        t:'یارمەتی!',    b:'Arîkarî!',    lv:'A1', cat:'emergency'},
{w:'Fire!',        t:'ئاگر!',       b:'Agir!',       lv:'A1', cat:'emergency'},
{w:'Thief!',       t:'دزی!',        b:'Dizî!',       lv:'A1', cat:'emergency'},
{w:'Danger',       t:'مەترسی',      b:'Xeter',       lv:'A1', cat:'emergency'},
{w:'Police',       t:'پۆلیس',       b:'Polîs',       lv:'A1', cat:'emergency'},
{w:'Emergency',    t:'نائاسایی',    b:'Acil',        lv:'A1', cat:'emergency'},
{w:'Lost',         t:'گومبووی',     b:'Winda',       lv:'A1', cat:'emergency'},
{w:'Accident',     t:'ڕووداو',      b:'Qeza',        lv:'A2', cat:'emergency'},
{w:'Earthquake',   t:'بومەلەرزە',   b:'Erdhej',      lv:'B1', cat:'emergency'},

// ═══════════════════════════════
//  B1/B2 — CULTURE & RELIGION
// ═══════════════════════════════
{w:'Culture',      t:'کولتور',      b:'Çand',        lv:'B1', cat:'culture', pos:'n'},
{w:'Tradition',    t:'دەرفەت',      b:'Adet',        lv:'B1', cat:'culture', pos:'n'},
{w:'Celebration',  t:'جەژن',        b:'Cejin',       lv:'A2', cat:'culture', pos:'n'},
{w:'Wedding',      t:'جەژنی هاوسەرگیری',b:'Dawet',  lv:'A2', cat:'culture', pos:'n'},
{w:'Funeral',      t:'شین',         b:'Şîn',         lv:'B1', cat:'culture', pos:'n'},
{w:'Religion',     t:'ئایین',       b:'Ol',          lv:'B1', cat:'religion', pos:'n'},
{w:'Islam',        t:'ئیسلام',      b:'Îslam',       lv:'A2', cat:'religion', pos:'n'},
{w:'Prayer',       t:'نوێژ',        b:'Nimêj',       lv:'A2', cat:'religion', pos:'n'},
{w:'Fasting',      t:'ڕۆژووگرتن',   b:'Roza',        lv:'A2', cat:'religion', pos:'n'},
{w:'Pilgrimage',   t:'حەج',         b:'Hecê',        lv:'B1', cat:'religion', pos:'n'},

// ═══════════════════════════════
//  B1/B2 — POLITICS & SOCIETY
// ═══════════════════════════════
{w:'Government',   t:'حکومەت',      b:'Hukûmet',     lv:'B1', cat:'politics', pos:'n'},
{w:'Democracy',    t:'دیموکراسی',   b:'Demokrasî',   lv:'B1', cat:'politics', pos:'n'},
{w:'Election',     t:'هەڵبژاردن',   b:'Hilbijartin', lv:'B1', cat:'politics', pos:'n'},
{w:'Freedom',      t:'ئازادی',      b:'Azadî',       lv:'B1', cat:'politics', pos:'n'},
{w:'Rights',       t:'مافەکان',     b:'Mafên',       lv:'B1', cat:'politics', pos:'n'},
{w:'Constitution', t:'یاسای بنەڕەتی',b:'Destûr',    lv:'B2', cat:'politics', pos:'n'},
{w:'Parliament',   t:'پەرلەمان',    b:'Parlamenta',  lv:'B1', cat:'politics', pos:'n'},
{w:'Protest',      t:'خۆپیشاندان',  b:'Xwepiştandan',lv:'B2', cat:'politics', pos:'n'},
{w:'Justice',      t:'دادگەری',     b:'Edalet',      lv:'B1', cat:'politics', pos:'n'},
{w:'Peace',        t:'ئاشتی',       b:'Aştî',        lv:'A2', cat:'politics', pos:'n'},
{w:'War',          t:'جەنگ',        b:'Şer',         lv:'B1', cat:'politics', pos:'n'},

// ═══════════════════════════════
//  B2/C1 — SCIENCE & TECHNOLOGY
// ═══════════════════════════════
{w:'Atom',         t:'ئەتۆم',       b:'Atom',        lv:'B2', cat:'science', pos:'n'},
{w:'Energy',       t:'وزە',         b:'Wize',        lv:'B1', cat:'science', pos:'n'},
{w:'Chemical',     t:'کیمیایی',     b:'Kîmyayî',     lv:'B2', cat:'science', pos:'adj'},
{w:'Evolution',    t:'گەشەکردن',    b:'Evolûsyon',   lv:'B2', cat:'science', pos:'n'},
{w:'Climate change',t:'گۆڕانی ئاب و هەوا',b:'Guherîna avhewayê',lv:'B2',cat:'science',pos:'n'},
{w:'Pollution',    t:'قیرانی ژینگە', b:'Qirêjî',     lv:'B1', cat:'science', pos:'n'},
{w:'DNA',          t:'ژینگە',        b:'DNA',         lv:'C1', cat:'science', pos:'n'},
{w:'Gravity',      t:'ڕووی زەوی',   b:'Rakêşan',     lv:'B2', cat:'science', pos:'n'},
{w:'Algorithm',    t:'ئالگۆریتم',    b:'Algorîtma',   lv:'C1', cat:'technology', pos:'n'},
{w:'Blockchain',   t:'بلۆکچەین',    b:'Blokzincîr',  lv:'C1', cat:'technology', pos:'n'},

// ═══════════════════════════════
//  B2/C1 — ART & LITERATURE
// ═══════════════════════════════
{w:'Novel',        t:'ڕۆمان',       b:'Roman',       lv:'B1', cat:'literature', pos:'n'},
{w:'Poetry',       t:'شیعر',        b:'Helbest',     lv:'B1', cat:'literature', pos:'n'},
{w:'Theatre',      t:'تیاتر',       b:'Tiyatro',     lv:'B1', cat:'art', pos:'n'},
{w:'Sculpture',    t:'پەیکەرتاشی',  b:'Peykerê',     lv:'B2', cat:'art', pos:'n'},
{w:'Exhibition',   t:'پیشانگا',     b:'Pêşangeh',    lv:'B1', cat:'art', pos:'n'},
{w:'Masterpiece',  t:'ئەثەری گەورە', b:'Karê sereke', lv:'B2', cat:'art', pos:'n'},

// ═══════════════════════════════
//  B1/B2 — IDIOMS & PROVERBS
// ═══════════════════════════════
{w:'Break a leg',                  t:'بەتاللا باشت بێت',         b:'Bextê te vekirî be',          lv:'B1', cat:'idioms'},
{w:'It\'s raining cats and dogs',  t:'باران تووندە',              b:'Baran tûnd e',                lv:'B2', cat:'idioms'},
{w:'Hit the nail on the head',     t:'ناو بەردی خواردی',          b:'Serê çiviyê xist',            lv:'B2', cat:'idioms'},
{w:'Time is money',                t:'کات زێڕه',                  b:'Dem zêr e',                   lv:'B1', cat:'proverbs'},
{w:'Knowledge is power',           t:'زانین هێزە',                b:'Zanîn hêz e',                 lv:'B1', cat:'proverbs'},
{w:'Better late than never',       t:'دواتر باشترە لە هیچکات',    b:'Paştir ji qet çêtir e',       lv:'B2', cat:'proverbs'},
{w:'Actions speak louder than words',t:'کردار لە قسەوە بلندترە', b:'Kirin ji gotinê bilindtir e', lv:'B2', cat:'proverbs'},

]; // END ZIMAN_VOCAB_EN

// ──────────────────────────────────────────────────────────────────
//  HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────────────

/** Returns all entries for a given category key */
function vocabByCategory(cat) {
    return ZIMAN_VOCAB_EN.filter(e => e.cat === cat);
}

/** Returns all entries for a given CEFR level */
function vocabByLevel(lv) {
    return ZIMAN_VOCAB_EN.filter(e => e.lv === lv);
}

/** Returns a random sample of n entries from arr */
function vocabSample(arr, n) {
    const a = arr.slice().sort(() => Math.random() - 0.5);
    return a.slice(0, n);
}

/** Converts a vocab entry to the legacy "word=translation" string format */
function vocabToLegacy(entry, dialectBadini) {
    const tgt = (dialectBadini && entry.b) ? entry.b : entry.t;
    return `${entry.w}=${tgt}`;
}

/**
 * Generates a lessons-compatible topic object from a VOCAB category.
 *   { id, title, icon, words: ["source=target", ...] }
 */
function vocabCategoryToTopic(catKey, topicId, dialectBadini) {
    const entries = vocabByCategory(catKey);
    const meta    = VOCAB_CATEGORIES[catKey] || { ku: catKey, icon: '📖' };
    return {
        id:    topicId,
        title: meta.icon + ' ' + meta.ku,
        words: entries.map(e => vocabToLegacy(e, dialectBadini)),
    };
}

/**
 * Returns stats about the vocabulary bank.
 */
function vocabStats() {
    const total    = ZIMAN_VOCAB_EN.length;
    const byLevel  = {};
    const byCat    = {};
    ZIMAN_VOCAB_EN.forEach(e => {
        byLevel[e.lv] = (byLevel[e.lv] || 0) + 1;
        byCat[e.cat]  = (byCat[e.cat]  || 0) + 1;
    });
    return { total, byLevel, byCat, categories: Object.keys(byCat).length };
}

/**
 * Search vocabulary by keyword (source word or translation).
 */
function vocabSearch(query) {
    const q = query.toLowerCase();
    return ZIMAN_VOCAB_EN.filter(e =>
        e.w.toLowerCase().includes(q) ||
        e.t.includes(q) ||
        (e.b && e.b.toLowerCase().includes(q))
    );
}

// ──────────────────────────────────────────────────────────────────
//  EXPOSE ON WINDOW (browser-compatible — no ES module needed)
// ──────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
    window.ZIMAN_VOCAB_EN   = ZIMAN_VOCAB_EN;
    window.VOCAB_CATEGORIES = VOCAB_CATEGORIES;
    window.VOCAB_LEVELS     = VOCAB_LEVELS;
    window.vocabByCategory  = vocabByCategory;
    window.vocabByLevel     = vocabByLevel;
    window.vocabSample      = vocabSample;
    window.vocabToLegacy    = vocabToLegacy;
    window.vocabCategoryToTopic = vocabCategoryToTopic;
    window.vocabStats       = vocabStats;
    window.vocabSearch      = vocabSearch;
}
