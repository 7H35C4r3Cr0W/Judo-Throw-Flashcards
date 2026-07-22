/* ═══════════════════════════════════════════════════════════════
   App layer — state, storage, rendering, wiring.
   Pure logic lives in js/core.js; data in js/data.js.
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var DATA = window.JUDO_DATA;
  var C = window.JudoCore;
  var THROWS = DATA.THROWS;
  var BELT_ORDER = DATA.BELT_ORDER;
  var BELT_META = DATA.BELT_META;
  var MODES = DATA.MODES;
  var TOTAL = THROWS.length;
  var THROW_BY_NAME = {};
  THROWS.forEach(function (t) { THROW_BY_NAME[t.name] = t; });
  var ALL_NAMES = THROWS.map(function (t) { return t.name; });

  function $(id) { return document.getElementById(id); }
  var esc = C.escapeHtml;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ═══════════ Storage ═══════════ */

  var KEY = {
    history: "judo_quiz_history_v1",
    throws: "judo_quiz_throws_v1",
    prefs: "judo_quiz_prefs_v1",
    srs: "judo_quiz_srs_v1",
    activity: "judo_quiz_activity_v1"
  };

  var storage = {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem(key);
        if (v === null) return fallback;
        var parsed = JSON.parse(v);
        return parsed === null || parsed === undefined ? fallback : parsed;
      } catch (e) { return fallback; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* quota/private mode */ }
    },
    del: function (key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  // Sanitized accessors — corrupted or legacy localStorage must never crash a render.
  function getHistory() { return C.sanitizeHistory(storage.get(KEY.history, [])); }
  function getThrowStats() { return C.sanitizeThrowStats(storage.get(KEY.throws, {})); }
  function getSrs() { return C.sanitizeSrs(storage.get(KEY.srs, {})); }
  function getActivity() { return C.sanitizeActivity(storage.get(KEY.activity, {})); }

  /* every finished quiz or study mark counts toward the day streak */
  function recordActivity() {
    var act = getActivity();
    var today = C.ymd(Date.now());
    act[today] = (act[today] || 0) + 1;
    storage.set(KEY.activity, act);
  }

  /* ── Pronunciation (built-in speech synthesis, zero deps) ── */

  var speechOK = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var jaVoice = null;

  /* the API can exist with zero voices installed (common on Linux) —
     don't render dead 🔊 buttons in that case */
  function speechUsable() {
    return speechOK && window.speechSynthesis.getVoices().length > 0;
  }

  function pickJaVoice() {
    if (!speechOK) return;
    jaVoice = null; // voice list can change; never keep a stale voice
    var voices = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < voices.length; i++) {
      if (/^ja([-_]|$)/i.test(voices[i].lang)) { jaVoice = voices[i]; return; }
    }
  }

  function speakThrow(t) {
    if (!speechOK) return;
    try {
      window.speechSynthesis.cancel();
      // a Japanese voice reads the kanji correctly; otherwise romaji is closer
      var u = new SpeechSynthesisUtterance(jaVoice ? t.kanji : t.name);
      if (jaVoice) { u.voice = jaVoice; u.lang = jaVoice.lang; }
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is a bonus, never an error */ }
  }

  /* ═══════════ State ═══════════ */

  var prefs = C.sanitizePrefs(storage.get(KEY.prefs, null), Object.keys(MODES), BELT_ORDER);

  var state = {
    view: "home",
    selectedBelts: new Set(prefs.belts),
    mode: prefs.mode,
    length: prefs.length,
    autoNext: !!storage.get(KEY.prefs, {}).autoNext,
    quiz: null,
    study: {
      deck: [],
      index: 0,
      flipped: false,
      query: "",
      filter: "all",
      front: prefs.studyFront,
      shuffled: false,
      paused: reducedMotion.matches // reduced-motion users start with GIFs frozen
    },
    libraryQuery: ""
  };

  var timerHandle = null;
  var autoNextHandle = null;
  var pendingSWReload = false; // an SW update arrived mid-quiz; reload later
  var swDeferredReload = null;

  function savePrefs() {
    storage.set(KEY.prefs, {
      mode: state.mode,
      belts: Array.from(state.selectedBelts),
      length: state.length,
      theme: currentThemePref,
      studyFront: state.study.front,
      autoNext: state.autoNext
    });
  }

  /* ═══════════ Theme ═══════════ */

  var currentThemePref = prefs.theme; // null = follow system

  function appliedTheme() {
    if (currentThemePref) return currentThemePref;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme() {
    var t = appliedTheme();
    document.documentElement.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f3eee4" : "#0c0e13");
    var btn = $("themeBtn");
    btn.querySelector("span").textContent = t === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }

  function toggleTheme() {
    currentThemePref = appliedTheme() === "dark" ? "light" : "dark";
    applyTheme();
    savePrefs();
  }

  /* ═══════════ Toast ═══════════ */

  var toastHandle = null;
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastHandle);
    toastHandle = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  /* ═══════════ Modals (focus-trapped) ═══════════ */

  var modalReturnFocus = null;

  function focusables(panel) {
    return Array.prototype.filter.call(
      panel.querySelectorAll("button, [href], input, select, textarea, [tabindex]"),
      function (el) { return !el.disabled && el.tabIndex >= 0 && el.offsetParent !== null; }
    );
  }

  /* the page behind a dialog must be inert to keyboard/AT users */
  function updateInert() {
    var anyOpen = !$("modal").hidden || !$("confirmModal").hidden;
    document.querySelector(".app").inert = anyOpen;
  }

  function openModal(title, bodyHtml) {
    clearTimeout(autoNextHandle); // a dialog must freeze any pending auto-advance
    // when navigating within an already-open modal, keep the original opener
    if ($("modal").hidden) modalReturnFocus = document.activeElement;
    $("modalTitle").textContent = title;
    $("modalBody").innerHTML = bodyHtml;
    $("modal").hidden = false;
    updateInert();
    var f = focusables($("modal").querySelector(".modal-panel"));
    if (f.length) f[0].focus();
  }

  function closeModal() {
    if ($("modal").hidden) return;
    $("modal").hidden = true;
    $("modalBody").innerHTML = "";
    updateInert();
    if (modalReturnFocus && modalReturnFocus.focus) modalReturnFocus.focus();
    modalReturnFocus = null;
  }

  function trapTab(e, panel) {
    if (e.key !== "Tab") return;
    var f = focusables(panel);
    if (!f.length) { e.preventDefault(); return; }
    // focus escaped (or started outside) → pull it back into the dialog
    if (!panel.contains(document.activeElement)) {
      e.preventDefault();
      (e.shiftKey ? f[f.length - 1] : f[0]).focus();
      return;
    }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Styled replacement for confirm() */
  var confirmResolve = null;
  var confirmReturnFocus = null;

  function showConfirm(opts) {
    return new Promise(function (resolve) {
      clearTimeout(autoNextHandle); // a dialog must freeze any pending auto-advance
      confirmResolve = resolve;
      confirmReturnFocus = document.activeElement;
      $("confirmTitle").textContent = opts.title || "Are you sure?";
      $("confirmMessage").textContent = opts.message || "";
      var ok = $("confirmOkBtn");
      ok.textContent = opts.okLabel || "Confirm";
      ok.className = "btn " + (opts.danger ? "danger" : "primary");
      $("confirmModal").hidden = false;
      updateInert();
      $("confirmCancelBtn").focus();
    });
  }

  function settleConfirm(val) {
    if (!confirmResolve) return;
    $("confirmModal").hidden = true;
    updateInert();
    var r = confirmResolve;
    confirmResolve = null;
    if (confirmReturnFocus && confirmReturnFocus.focus) confirmReturnFocus.focus();
    confirmReturnFocus = null;
    r(val);
  }

  /* ═══════════ View routing ═══════════ */

  var VIEWS = ["home", "study", "library", "community", "quiz", "summary"];

  function setCurrentTab(id, on) {
    if (on) $(id).setAttribute("aria-current", "page");
    else $(id).removeAttribute("aria-current");
  }

  function showView(v) {
    // a deferred SW-update reload can now run safely (not mid-quiz/summary)
    if (pendingSWReload && (v === "home" || v === "study" || v === "library" || v === "community") && swDeferredReload) {
      pendingSWReload = false;
      swDeferredReload();
      return;
    }
    state.view = v;
    VIEWS.forEach(function (name) { $(name + "View").hidden = name !== v; });
    setCurrentTab("tabHome", v === "home" || v === "quiz" || v === "summary");
    setCurrentTab("tabStudy", v === "study");
    setCurrentTab("tabLibrary", v === "library");
    setCurrentTab("tabCommunity", v === "community");
    window.scrollTo(0, 0);
    if (v === "home") refreshHome();
    if (v === "study") refreshStudy();
    if (v === "library") renderLibrary();
  }

  /* Leaving an in-progress quiz via nav should not be silent. */
  function requestView(v) {
    if (state.view === "quiz" && state.quiz && state.quiz.results.length > 0 && v !== "quiz") {
      showConfirm({
        title: "Leave the quiz?",
        message: "Your progress in this quiz won't be saved.",
        okLabel: "Leave quiz",
        danger: true
      }).then(function (yes) {
        if (yes) { abandonQuiz(); showView(v); }
      });
      return;
    }
    if (state.view === "quiz" && state.quiz) abandonQuiz();
    showView(v);
  }

  function abandonQuiz() {
    stopTimer();
    clearTimeout(autoNextHandle);
    quizImgToken += 1; // cancel pending image retries/watchdogs
    clearQuizImgTimers();
    state.quiz = null;
  }

  /* ═══════════ Belt chips (shared: home + study) ═══════════ */

  function renderBeltChips() {
    ["beltChips", "studyBeltChips"].forEach(function (hostId) {
      var host = $(hostId);
      host.innerHTML = "";
      BELT_ORDER.forEach(function (belt) {
        var meta = BELT_META[belt];
        var count = THROWS.filter(function (t) { return t.belt === belt; }).length;
        var btn = document.createElement("button");
        btn.className = "chip";
        btn.setAttribute("aria-pressed", String(state.selectedBelts.has(belt)));
        btn.innerHTML =
          '<span class="dot" data-belt="' + belt + '" aria-hidden="true"></span>' +
          esc(meta.label) + ' <span class="count">(' + count + ")</span>";
        btn.addEventListener("click", function () {
          if (state.selectedBelts.has(belt)) state.selectedBelts.delete(belt);
          else state.selectedBelts.add(belt);
          savePrefs();
          renderBeltChips();
          updateStartButton();
          if (state.view === "study") refreshStudy();
          // the re-render replaced this chip — put focus back on its successor
          var again = host.children[BELT_ORDER.indexOf(belt)];
          if (again) again.focus();
        });
        host.appendChild(btn);
      });
    });
  }

  /* ═══════════ Mode cards ═══════════ */

  function renderModeCards() {
    var host = $("modeRow");
    host.innerHTML = "";
    var keys = Object.keys(MODES);

    function select(key) {
      state.mode = key;
      savePrefs();
      host.querySelectorAll(".mode-card").forEach(function (c) {
        var on = c.dataset.mode === key;
        c.setAttribute("aria-checked", String(on));
        c.tabIndex = on ? 0 : -1; // roving tabindex: one tab stop for the group
      });
    }

    keys.forEach(function (key) {
      var m = MODES[key];
      var btn = document.createElement("button");
      btn.className = "mode-card";
      btn.dataset.mode = key;
      // single-select group → radio semantics, not independent toggles
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(state.mode === key));
      btn.tabIndex = state.mode === key ? 0 : -1;
      btn.innerHTML =
        '<span class="mode-icon" aria-hidden="true">' + m.icon + "</span>" +
        '<span class="mode-title">' + esc(m.title) + "</span>" +
        '<span class="mode-desc">' + esc(m.desc) + "</span>";
      btn.addEventListener("click", function () { select(key); });
      host.appendChild(btn);
    });

    // radios move selection with arrow keys (WAI-ARIA radiogroup pattern)
    host.addEventListener("keydown", function (e) {
      var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 :
                (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = keys[(keys.indexOf(state.mode) + dir + keys.length) % keys.length];
      select(next);
      var el = host.querySelector('[data-mode="' + next + '"]');
      if (el) el.focus();
    });
  }

  /* ═══════════ Home ═══════════ */

  function selectedPool() {
    return THROWS.filter(function (t) { return state.selectedBelts.has(t.belt); });
  }

  function updateStartButton() {
    var pool = selectedPool();
    var btn = $("startBtn");
    var n = state.length === "all" ? pool.length : Math.min(parseInt(state.length, 10), pool.length);
    btn.disabled = pool.length === 0;
    btn.textContent = pool.length === 0 ? "Start Quiz" : "Start Quiz · " + n + (n === 1 ? " throw" : " throws");
    $("beltHint").hidden = pool.length !== 0;
  }

  function refreshHome() {
    renderLifetimeStats();
    renderRecentTests();
    renderFocusList();
    updateStartButton();
  }

  function renderLifetimeStats() {
    var hist = getHistory();
    var ts = getThrowStats();
    var srs = getSrs();
    var agg = C.aggregateLifetime(hist);

    $("lt-tests").textContent = agg.tests;
    var dayStreak = C.computeDayStreak(getActivity(), Date.now());
    $("lt-tests-sub").textContent =
      dayStreak >= 2 ? "🔥 " + dayStreak + "-day study streak" :
      agg.tests === 0 ? "Get started above" :
      agg.tests === 1 ? "1 test completed" : agg.tests + " tests completed";
    $("lt-acc").textContent = agg.accuracy === null ? "—" : Math.round(agg.accuracy * 100) + "%";
    $("lt-acc-sub").textContent = agg.totalQuestions
      ? agg.totalCorrect + " / " + agg.totalQuestions + " correct"
      : "across all questions";
    $("lt-mastered").textContent = C.masteredCount(ts, THROWS) + " / " + TOTAL;

    var due = C.countDue(THROWS, srs, Date.now());
    $("lt-due").textContent = due;
    $("lt-due-sub").textContent = due ? "try a Smart Drill" : "all caught up";
    $("dueCard").classList.toggle("due-highlight", due > 0);
  }

  function renderRecentTests() {
    var host = $("recentTests");
    var hist = getHistory();
    if (!hist.length) {
      host.innerHTML = '<div class="empty-note">No tests yet — start one above.</div>';
      return;
    }
    host.innerHTML = "";
    hist.slice(0, 5).forEach(function (h) { host.appendChild(historyRow(h, false)); });
  }

  function historyRow(h, absolute) {
    var acc = h.total ? Math.round((h.score / h.total) * 100) : 0;
    var cls = acc >= 80 ? "good" : acc >= 60 ? "mid" : "bad";
    var when = absolute ? new Date(h.completedAt).toLocaleString() : C.fmtRelative(h.completedAt);
    var row = document.createElement("button");
    row.className = "history-row";
    row.setAttribute("aria-label", acc + "%, " + h.score + " of " + h.total + ", " + when + " — view details");
    row.innerHTML =
      '<span class="history-score ' + cls + '">' + acc + "%</span>" +
      '<span class="history-meta"><span><b>' + h.score + " / " + h.total + "</b> · " +
      esc((MODES[h.mode] || {}).label || h.mode) + "</span>" +
      '<span class="when" style="display:block;">' + esc(when) + " · " + C.fmtDuration(h.durationMs) +
      (h.partial ? " · partial" : "") + "</span></span>" +
      '<span class="history-actions" aria-hidden="true">›</span>';
    row.addEventListener("click", function () { openHistoryDetail(h.id); });
    return row;
  }

  function renderFocusList() {
    var host = $("focusList");
    var rows = C.computeFocus(getThrowStats(), THROWS, 6);
    $("drillFocusBtn").hidden = rows.length === 0;
    if (!rows.length) {
      host.innerHTML = '<div class="empty-note">Take a few quizzes — your weakest throws will appear here.</div>';
      return;
    }
    host.innerHTML = "";
    rows.forEach(function (r) {
      var pct = Math.round(r.acc * 100);
      var cls = pct < 50 ? "bad" : pct < 80 ? "mid" : "good";
      var row = document.createElement("button");
      row.className = "focus-row";
      row.setAttribute("aria-label", r.t.name + ", " + pct + "% accuracy — view details");
      row.innerHTML =
        "<span><span class=\"name\" style=\"display:block;\">" + esc(r.t.name) + "</span>" +
        '<span class="english">' + esc(r.t.english) + " · " + esc(BELT_META[r.t.belt].label) + "</span></span>" +
        '<span class="acc-pill ' + cls + '">' + pct + '% <span class="muted small">(' + r.correct + "/" + r.seen + ")</span></span>";
      row.addEventListener("click", function () { openThrowDetail(r.t.name); });
      host.appendChild(row);
    });
    var drill = $("drillFocusBtn");
    drill.onclick = function () {
      startQuiz({ deck: C.shuffle(rows.map(function (r) { return r.t; })), mixed: true });
    };
  }

  /* ═══════════ Quiz ═══════════ */

  var QUESTION_MODES = ["image-to-name", "english-to-name", "name-to-english"];

  function questionModeFor(quiz) {
    if (quiz.mode !== "smart" && !quiz.mixed) return quiz.mode;
    // mixed: favour visual recognition, sprinkle both text directions
    var r = Math.random();
    return r < 0.5 ? "image-to-name" : r < 0.75 ? "english-to-name" : "name-to-english";
  }

  function startQuiz(opts) {
    opts = opts || {};
    var deck;
    if (Array.isArray(opts.deck) && opts.deck.length) {
      deck = opts.deck;
    } else {
      var pool = selectedPool();
      if (!pool.length) { toast("Select at least one belt group first"); return; }
      deck = state.mode === "smart"
        ? C.buildSmartDeck(pool, getSrs(), getThrowStats(), state.length, Date.now())
        : C.buildDeck(pool, state.length);
    }
    state.quiz = {
      id: C.uid(),
      mode: opts.mixed ? "smart" : state.mode,
      mixed: !!opts.mixed || state.mode === "smart",
      selectedBelts: Array.from(state.selectedBelts),
      deck: deck,
      qIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      startedAt: Date.now(),
      answered: false,
      currentCorrectIdx: -1,
      currentQMode: null,
      results: []
    };
    showView("quiz");
    $("qTotal").textContent = deck.length;
    $("autoNextChk").checked = state.autoNext;
    startTimer();
    renderQuestion();
  }

  function startTimer() {
    stopTimer();
    var tick = function () {
      if (!state.quiz) return;
      $("timer").textContent = C.fmtDuration(Date.now() - state.quiz.startedAt);
    };
    tick();
    timerHandle = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }

  function setProgress(fraction) {
    var pct = Math.round(fraction * 100);
    $("progressFill").style.width = pct + "%";
    $("progressBar").setAttribute("aria-valuenow", String(pct));
  }

  /* GIF pause/replay controls (WCAG 2.2.2: pause, stop, hide) */
  var gifPaused = false;
  var pauseCanvas = null;
  var userReplayed = false; // explicit replay overrides the reduced-motion auto-pause once

  function ensureMediaControls() {
    var wrap = $("imageWrap");
    if (wrap.querySelector(".media-controls")) return;
    var box = document.createElement("div");
    box.className = "media-controls";
    box.innerHTML =
      '<button type="button" class="btn small icon-btn" id="replayBtn" aria-label="Replay animation"><span aria-hidden="true">↻</span></button>' +
      '<button type="button" class="btn small icon-btn" id="pauseBtn" aria-label="Pause animation" aria-pressed="false"><span aria-hidden="true">⏸</span></button>';
    wrap.appendChild(box);
    $("replayBtn").addEventListener("click", function () {
      var img = $("throwImage");
      unpauseGif();
      userReplayed = true;
      // same-value src reassignment doesn't reliably restart a GIF everywhere;
      // a cache-busting query does, and the SW matches it with ignoreSearch
      var base = (img.getAttribute("src") || "").split("?")[0];
      if (base) img.src = base + "?r=" + Date.now();
    });
    $("pauseBtn").addEventListener("click", function () {
      if (gifPaused) unpauseGif(); else pauseGif();
    });
  }

  function pauseGif() {
    var img = $("throwImage");
    if (!img.naturalWidth || gifPaused) return;
    pauseCanvas = document.createElement("canvas");
    pauseCanvas.width = img.naturalWidth;
    pauseCanvas.height = img.naturalHeight;
    try {
      pauseCanvas.getContext("2d").drawImage(img, 0, 0);
    } catch (e) { pauseCanvas = null; return; }
    // .gif-frame shares the img's sizing rules in CSS, so the frozen
    // frame occupies exactly the same box as the animation it replaces
    pauseCanvas.className = "gif-frame" + (img.className ? " " + img.className : "");
    img.style.display = "none";
    img.insertAdjacentElement("afterend", pauseCanvas);
    gifPaused = true;
    var b = $("pauseBtn");
    if (b) {
      b.setAttribute("aria-pressed", "true");
      b.setAttribute("aria-label", "Play animation");
      b.querySelector("span").textContent = "▶";
    }
  }

  function unpauseGif() {
    if (pauseCanvas && pauseCanvas.parentNode) pauseCanvas.parentNode.removeChild(pauseCanvas);
    pauseCanvas = null;
    $("throwImage").style.display = "";
    gifPaused = false;
    var b = $("pauseBtn");
    if (b) {
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "Pause animation");
      b.querySelector("span").textContent = "⏸";
    }
  }

  function beltBadgeHtml(t) {
    return '<span class="dot" data-belt="' + t.belt + '" aria-hidden="true"></span>' +
      esc(BELT_META[t.belt].label);
  }

  /* ── Image resilience ──────────────────────────────────────────
     Mobile connections drop GIF fetches; a study card or quiz image
     must recover instead of dead-ending. Failed loads retry with
     backoff, a watchdog catches hung connections, and only after
     that do we show an error (with a manual retry).              */

  var IMG_RETRY_DELAYS = [700, 2200];
  var quizImgToken = 0; // invalidates pending retries/watchdogs on question change
  var quizImgTimers = [];

  function clearQuizImgTimers() {
    quizImgTimers.forEach(clearTimeout);
    quizImgTimers = [];
  }

  function loadQuizImage(src) {
    var token = ++quizImgToken;
    clearQuizImgTimers();
    var imageWrap = $("imageWrap");
    var img = $("throwImage");
    var attempt = 0;

    function fail() {
      if (token !== quizImgToken) return;
      imageWrap.classList.remove("loading");
      imageWrap.classList.add("error");
    }

    function tryLoad() {
      if (token !== quizImgToken) return;
      imageWrap.classList.remove("error");
      imageWrap.classList.add("loading");
      // hung connections never fire onerror — watch and retry
      quizImgTimers.push(setTimeout(function () {
        if (token === quizImgToken && imageWrap.classList.contains("loading")) retry();
      }, 12000));
      img.src = src; // same-value assignment re-runs the fetch per spec
    }

    function retry() {
      if (token !== quizImgToken) return;
      if (attempt >= IMG_RETRY_DELAYS.length) { fail(); return; }
      var delay = IMG_RETRY_DELAYS[attempt];
      attempt += 1;
      quizImgTimers.push(setTimeout(tryLoad, delay));
    }

    img.onload = function () {
      if (token !== quizImgToken) return;
      clearQuizImgTimers();
      imageWrap.classList.remove("loading");
      // WCAG: no autoplaying motion — but an explicit replay is a request for it
      if (reducedMotion.matches && !userReplayed) pauseGif();
      userReplayed = false;
    };
    img.onerror = function () {
      if (!img.getAttribute("src")) return; // ignore programmatic src clears
      retry();
    };
    tryLoad();

    // manual retry from the error state resets the backoff budget
    var retryBtn = $("imgRetryBtn");
    if (retryBtn) retryBtn.onclick = function () { attempt = 0; tryLoad(); };
  }

  /* WCAG 2.2.2 outside the quiz: every looping GIF needs a way to stop.
     Freezing = hide the img and insert a first-frame canvas beside it
     (drawImage of an animated img yields frame 1), so it can be undone. */
  function gifFrozen(img) {
    var next = img && img.nextElementSibling;
    return !!(next && next.tagName === "CANVAS" && next.classList.contains("gif-frame"));
  }

  function freezeGifElement(img) {
    if (!img || !img.isConnected || !img.naturalWidth || gifFrozen(img)) return;
    var c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    try { c.getContext("2d").drawImage(img, 0, 0); } catch (e) { return; }
    c.className = "gif-frame " + img.className;
    c.setAttribute("role", "img");
    if (img.alt) c.setAttribute("aria-label", img.alt);
    img.style.display = "none";
    img.insertAdjacentElement("afterend", c);
  }

  function unfreezeGifElement(img) {
    if (!img) return;
    if (gifFrozen(img)) img.nextElementSibling.remove();
    img.style.display = "";
  }

  /* freeze now if loaded, else as soon as it loads */
  function freezeGifWhenReady(img) {
    if (!img) return;
    if (img.complete && img.naturalWidth) freezeGifElement(img);
    else img.addEventListener("load", function () { freezeGifElement(img); }, { once: true });
  }

  function freezeGifIfReduced(img) {
    if (img && reducedMotion.matches) freezeGifWhenReady(img);
  }

  /* Retry-once-then-placeholder for images outside the quiz flow
     (study card faces, throw-detail modal). */
  function attachImgRetry(img) {
    if (!img) return;
    var retried = false;
    img.addEventListener("error", function handler() {
      if (!img.getAttribute("src")) return;
      if (!retried) {
        retried = true;
        var src = img.getAttribute("src");
        setTimeout(function () {
          if (img.isConnected) img.src = src;
        }, 900);
        return;
      }
      var fallback = document.createElement("span");
      fallback.className = "img-fallback";
      fallback.textContent = "Animation couldn't load — check your connection";
      if (img.parentNode) img.parentNode.replaceChild(fallback, img);
    });
  }

  function renderQuestion() {
    var q = state.quiz;
    var t = q.deck[q.qIndex];
    q.currentQMode = questionModeFor(q);

    $("qIndex").textContent = q.qIndex + 1;
    $("score").textContent = q.score;
    updateStreakPill(q.streak);
    setProgress(q.qIndex / q.deck.length);

    $("beltBadge").innerHTML = beltBadgeHtml(t);

    var imageWrap = $("imageWrap");
    var img = $("throwImage");
    // reset the answer-reveal alt from the previous question
    img.alt = "Animated demonstration of a judo throw — identify it from the answer options";
    var qMain = $("qMain");
    var hint = $("questionHint");
    var isVisual = q.currentQMode === "image-to-name";
    var isType = q.currentQMode === "type-answer";

    unpauseGif();
    ensureMediaControls();
    $("quizView").querySelector(".quiz-card").classList.toggle("has-image", isVisual || isType);

    // reset hints for the new question
    q.hintLevel = 0;
    $("hintLine").hidden = true;
    $("hintLine").textContent = "";
    $("hintBtn").disabled = false;

    var labelKey;
    if (isVisual || isType) {
      qMain.textContent = "What throw is this?";
      hint.textContent = isType ? "Type the Japanese name — spelling is forgiving" : "Pick the correct Japanese name";
      imageWrap.style.display = "grid";
      loadQuizImage(t.img);
      labelKey = function (x) { return x.name; };
    } else if (q.currentQMode === "english-to-name") {
      qMain.textContent = 'Which throw means "' + t.english + '"?';
      hint.textContent = "Pick the correct Japanese name";
      imageWrap.style.display = "none";
      labelKey = function (x) { return x.name; };
    } else {
      qMain.textContent = 'What does "' + t.name + '" mean?';
      hint.textContent = "Pick the correct English meaning";
      imageWrap.style.display = "none";
      labelKey = function (x) { return x.english; };
    }
    if (!isVisual && !isType) {
      // text question: a GIF watchdog from the previous visual question
      // must not fire a pointless retry against the hidden image
      quizImgToken += 1;
      clearQuizImgTimers();
      imageWrap.classList.remove("loading", "error");
    }
    q.currentLabelKey = labelKey;

    var optsHost = $("options");
    var typeArea = $("typeArea");
    optsHost.innerHTML = "";

    if (isType) {
      optsHost.style.display = "none";
      typeArea.hidden = false;
      var input = $("typeInput");
      input.value = "";
      input.disabled = false;
      input.classList.remove("shake");
      $("typeSubmitBtn").disabled = false;
      $("typeGiveUpBtn").disabled = false;
      q.currentCorrectIdx = -1;
      input.focus({ preventScroll: true });
    } else {
      optsHost.style.display = "";
      typeArea.hidden = true;
      var distractors = C.pickSmartDistractors(THROWS, t, 3, labelKey);
      var options = C.shuffle([t].concat(distractors));
      q.currentCorrectIdx = options.indexOf(t);
      options.forEach(function (item, i) {
        var b = document.createElement("button");
        b.className = "option";
        b.dataset.idx = i;
        b.innerHTML =
          '<span class="kbd" aria-hidden="true">' + (i + 1) + "</span>" +
          '<span class="opt-label">' + esc(labelKey(item)) + "</span>";
        b.addEventListener("click", function () { handleAnswer(i); });
        optsHost.appendChild(b);
      });
    }

    var fb = $("feedback");
    fb.className = "feedback";
    fb.innerHTML = "";
    $("nextBtn").disabled = true;
    q.answered = false;

    // announce the new question / move reading position (type mode focuses its input)
    if (!isType) $("questionText").focus({ preventScroll: true });

    // preload the next GIF so slow connections don't stall the next question
    var next = q.deck[q.qIndex + 1];
    if (next) { var pre = new Image(); pre.src = next.img; }
  }

  /* ── Hints ─────────────────────────────────────────────────
     Level 1 shows the name shape ("O____ G___"); level 2 reveals
     more letters, and in choice modes also greys out two wrong
     options. Hints are free — they're recorded, not penalized.  */

  function useHint() {
    var q = state.quiz;
    if (!q || q.answered || q.hintLevel >= 2) return;
    q.hintLevel += 1;
    var t = q.deck[q.qIndex];
    var answerText = q.currentQMode === "name-to-english" ? t.english : t.name;
    var line = $("hintLine");
    line.hidden = false;
    line.textContent = "💡 " + C.maskName(answerText, q.hintLevel);

    if (q.hintLevel === 2 && q.currentQMode !== "type-answer") {
      // eliminate two wrong options
      var wrongs = Array.prototype.filter.call(
        $("options").querySelectorAll(".option"),
        function (b) { return parseInt(b.dataset.idx, 10) !== q.currentCorrectIdx && !b.classList.contains("eliminated"); }
      );
      C.shuffle(wrongs).slice(0, 2).forEach(function (b) {
        b.classList.add("eliminated");
        b.disabled = true;
      });
    }
    if (q.hintLevel >= 2) $("hintBtn").disabled = true;
    // clicking the hint button steals focus from the type input — give it back
    if (q.currentQMode === "type-answer" && !q.answered) {
      var ti = $("typeInput");
      if (!ti.disabled) ti.focus();
    }
  }

  function updateStreakPill(streak) {
    $("streak").textContent = streak;
    var hot = streak >= 3;
    $("streakPill").classList.toggle("streak-hot", hot);
    $("streakPill").firstChild.textContent = hot ? "Streak 🔥 " : "Streak ";
  }

  function handleAnswer(chosenIdx) {
    var q = state.quiz;
    if (!q || q.answered) return;
    var t = q.deck[q.qIndex];
    var correct = chosenIdx === q.currentCorrectIdx;

    var buttons = $("options").querySelectorAll(".option");
    buttons.forEach(function (b) {
      var i = parseInt(b.dataset.idx, 10);
      var name = (b.querySelector(".opt-label") || b).textContent.trim();
      b.disabled = true;
      if (i === q.currentCorrectIdx) {
        b.classList.add("correct");
        b.setAttribute("aria-label", name + " — correct answer");
      }
      if (i === chosenIdx && !correct) {
        b.classList.add("wrong");
        b.setAttribute("aria-label", name + " — your answer, incorrect");
      }
    });

    finalizeAnswer(t, correct, labelOf(buttons, chosenIdx));
  }

  function handleTypedAnswer(gaveUp) {
    var q = state.quiz;
    if (!q || q.answered) return;
    var t = q.deck[q.qIndex];
    var input = $("typeInput");
    var typed = input.value.trim();
    if (!gaveUp && !typed) {
      input.classList.remove("shake");
      void input.offsetWidth;
      input.classList.add("shake");
      return;
    }
    var correct = !gaveUp &&
      C.matchAnswer(typed, t.name, ALL_NAMES.filter(function (n) { return n !== t.name; }), t.kanji);
    input.disabled = true;
    $("typeSubmitBtn").disabled = true;
    $("typeGiveUpBtn").disabled = true;
    input.blur();
    finalizeAnswer(t, correct, gaveUp ? "(revealed)" : typed);
  }

  /* shared tail of both answer paths: scoring, SRS, feedback, focus */
  function finalizeAnswer(t, correct, chosenText) {
    var q = state.quiz;
    q.answered = true;
    $("hintBtn").disabled = true;

    if (correct) {
      q.score += 1;
      q.streak += 1;
      q.bestStreak = Math.max(q.bestStreak, q.streak);
      if (q.streak === 5 || q.streak === 10 || q.streak === 20) {
        toast("🔥 " + q.streak + " in a row!");
      }
    } else {
      q.streak = 0;
    }

    q.results.push({
      name: t.name,
      english: t.english,
      belt: t.belt,
      img: t.img,
      mode: q.currentQMode,
      correct: correct,
      chosen: chosenText,
      correctAnswer: q.currentLabelKey ? q.currentLabelKey(t) : t.name,
      hints: q.hintLevel || 0,
      ts: Date.now()
    });

    updateThrowStats(t.name, correct);
    updateSrs(t.name, correct);

    var fb = $("feedback");
    var isVisualish = q.currentQMode === "image-to-name" || q.currentQMode === "type-answer";
    var showThumb = !isVisualish; // the big animation is already on screen in visual modes
    fb.className = "feedback show " + (correct ? "ok" : "no");
    fb.innerHTML =
      '<span class="feedback-inner">' +
      (showThumb ? '<img class="fb-thumb" src="' + esc(t.img) + '" alt="Animation of ' + esc(t.name) + '" onerror="this.style.display=\'none\'" />' : "") +
      "<span>" +
      (correct
        ? "✔ Correct! <b>" + esc(t.name) + "</b> <span lang=\"ja\">" + esc(t.kanji) + "</span> — <i>" + esc(t.english) + "</i>"
        : "✖ The answer is <b>" + esc(t.name) + "</b> <span lang=\"ja\">" + esc(t.kanji) + "</span> — <i>" + esc(t.english) + "</i>") +
      '<span class="fb-detail" style="display:block;">' + esc(t.group) + " · " + esc(BELT_META[t.belt].sub) +
      (q.hintLevel ? " · 💡 hint used" : "") + "</span>" +
      "</span>" +
      (speechUsable() ? '<button type="button" class="btn ghost icon-btn fb-speak" id="fbSpeakBtn" aria-label="Pronounce ' + esc(t.name) + '"><span aria-hidden="true">🔊</span></button>' : "") +
      "</span>";
    var sp = $("fbSpeakBtn");
    if (sp) sp.addEventListener("click", function () { speakThrow(t); });
    freezeGifIfReduced(fb.querySelector(".fb-thumb"));

    // after answering, the alt text may reveal the throw
    $("throwImage").alt = "Animation of " + t.name;

    $("score").textContent = q.score;
    updateStreakPill(q.streak);
    setProgress((q.qIndex + 1) / q.deck.length);

    // on small screens the feedback can sit below the fold
    if (window.innerHeight < 800 || window.innerWidth < 700) {
      fb.scrollIntoView({ block: "nearest", behavior: reducedMotion.matches ? "auto" : "smooth" });
    }

    var nextBtn = $("nextBtn");
    nextBtn.disabled = false;
    if (state.autoNext && correct) {
      autoNextHandle = setTimeout(function () {
        // never advance behind an open dialog
        if (state.quiz === q && q.answered && $("modal").hidden && $("confirmModal").hidden) nextQuestion();
      }, 1100);
    } else {
      nextBtn.focus();
    }
  }

  function labelOf(buttons, idx) {
    var b = buttons[idx];
    if (!b) return "";
    var l = b.querySelector(".opt-label");
    return l ? l.textContent : "";
  }

  function updateThrowStats(name, correct) {
    var ts = getThrowStats();
    if (!ts[name]) ts[name] = { seen: 0, correct: 0, lastSeen: 0 };
    ts[name].seen += 1;
    if (correct) ts[name].correct += 1;
    ts[name].lastSeen = Date.now();
    storage.set(KEY.throws, ts);
  }

  function updateSrs(name, correct, flag) {
    var srs = getSrs();
    var next = C.srsOnAnswer(srs[name], correct, Date.now());
    next.flag = flag !== undefined ? flag : (srs[name] ? srs[name].flag : null);
    srs[name] = next;
    storage.set(KEY.srs, srs);
    return next;
  }

  function nextQuestion() {
    var q = state.quiz;
    if (!q || !q.answered) return;
    clearTimeout(autoNextHandle);
    q.qIndex += 1;
    if (q.qIndex >= q.deck.length) { finishQuiz(false); return; }
    renderQuestion();
  }

  function finishQuiz(partial) {
    var q = state.quiz;
    if (!q) return;
    stopTimer();
    clearTimeout(autoNextHandle);
    quizImgToken += 1; // cancel pending image retries/watchdogs
    clearQuizImgTimers();
    var completedAt = Date.now();
    var totalAnswered = q.results.length;

    var entry = {
      id: q.id,
      completedAt: completedAt,
      durationMs: completedAt - q.startedAt,
      mode: q.mode,
      selectedBelts: q.selectedBelts,
      total: partial ? totalAnswered : q.deck.length,
      score: q.score,
      bestStreak: q.bestStreak,
      partial: !!partial && totalAnswered < q.deck.length,
      results: q.results.slice()
    };
    if (entry.total > 0) {
      var hist = getHistory();
      hist.unshift(entry);
      storage.set(KEY.history, hist.slice(0, 200));
      recordActivity();
    }
    state.quiz = null;
    renderSummary(entry);
    showView("summary");
    // move reading position so "Quiz complete!" is announced
    var st = $("summaryTitle");
    if (st) st.focus({ preventScroll: true });
  }

  function endNow() {
    if (!state.quiz) return;
    if (state.quiz.results.length === 0) {
      showConfirm({
        title: "End the quiz?",
        message: "You haven't answered anything yet — nothing will be saved.",
        okLabel: "End quiz"
      }).then(function (yes) {
        if (!yes) return;
        abandonQuiz();
        showView("home");
      });
      return;
    }
    showConfirm({
      title: "End the quiz now?",
      message: "It will be saved to history as a partial test.",
      okLabel: "End & save"
    }).then(function (yes) { if (yes) finishQuiz(true); });
  }

  /* ═══════════ Summary ═══════════ */

  function renderSummary(entry) {
    var total = entry.total;
    var score = entry.score;
    var pct = total ? Math.round((score / total) * 100) : 0;

    var msg = "Good effort — keep drilling!";
    if (total === 0) msg = "Quiz ended early.";
    else if (pct === 100) msg = "Flawless! 一本 — Ippon!";
    else if (pct >= 85) msg = "Excellent — strong recall.";
    else if (pct >= 70) msg = "Solid work.";
    else if (pct >= 50) msg = "Getting there — another round will help.";
    $("summaryLine").textContent = msg + (entry.partial ? " (ended early)" : "");

    // count-up animation for the big score
    var scoreEl = $("finalScore");
    if (reducedMotion.matches || score === 0) {
      scoreEl.textContent = score + " / " + total;
    } else {
      var start = null;
      var dur = 650;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        scoreEl.textContent = Math.round(score * p) + " / " + total;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    $("m-acc").textContent = total ? pct + "%" : "—";
    $("m-time").textContent = C.fmtDuration(entry.durationMs);
    $("m-streak").textContent = entry.bestStreak || 0;
    $("m-avg").textContent = total ? C.fmtDuration(entry.durationMs / total) : "—";

    var wrong = entry.results.filter(function (r) { return !r.correct; });
    var wrongPanel = $("wrongPanel");
    var wrongList = $("wrongList");
    wrongPanel.hidden = wrong.length === 0;
    wrongList.innerHTML = "";
    wrong.forEach(function (r) {
      var row = document.createElement("button");
      row.className = "wrong-row";
      row.setAttribute("aria-label", r.name + " — view details");
      row.innerHTML =
        '<img class="thumb" src="' + esc(r.img) + '" alt="" loading="lazy" ' +
        "onerror=\"this.outerHTML='<span class=&quot;thumb-placeholder&quot;>no image</span>'\" />" +
        "<span><span class=\"name\" style=\"display:block;\">" + esc(r.name) +
        ' <span class="muted small">— ' + esc(r.english) + "</span></span>" +
        '<span class="muted small" style="display:block;">' + esc(BELT_META[r.belt] ? BELT_META[r.belt].label : r.belt) + "</span>" +
        '<span class="what-i-said">You said <b>' + esc(r.chosen) + "</b> · correct: <b>" + esc(r.correctAnswer) + "</b></span></span>";
      row.addEventListener("click", function () { openThrowDetail(r.name); });
      wrongList.appendChild(row);
    });
    // a long wrong-list is a wall of looping GIFs — honor reduced motion here too
    wrongList.querySelectorAll("img.thumb").forEach(freezeGifIfReduced);

    $("retryWrongBtn").hidden = wrong.length === 0;
    $("retryWrongBtn").dataset.names = JSON.stringify(wrong.map(function (r) { return r.name; }));

    if (pct === 100 && total > 0) fireConfetti();
  }

  function retryWrongOnly() {
    var names;
    try { names = JSON.parse($("retryWrongBtn").dataset.names || "[]"); } catch (e) { names = []; }
    var pool = THROWS.filter(function (t) { return names.indexOf(t.name) !== -1; });
    if (!pool.length) return;
    startQuiz({ deck: C.shuffle(pool), mixed: state.quiz === null && state.mode === "smart" });
  }

  /* ═══════════ Confetti (tiny, dependency-free) ═══════════ */

  function fireConfetti() {
    if (reducedMotion.matches) return;
    var canvas = $("confettiCanvas");
    canvas.hidden = false;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");
    var colors = ["#e5484d", "#f5c518", "#3b82f6", "#22c55e", "#f97316", "#ffffff"];
    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
        y: canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 11,
        vy: -(Math.random() * 9 + 3),
        s: Math.random() * 7 + 4,
        c: colors[Math.floor(Math.random() * colors.length)],
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25
      });
    }
    var start = Date.now();
    (function frame() {
      var elapsed = Date.now() - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 2000);
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      if (elapsed < 2000) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.hidden = true; }
    })();
  }

  /* ═══════════ Study (flashcards) ═══════════ */

  function computeStudyDeck() {
    var deck = C.filterThrows(THROWS, { query: state.study.query, belts: state.selectedBelts });
    var srs = getSrs();
    var stats = getThrowStats();
    var now = Date.now();
    var f = state.study.filter;
    if (f === "due") deck = deck.filter(function (t) { return srs[t.name] && C.srsIsDue(srs[t.name], now); });
    else if (f === "review") deck = deck.filter(function (t) { return srs[t.name] && srs[t.name].flag === "review"; });
    else if (f === "unseen") deck = deck.filter(function (t) { return !srs[t.name] && !stats[t.name]; });
    return deck;
  }

  function refreshStudy(keepIndex) {
    cancelPendingMark(); // filter/search changes supersede a pending sweep-advance
    var s = state.study;
    var current = keepIndex && s.deck.length ? s.deck[s.index] : null;
    var deck = computeStudyDeck();
    // apply the stable shuffled order (a fresh shuffle per keystroke would
    // yank the current card out from under the user)
    if (s.shuffled && s.order) {
      deck = deck.slice().sort(function (a, b) { return s.order[a.name] - s.order[b.name]; });
    }
    s.deck = deck;
    s.index = 0;
    if (current) {
      var at = deck.indexOf(current);
      if (at >= 0) s.index = at;
    }
    s.flipped = false;
    renderStudyCard();
  }

  function studyStatsPills(t) {
    var stats = getThrowStats()[t.name];
    var srs = getSrs()[t.name];
    var bits = [];
    if (stats && stats.seen) bits.push('<span class="pill">Accuracy <b>' + Math.round((stats.correct / stats.seen) * 100) + "%</b></span>");
    if (srs) bits.push('<span class="pill">Box <b>' + srs.box + "/5</b></span>");
    if (srs && srs.flag === "known") bits.push('<span class="pill">✓ known</span>');
    if (srs && srs.flag === "review") bits.push('<span class="pill">↻ review</span>');
    return bits.join("");
  }

  function renderStudyCard() {
    var s = state.study;
    var card = $("flashcard");
    var empty = $("studyEmpty");
    var deck = s.deck;

    $("studyFill").style.width = deck.length ? ((s.index + 1) / deck.length) * 100 + "%" : "0%";

    if (!deck.length) {
      card.hidden = true;
      empty.hidden = false;
      $("studyCounts").textContent = "0 cards";
      return;
    }
    card.hidden = false;
    empty.hidden = true;

    var t = deck[s.index];
    var count = (s.index + 1) + " / " + deck.length;
    var front = $("cardFront");
    var back = $("cardBack");

    var frontInner;
    if (s.front === "visual") {
      frontInner = '<img class="throw-gif" src="' + esc(t.img) +
        '" alt="Animated demonstration of a judo throw — flip the card for the name" />';
    } else if (s.front === "name") {
      frontInner = '<span class="front-word">' + esc(t.name) +
        '<span class="kanji-sub" lang="ja">' + esc(t.kanji) + "</span></span>";
    } else {
      frontInner = '<span class="front-word">' + esc(t.english) + "</span>";
    }
    var touchy = window.matchMedia("(pointer: coarse)").matches;
    front.innerHTML =
      '<span class="belt-badge">' + beltBadgeHtml(t) + "</span>" +
      '<span class="card-count">' + count + "</span>" +
      frontInner +
      '<span class="face-hint">' + (touchy ? "tap to flip · swipe for next" : "tap / space to flip") + "</span>";

    back.innerHTML =
      '<span class="belt-badge">' + beltBadgeHtml(t) + "</span>" +
      '<span class="card-count">' + count + "</span>" +
      (s.front !== "visual" ? '<img class="throw-gif" src="' + esc(t.img) + '" alt="Animation of ' + esc(t.name) + '" />' : "") +
      '<span class="back-name">' + esc(t.name) + "</span>" +
      '<span class="back-kanji" lang="ja">' + esc(t.kanji) + "</span>" +
      '<span class="back-english">' + esc(t.english) + "</span>" +
      '<span class="back-group">' + esc(t.group) + " · " + esc(BELT_META[t.belt].sub) + "</span>" +
      '<span class="back-stats">' + studyStatsPills(t) + "</span>";

    card.classList.toggle("flipped", s.flipped);
    card.setAttribute("aria-label", cardLabel(t, s, count));
    announceStudy(cardLabel(t, s, count));

    attachImgRetry(front.querySelector("img.throw-gif"));
    attachImgRetry(back.querySelector("img.throw-gif"));
    applyStudyGifState();

    var srs = getSrs()[t.name];
    $("knowBtn").setAttribute("aria-pressed", String(!!(srs && srs.flag === "known")));
    $("reviewBtn").setAttribute("aria-pressed", String(!!(srs && srs.flag === "review")));

    updateStudyCounts();

    var next = deck[s.index + 1];
    if (next) { var pre = new Image(); pre.src = next.img; }
  }

  function updateStudyCounts() {
    var srs = getSrs();
    var known = 0, review = 0;
    state.study.deck.forEach(function (t) {
      var e = srs[t.name];
      if (e && e.flag === "known") known++;
      if (e && e.flag === "review") review++;
    });
    $("studyCounts").textContent =
      state.study.deck.length + " cards · " + known + " known · " + review + " to review";
  }

  /* the accessible name must describe the VISIBLE face, not a generic label */
  function cardLabel(t, s, count) {
    if (s.flipped) {
      return t.name + ", " + t.kanji + ", " + t.english + ". " + t.group +
        ", " + BELT_META[t.belt].sub + " — press to flip back";
    }
    var front =
      s.front === "name" ? t.name + ", " + t.kanji :
      s.front === "english" ? t.english :
      "animation of a throw";
    return "Card " + count + ": " + front + " — press to flip";
  }

  /* aria-label changes on an already-focused element aren't re-announced —
     mirror card state into a polite live region so flips/moves are heard */
  function announceStudy(text) {
    var live = $("studyLive");
    if (live) live.textContent = text;
  }

  /* study pause toggle (and the reduced-motion default) — freezes whatever
     GIFs the current card carries; a fresh render animates again unless paused */
  function applyStudyGifState() {
    var card = $("flashcard");
    var imgs = card.querySelectorAll("img.throw-gif");
    imgs.forEach(state.study.paused ? freezeGifWhenReady : unfreezeGifElement);
    var b = $("studyPauseBtn");
    b.setAttribute("aria-pressed", String(state.study.paused));
    b.setAttribute("aria-label", state.study.paused ? "Play animations" : "Pause animations");
    b.querySelector("span").textContent = state.study.paused ? "▶" : "⏸";
  }

  function flipCard() {
    var s = state.study;
    if (!s.deck.length) return;
    s.flipped = !s.flipped;
    // toggle without re-rendering faces so the GIF doesn't restart mid-flip
    var card = $("flashcard");
    var t = s.deck[s.index];
    var label = cardLabel(t, s, (s.index + 1) + " / " + s.deck.length);
    card.classList.toggle("flipped", s.flipped);
    card.setAttribute("aria-label", label);
    announceStudy(label);
  }

  /* jump between cards without animating the un-flip */
  function resetFlipInstant() {
    var card = $("flashcard");
    card.style.transition = "none";
    card.classList.remove("flipped");
    void card.offsetWidth; // reflow so the removal isn't animated
    card.style.transition = "";
  }

  function studyNav(dir) {
    var s = state.study;
    if (!s.deck.length) return;
    cancelPendingMark(); // user navigation supersedes a pending sweep-advance
    s.index = (s.index + dir + s.deck.length) % s.deck.length;
    s.flipped = false;
    resetFlipInstant();
    var card = $("flashcard");
    card.classList.remove("slide-left", "slide-right");
    void card.offsetWidth;
    card.classList.add(dir > 0 ? "slide-left" : "slide-right");
    renderStudyCard();
  }

  var markAnimHandle = null;

  /* stop a pending sweep without advancing (for when the user
     navigates themselves during the animation window) */
  function cancelPendingMark() {
    if (!markAnimHandle) return false;
    clearTimeout(markAnimHandle);
    markAnimHandle = null;
    $("flashcard").classList.remove("mark-known", "mark-review");
    return true;
  }

  /* a second mark during the sweep animation must not be dropped —
     finish the pending advance instantly, then mark the next card */
  function completePendingMark() {
    if (cancelPendingMark()) studyNav(1);
  }

  function markCard(flag) {
    var s = state.study;
    if (!s.deck.length) return;
    completePendingMark();
    var t = s.deck[s.index];
    var entry = updateSrs(t.name, flag === "known", flag);
    recordActivity();
    var days = C.LEITNER_INTERVALS_DAYS[entry.box - 1];
    toast(flag === "known"
      ? t.name + " → box " + entry.box + " · next review in " + (days === 0 ? "today" : days + "d")
      : t.name + " marked for review");
    // the card sweeps out toward the verdict before the next one arrives
    var card = $("flashcard");
    var cls = flag === "known" ? "mark-known" : "mark-review";
    if (reducedMotion.matches) { studyNav(1); return; }
    card.classList.add(cls);
    markAnimHandle = setTimeout(function () {
      markAnimHandle = null;
      card.classList.remove(cls);
      studyNav(1);
    }, 280);
  }

  /* ═══════════ Library ═══════════ */

  function renderLibrary() {
    var host = $("libraryGroups");
    var q = state.libraryQuery;
    var matches = C.filterThrows(THROWS, { query: q, belts: null });
    $("libraryCount").textContent = matches.length + " of " + TOTAL + " throws";
    host.innerHTML = "";
    var stats = getThrowStats();
    var srs = getSrs();
    var now = Date.now();

    BELT_ORDER.forEach(function (belt) {
      var items = matches.filter(function (t) { return t.belt === belt; });
      if (!items.length) return;
      var meta = BELT_META[belt];
      var section = document.createElement("section");
      section.setAttribute("aria-label", meta.label);
      var grid = document.createElement("div");
      grid.className = "library-grid";
      items.forEach(function (t) {
        var s = stats[t.name];
        var e = srs[t.name];
        var badges = "";
        if (s && s.seen) {
          var pct = Math.round((s.correct / s.seen) * 100);
          var cls = pct < 50 ? "bad" : pct < 80 ? "mid" : "good";
          badges += '<span class="acc-pill ' + cls + '">' + pct + "%</span>";
        }
        if (e && C.srsIsDue(e, now)) badges += '<span class="pill">due</span>';
        var tile = document.createElement("button");
        tile.className = "throw-tile";
        tile.setAttribute("aria-label", t.name + ", " + t.english + " — view details");
        tile.innerHTML =
          "<span><span class=\"t-name\">" + esc(t.name) +
          '<span class="t-kanji" lang="ja">' + esc(t.kanji) + "</span></span>" +
          '<span class="t-english" style="display:block;">' + esc(t.english) + "</span></span>" +
          '<span class="t-badges">' + badges + "</span>";
        tile.addEventListener("click", function () { openThrowDetail(t.name); });
        grid.appendChild(tile);
      });
      var beltThrows = THROWS.filter(function (t) { return t.belt === belt; });
      var mastered = C.masteredCount(stats, beltThrows);
      var pctMastered = beltThrows.length ? Math.round((mastered / beltThrows.length) * 100) : 0;
      section.innerHTML =
        '<h2 class="library-group-title"><span class="dot" data-belt="' + belt + '" aria-hidden="true" style="width:12px;height:12px;border-radius:50%;"></span>' +
        esc(meta.label) + ' <span class="sub">' + esc(meta.sub) + " · " + items.length + " throws</span>" +
        '<span class="mastery-wrap" title="' + mastered + " of " + beltThrows.length + ' mastered">' +
        '<span class="mastery-bar" aria-hidden="true"><span style="width:' + pctMastered + '%"></span></span>' +
        '<span class="sub">' + mastered + "/" + beltThrows.length + "</span></span></h2>";
      section.appendChild(grid);
      host.appendChild(section);
    });

    if (!matches.length) {
      host.innerHTML = '<div class="empty-note card panel">No throws match "' + esc(q) + '".</div>';
    }
  }

  /* ═══════════ Throw detail modal ═══════════ */

  function openThrowDetail(name) {
    var t = THROW_BY_NAME[name];
    if (!t) return;
    var s = getThrowStats()[name];
    var e = getSrs()[name];
    var acc = s && s.seen ? Math.round((s.correct / s.seen) * 100) + "%" : "—";
    var seen = s ? s.seen : 0;
    var srsTxt = e
      ? "Box " + e.box + "/5" + (C.srsIsDue(e, Date.now()) ? " · due now" : "")
      : "not scheduled";
    openModal(t.name, (
      '<div class="detail-hero"><span class="belt-badge">' + beltBadgeHtml(t) + "</span>" +
      '<div class="media-controls"><button type="button" class="btn small icon-btn" id="detailPauseBtn" aria-pressed="false" aria-label="Pause animation"><span aria-hidden="true">⏸</span></button></div>' +
      '<img src="' + esc(t.img) + '" alt="Animation of ' + esc(t.name) + '" /></div>' +
      '<div class="detail-names">' +
      '<div class="d-name">' + esc(t.name) +
      (speechUsable() ? ' <button type="button" class="btn ghost icon-btn" id="detailSpeakBtn" aria-label="Pronounce ' + esc(t.name) + '"><span aria-hidden="true">🔊</span></button>' : "") +
      "</div>" +
      '<div class="d-kanji" lang="ja">' + esc(t.kanji) + "</div>" +
      '<div class="d-english">' + esc(t.english) + "</div>" +
      '<div class="muted small" style="margin-top:6px;">' + esc(t.group) + " · " + esc(BELT_META[t.belt].sub) + "</div>" +
      "</div>" +
      '<div class="detail-stats">' +
      '<div class="metric"><span>Accuracy</span><b>' + acc + "</b></div>" +
      '<div class="metric"><span>Times Seen</span><b>' + seen + "</b></div>" +
      '<div class="metric"><span>Spaced Repetition</span><b>' + esc(srsTxt) + "</b></div>" +
      "</div>"
    ));
    var heroImg = document.querySelector(".detail-hero img");
    attachImgRetry(heroImg);
    var heroPaused = reducedMotion.matches;
    var applyHero = function () {
      if (heroPaused) freezeGifWhenReady(heroImg); else unfreezeGifElement(heroImg);
      var b = $("detailPauseBtn");
      b.setAttribute("aria-pressed", String(heroPaused));
      b.setAttribute("aria-label", heroPaused ? "Play animation" : "Pause animation");
      b.querySelector("span").textContent = heroPaused ? "▶" : "⏸";
    };
    applyHero();
    $("detailPauseBtn").addEventListener("click", function () {
      heroPaused = !heroPaused;
      applyHero();
    });
    var dsp = $("detailSpeakBtn");
    if (dsp) dsp.addEventListener("click", function () { speakThrow(t); });
  }

  /* ═══════════ History modal ═══════════ */

  function openHistoryList() {
    var hist = getHistory();
    var html;
    if (!hist.length) {
      html = '<div class="empty-note">No tests yet.</div>';
    } else {
      html = '<div id="histRows"></div>';
    }
    html +=
      '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px;border-top:1px solid var(--border);padding-top:12px;">' +
      '<button class="btn ghost small" id="exportBtn">⬇ Export data</button>' +
      '<button class="btn ghost small" id="importBtn">⬆ Import data</button>' +
      '<input type="file" id="importFile" accept="application/json,.json" class="visually-hidden" aria-hidden="true" tabindex="-1" />' +
      '<button class="btn danger small" id="eraseAllBtn">🗑 Erase all data</button>' +
      "</div>";
    openModal("Test History (" + hist.length + ")", html);
    var rowsHost = $("histRows");
    if (rowsHost) hist.forEach(function (h) { rowsHost.appendChild(historyRow(h, true)); });
    $("exportBtn").addEventListener("click", exportData);
    $("importBtn").addEventListener("click", function () { $("importFile").click(); });
    $("importFile").addEventListener("change", importData);
    $("eraseAllBtn").addEventListener("click", function () {
      showConfirm({
        title: "Erase all data?",
        message: "All stats, history, spaced-repetition progress, and mini-game progress will be permanently deleted.",
        okLabel: "Erase everything",
        danger: true
      }).then(function (yes) {
        if (!yes) return;
        Object.keys(KEY).forEach(function (k) { storage.del(KEY[k]); });
        // the Ippon Toss mini-game keeps its own store — a full erase must take it too
        try { localStorage.removeItem("judoGame.ipponToss.v1"); } catch (e) { /* fine */ }
        state.selectedBelts = new Set(BELT_ORDER);
        state.mode = "image-to-name";
        state.length = "10";
        state.autoNext = false;
        $("lengthSelect").value = "10";
        renderBeltChips();
        renderModeCards();
        closeModal();
        showView("home");
        toast("All data erased");
      });
    });
  }

  function openHistoryDetail(id) {
    var hist = getHistory();
    var h = null;
    for (var i = 0; i < hist.length; i++) if (hist[i].id === id) { h = hist[i]; break; }
    if (!h) { openHistoryList(); return; }

    var acc = h.total ? Math.round((h.score / h.total) * 100) : 0;
    var html =
      '<div class="history-detail-meta">' +
      '<div class="metric"><span>Score</span><b>' + h.score + "/" + h.total + " (" + acc + "%)</b></div>" +
      '<div class="metric"><span>Mode</span><b>' + esc((MODES[h.mode] || {}).label || h.mode) + "</b></div>" +
      '<div class="metric"><span>Time</span><b>' + C.fmtDuration(h.durationMs) + "</b></div>" +
      '<div class="metric"><span>Best Streak</span><b>' + (h.bestStreak || 0) + "</b></div>" +
      "</div><div id=\"qaList\"></div>" +
      '<div style="display:flex;gap:8px;justify-content:space-between;margin-top:12px;">' +
      '<button class="btn ghost" id="backToListBtn">← All tests</button>' +
      '<button class="btn danger" id="deleteEntryBtn">Delete</button>' +
      "</div>";
    openModal("Test · " + new Date(h.completedAt).toLocaleString(), html);

    var qaList = $("qaList");
    h.results.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "qa-row";
      row.innerHTML =
        '<span class="ind ' + (r.correct ? "ok" : "no") + '" aria-hidden="true">' + (r.correct ? "✓" : "✗") + "</span>" +
        "<span><span class=\"qa-name\">" + esc(r.name) +
        ' <span class="muted small">· ' + esc(r.english || "") + "</span></span>" +
        '<span class="qa-sub" style="display:block;">' +
        (r.correct ? "correct" : "you said “" + esc(r.chosen || "") + "”") +
        (r.hints ? " · 💡×" + r.hints : "") + "</span></span>" +
        '<span class="qa-pill">' + esc((MODES[r.mode] || {}).label || r.mode || "") + "</span>";
      qaList.appendChild(row);
    });

    $("backToListBtn").addEventListener("click", openHistoryList);
    $("deleteEntryBtn").addEventListener("click", function () {
      showConfirm({
        title: "Delete this test?",
        message: "This removes the entry from history. Per-throw stats are kept.",
        okLabel: "Delete",
        danger: true
      }).then(function (yes) {
        if (!yes) return;
        var next = getHistory().filter(function (x) { return x.id !== id; });
        storage.set(KEY.history, next);
        if (state.view === "home") refreshHome();
        openHistoryList();
      });
    });
  }

  /* ═══════════ Export / import ═══════════ */

  function exportData() {
    var payload = {
      app: "judo-throw-flashcards",
      version: 2,
      exportedAt: new Date().toISOString(),
      history: getHistory(),
      throws: getThrowStats(),
      srs: getSrs(),
      activity: getActivity(),
      prefs: storage.get(KEY.prefs, {})
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "judo-flashcards-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    toast("Backup downloaded");
  }

  function importData(e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try { data = JSON.parse(reader.result); } catch (err) { toast("Not a valid backup file"); return; }
      if (!data || data.app !== "judo-throw-flashcards") { toast("Not a judo-flashcards backup"); return; }
      var hist = C.sanitizeHistory(data.history);
      var ts = C.sanitizeThrowStats(data.throws);
      var srs = C.sanitizeSrs(data.srs);
      storage.set(KEY.history, hist);
      storage.set(KEY.throws, ts);
      storage.set(KEY.srs, srs);
      storage.set(KEY.activity, C.sanitizeActivity(data.activity));
      // exports include prefs — restore them too, then reflect them in the UI
      if (data.prefs) {
        var sp = C.sanitizePrefs(data.prefs, Object.keys(MODES), BELT_ORDER);
        sp.autoNext = !!data.prefs.autoNext; // sanitizePrefs doesn't carry this one
        storage.set(KEY.prefs, sp);
        state.mode = sp.mode;
        state.selectedBelts = new Set(sp.belts);
        state.length = sp.length;
        state.autoNext = sp.autoNext;
        state.study.front = sp.studyFront;
        currentThemePref = sp.theme;
        $("lengthSelect").value = sp.length;
        $("studyFront").value = sp.studyFront;
        applyTheme();
        renderBeltChips();
        renderModeCards();
      }
      closeModal();
      showView("home");
      toast("Imported " + hist.length + " tests");
    };
    reader.onerror = function () { toast("Could not read the file"); };
    reader.readAsText(file);
  }

  /* ═══════════ Help modal ═══════════ */

  function openHelp() {
    var rows = [
      ["Anywhere", ""],
      ["?", "Show this help"],
      ["T", "Toggle dark / light theme"],
      ["Esc", "Close dialog"],
      ["Quiz", ""],
      ["1–4", "Pick an answer"],
      ["H", "Get a hint (twice for 50/50)"],
      ["Enter / Space", "Next question"],
      ["Study", ""],
      ["← →", "Previous / next card"],
      ["Space or F", "Flip the card"],
      ["K", "Mark “I know this”"],
      ["R", "Mark “needs review”"],
      ["S", "Shuffle the deck"]
    ];
    var html = '<div class="shortcut-grid">';
    rows.forEach(function (r) {
      if (!r[1]) {
        html += '<div class="setup-title" style="grid-column:1/-1;margin-top:8px;">' + esc(r[0]) + "</div>";
      } else {
        html += '<div class="shortcut-row"><span>' + esc(r[1]) + '</span><span class="keys">' +
          r[0].split(" / ").map(function (k) { return "<kbd>" + esc(k) + "</kbd>"; }).join(" ") +
          "</span></div>";
      }
    });
    html += "</div>";
    openModal("Keyboard Shortcuts", html);
  }

  /* ═══════════ Keyboard ═══════════ */

  function onKeyDown(e) {
    // confirm dialog takes priority
    if (!$("confirmModal").hidden) {
      if (e.key === "Escape") { e.preventDefault(); settleConfirm(false); }
      trapTab(e, $("confirmModal").querySelector(".modal-panel"));
      return;
    }
    if (!$("modal").hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeModal(); }
      trapTab(e, $("modal").querySelector(".modal-panel"));
      return;
    }

    // never swallow browser/OS accelerators (Cmd+R, Ctrl+F, Alt+Left, …)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;

    // during a Type-It question, printable keys belong to the answer — route
    // them to the input instead of firing single-letter shortcuts (T/H/?)
    var tq = state.quiz;
    if (state.view === "quiz" && tq && tq.currentQMode === "type-answer" && e.key.length === 1 && e.key !== " ") {
      if (!tq.answered) {
        var ti = $("typeInput");
        if (!ti.disabled && document.activeElement !== ti) ti.focus();
        return; // the keystroke lands in the freshly-focused input
      }
      return; // answered: swallow stray typing during the auto-advance window
    }

    if (e.key === "?") { e.preventDefault(); openHelp(); return; }
    if (e.key === "t" || e.key === "T") { toggleTheme(); return; }

    if (state.view === "quiz") {
      if (["1", "2", "3", "4"].indexOf(e.key) !== -1) {
        var i = parseInt(e.key, 10) - 1;
        var btns = $("options").querySelectorAll(".option");
        if (btns[i] && !btns[i].disabled) btns[i].click();
        return;
      }
      if (e.key === "h" || e.key === "H") { useHint(); return; }
      if (e.key === "Enter" || e.key === " ") {
        var nb = $("nextBtn");
        // don't steal Enter/Space from another focused control (End now, Home…)
        var ae = document.activeElement;
        if (ae && ae !== document.body && ae !== nb && (ae.tagName === "BUTTON" || ae.tagName === "A" || ae.tagName === "INPUT")) return;
        if (!nb.disabled) { e.preventDefault(); nb.click(); }
      }
      return;
    }

    if (state.view === "study") {
      switch (e.key) {
        case "ArrowRight": e.preventDefault(); studyNav(1); break;
        case "ArrowLeft": e.preventDefault(); studyNav(-1); break;
        case " ":
        case "f":
        case "F": {
          var el = document.activeElement;
          if (el && el !== document.body && el.tagName === "BUTTON" && el.id !== "flashcard") return;
          e.preventDefault();
          flipCard();
          break;
        }
        case "k": case "K": markCard("known"); break;
        case "r": case "R": markCard("review"); break;
        case "s": case "S": shuffleStudy(); break;
      }
    }
  }

  function shuffleStudy() {
    cancelPendingMark();
    var s = state.study;
    s.shuffled = true;
    // record a stable order over ALL throws so later filter changes keep it
    s.order = {};
    C.shuffle(THROWS).forEach(function (t, i) { s.order[t.name] = i; });
    s.deck = s.deck.slice().sort(function (a, b) { return s.order[a.name] - s.order[b.name]; });
    s.index = 0;
    s.flipped = false;
    resetFlipInstant();
    renderStudyCard();
    toast("Deck shuffled");
  }

  /* ═══════════ Swipe (study) ═══════════ */

  function wireSwipe() {
    var startX = 0, startY = 0, tracking = false;
    var stage = $("studyStage");
    stage.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dy) < 70) studyNav(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ═══════════ Wiring ═══════════ */

  function wire() {
    $("brandBtn").addEventListener("click", function () { requestView("home"); });
    $("tabHome").addEventListener("click", function () { requestView("home"); });
    $("tabStudy").addEventListener("click", function () { requestView("study"); });
    $("tabLibrary").addEventListener("click", function () { requestView("library"); });
    $("tabCommunity").addEventListener("click", function () { requestView("community"); });

    $("themeBtn").addEventListener("click", toggleTheme);
    $("helpBtn").addEventListener("click", openHelp);
    $("historyBtn").addEventListener("click", openHistoryList);
    $("viewAllHistoryBtn").addEventListener("click", openHistoryList);

    $("startBtn").addEventListener("click", function () { startQuiz(); });
    $("selectAllBtn").addEventListener("click", function () {
      state.selectedBelts = new Set(BELT_ORDER);
      renderBeltChips(); savePrefs(); updateStartButton();
    });
    $("clearBtn").addEventListener("click", function () {
      state.selectedBelts = new Set();
      renderBeltChips(); savePrefs(); updateStartButton();
    });
    $("lengthSelect").addEventListener("change", function (e) {
      state.length = e.target.value;
      savePrefs();
      updateStartButton();
    });

    $("homeBtn").addEventListener("click", function () { requestView("home"); });
    $("nextBtn").addEventListener("click", nextQuestion);
    $("quitBtn").addEventListener("click", endNow);
    $("hintBtn").addEventListener("click", useHint);
    $("typeSubmitBtn").addEventListener("click", function () { handleTypedAnswer(false); });
    $("typeGiveUpBtn").addEventListener("click", function () { handleTypedAnswer(true); });
    $("typeInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); handleTypedAnswer(false); }
    });
    $("typeInput").addEventListener("input", function () {
      this.classList.remove("shake"); // typing clears the empty-submit warning
    });
    $("autoNextChk").addEventListener("change", function (e) {
      state.autoNext = e.target.checked;
      if (!state.autoNext) clearTimeout(autoNextHandle); // unticking cancels a pending advance
      savePrefs();
    });

    $("restartBtn").addEventListener("click", function () { startQuiz(); });
    $("retryWrongBtn").addEventListener("click", retryWrongOnly);
    $("backBtn").addEventListener("click", function () { showView("home"); });

    // study
    $("flashcard").addEventListener("click", flipCard);
    $("flipBtn").addEventListener("click", flipCard);
    $("prevCardBtn").addEventListener("click", function () { studyNav(-1); });
    $("nextCardBtn").addEventListener("click", function () { studyNav(1); });
    $("shuffleBtn").addEventListener("click", shuffleStudy);
    $("knowBtn").addEventListener("click", function () { markCard("known"); });
    $("reviewBtn").addEventListener("click", function () { markCard("review"); });
    $("studyPauseBtn").addEventListener("click", function () {
      state.study.paused = !state.study.paused;
      applyStudyGifState();
    });
    if (speechOK) {
      $("speakBtn").addEventListener("click", function () {
        var s = state.study;
        if (s.deck.length) speakThrow(s.deck[s.index]);
      });
      var refreshSpeech = function () {
        pickJaVoice();
        $("speakBtn").hidden = !speechUsable();
      };
      refreshSpeech();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = refreshSpeech;
      }
    }
    $("studySearch").addEventListener("input", function (e) {
      state.study.query = e.target.value;
      refreshStudy();
    });
    $("studyFilter").addEventListener("change", function (e) {
      state.study.filter = e.target.value;
      refreshStudy();
    });
    $("studyFront").addEventListener("change", function (e) {
      state.study.front = e.target.value;
      savePrefs();
      refreshStudy(true);
    });
    wireSwipe();

    // library
    $("librarySearch").addEventListener("input", function (e) {
      state.libraryQuery = e.target.value;
      renderLibrary();
    });

    // modals
    $("modal").addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeModal();
    });
    $("confirmCancelBtn").addEventListener("click", function () { settleConfirm(false); });
    $("confirmOkBtn").addEventListener("click", function () { settleConfirm(true); });
    $("confirmBackdrop").addEventListener("click", function () { settleConfirm(false); });

    document.addEventListener("keydown", onKeyDown);

    reducedMotion.addEventListener && reducedMotion.addEventListener("change", function () {
      if (state.view === "quiz" && reducedMotion.matches) pauseGif();
    });
  }

  /* ═══════════ Service worker (offline) ═══════════ */

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    var ok = location.protocol === "https:" ||
      location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!ok) return; // e.g. file:// — the app still works, just without SW caching

    // When an updated worker takes over (skipWaiting + claim), the running
    // page may reference assets from a deleted cache. Reload once so the
    // whole app comes from the new version. hadController=false means this
    // is the very first install — no reload needed. Never reload out from
    // under an in-progress quiz — defer until the user leaves it.
    var hadController = !!navigator.serviceWorker.controller;
    var refreshed = false;
    var doReload = function () {
      if (refreshed) return;
      refreshed = true;
      location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController || refreshed) return;
      if (state.quiz && state.quiz.results.length > 0) { pendingSWReload = true; return; }
      doReload();
    });
    swDeferredReload = doReload;
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" })
      .catch(function () { /* offline-first is best-effort */ });
  }

  /* ═══════════ Init ═══════════ */

  function init() {
    applyTheme();
    $("lengthSelect").value = state.length;
    renderBeltChips();
    renderModeCards();
    wire();
    showView("home");
    registerSW();
  }

  init();
})();
