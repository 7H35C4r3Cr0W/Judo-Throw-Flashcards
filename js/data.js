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
    "image-to-name":   { icon: "🎬", title: "Visual",      desc: "Watch the animation, name the throw",      label: "🎬 Visual" },
    "english-to-name": { icon: "📖", title: "EN → JP",     desc: "English meaning to Japanese name",          label: "📖 EN→JP" },
    "name-to-english": { icon: "🈶", title: "JP → EN",     desc: "Japanese name to English meaning",          label: "🈶 JP→EN" },
    "smart":           { icon: "🧠", title: "Smart Drill", desc: "Mixed questions, weakest throws first",     label: "🧠 Smart" }
  };

  var DATA = { THROWS: THROWS, BELT_ORDER: BELT_ORDER, BELT_META: BELT_META, MODES: MODES };

  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
  else root.JUDO_DATA = DATA;
})(typeof self !== "undefined" ? self : this);
