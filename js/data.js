/* ═══════════════════════════════════════════════════════════════
   Judo throw data — 47 techniques of the Kodokan Gokyo no Waza
   plus the Habukareta Waza (preserved 1895 techniques).

   Plain script (no modules) so the app keeps working from file://.
   Exposed as window.JUDO_DATA in the browser and via CommonJS for
   the Node test suite.
═══════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  var THROWS = [
    // ── Dai Ikkyo (1st group) ─────────────────────────────────
    { name: "Deashi Harai",         kanji: "出足払",   english: "Forward Foot Sweep",          img: "images/technique/deashibarai.gif",        group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "Hiza Guruma",          kanji: "膝車",     english: "Knee Wheel",                  img: "images/technique/hizaguruma.gif",         group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "Sasae Tsurikomi Ashi", kanji: "支釣込足", english: "Supporting Foot Lift-Pull",   img: "images/technique/sasaetsu.gif",           group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "Uki Goshi",            kanji: "浮腰",     english: "Floating Hip",                img: "images/technique/uki_goshi.gif",          group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "Osoto Gari",           kanji: "大外刈",   english: "Large Outer Reap",            img: "images/technique/osoto_gari.gif",         group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "O Goshi",              kanji: "大腰",     english: "Large Hip Throw",             img: "images/technique/ogoshi.gif",             group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "Ouchi Gari",           kanji: "大内刈",   english: "Large Inner Reap",            img: "images/technique/ouchi_gari.gif",         group: "Dai Ikkyo",       belt: "Yellow" },
    { name: "Seoi Nage",            kanji: "背負投",   english: "Shoulder Throw",              img: "images/technique/seoi-nage.gif",          group: "Dai Ikkyo",       belt: "Yellow" },

    // ── Dai Nikyo (2nd group) ─────────────────────────────────
    { name: "Kosoto Gari",          kanji: "小外刈",   english: "Small Outer Reap",            img: "images/technique/kosotogari.gif",         group: "Dai Nikyo",       belt: "Orange" },
    { name: "Kouchi Gari",          kanji: "小内刈",   english: "Small Inner Reap",            img: "images/technique/kouchigari.gif",         group: "Dai Nikyo",       belt: "Orange" },
    { name: "Koshi Guruma",         kanji: "腰車",     english: "Hip Wheel",                   img: "images/technique/koshiguruma.gif",        group: "Dai Nikyo",       belt: "Orange" },
    { name: "Tsurikomi Goshi",      kanji: "釣込腰",   english: "Lift-Pull Hip Throw",         img: "images/technique/tsurikomi_goshi.gif",    group: "Dai Nikyo",       belt: "Orange" },
    { name: "Okuriashi Harai",      kanji: "送足払",   english: "Following Foot Sweep",        img: "images/technique/okuriash_Haraii.gif",    group: "Dai Nikyo",       belt: "Orange" },
    { name: "Tai Otoshi",           kanji: "体落",     english: "Body Drop",                   img: "images/technique/tai_otoshi.gif",         group: "Dai Nikyo",       belt: "Orange" },
    { name: "Harai Goshi",          kanji: "払腰",     english: "Sweeping Hip Throw",          img: "images/technique/hara_igoshi.gif",        group: "Dai Nikyo",       belt: "Orange" },
    { name: "Uchi Mata",            kanji: "内股",     english: "Inner Thigh Throw",           img: "images/technique/uchi_mata.gif",          group: "Dai Nikyo",       belt: "Orange" },

    // ── Dai Sankyo (3rd group) ────────────────────────────────
    { name: "Kosoto Gake",          kanji: "小外掛",   english: "Small Outer Hook",            img: "images/technique/kosotogake.gif",         group: "Dai Sankyo",      belt: "Green" },
    { name: "Tsuri Goshi",          kanji: "釣腰",     english: "Lifting Hip Throw",           img: "images/technique/tsuri_goshi.gif",        group: "Dai Sankyo",      belt: "Green" },
    { name: "Yoko Otoshi",          kanji: "横落",     english: "Side Drop",                   img: "images/technique/yoko_otoshi.gif",        group: "Dai Sankyo",      belt: "Green" },
    { name: "Ashi Guruma",          kanji: "足車",     english: "Leg Wheel",                   img: "images/technique/ashiguruma.gif",         group: "Dai Sankyo",      belt: "Green" },
    { name: "Hane Goshi",           kanji: "跳腰",     english: "Spring Hip Throw",            img: "images/technique/hanegoshi.gif",          group: "Dai Sankyo",      belt: "Green" },
    { name: "Harai Tsurikomi Ashi", kanji: "払釣込足", english: "Lift-Pull Foot Sweep",        img: "images/technique/haraitsurikomiashi.gif", group: "Dai Sankyo",      belt: "Green" },
    { name: "Tomoe Nage",           kanji: "巴投",     english: "Circle Throw",                img: "images/technique/tomoe_nage.gif",         group: "Dai Sankyo",      belt: "Green" },

    // ── Dai Yonkyo (4th group) ────────────────────────────────
    { name: "Sumi Gaeshi",          kanji: "隅返",     english: "Corner Reversal",             img: "images/technique/sumi_gaesh.gif",         group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Tani Otoshi",          kanji: "谷落",     english: "Valley Drop",                 img: "images/technique/tani_otoshi.gif",        group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Hane Makikomi",        kanji: "跳巻込",   english: "Spring Wraparound Throw",     img: "images/technique/hanemakikomi.gif",       group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Sukui Nage",           kanji: "掬投",     english: "Scoop Throw",                 img: "images/technique/sukui_nage.gif",         group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Utsuri Goshi",         kanji: "移腰",     english: "Shifting Hip Throw",          img: "images/technique/utsuri_goshi.gif",       group: "Dai Yonkyo",      belt: "Blue" },
    { name: "O Guruma",             kanji: "大車",     english: "Large Wheel",                 img: "images/technique/oguruma.gif",            group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Soto Makikomi",        kanji: "外巻込",   english: "Outer Wraparound Throw",      img: "images/technique/soto_makikomi.gif",      group: "Dai Yonkyo",      belt: "Blue" },
    { name: "Uki Otoshi",           kanji: "浮落",     english: "Floating Drop",               img: "images/technique/uki_otoshi.gif",         group: "Dai Yonkyo",      belt: "Blue" },

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
    { name: "Uchi Makikomi",        kanji: "内巻込",   english: "Inner Wraparound Throw",      img: "images/technique/uchi_makikomi.gif",      group: "Habukareta Waza", belt: "Preserved" }
  ];

  var BELT_ORDER = ["Yellow", "Orange", "Green", "Blue", "Brown", "Preserved"];

  var BELT_META = {
    Yellow:    { label: "Dai Ikkyo",       sub: "1st group",           color: "#eab308" },
    Orange:    { label: "Dai Nikyo",       sub: "2nd group",           color: "#f97316" },
    Green:     { label: "Dai Sankyo",      sub: "3rd group",           color: "#22c55e" },
    Blue:      { label: "Dai Yonkyo",      sub: "4th group",           color: "#3b82f6" },
    Brown:     { label: "Dai Gokyo",       sub: "5th group",           color: "#a16207" },
    Preserved: { label: "Habukareta Waza", sub: "preserved 1895",      color: "#94a3b8" }
  };

  var MODES = {
    "image-to-name":   { icon: "🎬", title: "Visual",      desc: "Watch the animation, name the throw",       label: "🎬 Visual" },
    "english-to-name": { icon: "📖", title: "EN → JP",     desc: "English meaning to Japanese name",           label: "📖 EN→JP" },
    "name-to-english": { icon: "🈶", title: "JP → EN",     desc: "Japanese name to English meaning",           label: "🈶 JP→EN" },
    "type-answer":     { icon: "⌨️", title: "Type It",     desc: "Watch the animation, type the name — no options", label: "⌨️ Type" },
    "smart":           { icon: "🧠", title: "Smart Drill", desc: "Mixed questions, weakest throws first",      label: "🧠 Smart" }
  };

  /* ═══════════════════════════════════════════════════════════════
     General judo vocabulary — NOT throws. Commands, roles, body-part
     modifiers, the waza families, and contest scoring. Kept separate
     from THROWS (no images, no belt groups) and studied as plain
     flip-cards in the Terms section. Fact-checked against the Kodokan,
     the IJF rules, and the Wikipedia judo glossary.
  ═══════════════════════════════════════════════════════════════ */

  var TERM_CATEGORIES = [
    { key: "etiquette", label: "Commands & Etiquette", sub: "words heard in the dojo",   color: "#e5484d" },
    { key: "concepts",  label: "Core Concepts",        sub: "principles, gripping & training", color: "#f59e0b" },
    { key: "phases",    label: "Roles & Phases",       sub: "the anatomy of a throw",     color: "#22c55e" },
    { key: "body",      label: "Body Parts",           sub: "modifiers inside throw names", color: "#3b82f6" },
    { key: "waza",      label: "Technique Categories", sub: "the families of waza",       color: "#a855f7" },
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

    // ── Core Concepts (principles, gripping & training) ───────
    { term: "Jita Kyoei", kanji: "自他共栄", english: "Mutual welfare and benefit", category: "concepts", note: "One of Kanō’s two guiding principles — mutual prosperity for self and others. Its partner is seiryoku zen’yō (精力善用), maximum efficient use of energy." },
    { term: "Kumi-kata", kanji: "組み方", english: "Gripping method",          category: "concepts", note: "How you take and manage your grips on the judogi before attacking." },
    { term: "Uchi-komi", kanji: "打ち込み", english: "Repetition (fit-in) training", category: "concepts", note: "Drilling a throw’s entry (kuzushi + tsukuri) without completing it — as opposed to nage-komi, which repeats the full throw." },

    // ── Roles & Phases of a throw ─────────────────────────────
    { term: "Tori",     kanji: "取り",     english: "The one who executes the technique", category: "phases", note: "Literally “taker.”" },
    { term: "Uke",      kanji: "受け",     english: "The one who receives the technique", category: "phases", note: "Literally “receiver” — the partner who is thrown." },
    { term: "Kuzushi",  kanji: "崩し",     english: "Breaking the balance",     category: "phases", note: "First phase of a throw: off-balancing uke." },
    { term: "Tsukuri",  kanji: "作り",     english: "Fitting in / positioning", category: "phases", note: "Second phase: entering and setting your body to throw." },
    { term: "Kake",     kanji: "掛け",     english: "Execution of the throw",   category: "phases", note: "Final phase: completing the technique." },
    { term: "Ukemi",    kanji: "受け身",   english: "Breakfall(s)",             category: "phases", note: "The skill of falling safely — the first thing every judoka learns." },

    // ── Body Parts (modifiers inside throw names) ─────────────
    { term: "Ashi",     kanji: "足",       english: "Foot or leg",              category: "body", note: "As in Ashi-waza and De-ashi-barai." },
    { term: "Te",       kanji: "手",       english: "Hand",                     category: "body", note: "As in Te-waza." },
    { term: "Koshi · Goshi", kanji: "腰", english: "Hip",                  category: "body", note: "Voiced to “goshi” inside compounds (O-goshi) — a sound change called rendaku." },
    { term: "Ude",      kanji: "腕",       english: "Arm",                      category: "body", note: "As in Ude-garami." },
    { term: "Hiza",     kanji: "膝",       english: "Knee",                     category: "body", note: "As in Hiza-guruma." },
    { term: "Mune",     kanji: "胸",       english: "Chest",                    category: "body", note: "As in Mune-gatame." },
    { term: "Eri",      kanji: "襟",       english: "Collar / lapel",           category: "body", note: "As in Okuri-eri-jime." },
    { term: "Sode",     kanji: "袖",       english: "Sleeve",                   category: "body", note: "As in Sode-tsurikomi-goshi." },
    { term: "Kubi",     kanji: "首",       english: "Neck",                     category: "body", note: "首 is the neck specifically; the head is atama (頭)." },

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

    // ── Scoring & Penalties ───────────────────────────────────
    { term: "Ippon",    kanji: "一本",     english: "Full point — instant win", category: "scoring", note: "Ends the match: a clean throw largely on the back, a 20-second pin, or a submission to a lock or choke." },
    { term: "Waza-ari", kanji: "技あり",   english: "Half-point score",         category: "scoring", note: "Two waza-ari add up to ippon. Since 2017 it is the only score below ippon (yuko was abolished)." },
    { term: "Shido",    kanji: "指導",     english: "Penalty for a minor infringement", category: "scoring", note: "A caution for stalling or small rule breaks; a third shido becomes hansoku-make." },
    { term: "Hansoku-make", kanji: "反則負け", english: "Disqualification",     category: "scoring", note: "The severe penalty / loss — either a third shido or one serious infringement." }
  ];

  var DATA = {
    THROWS: THROWS, BELT_ORDER: BELT_ORDER, BELT_META: BELT_META, MODES: MODES,
    TERMS: TERMS, TERM_CATEGORIES: TERM_CATEGORIES
  };

  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
  else root.JUDO_DATA = DATA;
})(typeof self !== "undefined" ? self : this);
