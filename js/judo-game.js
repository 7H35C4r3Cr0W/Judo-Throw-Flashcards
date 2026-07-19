/* ═══════════════════════════════════════════════════════════════
   IPPON TOSS! — a silly little judo mini-game · 一本投げ

   Press & hold to break uke's balance (kuzushi). The needle is
   uke's balance — release inside the glowing zone and send them
   flying across the tatami. Earn your belt one ippon at a time.

   Self-contained: injects its own scoped CSS (.jg-*), draws all
   art on canvas, zero dependencies, zero network requests.
   Touch + mouse + keyboard (Space). Respects reduced motion.

   Theming: reads the host site's design tokens through --jg-*
   custom properties (see fallbacks below), so the same file fits
   any page that maps its own palette onto:
     --jg-accent, --jg-accent-text, --jg-gold, --jg-surface,
     --jg-text, --jg-muted, --jg-border, --jg-radius,
     --jg-font-body, --jg-font-display, --jg-shadow

   Usage: <div data-judo-game></div> + this script. Auto-mounts.
   Manual: JudoGame.mount(element)
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ═══════════ Scoped styles ═══════════ */

  var CSS = "" +
    ".jg-shell [hidden]{display:none !important;}" +
    ".jg-shell{position:relative;font-family:var(--jg-font-body,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif);color:var(--jg-text,#eceef2);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}" +
    ".jg-frame{position:relative;overflow:hidden;border-radius:var(--jg-radius,16px);border:1px solid var(--jg-border,#2a3040);background:var(--jg-surface,#141824);box-shadow:var(--jg-shadow,0 10px 30px rgba(0,0,0,.35));touch-action:pan-y;cursor:grab;}" +
    ".jg-frame.jg-charging{cursor:grabbing;}" +
    ".jg-frame:focus-visible{outline:2px solid var(--jg-accent,#e5484d);outline-offset:3px;}" +
    ".jg-frame.jg-pointer-focus:focus-visible{outline:none;}" +
    ".jg-canvas{display:block;width:100%;}" +
    /* HUD chips */
    ".jg-hud{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;pointer-events:none;}" +
    ".jg-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:max(calc(11px*var(--jg-scale,1)),10.5px);font-weight:700;letter-spacing:.3px;background:color-mix(in srgb,var(--jg-surface,#141824) 88%,transparent);border:1px solid var(--jg-border,#2a3040);white-space:nowrap;}" +
    ".jg-chip .jg-dot{width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);}" +
    ".jg-chip.jg-streak{color:var(--jg-accent-text,var(--jg-accent,#e5484d));border-color:color-mix(in srgb,var(--jg-accent,#e5484d) 45%,transparent);display:none;}" +
    ".jg-spacer{flex:1;}" +
    ".jg-mute{pointer-events:auto;position:relative;cursor:pointer;border:1px solid var(--jg-border,#2a3040);background:color-mix(in srgb,var(--jg-surface,#141824) 88%,transparent);color:var(--jg-text,#eceef2);border-radius:999px;width:32px;height:32px;font-size:14px;line-height:1;display:grid;place-items:center;padding:0;}" +
    ".jg-mute::before{content:'';position:absolute;inset:-8px;border-radius:50%;}" +
    ".jg-mute:hover{border-color:var(--jg-accent,#e5484d);}" +
    /* verdict banner */
    ".jg-verdict{position:absolute;left:0;right:0;top:26%;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;opacity:0;transform:scale(.7);transition:opacity .18s ease,transform .34s cubic-bezier(.34,1.56,.64,1);}" +
    ".jg-verdict.jg-show{opacity:1;transform:scale(1);}" +
    ".jg-verdict-row{display:flex;align-items:center;gap:calc(12px*var(--jg-scale,1));}" +
    ".jg-stamp{display:grid;place-items:center;width:calc(58px*var(--jg-scale,1));height:calc(58px*var(--jg-scale,1));border-radius:12px;transform:rotate(-7deg);font-family:var(--jg-font-display,Georgia,serif);font-weight:800;color:#fff;font-size:calc(22px*var(--jg-scale,1));line-height:1.05;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.5);}" +
    ".jg-verdict-word{font-family:var(--jg-font-display,Georgia,serif);font-weight:800;font-size:calc(46px*var(--jg-scale,1));letter-spacing:1px;text-shadow:0 3px 14px rgba(0,0,0,.45);}" +
    ".jg-verdict-sub{font-size:max(calc(13px*var(--jg-scale,1)),11px);font-weight:700;opacity:.92;text-shadow:0 1px 6px rgba(0,0,0,.5);}" +
    /* result card */
    ".jg-card{position:absolute;left:50%;bottom:12px;transform:translate(-50%,16px);max-width:min(92%,440px);text-align:center;background:color-mix(in srgb,var(--jg-surface,#141824) 86%,transparent);border:1px solid var(--jg-border,#2a3040);border-radius:var(--jg-radius,16px);padding:10px 16px 11px;opacity:0;pointer-events:none;transition:opacity .25s ease,transform .35s cubic-bezier(.34,1.56,.64,1);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 10px 28px rgba(0,0,0,.3);}" +
    ".jg-card.jg-show{opacity:1;transform:translate(-50%,0);}" +
    ".jg-card .jg-throw{font-family:var(--jg-font-display,Georgia,serif);font-weight:800;font-size:calc(17px*var(--jg-scale,1));}" +
    ".jg-card .jg-throw .jg-kanji{opacity:.75;font-weight:600;margin-left:6px;}" +
    ".jg-card .jg-dist{font-size:max(calc(14px*var(--jg-scale,1)),12px);font-weight:800;color:var(--jg-accent-text,var(--jg-accent,#e5484d));margin-top:2px;}" +
    ".jg-card .jg-dist .jg-best-star{color:var(--jg-gold,#c9a25a);margin-left:6px;}" +
    ".jg-card .jg-quip{font-size:max(calc(12px*var(--jg-scale,1)),11px);font-style:italic;color:var(--jg-muted,#9aa4b5);margin-top:3px;}" +
    /* hint bar */
    ".jg-hint{position:absolute;left:0;right:0;bottom:0;text-align:center;padding:9px 12px calc(9px + env(safe-area-inset-bottom,0px));font-size:max(calc(12px*var(--jg-scale,1)),12px);font-weight:700;letter-spacing:.4px;color:var(--jg-text,#eceef2);background:linear-gradient(color-mix(in srgb,var(--jg-surface,#141824) 45%,transparent),color-mix(in srgb,var(--jg-surface,#141824) 90%,transparent));pointer-events:none;transition:opacity .3s;}" +
    ".jg-hint b{color:var(--jg-accent-text,var(--jg-text,#eceef2));}" +
    ".jg-hint.jg-pulse b{animation:jg-pulse 1.6s ease-in-out infinite;}" +
    "@keyframes jg-pulse{0%,100%{opacity:1}50%{opacity:.65}}" +
    /* rank-up overlay */
    ".jg-rankup{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;opacity:0;transition:opacity .3s;}" +
    ".jg-rankup.jg-show{opacity:1;}" +
    ".jg-rankup-inner{text-align:center;padding:16px 30px;border-radius:var(--jg-radius,16px);background:color-mix(in srgb,var(--jg-surface,#141824) 88%,transparent);border:1px solid var(--jg-border,#2a3040);box-shadow:0 14px 40px rgba(0,0,0,.4);transform:scale(.8);transition:transform .4s cubic-bezier(.34,1.56,.64,1);}" +
    ".jg-rankup.jg-show .jg-rankup-inner{transform:scale(1);}" +
    ".jg-rankup .jg-obi{height:12px;border-radius:6px;margin:10px auto 0;width:150px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.28);}" +
    ".jg-rankup .jg-rankup-kanji{font-family:var(--jg-font-display,Georgia,serif);font-size:13px;letter-spacing:6px;opacity:.7;}" +
    ".jg-rankup .jg-rankup-name{font-family:var(--jg-font-display,Georgia,serif);font-weight:800;font-size:calc(26px*var(--jg-scale,1));margin-top:2px;}" +
    "@media (prefers-reduced-motion:reduce){.jg-verdict,.jg-card,.jg-rankup-inner{transition:opacity .2s;}.jg-hint.jg-pulse b{animation:none;}}";

  /* ═══════════ The 47 throws (Gokyo + Habukareta) ═══════════ */

  var THROWS = [
    ["Deashi Harai", "出足払", "Forward Foot Sweep"], ["Hiza Guruma", "膝車", "Knee Wheel"],
    ["Sasae Tsurikomi Ashi", "支釣込足", "Supporting Foot Lift-Pull"], ["Uki Goshi", "浮腰", "Floating Hip"],
    ["Osoto Gari", "大外刈", "Large Outer Reap"], ["O Goshi", "大腰", "Large Hip Throw"],
    ["Ouchi Gari", "大内刈", "Large Inner Reap"], ["Seoi Nage", "背負投", "Shoulder Throw"],
    ["Kosoto Gari", "小外刈", "Small Outer Reap"], ["Kouchi Gari", "小内刈", "Small Inner Reap"],
    ["Koshi Guruma", "腰車", "Hip Wheel"], ["Tsurikomi Goshi", "釣込腰", "Lift-Pull Hip Throw"],
    ["Okuriashi Harai", "送足払", "Following Foot Sweep"], ["Tai Otoshi", "体落", "Body Drop"],
    ["Harai Goshi", "払腰", "Sweeping Hip Throw"], ["Uchi Mata", "内股", "Inner Thigh Throw"],
    ["Kosoto Gake", "小外掛", "Small Outer Hook"], ["Tsuri Goshi", "釣腰", "Lifting Hip Throw"],
    ["Yoko Otoshi", "横落", "Side Drop"], ["Ashi Guruma", "足車", "Leg Wheel"],
    ["Hane Goshi", "跳腰", "Spring Hip Throw"], ["Harai Tsurikomi Ashi", "払釣込足", "Lift-Pull Foot Sweep"],
    ["Tomoe Nage", "巴投", "Circle Throw"], ["Sumi Gaeshi", "隅返", "Corner Reversal"],
    ["Tani Otoshi", "谷落", "Valley Drop"], ["Hane Makikomi", "跳巻込", "Spring Wraparound Throw"],
    ["Sukui Nage", "掬投", "Scoop Throw"], ["Utsuri Goshi", "移腰", "Shifting Hip Throw"],
    ["O Guruma", "大車", "Large Wheel"], ["Soto Makikomi", "外巻込", "Outer Wraparound Throw"],
    ["Uki Otoshi", "浮落", "Floating Drop"], ["Osoto Guruma", "大外車", "Large Outer Wheel"],
    ["Uki Waza", "浮技", "Floating Technique"], ["Yoko Wakare", "横分", "Side Separation"],
    ["Yoko Guruma", "横車", "Side Wheel"], ["Ushiro Goshi", "後腰", "Rear Hip Throw"],
    ["Ura Nage", "裏投", "Rear Throw"], ["Sumi Otoshi", "隅落", "Corner Drop"],
    ["Yoko Gake", "横掛", "Side Hook"], ["Obi Otoshi", "帯落", "Belt Drop"],
    ["Seoi Otoshi", "背負落", "Shoulder Drop"], ["Yama Arashi", "山嵐", "Mountain Storm"],
    ["Osoto Otoshi", "大外落", "Large Outer Drop"], ["Daki Wakare", "抱分", "Lifting Separation"],
    ["Hikikomi Gaeshi", "引込返", "Pulling-in Reversal"], ["Tawara Gaeshi", "俵返", "Rice-Bale Reversal"],
    ["Uchi Makikomi", "内巻込", "Inner Wraparound Throw"]
  ];

  /* ═══════════ Flavor ═══════════ */

  var QUIPS = {
    ippon: [
      "The tatami will remember that one.",
      "Kanō-sensei nods in quiet approval.",
      "Uke saw their whole life flash by. Twice.",
      "Somewhere, a scoreboard just broke.",
      "Textbook. Frame it. Hang it in the dojo.",
      "The crowd goes tatami-wild!"
    ],
    waza: [
      "So close to glory!",
      "Half a point, whole lot of style.",
      "Uke is mildly inconvenienced!",
      "Solid. Sensei raises one eyebrow — the good one.",
      "Almost flat on the back. Almost."
    ],
    yuko: [
      "A throw! …Technically.",
      "Uke stumbled with tremendous dignity.",
      "The judges shrug, politely.",
      "That'll buff right out."
    ],
    flub: [
      "MATTE! That was a hug.",
      "Uke politely declines to fall over.",
      "You off-balanced… yourself.",
      "The referee is very confused.",
      "Grip slipped! Chalk up next time.",
      "Try bending the knees. Any knees."
    ],
    bored: ["Uke got bored and sat down.", "Matte! You can't hold a grip forever."],
    slip: ["Grip slipped — hold steady!", "The grip fight continues…"]
  };

  var BELTS = [
    { name: "White Belt", jp: "白帯", color: "#e9e6df", at: 0 },
    { name: "Yellow Belt", jp: "黄帯", color: "#eab308", at: 2 },
    { name: "Orange Belt", jp: "橙帯", color: "#f97316", at: 5 },
    { name: "Green Belt", jp: "緑帯", color: "#22c55e", at: 10 },
    { name: "Blue Belt", jp: "青帯", color: "#3b82f6", at: 18 },
    { name: "Brown Belt", jp: "茶帯", color: "#92621d", at: 30 },
    { name: "Black Belt", jp: "黒帯", color: "#23252a", at: 50 },
    { name: "Kōhaku Master", jp: "紅白帯", color: "#d43d3d", at: 100 }
  ];

  var SKINS = ["#f1c9a5", "#e3b287", "#d9a06b", "#b0805a", "#8d5a33", "#6f452a"];

  /* ═══════════ Tiny utils ═══════════ */

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function rad(deg) { return deg * Math.PI / 180; }

  function parseColor(str) {
    str = (str || "").trim();
    var m = /^#([0-9a-f]{3})$/i.exec(str);
    if (m) return [parseInt(m[1][0], 16) * 17, parseInt(m[1][1], 16) * 17, parseInt(m[1][2], 16) * 17];
    m = /^#([0-9a-f]{6})/i.exec(str);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = /^rgba?\(([^)]+)\)/i.exec(str);
    if (m) {
      var p = m[1].split(",").map(parseFloat);
      return [p[0] || 0, p[1] || 0, p[2] || 0];
    }
    return null;
  }
  function luminance(rgb) { return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255; }
  function mix(c1, c2, t) {
    var a = parseColor(c1) || [0, 0, 0], b = parseColor(c2) || [255, 255, 255];
    return "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)) + ")";
  }

  /* ═══════════ Pocket synthesizer (WebAudio, all generated) ═══════════ */

  function makeAudio(isMuted) {
    var ctx = null;

    function ac() {
      if (ctx) return ctx;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
      return ctx;
    }
    function env(gainNode, t0, peak, dur) {
      var g = gainNode.gain;
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + 0.012);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
    }
    function tone(freqFrom, freqTo, dur, peak, type) {
      if (isMuted() || !ac() || ctx.state === "closed") return;
      if (ctx.state !== "running") ctx.resume();   // covers iOS 'interrupted' too
      var t0 = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freqFrom, t0);
      o.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), t0 + dur);
      env(g, t0, peak, dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    }
    function noise(dur, peak, freq, q) {
      if (isMuted() || !ac() || ctx.state === "closed") return;
      if (ctx.state !== "running") ctx.resume();   // covers iOS 'interrupted' too
      var t0 = ctx.currentTime;
      var len = Math.max(1, (dur * ctx.sampleRate) | 0);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q || 0.8;
      var g = ctx.createGain(); env(g, t0, peak, dur);
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start(t0);
    }
    return {
      unlock: function () { var c = ac(); if (c && c.state !== "running" && c.state !== "closed") c.resume(); },
      grip: function () { noise(0.08, 0.05, 900, 1.2); },
      whoosh: function (q) { noise(0.3, 0.05 + 0.1 * q, 500 + 900 * q, 0.6); },
      thud: function (i) { tone(110, 38, 0.14, 0.1 + 0.14 * i, "triangle"); noise(0.1, 0.05 + 0.1 * i, 180, 0.5); },
      ding: function () { tone(880, 870, 0.25, 0.08); },
      ippon: function () {
        var f = [523.25, 659.25, 783.99, 1046.5];
        for (var i = 0; i < f.length; i++) (function (fr, d) {
          setTimeout(function () { tone(fr, fr, 0.22, 0.09, "square"); }, d);
        })(f[i], i * 95);
      },
      flub: function () { tone(240, 130, 0.5, 0.07, "sawtooth"); },
      rankup: function () {
        var f = [392, 523.25, 659.25, 783.99, 1046.5];
        for (var i = 0; i < f.length; i++) (function (fr, d) {
          setTimeout(function () { tone(fr, fr, 0.3, 0.08, "triangle"); }, d);
        })(f[i], i * 110);
      }
    };
  }

  /* ═══════════ Game factory ═══════════ */

  var styleInjected = false;

  function createGame(host) {
    if (!host || host.__jgMounted) return null;
    host.__jgMounted = true;

    if (!styleInjected) {
      styleInjected = true;
      var st = document.createElement("style");
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    /* ── DOM scaffold ── */
    var shell = document.createElement("div");
    shell.className = "jg-shell";
    shell.innerHTML =
      '<div class="jg-frame" tabindex="0" role="application" aria-label="Ippon Toss mini-game. Hold Space or press and hold to grip uke, then release inside the glowing zone to throw.">' +
        '<canvas class="jg-canvas" aria-hidden="true"></canvas>' +
        '<div class="jg-hud">' +
          '<span class="jg-chip jg-belt-chip"><span class="jg-dot"></span><span class="jg-belt-name">White Belt</span></span>' +
          '<span class="jg-chip jg-best-chip" hidden>Best <b class="jg-best-val"></b></span>' +
          '<span class="jg-chip jg-streak">🔥 <b class="jg-streak-val">0</b></span>' +
          '<span class="jg-spacer"></span>' +
          '<button class="jg-mute" type="button" aria-label="Mute sound" aria-pressed="false">🔊</button>' +
        '</div>' +
        '<div class="jg-verdict" aria-hidden="true">' +
          '<div class="jg-verdict-row"><span class="jg-stamp"></span><span class="jg-verdict-word"></span></div>' +
          '<span class="jg-verdict-sub"></span>' +
        '</div>' +
        '<div class="jg-card" aria-hidden="true">' +
          '<div class="jg-throw"></div><div class="jg-dist"></div><div class="jg-quip"></div>' +
        '</div>' +
        '<div class="jg-rankup" aria-hidden="true"><div class="jg-rankup-inner">' +
          '<div class="jg-rankup-kanji">昇級 RANK UP</div><div class="jg-rankup-name"></div><div class="jg-obi"></div>' +
        '</div></div>' +
        // 昇級 is swapped for 昇段 at runtime when the promotion is dan-grade
        '<div class="jg-hint jg-pulse"><b>Press &amp; hold</b> to grip — release in the glowing zone!</div>' +
      '</div>' +
      '<span class="visually-hidden jg-live" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);"></span>';
    host.appendChild(shell);

    var frame = shell.querySelector(".jg-frame");
    var canvas = shell.querySelector(".jg-canvas");
    var g = canvas.getContext("2d");
    var el = {
      beltChip: shell.querySelector(".jg-belt-chip"),
      beltDot: shell.querySelector(".jg-belt-chip .jg-dot"),
      beltName: shell.querySelector(".jg-belt-name"),
      bestChip: shell.querySelector(".jg-best-chip"),
      bestVal: shell.querySelector(".jg-best-val"),
      streakChip: shell.querySelector(".jg-streak"),
      streakVal: shell.querySelector(".jg-streak-val"),
      mute: shell.querySelector(".jg-mute"),
      verdict: shell.querySelector(".jg-verdict"),
      stamp: shell.querySelector(".jg-stamp"),
      word: shell.querySelector(".jg-verdict-word"),
      sub: shell.querySelector(".jg-verdict-sub"),
      card: shell.querySelector(".jg-card"),
      cardThrow: shell.querySelector(".jg-throw"),
      cardDist: shell.querySelector(".jg-dist"),
      cardQuip: shell.querySelector(".jg-quip"),
      rankup: shell.querySelector(".jg-rankup"),
      rankName: shell.querySelector(".jg-rankup-name"),
      rankKanji: shell.querySelector(".jg-rankup-kanji"),
      obi: shell.querySelector(".jg-obi"),
      hint: shell.querySelector(".jg-hint"),
      live: shell.querySelector(".jg-live")
    };

    /* ── persistence ── */
    var STORE_KEY = "judoGame.ipponToss.v1";
    function loadSave() {
      try {
        var s = JSON.parse(localStorage.getItem(STORE_KEY));
        if (s && typeof s === "object") return s;
      } catch (e) { /* private mode etc. */ }
      return {};
    }
    var save = loadSave();
    save.best = +save.best || 0;
    save.ippons = +save.ippons || 0;
    save.throws = +save.throws || 0;
    save.bestStreak = +save.bestStreak || 0;
    save.muted = !!save.muted;
    function persist() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (e) { /* fine */ }
    }

    var audio = makeAudio(function () { return save.muted; });

    var reducedMotion = false;
    try {
      var rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotion = rmq.matches;
      if (rmq.addEventListener) rmq.addEventListener("change", function (e) { reducedMotion = e.matches; });
    } catch (e) { /* fine */ }

    /* ── theme / palette (from host tokens) ── */
    var pal = {};
    function resolvePalette() {
      var cs = getComputedStyle(shell);
      function v(name, fb) { var s = cs.getPropertyValue(name).trim(); return s || fb; }
      var accent = v("--jg-accent", "#e5484d");
      var surface = v("--jg-surface", "#141824");
      var gold = v("--jg-gold", "#c9a25a");
      var lum = luminance(parseColor(surface) || [20, 24, 36]);
      var light = lum > 0.45;
      pal = {
        accent: accent,
        gold: gold,
        text: v("--jg-text", "#eceef2"),
        muted: v("--jg-muted", "#9aa4b5"),
        light: light,
        // scene colors derived from the host surface so the game blends in
        sky: light ? mix(surface, "#ffffff", 0.32) : mix(surface, "#000000", 0.12),
        skyGlow: light ? mix(accent, "#ffffff", 0.82) : mix(accent, surface, 0.82),
        wall: light ? mix(surface, "#ffffff", 0.16) : mix(surface, "#ffffff", 0.05),
        beam: light ? mix(accent, "#7a5a3a", 0.55) : mix(accent, surface, 0.45),
        matA: light ? "#aab873" : "#5c6a48",
        matB: light ? "#b6c383" : "#66744f",
        matEdge: light ? "#8a9a58" : "#46523a",
        matSeam: light ? "#79894e" : "#3a4530",
        paper: "#f0e7d4",
        paperInk: "#4a4132",
        fontDisplay: v("--jg-font-display", "Georgia, 'Times New Roman', serif"),
        fontBody: v("--jg-font-body", "system-ui, sans-serif")
      };
      // derived scene colors, precomputed so mix() stays out of the draw loop
      pal.pillar = mix(pal.beam, "#000000", 0.25);
      pal.scrollRod = mix(pal.beam, "#000000", 0.3);
      pal.wallRing = mix(accent, pal.wall, 0.4);
      rebuildStaticGradients();
    }
    resolvePalette();
    // re-resolve when the host flips its theme (e.g. data-theme attribute)
    try {
      new MutationObserver(resolvePalette).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    } catch (e) { /* fine */ }

    /* ── sizing ── */
    var W = 300, H = 250, dpr = 1, scale = 50, groundY = 200, viewW = 6;
    // gradients depend only on size + palette: rebuilt there, never per frame
    var skyGrad = null, vigGrad = null, meterZoneGrad = null, meterGeom = null;
    function rebuildStaticGradients() {
      if (!g || !W || !H || !groundY) return;  // palette can resolve before first resize
      skyGrad = g.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, pal.sky);
      skyGrad.addColorStop(1, pal.skyGlow);
      vigGrad = g.createRadialGradient(W / 2, H * 0.45, H * 0.5, W / 2, H * 0.55, H * 1.05);
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.22)");
      buildMeterGradient();
    }
    function buildMeterGradient() {
      if (!g) return;
      var mw = Math.min(W * 0.62, 360), mh = 16;
      var mx = (W - mw) / 2, my = Math.max(46, H * 0.14);
      meterGeom = { mw: mw, mh: mh, mx: mx, my: my };
      var zx = mx + (zoneC - zoneHalf) * mw, zw = Math.max(zoneHalf * 2 * mw, 1);
      meterZoneGrad = g.createLinearGradient(zx, 0, zx + zw, 0);
      meterZoneGrad.addColorStop(0, mix(pal.accent, "#000000", 0.25));
      meterZoneGrad.addColorStop(0.5, pal.accent);
      meterZoneGrad.addColorStop(1, mix(pal.accent, "#000000", 0.25));
    }
    function resize() {
      var w = frame.clientWidth || 300;
      var h = Math.round(clamp(w * 0.54, 250, 400));
      dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      W = w; H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      scale = H / 5.4;          // px per meter — about 5.4 m of world height visible
      groundY = H * 0.86;
      viewW = W / scale;
      // 0.88 floor keeps HUD/hint type legible on phones (CSS also max()-clamps it)
      shell.style.setProperty("--jg-scale", clamp(w / 680, 0.88, 1.1).toFixed(3));
      rebuildStaticGradients();
      needDraw = true;
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(frame);
    window.addEventListener("resize", resize);

    /* ── world & state ── */
    var ST = { READY: 0, CHARGING: 1, FLIGHT: 2, RESULT: 3 };
    var state = ST.READY;
    var t = 0;                    // global clock (s)
    var chargeT = 0;              // time since grip started
    var needle = 0, zoneC = 0.75, zoneHalf = 0.1, meterSpeed = 1.1;
    var meterAlpha = 0;
    var streak = 0;
    var camX = 0, camTarget = 0, shakeT = 0, shakeAmp = 0;
    var flightDist = 0, resultTimer = 0, throwOfRound = pick(THROWS);
    var toriLunge = 0;            // forward lunge during throw anim

    // characters: tori (player) + uke (the flying one).
    // gi shade / hair colors are mixed once per character, never per frame.
    var TORI_GI = "#f4f1e8";
    var TORI_GI_BACK = mix(TORI_GI, "#000000", 0.12);
    var toriSkin = pick(SKINS);
    var toriHair = mix(toriSkin, "#1c1410", 0.75);
    var uke = {
      x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0,
      skin: pick(SKINS), belt: "#e9e6df", gi: "#4a7fd0", giBack: "", hair: "",
      state: "idle",              // idle | charge | flight | down | stumble
      landed: false, restT: 0
    };
    function ukeRespawn() {
      uke.x = 0; uke.y = 0; uke.vx = 0; uke.vy = 0; uke.rot = 0; uke.vrot = 0;
      uke.skin = pick(SKINS);
      uke.hair = mix(uke.skin, "#1c1410", 0.75);
      uke.belt = pick(["#e9e6df", "#eab308", "#f97316", "#22c55e", "#3b82f6", "#92621d"]);
      uke.gi = mix("#4a7fd0", "#3563a8", rand(0, 1));
      uke.giBack = mix(uke.gi, "#000000", 0.12);
      uke.state = "idle"; uke.landed = false; uke.restT = 0;
      spawnDust(0, 0.2, 5, 0.5);
    }

    // pose interpolation: current pose eases toward target each frame
    function makePose() { return { lean: 0, crouch: 0.05, armF: 15, armB: -12, legF: 6, legB: -6, tuck: 0 }; }
    var toriPose = makePose(), toriTarget = makePose();
    var ukePose = makePose(), ukeTarget = makePose();
    var POSES = {
      idle: { lean: 0, crouch: 0.05, armF: 20, armB: -14, legF: 7, legB: -7, tuck: 0 },
      grip: { lean: 14, crouch: 0.3, armF: 78, armB: 58, legF: 16, legB: -20, tuck: 0 },
      throwing: { lean: 62, crouch: 0.34, armF: 132, armB: 40, legF: 6, legB: -85, tuck: 0 },
      followThrough: { lean: 30, crouch: 0.22, armF: 95, armB: 20, legF: 10, legB: -30, tuck: 0 },
      facepalm: { lean: -4, crouch: 0.1, armF: 152, armB: -12, legF: 6, legB: -6, tuck: 0 },
      proud: { lean: -6, crouch: 0.02, armF: -25, armB: 25, legF: 6, legB: -6, tuck: 0 },
      ukeIdle: { lean: 0, crouch: 0.06, armF: 18, armB: -12, legF: 6, legB: -6, tuck: 0 },
      ukeTip: { lean: -30, crouch: 0.12, armF: -55, armB: -75, legF: -14, legB: 10, tuck: 0 },
      tucked: { lean: 20, crouch: 0.4, armF: 60, armB: 40, legF: 40, legB: 20, tuck: 1 },
      sit: { lean: -18, crouch: 0.75, armF: -30, armB: -40, legF: 55, legB: 40, tuck: 0.3 }
    };
    function setPose(target, name) {
      var p = POSES[name];
      for (var k in p) target[k] = p[k];
    }
    function tween(cur, target, k) {
      for (var key in cur) cur[key] = lerp(cur[key], target[key], k);
    }

    var toriFace = "calm", ukeFace = "calm";

    /* ── particles ── */
    var dust = [], stars = [], confetti = [], petals = [];
    function spawnDust(wx, wy, n, size) {
      if (reducedMotion) n = Math.min(n, 3);
      for (var i = 0; i < n; i++) {
        dust.push({
          x: wx + rand(-0.25, 0.25), y: Math.max(wy, 0.06) + rand(0, 0.15),
          vx: rand(-0.9, 0.9), vy: rand(0.15, 1.0),
          r: rand(0.06, 0.16) * (size || 1), a: rand(0.5, 0.85), decay: rand(1.2, 2.2)
        });
      }
    }
    function spawnStars(wx, wy, n) {
      for (var i = 0; i < n; i++) {
        var ang = rand(0, Math.PI * 2);
        stars.push({ x: wx, y: wy + 0.2, vx: Math.cos(ang) * rand(0.8, 2.2), vy: Math.sin(ang) * rand(0.8, 2.2) + 1.2, a: 1, spin: rand(0, 6) });
      }
    }
    function spawnConfetti(wx) {
      var n = reducedMotion ? 14 : 46;
      var colors = [pal.accent, pal.gold, "#ffffff", "#3b82f6", "#22c55e", "#f97316"];
      for (var i = 0; i < n; i++) {
        confetti.push({
          x: wx + rand(-0.4, 0.4), y: rand(0.4, 1.6),
          vx: rand(-2.4, 2.4), vy: rand(2.2, 5.4),
          w: rand(0.035, 0.07), h: rand(0.05, 0.1),
          rot: rand(0, 6.3), vrot: rand(-9, 9),
          color: pick(colors), a: 1
        });
      }
    }
    function initPetals() {
      petals.length = 0;
      var n = reducedMotion ? 0 : 8;
      for (var i = 0; i < n; i++) {
        petals.push({ x: Math.random(), y: Math.random(), s: rand(3, 6), ph: rand(0, 6.3), spd: rand(0.014, 0.03), drift: rand(0.4, 1.1) });
      }
    }
    initPetals();

    /* ── referee (screen-space, pops up to give the call) ── */
    var ref = { vis: 0, arm: 0, armTarget: 0, mode: "none" }; // arm: 0 down, 1 side, 2 up, 3 head-scratch

    /* ═══════════ HUD helpers ═══════════ */

    function beltForIppons(n) {
      var b = BELTS[0];
      for (var i = 0; i < BELTS.length; i++) if (n >= BELTS[i].at) b = BELTS[i];
      return b;
    }
    function refreshHud() {
      var b = beltForIppons(save.ippons);
      el.beltDot.style.background = b.color;
      el.beltName.textContent = b.name;
      el.beltChip.title = save.ippons + " ippon" + (save.ippons === 1 ? "" : "s") + " · " + save.throws + " throws";
      if (save.best > 0) {
        el.bestChip.hidden = false;
        el.bestVal.textContent = save.best.toFixed(1) + " m";
      }
      el.streakChip.style.display = streak > 1 ? "inline-flex" : "none";
      el.streakVal.textContent = streak;
      el.mute.textContent = save.muted ? "🔇" : "🔊";
      el.mute.setAttribute("aria-pressed", String(save.muted));
    }
    var lastHint = "", flightB = null, lastFlightTxt = "";
    function setHint(html, pulse) {
      if (html !== lastHint) {
        lastHint = html;
        flightB = null;
        el.hint.innerHTML = html;
      }
      el.hint.classList.toggle("jg-pulse", !!pulse);
    }
    // the in-flight distance readout updates ~60x/s: touch only a text node
    function setFlightCounter(txt) {
      if (!flightB) {
        el.hint.innerHTML = "<b></b>";
        el.hint.classList.remove("jg-pulse");
        flightB = el.hint.firstChild;
        lastHint = null;
        lastFlightTxt = "";
      }
      if (txt !== lastFlightTxt) { lastFlightTxt = txt; flightB.textContent = txt; }
    }
    function announce(msg) { el.live.textContent = msg; }

    refreshHud();

    /* ═══════════ State transitions ═══════════ */

    function toReady(quiet) {
      state = ST.READY;
      ukeRespawn();
      setPose(toriTarget, "idle"); setPose(ukeTarget, "ukeIdle");
      toriFace = "calm"; ukeFace = "calm";
      toriLunge = 0;
      el.verdict.classList.remove("jg-show");
      el.card.classList.remove("jg-show");
      ref.mode = "none";
      camTarget = -viewW * 0.45;
      if (!quiet) setHint(IDLE_HINT, true);
    }

    var gripSounded = false;

    function startCharge() {
      state = ST.CHARGING;
      frame.classList.add("jg-charging");
      chargeT = 0;
      needle = 0;                 // never score against last round's needle
      gripSounded = false;        // grip sfx waits ~90ms so scroll-brushes stay silent
      zoneC = rand(0.6, 0.86);
      zoneHalf = Math.max(0.05, 0.105 - streak * 0.006);
      meterSpeed = 1.05 + Math.min(streak, 10) * 0.07;
      buildMeterGradient();
      throwOfRound = pick(THROWS);
      setPose(toriTarget, "grip");
      toriFace = "focus"; ukeFace = "worry";
      audio.unlock();
      setHint("Release in the <b>zone</b>…!", false);
    }

    var IDLE_HINT = "<b>Press &amp; hold</b> to grip — release in the glowing zone!";

    function cancelCharge(msg, silent) {
      if (state !== ST.CHARGING) return;
      frame.classList.remove("jg-charging");
      state = ST.READY;
      setPose(toriTarget, "idle"); setPose(ukeTarget, "ukeIdle");
      toriFace = "calm"; ukeFace = "calm";
      setHint(msg || pick(QUIPS.slip), true);
      if (!silent) announce("Matte — grip released, no throw.");
    }

    function release() {
      if (state !== ST.CHARGING) return;
      // a sub-150ms press is an accidental brush (scroll tap, double-tap),
      // not a throw attempt — let it go with no verdict and no penalty
      if (chargeT < 0.15) { cancelCharge(IDLE_HINT, true); return; }
      frame.classList.remove("jg-charging");
      var d = Math.abs(needle - zoneC) / zoneHalf;   // normalized distance from zone center
      var golden = d <= 0.09;
      var verdict = d <= 0.35 ? "ippon" : d <= 1 ? "waza" : d <= 1.7 ? "yuko" : "flub";
      var q = verdict === "flub" ? 0 : clamp(1 - d * 0.42, 0.15, 1);
      if (golden) q = 1.08;                          // dead-center bonus: overdrive throw

      state = ST.FLIGHT;
      flightDist = 0;
      uke.state = verdict === "flub" ? "stumble" : "flight";
      uke.landed = false; uke.restT = 0;
      uke.pendingVerdict = verdict;
      uke.golden = golden;
      uke.maxImpact = 0;

      if (verdict === "flub") {
        uke.x = 0.15; uke.y = 0.4; uke.vx = rand(1.2, 1.9); uke.vy = 1.6; uke.vrot = rand(-2, 2);
        setPose(ukeTarget, "sit");
        setPose(toriTarget, "facepalm");
        toriFace = "oops"; ukeFace = "huh";
        audio.flub();
      } else {
        var ang = rad(38 + 16 * Math.min(q, 1));
        var v = 6.5 + 13.5 * q;
        uke.x = 0.2; uke.y = 0.9;
        uke.vx = Math.cos(ang) * v; uke.vy = Math.sin(ang) * v;
        uke.vrot = -(4 + 8 * q) * (Math.random() < 0.15 ? -1 : 1);
        setPose(ukeTarget, "tucked");
        setPose(toriTarget, "throwing");
        toriLunge = 0.001;
        toriFace = "yell"; ukeFace = "wee";
        audio.whoosh(q);
        setTimeout(function () { if (state === ST.FLIGHT) setPose(toriTarget, "followThrough"); }, 320);
      }
      setHint("", false);
    }

    function settleResult() {
      state = ST.RESULT;
      resultTimer = 0;
      var verdict = uke.pendingVerdict;
      var dist = Math.max(0, uke.x);
      save.throws++;

      var isBest = false;
      if (verdict !== "flub" && dist > save.best) {
        isBest = save.best > 0;
        save.best = Math.max(save.best, dist);
      }

      var prevBelt = beltForIppons(save.ippons);
      if (verdict === "ippon") { save.ippons++; streak++; }
      else if (verdict === "waza") streak++;
      else streak = 0;
      save.bestStreak = Math.max(save.bestStreak, streak);
      var newBelt = beltForIppons(save.ippons);
      persist();

      var V = {
        ippon: { word: "IPPON!", kanji: "一本", color: pal.accent, quips: QUIPS.ippon },
        waza: { word: "WAZA-ARI!", kanji: "技あり", color: pal.gold, quips: QUIPS.waza },
        yuko: { word: "YUKO", kanji: "有効", color: pal.light ? "#5d6d7e" : "#7d8fa3", quips: QUIPS.yuko },
        flub: { word: "MATTE!", kanji: "待て", color: pal.light ? "#63676f" : "#8a8f98", quips: QUIPS.flub }
      }[verdict];

      el.stamp.textContent = V.kanji;
      el.stamp.style.background = V.color;
      // stamp ink follows the stamp's own luminance; the big word darkens on
      // light scenes — both keep the verdict readable in every host theme
      var stampLum = luminance(parseColor(V.color) || [0, 0, 0]);
      el.stamp.style.color = stampLum > 0.5 ? "#2a2320" : "#fff";
      el.word.textContent = uke.golden ? "GOLDEN " + V.word : V.word;
      el.word.style.color = pal.light ? mix(V.color, "#000000", 0.3) : V.color;
      el.sub.textContent = uke.golden ? "Dead-center kuzushi — Kanō-approved!" : "";
      el.verdict.classList.add("jg-show");

      var tatami = Math.max(1, Math.round(dist / 2));
      var quip = pick(V.quips);
      el.cardThrow.innerHTML = verdict === "flub"
        ? "Attempted… something"
        : throwOfRound[0] + ' <span class="jg-kanji" lang="ja">' + throwOfRound[1] + "</span>";
      el.cardDist.innerHTML = verdict === "flub"
        ? "0 points · uke remains unimpressed"
        : dist.toFixed(1) + " m · " + tatami + " tatami" +
          (isBest ? ' <span class="jg-best-star">★ New best!</span>' : "");
      el.cardQuip.textContent = "“" + quip + "”";
      el.card.classList.add("jg-show");

      ref.mode = verdict;
      ref.armTarget = verdict === "ippon" ? 2 : verdict === "waza" ? 1 : verdict === "yuko" ? 0.5 : 3;

      if (verdict === "ippon") {
        audio.ippon();
        spawnConfetti(uke.x);
        if (!reducedMotion) { shakeT = 0.45; shakeAmp = 7; }
        toriFace = "happy"; setPose(toriTarget, "proud");
      } else if (verdict === "waza") {
        audio.ding();
        toriFace = "happy"; setPose(toriTarget, "proud");
      } else if (verdict === "yuko") {
        toriFace = "calm"; setPose(toriTarget, "idle");
      }
      ukeFace = verdict === "flub" ? "huh" : "dizzy";

      announce(verdict === "flub"
        ? "Matte! No score. " + quip
        : V.word + " " + throwOfRound[0] + ", " + dist.toFixed(1) + " meters." + (isBest ? " New best!" : ""));

      if (newBelt !== prevBelt) {
        setTimeout(function () {
          // dan-grade promotions (black belt and up) are 昇段, not 昇級
          el.rankKanji.textContent = (BELTS.indexOf(newBelt) >= 6 ? "昇段" : "昇級") + " RANK UP";
          el.rankName.textContent = newBelt.name + " · " + newBelt.jp;
          el.obi.style.background = newBelt.color;
          el.rankup.classList.add("jg-show");
          audio.rankup();
          announce("Rank up! You are now " + newBelt.name + ".");
          setTimeout(function () { el.rankup.classList.remove("jg-show"); }, 2600);
        }, 900);
      }

      refreshHud();
      setHint("<b>Tap</b> to throw again", true);
    }

    /* ═══════════ Physics & simulation ═══════════ */

    var GRAV = 9.8;

    function step(dt) {
      t += dt;

      // pose easing
      var k = 1 - Math.pow(0.0001, dt);   // fast smooth approach
      tween(toriPose, toriTarget, k);
      tween(ukePose, ukeTarget, k);

      if (shakeT > 0) shakeT -= dt;
      if (toriLunge > 0) toriLunge = Math.min(toriLunge + dt * 2.4, 0.5);

      // camera
      var kcam = 1 - Math.pow(0.002, dt);
      camX = lerp(camX, camTarget, kcam);

      if (state === ST.CHARGING) {
        chargeT += dt;
        if (!gripSounded && chargeT > 0.09) { gripSounded = true; audio.grip(); }
        meterAlpha = Math.min(1, meterAlpha + dt * 5);
        needle = 0.5 - 0.5 * Math.cos(chargeT * meterSpeed * Math.PI);
        // the needle IS uke's balance: they tip further as it climbs
        ukeTarget.lean = -needle * 34;
        ukeTarget.armF = -30 - needle * 45;
        ukeTarget.armB = -40 - needle * 55;
        ukeTarget.crouch = 0.1 + needle * 0.1;
        if (needle > 0.85) ukeFace = "wee";
        else if (needle > 0.5) ukeFace = "worry";
        if (chargeT > 9) {  // uke has limits
          cancelCharge(pick(QUIPS.bored), true);
          announce("Matte! You held the grip too long — no throw, streak reset.");
          streak = 0; refreshHud();
        }
      } else {
        meterAlpha = Math.max(0, meterAlpha - dt * 4);
      }

      if (state === ST.FLIGHT) {
        // sub-step for stable ground collisions on slow frames
        var steps = Math.max(1, Math.ceil(dt / 0.0167));
        var h = dt / steps;
        for (var i = 0; i < steps; i++) {
          uke.vy -= GRAV * h;
          uke.x += uke.vx * h;
          uke.y += uke.vy * h;
          uke.rot += uke.vrot * h;
          if (uke.y <= 0 && uke.vy < 0) {
            var impact = -uke.vy;
            uke.maxImpact = Math.max(uke.maxImpact, impact);
            uke.y = 0;
            if (impact > 1.6) {
              uke.vy = impact * 0.42;
              uke.vx *= 0.72;
              uke.vrot *= 0.7;
              spawnDust(uke.x, 0, Math.round(3 + impact * 0.8), 0.6 + impact * 0.08);
              if (impact > 4.5) spawnStars(uke.x, 0.3, 4);
              audio.thud(clamp(impact / 12, 0.15, 1));
            } else {
              // sliding out
              uke.vy = 0;
              uke.vx = Math.max(0, uke.vx - 6 * h);
              uke.vrot = lerp(uke.vrot, 0, 0.2);
              if (!uke.landed) {
                uke.landed = true;
                audio.thud(0.3);
                spawnDust(uke.x, 0, 4, 0.7);
              }
            }
          } else if (uke.y <= 0) {
            uke.y = 0;
            uke.vx = Math.max(0, uke.vx - 6 * h);
          }
        }
        flightDist = Math.max(flightDist, uke.x);

        // live counter while flying
        if (uke.pendingVerdict !== "flub") {
          setFlightCounter(Math.max(0, uke.x).toFixed(1) + " m");
        }

        camTarget = Math.max(-viewW * 0.45, uke.x - viewW * 0.42);

        var atRest = uke.y <= 0.001 && Math.abs(uke.vx) < 0.15 && Math.abs(uke.vy) < 0.4;
        if (atRest) {
          uke.restT += dt;
          uke.state = uke.pendingVerdict === "flub" ? "stumble" : "down";
          if (uke.restT > 0.45) settleResult();
        } else {
          uke.restT = 0;
        }
      }

      if (state === ST.RESULT) {
        resultTimer += dt;
        if (resultTimer > 8) toReady();
      }

      // particles
      var i2, p;
      for (i2 = dust.length - 1; i2 >= 0; i2--) {
        p = dust[i2];
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 0.35; p.a -= p.decay * dt;
        if (p.a <= 0) dust.splice(i2, 1);
      }
      for (i2 = stars.length - 1; i2 >= 0; i2--) {
        p = stars[i2];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 3 * dt; p.spin += 4 * dt; p.a -= 1.1 * dt;
        if (p.a <= 0) stars.splice(i2, 1);
      }
      for (i2 = confetti.length - 1; i2 >= 0; i2--) {
        p = confetti[i2];
        p.vy -= 6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vrot * dt;
        p.vx *= (1 - 1.4 * dt);
        if (p.y <= 0.02 && p.vy < 0) { p.vy = 0; p.vx = 0; p.vrot *= 0.2; p.a -= 1.6 * dt; }
        if (p.a <= 0) confetti.splice(i2, 1);
      }
      for (i2 = 0; i2 < petals.length; i2++) {
        p = petals[i2];
        p.y += p.spd * dt * 8;
        p.ph += dt;
        p.x += Math.sin(p.ph) * 0.0006 * p.drift * 60 * dt;
        if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
      }

      // referee spring
      var refVisTarget = ref.mode === "none" ? 0 : 1;
      ref.vis = lerp(ref.vis, refVisTarget, 1 - Math.pow(0.001, dt));
      ref.arm = lerp(ref.arm, ref.armTarget, 1 - Math.pow(0.004, dt));
    }

    /* ═══════════ Drawing ═══════════ */

    function wx2sx(wx) { return (wx - camX) * scale; }
    function wy2sy(wy) { return groundY - wy * scale; }

    function drawScene() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      // camera shake
      if (shakeT > 0) {
        var s = shakeT / 0.45;
        g.translate(rand(-1, 1) * shakeAmp * s, rand(-1, 1) * shakeAmp * s * 0.6);
      }

      drawBackdrop();
      drawTatami();
      drawPetals(true);

      // shadows
      drawShadow(uke.x, uke.y, 0.55);
      drawShadow(-1.0 + toriLunge, 0, 0.55);

      drawUke();
      drawTori();

      drawParticles();
      drawMeter();
      drawReferee();
      drawVignette();
      drawPetals(false);
    }

    function drawBackdrop() {
      // sky band with a soft accent glow (shomen light)
      g.fillStyle = skyGrad;
      g.fillRect(0, 0, W, groundY);

      var wallH = H * 0.38;               // lower wall band
      var wallY = groundY - wallH;
      g.fillStyle = pal.wall;
      g.fillRect(0, wallY, W, wallH);

      // wooden rail
      g.fillStyle = pal.beam;
      g.fillRect(0, wallY - 6, W, 6);

      // pillars every 8 m (world-anchored so they pan by), offset to keep
      // the starting grip area clear; kept faint so they read as backdrop
      var x0 = Math.floor((camX - 4) / 8) * 8 + 4;
      g.fillStyle = pal.pillar;
      g.globalAlpha = 0.45;
      for (var px = x0; px < camX + viewW + 8; px += 8) {
        var sx = wx2sx(px);
        g.fillRect(sx - 3, wallY - 6, 6, wallH + 6);
      }
      g.globalAlpha = 1;

      // calligraphy scrolls at the start (world-anchored, drift away as you fly)
      drawScroll(-2.6, "精力\n善用");
      drawScroll(3.0, "自他\n共栄");

      // hinomaru-style circle mid-wall for depth, far downrange rewards
      drawWallCircle(14);
      drawWallCircle(34);

      // distance plaques every 5 m
      g.textAlign = "center";
      var plaqueFont = "700 " + Math.round(clamp(scale * 0.16, 9, 12)) + "px " + pal.fontBody;
      for (var m = 5; m < camX + viewW + 5; m += 5) {
        var mx = wx2sx(m);
        if (mx < -40) continue;
        g.fillStyle = pal.paper;
        rounded(mx - 17, wallY + wallH * 0.28, 34, 18, 4);
        g.fill();
        g.fillStyle = pal.paperInk;
        g.font = plaqueFont;
        g.fillText(m + " m", mx, wallY + wallH * 0.28 + 13);
      }
    }

    function drawScroll(wxPos, text) {
      var sx = wx2sx(wxPos);
      if (sx < -80 || sx > W + 80) return;
      var wallH = H * 0.38, wallY = groundY - wallH;
      var sw = clamp(scale * 0.62, 26, 44), sh = wallH * 0.72;
      g.fillStyle = pal.scrollRod;
      g.fillRect(sx - sw / 2 - 3, wallY + 6, sw + 6, 5);
      g.fillStyle = pal.paper;
      g.fillRect(sx - sw / 2, wallY + 9, sw, sh);
      g.fillStyle = pal.paperInk;
      var lines = text.split("\n");
      g.font = "600 " + Math.round(sw * 0.42) + 'px ' + pal.fontDisplay;
      g.textAlign = "center";
      for (var i = 0; i < lines.length; i++) {
        var chars = lines[i].split("");
        for (var c = 0; c < chars.length; c++) {
          // tategaki: columns read right-to-left, so the first line takes
          // the RIGHT column (精力善用, not 善用精力)
          g.fillText(chars[c], sx + (i === 0 ? sw * 0.22 : -sw * 0.22), wallY + 9 + sh * 0.3 + c * sw * 0.46 + i * 4);
        }
      }
    }

    function drawWallCircle(wxPos) {
      var sx = wx2sx(wxPos);
      if (sx < -100 || sx > W + 100) return;
      var wallH = H * 0.38, wallY = groundY - wallH;
      g.beginPath();
      g.arc(sx, wallY + wallH * 0.42, clamp(scale * 0.5, 20, 34), 0, Math.PI * 2);
      g.fillStyle = "rgba(255,255,255,0.05)";
      g.fill();
      g.strokeStyle = pal.wallRing;
      g.lineWidth = 2;
      g.stroke();
    }

    function drawTatami() {
      var matW = 2 * scale;      // mats are 2 m long
      var x0 = Math.floor(camX / 2) * 2;
      for (var mx = x0; mx < camX + viewW + 2; mx += 2) {
        var sx = wx2sx(mx);
        var odd = (Math.round(mx / 2) % 2 + 2) % 2 === 0;
        g.fillStyle = odd ? pal.matA : pal.matB;
        g.fillRect(sx, groundY, matW + 1, H - groundY);
        // mat edge trim (the black cloth border of real tatami)
        g.fillStyle = pal.matSeam;
        g.fillRect(sx - 1, groundY, 2.5, H - groundY);
        // weave hint
        g.fillStyle = "rgba(0,0,0,0.05)";
        g.fillRect(sx, groundY, matW + 1, 3);
      }
      // top edge line
      g.fillStyle = pal.matEdge;
      g.fillRect(0, groundY - 2, W, 3);
    }

    function drawShadow(wxPos, wyPos, w) {
      var sx = wx2sx(wxPos), sy = groundY + (H - groundY) * 0.35;
      if (sx < -60 || sx > W + 60) return;
      var k = clamp(1 - wyPos / 6, 0.25, 1);
      g.beginPath();
      g.ellipse(sx, sy, w * scale * 0.55 * k, w * scale * 0.14 * k, 0, 0, Math.PI * 2);
      g.fillStyle = "rgba(0,0,0," + (0.18 * k).toFixed(3) + ")";
      g.fill();
    }

    /* ── chibi judoka ── */
    function drawJudoka(o) {
      // o: {x,y (feet, world), s (height m), flip, gi, giEdge, belt, skin, pose, face, rot}
      var s = o.s * scale;
      var sx = wx2sx(o.x), sy = wy2sy(o.y);
      if (sx < -s * 2 || sx > W + s * 2) return;
      g.save();
      g.translate(sx, sy);
      if (o.rot) {
        g.translate(0, -s * 0.45);
        g.rotate(o.rot);
        g.translate(0, s * 0.45);
      }
      if (o.flip) g.scale(-1, 1);

      var p = o.pose;
      var crouch = p.crouch;
      var hipY = -s * 0.42 * (1 - 0.22 * crouch);
      var lean = rad(p.lean);
      var torsoL = s * 0.3;
      var shX = Math.sin(lean) * torsoL, shY = hipY - Math.cos(lean) * torsoL;
      var headR = s * 0.155;
      var tuck = p.tuck || 0;

      g.lineCap = "round";

      // legs (behind torso)
      var legL = -hipY * (1 - 0.35 * tuck);
      leg(p.legB, legL, o.giBack);
      leg(p.legF, legL, o.gi);

      function leg(angDeg, len, color) {
        var a = rad(angDeg);
        var kx = Math.sin(a) * len * 0.5, ky = hipY + Math.cos(a) * len * 0.52;
        var fx = Math.sin(a) * len * (0.9 - tuck * 0.3);
        var fy = hipY + Math.cos(a) * len * (1 - tuck * 0.4);
        g.strokeStyle = color;
        g.lineWidth = s * 0.115;
        g.beginPath();
        g.moveTo(0, hipY);
        g.quadraticCurveTo(kx, ky, fx, Math.min(fy, 0));
        g.stroke();
        // foot
        g.fillStyle = o.skin;
        g.beginPath();
        g.arc(fx + s * 0.02, Math.min(fy, 0), s * 0.05, 0, Math.PI * 2);
        g.fill();
      }

      // torso (gi jacket)
      g.strokeStyle = o.gi;
      g.lineWidth = s * 0.26;
      g.beginPath();
      g.moveTo(0, hipY);
      g.lineTo(shX, shY);
      g.stroke();
      // lapel V
      g.strokeStyle = o.giEdge;
      g.lineWidth = s * 0.035;
      g.beginPath();
      g.moveTo(shX - s * 0.07, shY + s * 0.03);
      g.lineTo(shX * 0.4, hipY - torsoL * 0.35);
      g.lineTo(shX + s * 0.07, shY + s * 0.05);
      g.stroke();

      // belt + knot + tails
      g.strokeStyle = o.belt;
      g.lineWidth = s * 0.055;
      g.beginPath();
      g.moveTo(-s * 0.13, hipY + s * 0.01);
      g.lineTo(s * 0.13, hipY + s * 0.01);
      g.stroke();
      g.fillStyle = o.belt;
      g.fillRect(shX * 0.1 - s * 0.03, hipY - s * 0.02, s * 0.06, s * 0.06);
      g.lineWidth = s * 0.03;
      g.beginPath();
      g.moveTo(shX * 0.1, hipY + s * 0.03);
      g.lineTo(shX * 0.1 - s * 0.05, hipY + s * 0.12);
      g.moveTo(shX * 0.1, hipY + s * 0.03);
      g.lineTo(shX * 0.1 + s * 0.06, hipY + s * 0.11);
      g.stroke();

      // arms
      arm(p.armB, o.giBack);
      arm(p.armF, o.gi);
      function arm(angDeg, color) {
        var a = rad(angDeg - p.lean * 0.4);
        var len = s * 0.3 * (1 - tuck * 0.25);
        var ex = shX + Math.sin(a) * len, ey = shY + Math.cos(a) * len;
        g.strokeStyle = color;
        g.lineWidth = s * 0.095;
        g.beginPath();
        g.moveTo(shX, shY);
        g.quadraticCurveTo(shX + Math.sin(a) * len * 0.5, shY + Math.cos(a) * len * 0.6, ex, ey);
        g.stroke();
        g.fillStyle = o.skin;
        g.beginPath();
        g.arc(ex, ey, s * 0.045, 0, Math.PI * 2);
        g.fill();
      }

      // head
      var hx = shX + Math.sin(lean) * headR * 1.1;
      var hy = shY - Math.cos(lean) * headR * 1.15;
      g.fillStyle = o.skin;
      g.beginPath();
      g.arc(hx, hy, headR, 0, Math.PI * 2);
      g.fill();
      // hair cap
      g.fillStyle = o.hair;
      g.beginPath();
      g.arc(hx, hy, headR, Math.PI * 0.95, Math.PI * 2.05);
      g.fill();

      drawFace(hx + headR * 0.35, hy, headR, o.face);
      g.restore();
    }

    function drawFace(cx, cy, r, face) {
      g.fillStyle = "#2a2320";
      g.strokeStyle = "#2a2320";
      g.lineWidth = Math.max(1, r * 0.09);
      var ex = r * 0.32, ey = -r * 0.05;
      function dot(x, y, rr) { g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); }
      if (face === "dizzy") {
        // little spiral eyes
        for (var sgn = -1; sgn <= 1; sgn += 2) {
          g.beginPath();
          for (var a2 = 0; a2 < 4.5; a2 += 0.3) {
            var rr = r * 0.05 * a2 / 4.5 + r * 0.03;
            var px2 = cx + sgn * ex + Math.cos(a2 * 2.2) * rr;
            var py2 = cy + ey + Math.sin(a2 * 2.2) * rr;
            a2 === 0 ? g.moveTo(px2, py2) : g.lineTo(px2, py2);
          }
          g.stroke();
        }
        g.beginPath(); g.arc(cx, cy + r * 0.42, r * 0.16, 0, Math.PI); g.stroke();
      } else if (face === "wee" || face === "yell") {
        dot(cx - ex, cy + ey, r * 0.09);
        dot(cx + ex, cy + ey, r * 0.09);
        g.beginPath();
        g.ellipse(cx, cy + r * 0.4, r * 0.14, r * (face === "yell" ? 0.2 : 0.16), 0, 0, Math.PI * 2);
        g.fill();
      } else if (face === "worry") {
        dot(cx - ex, cy + ey, r * 0.09);
        dot(cx + ex, cy + ey, r * 0.09);
        g.beginPath(); g.arc(cx, cy + r * 0.5, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      } else if (face === "huh") {
        dot(cx - ex, cy + ey, r * 0.11);
        dot(cx + ex, cy + ey, r * 0.06);
        g.beginPath(); g.moveTo(cx - r * 0.12, cy + r * 0.45); g.lineTo(cx + r * 0.14, cy + r * 0.4); g.stroke();
      } else if (face === "happy") {
        g.beginPath(); g.arc(cx - ex, cy + ey, r * 0.11, Math.PI, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(cx + ex, cy + ey, r * 0.11, Math.PI, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(cx, cy + r * 0.34, r * 0.18, 0.1, Math.PI - 0.1); g.stroke();
      } else if (face === "oops") {
        g.beginPath(); g.moveTo(cx - ex - r * 0.1, cy + ey - r * 0.12); g.lineTo(cx - ex + r * 0.08, cy + ey - r * 0.02); g.stroke();
        dot(cx - ex, cy + ey + r * 0.06, r * 0.08);
        dot(cx + ex, cy + ey + r * 0.06, r * 0.08);
        g.beginPath(); g.moveTo(cx - r * 0.1, cy + r * 0.46); g.lineTo(cx + r * 0.12, cy + r * 0.46); g.stroke();
      } else if (face === "focus") {
        g.beginPath(); g.moveTo(cx - ex - r * 0.12, cy + ey - r * 0.14); g.lineTo(cx - ex + r * 0.1, cy + ey - r * 0.04); g.stroke();
        g.beginPath(); g.moveTo(cx + ex + r * 0.12, cy + ey - r * 0.14); g.lineTo(cx + ex - r * 0.1, cy + ey - r * 0.04); g.stroke();
        dot(cx - ex, cy + ey + r * 0.06, r * 0.09);
        dot(cx + ex, cy + ey + r * 0.06, r * 0.09);
        g.beginPath(); g.moveTo(cx - r * 0.08, cy + r * 0.44); g.lineTo(cx + r * 0.1, cy + r * 0.44); g.stroke();
      } else { // calm
        dot(cx - ex, cy + ey, r * 0.09);
        dot(cx + ex, cy + ey, r * 0.09);
        g.beginPath(); g.arc(cx, cy + r * 0.32, r * 0.16, 0.2, Math.PI - 0.4); g.stroke();
      }
    }

    function drawTori() {
      var breathe = state === ST.READY || state === ST.RESULT ? Math.sin(t * 2.2) * 0.012 : 0;
      drawJudoka({
        x: -1.0 + toriLunge, y: 0, s: 1.5 + breathe, flip: false,
        gi: TORI_GI, giBack: TORI_GI_BACK, giEdge: "#d9d4c4", belt: beltForIppons(save.ippons).color,
        skin: toriSkin, hair: toriHair, pose: toriPose, face: toriFace, rot: 0
      });
    }

    function drawUke() {
      var rot = 0, face = ukeFace;
      if (uke.state === "flight") {
        rot = uke.rot;
        face = uke.y > 0.05 ? "wee" : "dizzy";
      } else if (uke.state === "down") {
        rot = Math.PI / 2 * (uke.vrot >= 0 ? 1 : -1) * 0.94;
        face = "dizzy";
      }
      drawJudoka({
        x: uke.x, y: uke.y, s: 1.45, flip: true,
        gi: uke.gi, giBack: uke.giBack, giEdge: "#2e4f86", belt: uke.belt,
        skin: uke.skin, hair: uke.hair, pose: ukePose, face: face, rot: rot
      });
      // zzz / sweat drops when down
      if (uke.state === "down" && state === ST.RESULT) {
        var sx = wx2sx(uke.x), sy = wy2sy(uke.y) - scale * 0.9;
        g.fillStyle = pal.text;
        g.globalAlpha = 0.5 + Math.sin(t * 3) * 0.2;
        g.font = "700 " + Math.round(scale * 0.24) + "px " + pal.fontBody;
        g.textAlign = "center";
        g.fillText("＠_＠", sx, sy - Math.sin(t * 2) * 3);
        g.globalAlpha = 1;
      }
    }

    /* ── meter ── */
    function drawMeter() {
      if (meterAlpha <= 0.01 || !meterGeom) return;
      var mw = meterGeom.mw, mh = meterGeom.mh, mx = meterGeom.mx, my = meterGeom.my;
      g.save();
      g.globalAlpha = meterAlpha;

      // label
      g.fillStyle = pal.text;
      g.font = "800 " + Math.round(clamp(scale * 0.18, 10, 13)) + "px " + pal.fontBody;
      g.textAlign = "center";
      g.fillText("KUZUSHI · 崩し", W / 2, my - 8);

      // track
      g.fillStyle = "rgba(0,0,0,0.35)";
      rounded(mx, my, mw, mh, mh / 2); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.25)";
      g.lineWidth = 1;
      rounded(mx, my, mw, mh, mh / 2); g.stroke();

      // sweet zone (gradient prebuilt in startCharge/resize)
      var zx = mx + (zoneC - zoneHalf) * mw, zw = zoneHalf * 2 * mw;
      g.fillStyle = meterZoneGrad;
      rounded(zx, my + 1.5, zw, mh - 3, (mh - 3) / 2); g.fill();
      // center tick
      g.fillStyle = "#fff";
      g.fillRect(mx + zoneC * mw - 1, my + 2, 2, mh - 4);

      // needle
      var nx = mx + needle * mw;
      g.fillStyle = "#ffffff";
      g.strokeStyle = "rgba(0,0,0,0.4)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(nx, my - 5);
      g.lineTo(nx - 5, my - 12);
      g.lineTo(nx + 5, my - 12);
      g.closePath();
      g.fill(); g.stroke();
      g.fillRect(nx - 1.25, my - 4, 2.5, mh + 8);

      g.restore();
    }

    function rounded(x, y, w2, h2, r) {
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w2, y, x + w2, y + h2, r);
      g.arcTo(x + w2, y + h2, x, y + h2, r);
      g.arcTo(x, y + h2, x, y, r);
      g.arcTo(x, y, x + w2, y, r);
      g.closePath();
    }

    /* ── referee (screen-space, bottom-right) ── */
    function drawReferee() {
      if (ref.vis <= 0.01) return;
      var s = clamp(scale * 1.1, 48, 72);
      var x = W - s * 1.1;
      var y = H - 10 + (1 - ref.vis) * s * 1.4;
      g.save();
      g.translate(x, y);
      // torso (suit)
      g.strokeStyle = "#3a4254";
      g.lineCap = "round";
      g.lineWidth = s * 0.34;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 0.52); g.stroke();
      // tie
      g.strokeStyle = "#8792a8";
      g.lineWidth = s * 0.06;
      g.beginPath(); g.moveTo(0, -s * 0.52); g.lineTo(0, -s * 0.28); g.stroke();
      // signalling arm: ref.arm 0=down .5=45° 1=side 2=up 3=head-scratch
      var a = ref.arm;
      var armA = a >= 2.5 ? rad(-40) : rad(90 - clamp(a, 0, 2) * 90);
      var ax0 = -s * 0.02, ay0 = -s * 0.5;
      var wob = ref.mode === "flub" ? Math.sin(t * 7) * s * 0.05 : 0;
      var ax1 = ax0 - Math.cos(armA) * s * 0.5 + wob;
      var ay1 = ay0 + Math.sin(armA) * s * 0.5;
      g.strokeStyle = "#3a4254";
      g.lineWidth = s * 0.12;
      g.beginPath(); g.moveTo(ax0, ay0); g.lineTo(ax1, ay1); g.stroke();
      g.fillStyle = "#e8c49a";
      g.beginPath(); g.arc(ax1, ay1, s * 0.07, 0, Math.PI * 2); g.fill();
      // head
      g.fillStyle = "#e8c49a";
      g.beginPath(); g.arc(0, -s * 0.72, s * 0.17, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#4c4038";
      g.beginPath(); g.arc(0, -s * 0.72, s * 0.17, Math.PI * 0.95, Math.PI * 2.05); g.fill();
      drawFace(-s * 0.06, -s * 0.72, s * 0.17, ref.mode === "ippon" ? "yell" : ref.mode === "flub" ? "huh" : "calm");
      g.restore();
    }

    /* ── particles & atmosphere ── */
    function drawParticles() {
      var i, p, sx, sy;
      g.fillStyle = "rgb(210,195,170)";
      for (i = 0; i < dust.length; i++) {
        p = dust[i];
        sx = wx2sx(p.x); sy = wy2sy(p.y);
        g.globalAlpha = clamp(p.a * 0.55, 0, 1);
        g.beginPath();
        g.arc(sx, sy, p.r * scale, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      for (i = 0; i < stars.length; i++) {
        p = stars[i];
        sx = wx2sx(p.x); sy = wy2sy(p.y);
        g.globalAlpha = clamp(p.a, 0, 1);
        drawStar(sx, sy, 5 + 2 * p.a, p.spin, "rgb(250,204,21)");
      }
      g.globalAlpha = 1;
      for (i = 0; i < confetti.length; i++) {
        p = confetti[i];
        sx = wx2sx(p.x); sy = wy2sy(p.y);
        g.save();
        g.translate(sx, sy);
        g.rotate(p.rot);
        g.globalAlpha = clamp(p.a, 0, 1);
        g.fillStyle = p.color;
        g.fillRect(-p.w * scale / 2, -p.h * scale / 2, p.w * scale, p.h * scale);
        g.restore();
      }
      g.globalAlpha = 1;
    }
    function drawStar(x, y, r, rot, color) {
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.fillStyle = color;
      g.beginPath();
      for (var i = 0; i < 8; i++) {
        var rr = i % 2 === 0 ? r : r * 0.45;
        var a = i * Math.PI / 4;
        i === 0 ? g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.restore();
    }
    function drawPetals(back) {
      // two depth layers of drifting sakura
      for (var i = 0; i < petals.length; i++) {
        if ((i % 2 === 0) !== back) continue;
        var p = petals[i];
        var sx = p.x * W, sy = p.y * H;
        g.save();
        g.translate(sx, sy);
        g.rotate(Math.sin(p.ph * 1.3) * 0.8);
        g.globalAlpha = back ? 0.35 : 0.55;
        g.fillStyle = "#eeaebd";
        g.beginPath();
        g.ellipse(0, 0, p.s, p.s * 0.62, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
      g.globalAlpha = 1;
    }
    function drawVignette() {
      g.fillStyle = vigGrad;
      g.fillRect(0, 0, W, H);
    }

    /* ═══════════ Input ═══════════ */

    var activePointer = null, swallowPress = false;

    function pressStart() {
      if (state === ST.READY) startCharge();
      else if (state === ST.RESULT) {
        toReady();
        swallowPress = true;
        // eager replayers press-and-hold straight through the verdict:
        // if they are still holding shortly after dismissal, flow into a charge
        setTimeout(function () {
          if (state === ST.READY && swallowPress && (activePointer !== null || spaceHeld)) {
            swallowPress = false;
            startCharge();
          }
        }, 300);
      }
    }
    function pressEnd() {
      if (swallowPress) { swallowPress = false; return; }
      if (state === ST.CHARGING) release();
    }

    frame.addEventListener("pointerdown", function (e) {
      if (el.mute.contains(e.target)) return;
      if (e.button !== undefined && e.button !== 0) return;  // left button / touch only
      if (activePointer !== null) return;
      activePointer = e.pointerId;
      try { frame.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      frame.classList.add("jg-pointer-focus");
      try { frame.focus({ preventScroll: true }); } catch (err) { frame.focus(); }
      audio.unlock();
      pressStart();
    });
    frame.addEventListener("pointerup", function (e) {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      pressEnd();
    });
    frame.addEventListener("pointercancel", function (e) {
      // browser took over (page scroll) — no throw, no penalty
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      swallowPress = false;
      cancelCharge();
    });
    frame.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    var spaceHeld = false;
    frame.addEventListener("keydown", function (e) {
      if (e.target !== frame) return;  // let the mute button keep its native keys
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();   // game keys must not reach host-page shortcuts
        frame.classList.remove("jg-pointer-focus");  // keyboard players get the ring back
        if (spaceHeld) return;
        spaceHeld = true;
        pressStart();
      }
    });
    frame.addEventListener("keyup", function (e) {
      if (e.target !== frame) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        spaceHeld = false;
        pressEnd();
      }
    });
    // focus lost mid-charge (help modal, click elsewhere): the keyup will land
    // on another element, so recover here exactly like pointercancel does
    frame.addEventListener("blur", function () {
      spaceHeld = false;
      cancelCharge();
    });

    el.mute.addEventListener("click", function (e) {
      e.stopPropagation();
      save.muted = !save.muted;
      persist();
      refreshHud();
      if (!save.muted) { audio.unlock(); audio.ding(); }
    });
    el.mute.addEventListener("pointerdown", function (e) { e.stopPropagation(); });

    /* ═══════════ Main loop (paused when offscreen) ═══════════ */

    var rafId = null, lastTs = 0, lastDrawTs = 0, running = false, visible = true, needDraw = true;

    function frameTick(ts) {
      rafId = null;
      var dt = clamp((ts - lastTs) / 1000, 0, 0.05);
      lastTs = ts;
      step(dt || 0.016);
      // full rate only while something fast is happening; idle scenes
      // (breathing, petals) throttle to ~30fps to save phone batteries
      var busy = state === ST.CHARGING || state === ST.FLIGHT ||
        shakeT > 0 || confetti.length > 0 || dust.length > 0 || stars.length > 0;
      var interval = busy ? 0 : (reducedMotion ? 90 : 33);
      if (needDraw || !interval || ts - lastDrawTs >= interval) {
        drawScene();
        lastDrawTs = ts;
        needDraw = false;
      }
      if (running) rafId = requestAnimationFrame(frameTick);
    }
    function startLoop() {
      if (running) return;
      running = true;
      lastTs = performance.now();
      rafId = requestAnimationFrame(frameTick);
    }
    function stopLoop() {
      running = false;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }
    function updateRunState() {
      var active = visible && !document.hidden;
      if (active) startLoop();
      else {
        if (state === ST.CHARGING) cancelCharge();
        spaceHeld = false;   // a keyup delivered elsewhere must not wedge input
        stopLoop();
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        updateRunState();
      }, { threshold: 0.05 }).observe(frame);
    }
    document.addEventListener("visibilitychange", updateRunState);

    /* ── boot ── */
    resize();
    toReady(false);
    camX = camTarget = -viewW * 0.45;
    updateRunState();
    startLoop();

    return { shell: shell };
  }

  /* ═══════════ Auto-mount ═══════════ */

  function mountAll() {
    var nodes = document.querySelectorAll("[data-judo-game]");
    for (var i = 0; i < nodes.length; i++) createGame(nodes[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();

  window.JudoGame = { mount: createGame };
})();
