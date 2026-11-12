/* ═══════════════════════════════════════════════════════════════
   Judo throw data — 53 techniques: the full Kodokan Gokyo no Waza,
   the Habukareta Waza (preserved 1895 techniques), and five of the
   Shinmeisho no Waza (newer Kodokan throws) that have animations.

   Plain script (no modules) so the app keeps working from file://.
   Exposed as window.JUDO_DATA in the browser and via CommonJS for
   the Node test suite.
═══════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  var THROWS = [
    // ── Dai Ikkyo (1st group) ─────────────────────────────────
    { name: "Deashi Harai",         kanji: "出足払",   english: "Forward Foot Sweep",          img: "images/technique/deashibarai.gif",        group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 5, english: "Advanced Foot Sweep" } },
    { name: "Hiza Guruma",          kanji: "膝車",     english: "Knee Wheel",                  img: "images/technique/hizaguruma.gif",         group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 6, english: "Knee Wheel Throw" } },
    { name: "Sasae Tsurikomi Ashi", kanji: "支釣込足", english: "Supporting Foot Lift-Pull",   img: "images/technique/sasaetsu.gif",           group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 5, english: "Propping-Lifting Foot Sweep" } },
    { name: "Uki Goshi",            kanji: "浮腰",     english: "Floating Hip",                img: "images/technique/uki_goshi.gif",          group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 5, english: "Floating Hip Throw" } },
    { name: "Osoto Gari",           kanji: "大外刈",   english: "Large Outer Reap",            img: "images/technique/osoto_gari.gif",         group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 6, english: "Major Outside Reaping Throw" } },
    { name: "O Goshi",              kanji: "大腰",     english: "Large Hip Throw",             img: "images/technique/ogoshi.gif",             group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 6, english: "Major Hip Throw" } },
    { name: "Ouchi Gari",           kanji: "大内刈",   english: "Large Inner Reap",            img: "images/technique/ouchi_gari.gif",         group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 5, english: "Major Inside Reaping Throw" } },
    { name: "Seoi Nage",            kanji: "背負投",   english: "Shoulder Throw",              img: "images/technique/seoi-nage.gif",          group: "Dai Ikkyo",       belt: "Yellow", atja: { kyu: 6, english: "Shoulder Throw" } },

    // ── Dai Nikyo (2nd group) ─────────────────────────────────
    { name: "Kosoto Gari",          kanji: "小外刈",   english: "Small Outer Reap",            img: "images/technique/kosotogari.gif",         group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 4, english: "Minor Outer Reaping Throw" } },
    { name: "Kouchi Gari",          kanji: "小内刈",   english: "Small Inner Reap",            img: "images/technique/kouchigari.gif",         group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 4, english: "Minor Inner Reaping Throw" } },
    { name: "Koshi Guruma",         kanji: "腰車",     english: "Hip Wheel",                   img: "images/technique/koshiguruma.gif",        group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 3, english: "Hip Wheel Throw" } },
    { name: "Tsurikomi Goshi",      kanji: "釣込腰",   english: "Lift-Pull Hip Throw",         img: "images/technique/tsurikomi_goshi.gif",    group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 2, english: "Propping-Lifting Hip Throw" } },
    { name: "Okuriashi Harai",      kanji: "送足払",   english: "Following Foot Sweep",        img: "images/technique/okuriash_Haraii.gif",    group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 2, english: "Sliding Foot Sweep" } },
    { name: "Tai Otoshi",           kanji: "体落",     english: "Body Drop",                   img: "images/technique/tai_otoshi.gif",         group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 4, english: "Forward Body Drop Throw" } },
    { name: "Harai Goshi",          kanji: "払腰",     english: "Sweeping Hip Throw",          img: "images/technique/hara_igoshi.gif",        group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 4, english: "Sweeping Loin Throw" } },
    { name: "Uchi Mata",            kanji: "内股",     english: "Inner Thigh Throw",           img: "images/technique/uchi_mata.gif",          group: "Dai Nikyo",       belt: "Orange", atja: { kyu: 3, english: "Inner Thigh Sweep" } },

    // ── Dai Sankyo (3rd group) ────────────────────────────────
    { name: "Kosoto Gake",          kanji: "小外掛",   english: "Small Outer Hook",            img: "images/technique/kosotogake.gif",         group: "Dai Sankyo",      belt: "Green", atja: { kyu: 3, english: "Minor Outer Hook Throw" } },
    { name: "Tsuri Goshi",          kanji: "釣腰",     english: "Lifting Hip Throw",           img: "images/technique/tsuri_goshi.gif",        group: "Dai Sankyo",      belt: "Green", atja: { kyu: 3, english: "Lifting Hip Throw" } },
    { name: "Yoko Otoshi",          kanji: "横落",     english: "Side Drop",                   img: "images/technique/yoko_otoshi.gif",        group: "Dai Sankyo",      belt: "Green", atja: { kyu: 1, english: "Lateral Drop Throw" } },
    { name: "Ashi Guruma",          kanji: "足車",     english: "Leg Wheel",                   img: "images/technique/ashiguruma.gif",         group: "Dai Sankyo",      belt: "Green", atja: { kyu: 2, english: "Leg Wheel Throw" } },
    { name: "Hane Goshi",           kanji: "跳腰",     english: "Spring Hip Throw",            img: "images/technique/hanegoshi.gif",          group: "Dai Sankyo",      belt: "Green" },
    { name: "Harai Tsurikomi Ashi", kanji: "払釣込足", english: "Lift-Pull Foot Sweep",        img: "images/technique/haraitsurikomiashi.gif", group: "Dai Sankyo",      belt: "Green" },
    { name: "Tomoe Nage",           kanji: "巴投",     english: "Circle Throw",                img: "images/technique/tomoe_nage.gif",         group: "Dai Sankyo",      belt: "Green", atja: { kyu: 2, english: "Somersault Throw" } },
    { name: "Kata Guruma",          kanji: "肩車",     english: "Shoulder Wheel",              img: "images/technique/kata_guruma.gif",        group: "Dai Sankyo",      belt: "Green", atja: { kyu: 1, english: "Shoulder Wheel Throw" } },

    // ── Dai Yonkyo (4th group) ────────────────────────────────
    { name: "Sumi Gaeshi",          kanji: "隅返",     english: "Corner Reversal",             img: "images/technique/sumi_gaesh.gif",         group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Tani Otoshi",          kanji: "谷落",     english: "Valley Drop",                 img: "images/technique/tani_otoshi.gif",        group: "Dai Yonkyo",      belt: "Blue", atja: { kyu: 1, english: "Valley Drop Throw" } },
    { name: "Hane Makikomi",        kanji: "跳巻込",   english: "Spring Wraparound Throw",     img: "images/technique/hanemakikomi.gif",       group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Sukui Nage",           kanji: "掬投",     english: "Scoop Throw",                 img: "images/technique/sukui_nage.gif",         group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Utsuri Goshi",         kanji: "移腰",     english: "Shifting Hip Throw",          img: "images/technique/utsuri_goshi.gif",       group: "Dai Yonkyo",      belt: "Blue" },
    { name: "O Guruma",             kanji: "大車",     english: "Large Wheel",                 img: "images/technique/oguruma.gif",            group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Soto Makikomi",        kanji: "外巻込",   english: "Outer Wraparound Throw",      img: "images/technique/soto_makikomi.gif",      group: "Dai Yonkyo",      belt: "Blue", atja: { kyu: 1, english: "Outer Winding Throw" } },
    { name: "Uki Otoshi",           kanji: "浮落",     english: "Floating Drop",               img: "images/technique/uki_otoshi.gif",         group: "Dai Yonkyo",      belt: "Blue", atja: { kyu: 1, english: "Floating Drop Throw" } },

    // ── Dai Gokyo (5th group) ─────────────────────────────────
    { name: "Osoto Guruma",         kanji: "大外車",   english: "Large Outer Wheel",           img: "images/technique/osoto_guruma.gif",       group: "Dai Gokyo",       belt: "Brown" },
    { name: "Uki Waza",             kanji: "浮技",     english: "Floating Technique",          img: "images/technique/uki_waza.gif",           group: "Dai Gokyo",       belt: "Brown" },
    { name: "Yoko Wakare",          kanji: "横分",     english: "Side Separation",             img: "images/technique/yoko_wakare.gif",        group: "Dai Gokyo",       belt: "Brown" },
    { name: "Yoko Guruma",          kanji: "横車",     english: "Side Wheel",                  img: "images/technique/yoko_guruma.gif",        group: "Dai Gokyo",       belt: "Brown" },
    { name: "Ushiro Goshi",         kanji: "後腰",     english: "Rear Hip Throw",              img: "images/technique/ushiro_goshi.gif",       group: "Dai Gokyo",       belt: "Brown" },
    { name: "Ura Nage",             kanji: "裏投",     english: "Rear Throw",                  img: "images/technique/ura_nage.gif",           group: "Dai Gokyo",       belt: "Brown" },
    { name: "Sumi Otoshi",          kanji: "隅落",     english: "Corner Drop",                 img: "images/technique/sumi_otoshi.gif",        group: "Dai Gokyo",       belt: "Brown" },
    { name: "Yoko Gake",            kanji: "横掛",     english: "Side Hook",                   img: "images/technique/yoko_gake2.gif",         group: "Dai Gokyo",       belt: "Brown" },

    // ── Habukareta Waza (preserved 1895 techniques) ───────────
    { name: "Obi Otoshi",           kanji: "帯落",     english: "Belt Drop",                   img: "images/technique/obi_otoshi.gif",         group: "Habukareta Waza", belt: "Preserved" },
    { name: "Seoi Otoshi",          kanji: "背負落",   english: "Shoulder Drop",               img: "images/technique/seoio_toshi.gif",        group: "Habukareta Waza", belt: "Preserved" },
    { name: "Yama Arashi",          kanji: "山嵐",     english: "Mountain Storm",              img: "images/technique/yama_arashi.gif",        group: "Habukareta Waza", belt: "Preserved" },
    { name: "Osoto Otoshi",         kanji: "大外落",   english: "Large Outer Drop",            img: "images/technique/osoto_otoshi.gif",       group: "Habukareta Waza", belt: "Preserved" },
    { name: "Daki Wakare",          kanji: "抱分",     english: "Lifting Separation",          img: "images/technique/dakiwakare.gif",         group: "Habukareta Waza", belt: "Preserved" },
    { name: "Hikikomi Gaeshi",      kanji: "引込返",   english: "Pulling-in Reversal",         img: "images/technique/hikikomigaeshi.gif",     group: "Habukareta Waza", belt: "Preserved" },
    { name: "Tawara Gaeshi",        kanji: "俵返",     english: "Rice-Bale Reversal",          img: "images/technique/tawara_gaeshi.gif",      group: "Habukareta Waza", belt: "Preserved" },
    { name: "Uchi Makikomi",        kanji: "内巻込",   english: "Inner Wraparound Throw",      img: "images/technique/uchi_makikomi.gif",      group: "Habukareta Waza", belt: "Preserved" },

    // ── Shinmeisho no Waza (newer Kodokan throws, 1982 & 1997) ─
    // animations from judoinfo.com, redrawn onto white full-size frames
    { name: "Morote Gari",          kanji: "双手刈",   english: "Two-Hand Reap",               img: "images/technique/morote_gari.gif",        group: "Shinmeisho no Waza", belt: "Shinmeisho" },
    { name: "Kibisu Gaeshi",        kanji: "踵返",     english: "Heel Reversal",               img: "images/technique/kibisu_gaeshi.gif",      group: "Shinmeisho no Waza", belt: "Shinmeisho" },
    { name: "Harai Makikomi",       kanji: "払巻込",   english: "Sweeping Wraparound Throw",   img: "images/technique/harai_makikomi.gif",     group: "Shinmeisho no Waza", belt: "Shinmeisho" },
    { name: "Sode Tsurikomi Goshi", kanji: "袖釣込腰", english: "Sleeve Lift-Pull Hip Throw",  img: "images/technique/sode_tsurikomi_goshi.gif", group: "Shinmeisho no Waza", belt: "Shinmeisho" },
    { name: "Ippon Seoi Nage",      kanji: "一本背負投", english: "One-Arm Shoulder Throw",    img: "images/technique/ippon_seoi_nage.gif",    group: "Shinmeisho no Waza", belt: "Shinmeisho", atja: { kyu: 6, english: "Shoulder Throw" } }
  ];

  /* ATJA Judo Kyu Curriculum (v2.0): the senior grade at which each throw
     is first tested, and ATJA's own English name for it (kept as written —
     it is what students see on the exam form — except Kosoto Gake, whose
     "Minor Outer Dash Throw" is a typo for Hook). All 25 of its throws are
     here; its "Ippon/Morote Seoi-nage" row tags both Seoi Nage cards. */
  var ATJA_KYU = {
    6: { label: "6th kyu", belt: "Yellow", color: "#eab308" },
    5: { label: "5th kyu", belt: "Orange", color: "#f97316" },
    4: { label: "4th kyu", belt: "Green",  color: "#22c55e" },
    3: { label: "3rd kyu", belt: "Brown",  color: "#a16207" },
    2: { label: "2nd kyu", belt: "Brown",  color: "#a16207" },
    1: { label: "1st kyu", belt: "Brown",  color: "#a16207" }
  };

  var BELT_ORDER = ["Yellow", "Orange", "Green", "Blue", "Brown", "Preserved", "Shinmeisho"];

  var BELT_META = {
    Yellow:    { label: "Dai Ikkyo",       sub: "1st group",           color: "#eab308" },
    Orange:    { label: "Dai Nikyo",       sub: "2nd group",           color: "#f97316" },
    Green:     { label: "Dai Sankyo",      sub: "3rd group",           color: "#22c55e" },
    Blue:      { label: "Dai Yonkyo",      sub: "4th group",           color: "#3b82f6" },
    Brown:     { label: "Dai Gokyo",       sub: "5th group",           color: "#a16207" },
    Preserved: { label: "Habukareta Waza", sub: "preserved 1895",      color: "#94a3b8" },
    Shinmeisho: { label: "Shinmeisho no Waza", sub: "newer Kodokan throws", color: "#14b8a6" }
  };

  var MODES = {
    "image-to-name":   { icon: "🎬", title: "Visual",      desc: "Watch the animation, name the throw",       label: "🎬 Visual" },
    "english-to-name": { icon: "📖", title: "EN → JP",     desc: "English meaning to Japanese name",           label: "📖 EN→JP" },
    "name-to-english": { icon: "🈶", title: "JP → EN",     desc: "Japanese name to English meaning",           label: "🈶 JP→EN" },
    "type-answer":     { icon: "⌨️", title: "Type It",     desc: "Watch the animation, type the name — no options", label: "⌨️ Type" },
    "smart":           { icon: "🧠", title: "Smart Drill", desc: "Mixed questions, weakest throws first",      label: "🧠 Smart" }
  };

  /* ═══════════════════════════════════════════════════════════════
     General judo vocabulary — NOT throws. Commands, roles, the
     fundamentals (falls, stances, footwork), body-part and direction
     modifiers, the words throw names are built from, the waza families,
     and contest scoring. Kept separate
     from THROWS (no images, no belt groups) and studied as plain
     flip-cards in the Terms section. Fact-checked against the Kodokan,
     the IJF rules, and the Wikipedia judo glossary.
  ═══════════════════════════════════════════════════════════════ */

  var TERM_CATEGORIES = [
    { key: "etiquette", label: "Commands & Etiquette", sub: "words heard in the dojo",   color: "#e5484d" },
    { key: "concepts",  label: "Core Concepts",        sub: "principles, gripping & training", color: "#f59e0b" },
    { key: "phases",    label: "Roles & Phases",       sub: "the anatomy of a throw",     color: "#22c55e" },
    { key: "basics",    label: "Fundamentals",         sub: "falls, stances & footwork",  color: "#14b8a6" },
    { key: "body",      label: "Body & Direction",     sub: "modifiers inside technique names", color: "#3b82f6" },
    { key: "names",     label: "Reading Throw Names",  sub: "decode any throw, word by word", color: "#f97316" },
    { key: "waza",      label: "Technique Categories", sub: "the families of waza",       color: "#a855f7" },
    { key: "katame",    label: "Pins, Chokes & Locks", sub: "the ATJA kyu grappling list", color: "#c2855a" },
    { key: "scoring",   label: "Scoring & Penalties",  sub: "in shiai (contest)",         color: "#ec4899" }
  ];

  var TERMS = [
    // ── Commands & Etiquette ──────────────────────────────────
    { term: "Hajime",   kanji: "始め",     english: "Begin / start",            category: "etiquette", note: "The command to start — and to resume action after Mate." },
    { term: "Mate",     kanji: "待て",     english: "Wait / stop",              category: "etiquette", note: "Referee command to pause the contest. Often romanized “Matte”." },
    { term: "Rei",      kanji: "礼",       english: "Bow",                      category: "etiquette", note: "The bow of respect — standing (ritsurei) or kneeling (zarei)." },
    { term: "Sono Mama", kanji: "そのまま", english: "Freeze — do not move", category: "etiquette", note: "Written in kana. Pauses the action in ne-waza without resetting position." },
    { term: "Yoshi",    kanji: "よし",     english: "Carry on / resume",        category: "etiquette", note: "Written in kana. Restarts the action after Sono mama." },
    { term: "Maitta",   kanji: "参った",   english: "I submit / I give up",     category: "etiquette", note: "Spoken, or signalled by tapping twice (the tap-out)." },
    { term: "Dojo",     kanji: "道場",     english: "Training hall",            category: "etiquette", note: "Literally “place of the Way.”" },
    { term: "Judogi",   kanji: "柔道着",   english: "Judo uniform",             category: "etiquette", note: "Commonly shortened to “gi.” Also written 柔道衣." },
    { term: "Judoka",   kanji: "柔道家",   english: "A judo practitioner",      category: "etiquette", note: "Someone who practises judo." },
    { term: "Sensei",   kanji: "先生",     english: "Teacher / instructor",     category: "etiquette", note: "Literally “one who has gone before.”" },
    { term: "Obi",      kanji: "帯",       english: "Belt",                     category: "etiquette", note: "Its colour marks the wearer’s kyu or dan rank." },
    { term: "Tatami",   kanji: "畳",       english: "Mat",                      category: "etiquette", note: "The matted surface judo is trained and contested on." },
    // the line-up that opens and closes every class
    { term: "Shomen",   kanji: "正面",     english: "Front of the dojo",        category: "etiquette", note: "The front wall — the place of honour, usually with Kanō’s portrait. The class lines up facing it." },
    { term: "Ki o tsuke", kanji: "気を付け", english: "Attention!",             category: "etiquette", note: "The call to stand to attention when the class lines up, just before the bows. Also written “kiotsuke.”" },
    { term: "Shomen ni rei", kanji: "正面に礼", english: "Bow to the front",    category: "etiquette", note: "The first bow of the line-up that opens and closes class, made toward the shomen." },
    { term: "Sensei ni rei", kanji: "先生に礼", english: "Bow to the teacher",  category: "etiquette", note: "Called right after the bow to the front; often followed by otagai ni rei — bow to each other." },
    { term: "Senpai",   kanji: "先輩",     english: "Senior student",           category: "etiquette", note: "A student ahead of you in rank or experience. At line-up the senpai often calls the bow to the teacher." },
    { term: "Seiza",    kanji: "正座",     english: "Formal kneeling",          category: "etiquette", note: "Kneeling upright, sitting on the heels. Kneel left knee first, rise right knee first — and wait for the senior grades to move before you do." },
    { term: "Ritsurei", kanji: "立礼",     english: "Standing bow",             category: "etiquette", note: "Bow from a natural standing posture, about 30°. Its kneeling counterpart is zarei (座礼)." },

    // ── Core Concepts (principles, gripping & training) ───────
    { term: "Jita Kyoei", kanji: "自他共栄", english: "Mutual welfare and benefit", category: "concepts", note: "One of Kanō’s two guiding principles — mutual prosperity for self and others. Its partner is seiryoku zen’yō (精力善用), maximum efficient use of energy." },
    { term: "Kumi-kata", kanji: "組み方", english: "Gripping method",          category: "concepts", note: "How you take and manage your grips on the judogi before attacking." },
    { term: "Uchi-komi", kanji: "打ち込み", english: "Repetition (fit-in) training", category: "concepts", note: "Drilling a throw’s entry (kuzushi + tsukuri) without completing it — as opposed to nage-komi, which repeats the full throw." },
    { term: "Hikite",   kanji: "引き手",   english: "Pulling hand",             category: "concepts", note: "Usually holds the sleeve and draws uke off balance." },
    { term: "Tsurite",  kanji: "釣り手",   english: "Lifting hand",             category: "concepts", note: "Usually holds the lapel (sometimes the back or belt) to lift and steer uke." },

    // ── Roles & Phases of a throw ─────────────────────────────
    { term: "Tori",     kanji: "取り",     english: "The one who executes the technique", category: "phases", note: "Literally “taker.”" },
    { term: "Uke",      kanji: "受け",     english: "The one who receives the technique", category: "phases", note: "Literally “receiver” — the partner who is thrown." },
    { term: "Kuzushi",  kanji: "崩し",     english: "Breaking the balance",     category: "phases", note: "First phase of a throw: off-balancing uke." },
    { term: "Tsukuri",  kanji: "作り",     english: "Fitting in / positioning", category: "phases", note: "Second phase: entering and setting your body to throw." },
    { term: "Kake",     kanji: "掛け",     english: "Execution of the throw",   category: "phases", note: "Final phase: completing the technique." },
    { term: "Ukemi",    kanji: "受け身",   english: "Breakfall(s)",             category: "phases", note: "The skill of falling safely — the first thing every judoka learns." },
    { term: "Kime",     kanji: "極め",     english: "Finishing with control",   category: "phases", note: "Often taught as a fourth phase after kake: following through and keeping control as uke lands." },

    // ── Fundamentals (falls, stances & footwork) ──────────────
    { term: "Ushiro ukemi", kanji: "後ろ受身", english: "Back breakfall",       category: "basics", note: "Fall straight back with the chin tucked, slapping the mat with both arms. Called kōhō ukemi (後方受身) on the ATJA exam — 6th kyu." },
    { term: "Yoko ukemi", kanji: "横受身", english: "Side breakfall",           category: "basics", note: "Fall onto your side, slapping with the arm on the side you land on." },
    { term: "Mae ukemi", kanji: "前受身",  english: "Front breakfall",          category: "basics", note: "Fall forward onto forearms and palms, face turned away from the mat." },
    { term: "Mae mawari ukemi", kanji: "前回り受身", english: "Forward rolling breakfall", category: "basics", note: "Roll diagonally over one shoulder and finish with a side slap. Also called zenpō kaiten ukemi — its name on the ATJA exam (5th kyu)." },
    { term: "Shizentai", kanji: "自然体",  english: "Natural posture",          category: "basics", note: "Upright and relaxed. Shizen hontai stands square; migi and hidari shizentai lead with the right or left foot." },
    { term: "Jigotai",  kanji: "自護体",   english: "Defensive posture",        category: "basics", note: "Wide, low, knees bent. Jigo hontai stands square; migi and hidari jigotai lead with the right or left foot." },
    { term: "Ayumi ashi", kanji: "歩み足", english: "Walking steps",            category: "basics", note: "The feet pass each other, as in ordinary walking." },
    { term: "Tsugi ashi", kanji: "継ぎ足", english: "Following steps",          category: "basics", note: "One foot leads and the other follows without passing it — the everyday footwork of judo." },
    { term: "Tai sabaki", kanji: "体捌き", english: "Body turning",             category: "basics", note: "Moving and turning the whole body to set up a throw or slip an attack: forward, back, and turning (mawari) sabaki." },

    // ── Body & Direction (modifiers inside technique names) ───
    { term: "Ashi",     kanji: "足",       english: "Foot or leg",              category: "body", note: "As in Ashi-waza and De-ashi-barai." },
    { term: "Te",       kanji: "手",       english: "Hand",                     category: "body", note: "As in Te-waza." },
    { term: "Koshi · Goshi", kanji: "腰", english: "Hip",                  category: "body", note: "Voiced to “goshi” inside compounds (O-goshi) — a sound change called rendaku." },
    { term: "Ude",      kanji: "腕",       english: "Arm",                      category: "body", note: "As in Ude-garami." },
    { term: "Hiza",     kanji: "膝",       english: "Knee",                     category: "body", note: "As in Hiza-guruma." },
    { term: "Mune",     kanji: "胸",       english: "Chest",                    category: "body", note: "As in Mune-gatame." },
    { term: "Eri",      kanji: "襟",       english: "Collar / lapel",           category: "body", note: "As in Okuri-eri-jime." },
    { term: "Sode",     kanji: "袖",       english: "Sleeve",                   category: "body", note: "As in Sode-tsurikomi-goshi." },
    { term: "Kubi",     kanji: "首",       english: "Neck",                     category: "body", note: "首 is the neck specifically; the head is atama (頭)." },
    { term: "Mae",      kanji: "前",       english: "Front / forward",          category: "body", note: "As in Mae-ukemi." },
    { term: "Ushiro",   kanji: "後ろ",     english: "Back / rear",              category: "body", note: "As in Ushiro-goshi and Ushiro-ukemi." },
    { term: "Yoko",     kanji: "横",       english: "Side",                     category: "body", note: "As in Yoko-otoshi and Yoko-shiho-gatame." },
    { term: "Migi",     kanji: "右",       english: "Right",                    category: "body", note: "As in migi shizentai — right natural posture." },
    { term: "Hidari",   kanji: "左",       english: "Left",                     category: "body", note: "As in hidari shizentai — left natural posture." },
    { term: "Mawari",   kanji: "回り",     english: "Turning / rotation",       category: "body", note: "As in Mae-mawari-ukemi, the forward rolling breakfall." },

    // ── Reading Throw Names (the words a throw is built from) ─
    { term: "O",        kanji: "大",       english: "Large / major",            category: "names", note: "Written Ō with a long vowel. O-soto-gari = large · outside · reap." },
    { term: "Ko",       kanji: "小",       english: "Small / minor",            category: "names", note: "Ko-uchi-gari = small · inside · reap." },
    { term: "Soto",     kanji: "外",       english: "Outside / outer",          category: "names", note: "Ko-soto-gake = small · outside · hook." },
    { term: "Uchi",     kanji: "内",       english: "Inside / inner",           category: "names", note: "Uchi-mata = inner thigh." },
    { term: "Gari",     kanji: "刈",       english: "Reap",                     category: "names", note: "Kari (刈り), voiced to “gari” inside a name: O-soto-gari, Ko-uchi-gari." },
    { term: "Harai",    kanji: "払",       english: "Sweep",                    category: "names", note: "As in Harai-goshi; often voiced “barai” — De-ashi-barai." },
    { term: "Guruma",   kanji: "車",       english: "Wheel",                    category: "names", note: "Kuruma, voiced inside a name: Hiza-guruma, Ashi-guruma." },
    { term: "Otoshi",   kanji: "落",       english: "Drop",                     category: "names", note: "Tai-otoshi = body drop; Tani-otoshi = valley drop." },
    { term: "Nage",     kanji: "投",       english: "Throw",                    category: "names", note: "Seoi-nage = shoulder throw; also the root of nage-waza." },
    { term: "Gaeshi",   kanji: "返",       english: "Reversal",                 category: "names", note: "Kaeshi, voiced inside a name: Sumi-gaeshi. Kaeshi-waza are counter-throws." },
    { term: "Makikomi", kanji: "巻込",     english: "Wrap-around",              category: "names", note: "Tori winds uke around their own body and falls with them: Soto-makikomi." },

    // ── Technique (Waza) Categories ───────────────────────────
    { term: "Nage-waza", kanji: "投技",    english: "Throwing techniques",      category: "waza", note: "The Kodokan recognizes 68 throws (67 before the 2017 revision), divided into te-, koshi-, ashi-, and sutemi-waza." },
    { term: "Te-waza",   kanji: "手技",    english: "Hand (hand/arm) throws",   category: "waza", note: "e.g. Seoi-nage, Tai-otoshi, Kata-guruma." },
    { term: "Koshi-waza", kanji: "腰技",   english: "Hip throws",               category: "waza", note: "e.g. O-goshi, Harai-goshi, Uki-goshi." },
    { term: "Ashi-waza", kanji: "足技",    english: "Foot & leg throws",        category: "waza", note: "e.g. O-soto-gari, De-ashi-barai, Hiza-guruma." },
    { term: "Sutemi-waza", kanji: "捨身技", english: "Sacrifice throws",        category: "waza", note: "Tori sacrifices their own stance: ma-sutemi (onto the back, e.g. Tomoe-nage) and yoko-sutemi (onto the side, e.g. Tani-otoshi)." },
    { term: "Katame-waza", kanji: "固技",  english: "Grappling techniques (holds, chokes, locks)", category: "waza", note: "The 32 Kodokan katame-waza (29 before the 2017 revision): osaekomi- (pins), shime- (chokes), and kansetsu-waza (locks)." },
    { term: "Osaekomi-waza", kanji: "抑込技", english: "Hold-downs / pins",     category: "waza", note: "e.g. Kesa-gatame, Yoko-shiho-gatame." },
    { term: "Shime-waza", kanji: "絞技",   english: "Strangles & chokes",       category: "waza", note: "e.g. Hadaka-jime, Okuri-eri-jime." },
    { term: "Kansetsu-waza", kanji: "関節技", english: "Joint locks",           category: "waza", note: "In contest judo, limited to the elbow — e.g. Juji-gatame, Ude-garami." },
    { term: "Tachi-waza", kanji: "立技",   english: "Standing techniques",      category: "waza", note: "Throws made from standing — te-, koshi- and ashi-waza. The first half of the ATJA kyu exam." },
    { term: "Renraku-waza", kanji: "連絡技", english: "Combination techniques", category: "waza", note: "Linking one attack into the next. Spelled “renwaku waza” on the ATJA exam form." },
    { term: "Kaeshi-waza", kanji: "返し技", english: "Counter techniques",      category: "waza", note: "Turning uke’s own attack back against them. Every ATJA kyu grade tests at least one." },
    { term: "Fusegi-waza", kanji: "防ぎ技", english: "Hold-down escapes",       category: "waza", note: "Escaping a pin — the ATJA exam’s name for the hold-escape drills." },

    // ── Pins, Chokes & Locks (ATJA Judo Kyu Curriculum v2.0) ──
    { term: "Kesa-gatame", kanji: "袈裟固", english: "Scarf hold",              category: "katame", note: "Pinning from the side, one arm around uke’s neck and their near arm trapped. ATJA 6th kyu." },
    { term: "Yoko-shiho-gatame", kanji: "横四方固", english: "Side four-corner hold", category: "katame", note: "Pinning across uke’s chest from the side. ATJA 5th kyu." },
    { term: "Kami-shiho-gatame", kanji: "上四方固", english: "Upper four-corner hold", category: "katame", note: "Pinning from above uke’s head, gripping the belt on both sides. ATJA 5th kyu." },
    { term: "Kuzure-kesa-gatame", kanji: "崩袈裟固", english: "Modified scarf hold", category: "katame", note: "Kesa-gatame with the arm under uke’s far armpit instead of around the neck. ATJA 4th kyu." },
    { term: "Kuzure-yoko-shiho-gatame", kanji: "崩横四方固", english: "Modified side four-corner hold", category: "katame", note: "A variation of yoko-shiho-gatame. ATJA 3rd kyu." },
    { term: "Kata-gatame", kanji: "肩固",   english: "Shoulder hold",            category: "katame", note: "Uke’s arm and head are locked together against their own shoulder. ATJA 2nd kyu." },
    { term: "Hadaka-jime", kanji: "裸絞",   english: "Naked choke",              category: "katame", note: "From behind with the forearm, without using the gi — hence “naked.” ATJA 6th kyu." },
    { term: "Juji-jime", kanji: "十字絞",   english: "Cross choke",              category: "katame", note: "Hands crossed, gripping both lapels. Three forms: nami (normal), kata (half) and gyaku (reverse). ATJA 5th kyu." },
    { term: "Okuri-eri-jime", kanji: "送襟絞", english: "Sliding lapel choke",   category: "katame", note: "From behind, both hands working the lapels. ATJA 4th kyu." },
    { term: "Kataha-jime", kanji: "片羽絞", english: "Single-wing choke",        category: "katame", note: "From behind, one arm lifts uke’s arm like a wing while the other chokes with the lapel. The ATJA form calls it the single shoulder choke; 3rd kyu." },
    { term: "Ryote-jime", kanji: "両手絞",  english: "Two-hand lapel choke",     category: "katame", note: "A choke using both hands on the lapels. ATJA 2nd kyu." },
    { term: "Sankaku-jime", kanji: "三角絞", english: "Triangle choke",          category: "katame", note: "The legs lock in a figure-4 around uke’s neck and one arm. ATJA 1st kyu." },
    { term: "Ude-garami", kanji: "腕緘",    english: "Bent arm lock",            category: "katame", note: "Also called the entangled arm lock. ATJA 5th kyu (seniors only — juniors skip arm locks)." },
    { term: "Ude-gatame", kanji: "腕固",    english: "Straight arm lock",        category: "katame", note: "Full name ude-hishigi-ude-gatame (hishigi = crush). ATJA 4th kyu." },
    { term: "Juji-gatame", kanji: "十字固", english: "Cross arm lock",           category: "katame", note: "Full name ude-hishigi-juji-gatame — lying at a right angle across uke, arm straightened between the legs. ATJA 3rd kyu." },
    { term: "Hiza-gatame", kanji: "膝固",   english: "Knee arm lock",            category: "katame", note: "Full name ude-hishigi-hiza-gatame — the knee levers against uke’s straightened elbow. ATJA 2nd kyu." },
    { term: "Sankaku-gatame", kanji: "三角固", english: "Triangle arm lock",     category: "katame", note: "Full name ude-hishigi-sankaku-gatame — the elbow is locked from the triangle position. ATJA 1st kyu." },

    // ── Scoring & Penalties ───────────────────────────────────
    { term: "Ippon",    kanji: "一本",     english: "Full point — instant win", category: "scoring", note: "Ends the match: a clean throw largely on the back, a 20-second pin, or a submission to a lock or choke." },
    { term: "Waza-ari", kanji: "技あり",   english: "Half-point score",         category: "scoring", note: "Two waza-ari add up to ippon (waza-ari awasete ippon). A 10–19-second hold-down also scores waza-ari." },
    { term: "Yuko",     kanji: "有効",     english: "Smallest score",           category: "scoring", note: "Brought back by the IJF in 2025, below waza-ari — a 5–9-second hold or a throw that falls short of waza-ari. Any number of yuko never add up to a waza-ari." },
    { term: "Osaekomi", kanji: "抑え込み", english: "Hold-down is on",          category: "scoring", note: "The referee’s call that a pin has started the clock: 5 s yuko, 10 s waza-ari, 20 s ippon. Toketa (解けた) means the hold is broken." },
    { term: "Shido",    kanji: "指導",     english: "Penalty for a minor infringement", category: "scoring", note: "A caution for stalling or small rule breaks; a third shido becomes hansoku-make." },
    { term: "Hansoku-make", kanji: "反則負け", english: "Disqualification",     category: "scoring", note: "The severe penalty / loss — either a third shido or one serious infringement." }
  ];

  var DATA = {
    THROWS: THROWS, BELT_ORDER: BELT_ORDER, BELT_META: BELT_META, MODES: MODES, ATJA_KYU: ATJA_KYU,
    TERMS: TERMS, TERM_CATEGORIES: TERM_CATEGORIES
  };

  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
  else root.JUDO_DATA = DATA;
})(typeof self !== "undefined" ? self : this);
