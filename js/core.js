/* ═══════════════════════════════════════════════════════════════
   Pure logic — no DOM, no storage, no globals mutated.
   Everything here is exercised by tests/core.test.mjs via Node.

   Plain script (no modules) so the app keeps working from file://.
═══════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  /* ── Small utilities ─────────────────────────────────────── */

  function shuffle(arr, rng) {
    var random = rng || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  /* ── Formatting ──────────────────────────────────────────── */

  function fmtDuration(ms) {
    var sec = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function fmtRelative(ts, now) {
    var diff = (now || Date.now()) - ts;
    var min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return min + "m ago";
    var h = Math.floor(min / 60);
    if (h < 24) return h + "h ago";
    var d = Math.floor(h / 24);
    if (d < 7) return d + "d ago";
    return new Date(ts).toLocaleDateString();
  }

  /* ── Deck building ───────────────────────────────────────── */

  function buildDeck(pool, len, rng) {
    var shuffled = shuffle(pool, rng);
    if (len === "all") return shuffled;
    var n = parseInt(len, 10);
    if (!Number.isFinite(n) || n <= 0) return shuffled;
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  /* Pick n distractors distinct from the correct answer (and from
     each other) under keyFn. */
  function pickDistinct(pool, correct, n, keyFn, rng) {
    var seen = new Set([keyFn(correct)]);
    var out = [];
    var pile = shuffle(pool, rng);
    for (var i = 0; i < pile.length && out.length < n; i++) {
      var k = keyFn(pile[i]);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(pile[i]);
    }
    return out;
  }

  /* Distractors weighted toward confusable throws: shared name
     stems (Osoto Gari / Osoto Guruma / Osoto Otoshi), the same
     technique family (…Gari vs …Gake), and the same gokyo group.
     Random distractors make questions trivially eliminable. */
  function pickSmartDistractors(pool, correct, n, keyFn, rng) {
    var random = rng || Math.random;
    var cTokens = correct.name.split(" ");
    var cFirst = cTokens[0], cLast = cTokens[cTokens.length - 1];
    var seen = new Set([keyFn(correct)]);
    var scored = [];
    for (var i = 0; i < pool.length; i++) {
      var t = pool[i];
      var k = keyFn(t);
      if (seen.has(k)) continue;
      seen.add(k);
      var toks = t.name.split(" ");
      var score = 0;
      if (toks[0] === cFirst) score += 2;
      if (toks[toks.length - 1] === cLast) score += 2;
      if (t.group === correct.group) score += 1;
      if (t.belt === correct.belt) score += 1;
      scored.push({ t: t, score: score + random() * 1.5 }); // jitter keeps options varied
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, n).map(function (s) { return s.t; });
  }

  /* ── Stats aggregation ───────────────────────────────────── */

  function aggregateLifetime(history) {
    var totalQ = 0, totalC = 0, bestStreak = 0;
    for (var i = 0; i < history.length; i++) {
      var h = history[i];
      totalQ += h.total || 0;
      totalC += h.score || 0;
      if ((h.bestStreak || 0) > bestStreak) bestStreak = h.bestStreak;
    }
    return {
      tests: history.length,
      totalQuestions: totalQ,
      totalCorrect: totalC,
      accuracy: totalQ ? totalC / totalQ : null,
      bestStreak: bestStreak
    };
  }

  function masteredCount(throwStats, throws) {
    var n = 0;
    for (var i = 0; i < throws.length; i++) {
      var s = throwStats[throws[i].name];
      if (s && s.seen >= 3 && s.correct / s.seen >= 0.8) n++;
    }
    return n;
  }

  function computeFocus(throwStats, throws, limit) {
    return throws
      .map(function (t) {
        var s = throwStats[t.name];
        if (!s || s.seen < 2) return null;
        return { t: t, seen: s.seen, correct: s.correct, acc: s.correct / s.seen };
      })
      .filter(Boolean)
      .filter(function (r) { return r.acc < 1; })
      .sort(function (a, b) { return a.acc - b.acc || b.seen - a.seen; })
      .slice(0, limit || 6);
  }

  /* ── Spaced repetition (Leitner boxes) ───────────────────────
     Box 1..5 with review intervals in days. A correct answer (or a
     "know it" mark in study mode) moves the card up one box; a miss
     (or "needs review") drops it back to box 1. A card is due when
     its interval has elapsed since it was last answered.          */

  var DAY_MS = 86400000;
  var LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 14]; // box 1..5

  function srsOnAnswer(entry, correct, now) {
    var box = entry && Number.isFinite(entry.box) ? clamp(entry.box, 1, 5) : 1;
    box = correct ? clamp(box + 1, 1, 5) : 1;
    return {
      box: box,
      lastSeen: now,
      due: now + LEITNER_INTERVALS_DAYS[box - 1] * DAY_MS
    };
  }

  function srsIsDue(entry, now) {
    if (!entry || !Number.isFinite(entry.due)) return true; // never seen → due
    return now >= entry.due;
  }

  /* Deck for Smart Drill: due cards first (most overdue first),
     then unseen cards, then the rest by weakest accuracy. */
  function buildSmartDeck(throws, srs, throwStats, len, now, rng) {
    var due = [], unseen = [], rest = [];
    for (var i = 0; i < throws.length; i++) {
      var t = throws[i];
      var e = srs[t.name];
      var s = throwStats[t.name];
      if (!e && !s) unseen.push(t);
      // only SCHEDULED cards count as due — legacy stats-only cards go to
      // "rest" (sorted by weakness), keeping this consistent with countDue
      else if (e && srsIsDue(e, now)) due.push(t);
      else rest.push(t);
    }
    due.sort(function (a, b) {
      var da = srs[a.name] ? srs[a.name].due : 0;
      var db = srs[b.name] ? srs[b.name].due : 0;
      return da - db;
    });
    var accOf = function (t) {
      var s = throwStats[t.name];
      return s && s.seen ? s.correct / s.seen : 0.5;
    };
    rest.sort(function (a, b) { return accOf(a) - accOf(b); });
    var ordered = due.concat(shuffle(unseen, rng), rest);
    if (len === "all") return ordered;
    var n = parseInt(len, 10);
    if (!Number.isFinite(n) || n <= 0) return ordered;
    return ordered.slice(0, Math.min(n, ordered.length));
  }

  function countDue(throws, srs, now) {
    var n = 0;
    for (var i = 0; i < throws.length; i++) {
      var e = srs[throws[i].name];
      if (e && srsIsDue(e, now)) n++;
    }
    return n;
  }

  /* ── Input validation for storage payloads ────────────────────
     localStorage can hold anything (old versions, manual edits,
     corruption). Sanitizers coerce unknown shapes into safe ones
     instead of crashing render code.                             */

  function sanitizeHistory(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (h) {
      return h && typeof h === "object" &&
        Number.isFinite(h.total) && h.total > 0 &&
        Number.isFinite(h.score) && h.score >= 0 && h.score <= h.total &&
        Number.isFinite(h.completedAt) &&
        Array.isArray(h.results);
    }).map(function (h) {
      return {
        id: typeof h.id === "string" ? h.id : uid(),
        completedAt: h.completedAt,
        durationMs: Number.isFinite(h.durationMs) ? Math.max(0, h.durationMs) : 0,
        mode: typeof h.mode === "string" ? h.mode : "image-to-name",
        selectedBelts: Array.isArray(h.selectedBelts) ? h.selectedBelts : [],
        total: h.total,
        score: h.score,
        bestStreak: Number.isFinite(h.bestStreak) ? h.bestStreak : 0,
        partial: !!h.partial,
        results: h.results.filter(function (r) {
          return r && typeof r === "object" && typeof r.name === "string";
        })
      };
    });
  }

  function sanitizeThrowStats(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    var out = {};
    Object.keys(raw).forEach(function (name) {
      var s = raw[name];
      if (!s || typeof s !== "object") return;
      var seen = Number.isFinite(s.seen) ? Math.max(0, Math.floor(s.seen)) : 0;
      var correct = Number.isFinite(s.correct) ? Math.max(0, Math.floor(s.correct)) : 0;
      if (seen === 0) return;
      out[name] = {
        seen: seen,
        correct: Math.min(correct, seen),
        lastSeen: Number.isFinite(s.lastSeen) ? s.lastSeen : 0
      };
    });
    return out;
  }

  function sanitizeSrs(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    var out = {};
    Object.keys(raw).forEach(function (name) {
      var e = raw[name];
      if (!e || typeof e !== "object") return;
      if (!Number.isFinite(e.box)) return;
      out[name] = {
        box: clamp(Math.floor(e.box), 1, 5),
        lastSeen: Number.isFinite(e.lastSeen) ? e.lastSeen : 0,
        due: Number.isFinite(e.due) ? e.due : 0,
        flag: e.flag === "known" || e.flag === "review" ? e.flag : null
      };
    });
    return out;
  }

  function sanitizePrefs(raw, validModes, validBelts) {
    var p = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    var belts = Array.isArray(p.belts)
      ? p.belts.filter(function (b) { return validBelts.indexOf(b) !== -1; })
      : validBelts.slice();
    return {
      mode: validModes.indexOf(p.mode) !== -1 ? p.mode : "image-to-name",
      belts: belts,
      length: ["10", "20", "all"].indexOf(String(p.length)) !== -1 ? String(p.length) : "10",
      theme: p.theme === "light" || p.theme === "dark" ? p.theme : null,
      studyFront: ["visual", "name", "english"].indexOf(p.studyFront) !== -1 ? p.studyFront : "visual"
    };
  }

  /* ── Typed-answer matching ─────────────────────────────────
     "o soto gari", "Osotogari", "ōsoto-gari" and one-letter typos
     should all count. Normalize hard, then allow a small edit
     distance that scales with the length of the answer.         */

  function normalizeAnswer(s) {
    return String(s)
      .toLowerCase()
      .replace(/ō/g, "o").replace(/ū/g, "u").replace(/ā/g, "a")
      .replace(/ē/g, "e").replace(/ī/g, "i")
      .replace(/[^a-z]/g, ""); // drop spaces, hyphens, apostrophes, digits
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1);
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur[0] = i;
      for (var k = 1; k <= n; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      var tmp = prev; prev = cur; cur = tmp;
    }
    return prev[n];
  }

  /* Typo tolerance must never turn one throw into another —
     Kosoto Gari is a single edit from Osoto Gari. The input is
     accepted only when it is within tolerance of the correct name
     AND strictly closer to it than to any alternative name.
     Typing the kanji itself (e.g. via a Japanese IME) also counts. */
  function matchAnswer(input, correct, alternatives, kanji) {
    if (kanji) {
      var typed = String(input).normalize ? String(input).normalize("NFKC") : String(input);
      if (typed.replace(/\s+/g, "") === kanji) return true;
    }
    var a = normalizeAnswer(input);
    var b = normalizeAnswer(correct);
    if (!a) return false;
    var tolerance = b.length >= 10 ? 2 : b.length >= 5 ? 1 : 0;
    var d = levenshtein(a, b);
    if (d > tolerance) return false;
    if (alternatives) {
      for (var i = 0; i < alternatives.length; i++) {
        if (levenshtein(a, normalizeAnswer(alternatives[i])) <= d) return false;
      }
    }
    return true;
  }

  /* ── Hints ─────────────────────────────────────────────────
     Level 1 masks the name ("O____ G___"); level 2 reveals every
     other letter ("O_o_o G_r_"). Word shape + initials first, more
     letters if still stuck.                                     */

  function maskName(name, level) {
    return name.split(" ").map(function (word) {
      return word.split("").map(function (ch, i) {
        if (!/[a-zA-Z]/.test(ch)) return ch; // hyphens etc. stay visible
        if (i === 0) return ch;
        if (level >= 2 && i % 2 === 0) return ch;
        return "_";
      }).join("");
    }).join(" ");
  }

  /* ── Day streak ────────────────────────────────────────────
     activity = { "2026-07-17": count, ... }. The streak counts
     consecutive days ending today (or yesterday, so an unbroken
     streak isn't shown as 0 before today's first session).      */

  function ymd(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function computeDayStreak(activity, now) {
    // walk by calendar day, not fixed 24h steps — DST days are 23/25h
    var d = new Date(now);
    var streak = 0;
    if (!activity[ymd(d.getTime())]) d.setDate(d.getDate() - 1); // today not studied yet
    while (activity[ymd(d.getTime())]) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function sanitizeActivity(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    var out = {};
    Object.keys(raw).forEach(function (k) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(raw[k]) && raw[k] > 0) {
        out[k] = Math.floor(raw[k]);
      }
    });
    return out;
  }

  /* ── Study-deck filtering ────────────────────────────────── */

  function filterThrows(throws, opts) {
    var q = (opts.query || "").trim().toLowerCase();
    var belts = opts.belts; // Set or null = all
    return throws.filter(function (t) {
      if (belts && !belts.has(t.belt)) return false;
      if (!q) return true;
      return t.name.toLowerCase().indexOf(q) !== -1 ||
        t.english.toLowerCase().indexOf(q) !== -1 ||
        (t.kanji && t.kanji.indexOf(opts.query.trim()) !== -1) ||
        t.group.toLowerCase().indexOf(q) !== -1;
    });
  }

  var CORE = {
    shuffle: shuffle,
    escapeHtml: escapeHtml,
    uid: uid,
    clamp: clamp,
    fmtDuration: fmtDuration,
    fmtRelative: fmtRelative,
    buildDeck: buildDeck,
    pickDistinct: pickDistinct,
    pickSmartDistractors: pickSmartDistractors,
    aggregateLifetime: aggregateLifetime,
    masteredCount: masteredCount,
    computeFocus: computeFocus,
    DAY_MS: DAY_MS,
    LEITNER_INTERVALS_DAYS: LEITNER_INTERVALS_DAYS,
    srsOnAnswer: srsOnAnswer,
    srsIsDue: srsIsDue,
    buildSmartDeck: buildSmartDeck,
    countDue: countDue,
    sanitizeHistory: sanitizeHistory,
    sanitizeThrowStats: sanitizeThrowStats,
    sanitizeSrs: sanitizeSrs,
    sanitizePrefs: sanitizePrefs,
    filterThrows: filterThrows,
    normalizeAnswer: normalizeAnswer,
    levenshtein: levenshtein,
    matchAnswer: matchAnswer,
    maskName: maskName,
    ymd: ymd,
    computeDayStreak: computeDayStreak,
    sanitizeActivity: sanitizeActivity
  };

  if (typeof module !== "undefined" && module.exports) module.exports = CORE;
  else root.JudoCore = CORE;
})(typeof self !== "undefined" ? self : this);
