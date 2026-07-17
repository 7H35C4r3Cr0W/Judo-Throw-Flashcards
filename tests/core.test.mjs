/* Run with:  node --test tests/
   No dependencies — uses Node's built-in test runner. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const C = require("../js/core.js");
const DATA = require("../js/data.js");
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const { THROWS, BELT_ORDER, BELT_META, MODES } = DATA;

/* ── Data integrity ─────────────────────────────────────────── */

test("data: exactly 47 throws", () => {
  assert.equal(THROWS.length, 47);
});

test("data: names, images, and kanji are unique and non-empty", () => {
  const names = new Set(), imgs = new Set();
  for (const t of THROWS) {
    assert.ok(t.name && t.english && t.kanji && t.img, `incomplete entry: ${t.name}`);
    assert.ok(!names.has(t.name), `duplicate name: ${t.name}`);
    assert.ok(!imgs.has(t.img), `duplicate image: ${t.img}`);
    names.add(t.name);
    imgs.add(t.img);
  }
});

test("data: every belt is a known belt with metadata", () => {
  for (const t of THROWS) {
    assert.ok(BELT_ORDER.includes(t.belt), `unknown belt ${t.belt} on ${t.name}`);
    assert.ok(BELT_META[t.belt], `no metadata for belt ${t.belt}`);
  }
});

test("data: belt ↔ group mapping is consistent", () => {
  const groupOf = {
    Yellow: "Dai Ikkyo", Orange: "Dai Nikyo", Green: "Dai Sankyo",
    Blue: "Dai Yonkyo", Brown: "Dai Gokyo", Preserved: "Habukareta Waza"
  };
  for (const t of THROWS) {
    assert.equal(t.group, groupOf[t.belt], `${t.name}: group ${t.group} vs belt ${t.belt}`);
  }
});

test("data: every referenced GIF exists on disk", () => {
  for (const t of THROWS) {
    assert.ok(existsSync(path.join(ROOT, t.img)), `missing file: ${t.img}`);
  }
});

test("data: group sizes match the canonical syllabus (Kata Guruma omitted)", () => {
  const count = {};
  for (const t of THROWS) count[t.group] = (count[t.group] || 0) + 1;
  assert.deepEqual(count, {
    "Dai Ikkyo": 8, "Dai Nikyo": 8, "Dai Sankyo": 7,
    "Dai Yonkyo": 8, "Dai Gokyo": 8, "Habukareta Waza": 8
  });
});

test("service worker: precache lists exist on disk and cover every data.js GIF", () => {
  const sw = readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const urls = [...sw.matchAll(/"((?:images|css|js|icons)\/[^"]+|[a-z_.-]+\.(?:html|js|jpg|webmanifest|svg|png))"/g)]
    .map((m) => m[1]);
  assert.ok(urls.includes("index.html") && urls.includes("js/app.js"), "app shell present");
  for (const u of urls) {
    assert.ok(existsSync(path.join(ROOT, u)), `sw.js precaches missing file: ${u}`);
  }
  for (const t of THROWS) {
    assert.ok(urls.includes(t.img), `data.js GIF not precached by sw.js: ${t.img}`);
  }
});

test("data: all four quiz modes have display metadata", () => {
  for (const k of ["image-to-name", "english-to-name", "name-to-english", "smart"]) {
    assert.ok(MODES[k] && MODES[k].title && MODES[k].label, `mode ${k}`);
  }
});

/* ── Utilities ──────────────────────────────────────────────── */

test("shuffle: returns a permutation and does not mutate the input", () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const copy = input.slice();
  const out = C.shuffle(input);
  assert.deepEqual(input, copy);
  assert.deepEqual([...out].sort((a, b) => a - b), copy);
});

test("shuffle: deterministic with a seeded rng", () => {
  let calls = 0;
  const rng = () => ((calls++ * 37) % 100) / 100;
  const a = C.shuffle([1, 2, 3, 4, 5], rng);
  calls = 0;
  const b = C.shuffle([1, 2, 3, 4, 5], rng);
  assert.deepEqual(a, b);
});

test("escapeHtml escapes all dangerous characters", () => {
  assert.equal(C.escapeHtml(`<img src="x" onerror='a&b'>`),
    "&lt;img src=&quot;x&quot; onerror=&#39;a&amp;b&#39;&gt;");
  assert.equal(C.escapeHtml(123), "123");
});

test("clamp bounds values", () => {
  assert.equal(C.clamp(10, 1, 5), 5);
  assert.equal(C.clamp(-3, 1, 5), 1);
  assert.equal(C.clamp(3, 1, 5), 3);
});

test("fmtDuration formats m:ss", () => {
  assert.equal(C.fmtDuration(0), "0:00");
  assert.equal(C.fmtDuration(65000), "1:05");
  assert.equal(C.fmtDuration(-500), "0:00");
  assert.equal(C.fmtDuration(3600000), "60:00");
});

test("fmtRelative buckets", () => {
  const now = 1_700_000_000_000;
  assert.equal(C.fmtRelative(now - 10_000, now), "just now");
  assert.equal(C.fmtRelative(now - 5 * 60_000, now), "5m ago");
  assert.equal(C.fmtRelative(now - 3 * 3_600_000, now), "3h ago");
  assert.equal(C.fmtRelative(now - 2 * 86_400_000, now), "2d ago");
  // ≥7 days falls back to a locale date string
  assert.match(C.fmtRelative(now - 10 * 86_400_000, now), /\d/);
});

/* ── Deck building ──────────────────────────────────────────── */

test("buildDeck: 'all' returns the whole pool, numbers slice, junk falls back", () => {
  const pool = THROWS.slice(0, 12);
  assert.equal(C.buildDeck(pool, "all").length, 12);
  assert.equal(C.buildDeck(pool, "10").length, 10);
  assert.equal(C.buildDeck(pool, "20").length, 12); // clamped to pool
  assert.equal(C.buildDeck(pool, "garbage").length, 12);
  assert.equal(C.buildDeck(pool, "-5").length, 12);
});

test("pickDistinct: n distinct items, never the correct answer", () => {
  const correct = THROWS[0];
  const out = C.pickDistinct(THROWS, correct, 3, (t) => t.name);
  assert.equal(out.length, 3);
  const keys = new Set(out.map((t) => t.name));
  assert.equal(keys.size, 3);
  assert.ok(!keys.has(correct.name));
});

test("pickSmartDistractors: distinct, excludes correct, prefers confusable throws", () => {
  const osotoGari = THROWS.find((t) => t.name === "Osoto Gari");
  const out = C.pickSmartDistractors(THROWS, osotoGari, 3, (t) => t.name, () => 0);
  assert.equal(out.length, 3);
  assert.ok(!out.some((t) => t.name === "Osoto Gari"));
  // with zero jitter every pick must be related: shared name stem, group, or belt
  for (const t of out) {
    const related =
      t.name.split(" ")[0] === "Osoto" ||
      t.name.split(" ").pop() === "Gari" ||
      t.group === osotoGari.group ||
      t.belt === osotoGari.belt;
    assert.ok(related, `${t.name} is unrelated to Osoto Gari`);
  }
});

test("pickSmartDistractors: works when pool is tiny", () => {
  const pool = THROWS.slice(0, 3);
  const out = C.pickSmartDistractors(pool, pool[0], 3, (t) => t.name);
  assert.equal(out.length, 2); // only two other candidates exist
});

/* ── Stats aggregation ──────────────────────────────────────── */

test("aggregateLifetime: empty and populated history", () => {
  assert.deepEqual(C.aggregateLifetime([]), {
    tests: 0, totalQuestions: 0, totalCorrect: 0, accuracy: null, bestStreak: 0
  });
  const agg = C.aggregateLifetime([
    { total: 10, score: 8, bestStreak: 5 },
    { total: 10, score: 6, bestStreak: 9 }
  ]);
  assert.equal(agg.tests, 2);
  assert.equal(agg.totalQuestions, 20);
  assert.equal(agg.totalCorrect, 14);
  assert.equal(agg.accuracy, 0.7);
  assert.equal(agg.bestStreak, 9);
});

test("masteredCount: ≥80% over 3+ attempts", () => {
  const stats = {
    [THROWS[0].name]: { seen: 3, correct: 3 },  // mastered
    [THROWS[1].name]: { seen: 5, correct: 4 },  // mastered (80%)
    [THROWS[2].name]: { seen: 2, correct: 2 },  // too few attempts
    [THROWS[3].name]: { seen: 4, correct: 3 }   // 75%
  };
  assert.equal(C.masteredCount(stats, THROWS), 2);
});

test("computeFocus: weakest first, excludes perfect and barely-seen", () => {
  const stats = {
    [THROWS[0].name]: { seen: 4, correct: 1 },  // 25%
    [THROWS[1].name]: { seen: 4, correct: 3 },  // 75%
    [THROWS[2].name]: { seen: 4, correct: 4 },  // perfect → excluded
    [THROWS[3].name]: { seen: 1, correct: 0 }   // seen < 2 → excluded
  };
  const rows = C.computeFocus(stats, THROWS, 6);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].t.name, THROWS[0].name);
  assert.equal(rows[1].t.name, THROWS[1].name);
});

/* ── Spaced repetition ──────────────────────────────────────── */

test("srsOnAnswer: correct promotes, wrong demotes to box 1", () => {
  const now = 1_700_000_000_000;
  const fresh = C.srsOnAnswer(undefined, true, now);
  assert.equal(fresh.box, 2);
  assert.equal(fresh.due, now + 1 * C.DAY_MS);

  const top = C.srsOnAnswer({ box: 5 }, true, now);
  assert.equal(top.box, 5); // capped
  assert.equal(top.due, now + 14 * C.DAY_MS);

  const missed = C.srsOnAnswer({ box: 4 }, false, now);
  assert.equal(missed.box, 1);
  assert.equal(missed.due, now); // box 1 is due immediately
});

test("srsIsDue: unseen entries are due, future entries are not", () => {
  const now = 1_700_000_000_000;
  assert.equal(C.srsIsDue(undefined, now), true);
  assert.equal(C.srsIsDue({ due: now + 1000 }, now), false);
  assert.equal(C.srsIsDue({ due: now - 1000 }, now), true);
});

test("buildSmartDeck: due before unseen before strong, weakest-first tail", () => {
  const now = 1_700_000_000_000;
  const [a, b, c, d] = THROWS;
  const srs = {
    [a.name]: { box: 2, due: now - C.DAY_MS },       // overdue
    [c.name]: { box: 3, due: now + 5 * C.DAY_MS },   // not due
    [d.name]: { box: 3, due: now + 5 * C.DAY_MS }    // not due
  };
  const stats = {
    [a.name]: { seen: 4, correct: 2 },
    [c.name]: { seen: 4, correct: 4 },   // strong
    [d.name]: { seen: 4, correct: 1 }    // weak
  };
  const deck = C.buildSmartDeck([a, b, c, d], srs, stats, "all", now);
  assert.equal(deck[0].name, a.name);          // due first
  assert.equal(deck[1].name, b.name);          // unseen next
  assert.equal(deck[2].name, d.name);          // weakest of the rest
  assert.equal(deck[3].name, c.name);
  assert.equal(C.buildSmartDeck([a, b, c, d], srs, stats, "2", now).length, 2);
});

test("buildSmartDeck: legacy stats-only throws are 'rest', not due (consistent with countDue)", () => {
  const now = 1_700_000_000_000;
  const [a, b] = THROWS;
  // a: quizzed in the old app (stats) but never scheduled (no srs entry)
  const deck = C.buildSmartDeck([a, b], {}, { [a.name]: { seen: 4, correct: 1 } }, "all", now);
  assert.equal(deck[0].name, b.name); // unseen first
  assert.equal(deck[1].name, a.name); // stats-only goes to the weakness-sorted tail
  assert.equal(C.countDue([a, b], {}, now), 0); // and countDue agrees: nothing scheduled → nothing due
});

test("countDue counts only scheduled-and-due entries", () => {
  const now = 1_700_000_000_000;
  const srs = {
    [THROWS[0].name]: { box: 1, due: now - 1 },
    [THROWS[1].name]: { box: 4, due: now + C.DAY_MS }
  };
  assert.equal(C.countDue(THROWS, srs, now), 1);
});

/* ── Storage sanitizers ─────────────────────────────────────── */

test("sanitizeHistory: rejects garbage shapes wholesale", () => {
  assert.deepEqual(C.sanitizeHistory(null), []);
  assert.deepEqual(C.sanitizeHistory("boom"), []);
  assert.deepEqual(C.sanitizeHistory({}), []);
  assert.deepEqual(C.sanitizeHistory(42), []);
});

test("sanitizeHistory: drops invalid entries, keeps and normalizes valid ones", () => {
  const now = Date.now();
  const out = C.sanitizeHistory([
    { id: "ok", completedAt: now, durationMs: 5000, mode: "smart", total: 10, score: 8, bestStreak: 3, results: [{ name: "Osoto Gari" }] },
    { completedAt: now, total: 0, score: 0, results: [] },          // total 0
    { completedAt: now, total: 5, score: 9, results: [] },          // score > total
    { completedAt: "yesterday", total: 5, score: 3, results: [] },  // bad timestamp
    null,
    "junk",
    { id: 7, completedAt: now, durationMs: -50, total: 3, score: 3, results: [null, { name: "Uchi Mata" }, { noName: true }] }
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].id, "ok");
  assert.equal(typeof out[1].id, "string");   // coerced
  assert.equal(out[1].durationMs, 0);         // clamped
  assert.equal(out[1].results.length, 1);     // invalid results dropped
});

test("sanitizeThrowStats: clamps and drops garbage", () => {
  const out = C.sanitizeThrowStats({
    "Osoto Gari": { seen: 5, correct: 9 },   // correct clamped to seen
    "Uchi Mata": { seen: 0, correct: 0 },    // never seen → dropped
    "Tai Otoshi": "junk",
    "O Goshi": { seen: 2.9, correct: 1.2 }
  });
  assert.equal(out["Osoto Gari"].correct, 5);
  assert.ok(!("Uchi Mata" in out));
  assert.ok(!("Tai Otoshi" in out));
  assert.equal(out["O Goshi"].seen, 2);
  assert.equal(out["O Goshi"].correct, 1);
  assert.deepEqual(C.sanitizeThrowStats([1, 2]), {});
  assert.deepEqual(C.sanitizeThrowStats("x"), {});
});

test("sanitizeSrs: clamps box, validates flag", () => {
  const out = C.sanitizeSrs({
    a: { box: 99, lastSeen: 1, due: 2, flag: "known" },
    b: { box: 0, flag: "banana" },
    c: { flag: "review" },              // no box → dropped
    d: "junk"
  });
  assert.equal(out.a.box, 5);
  assert.equal(out.a.flag, "known");
  assert.equal(out.b.box, 1);
  assert.equal(out.b.flag, null);
  assert.ok(!("c" in out));
  assert.ok(!("d" in out));
});

test("sanitizePrefs: whitelists everything", () => {
  const modes = Object.keys(MODES);
  const p = C.sanitizePrefs(
    { mode: "hack", belts: ["Yellow", "Nope"], length: 15, theme: "sepia", studyFront: "x" },
    modes, BELT_ORDER
  );
  assert.equal(p.mode, "image-to-name");
  assert.deepEqual(p.belts, ["Yellow"]);
  assert.equal(p.length, "10"); // 15 is not an allowed value → default
  assert.equal(p.theme, null);
  assert.equal(p.studyFront, "visual");

  const good = C.sanitizePrefs({ mode: "smart", length: "10", theme: "light", studyFront: "name" }, modes, BELT_ORDER);
  assert.equal(good.mode, "smart");
  assert.equal(good.length, "10");
  assert.equal(good.theme, "light");
  assert.equal(good.studyFront, "name");
  // no belts key → default to all belts
  assert.deepEqual(good.belts, BELT_ORDER);
});

/* ── Typed-answer matching ──────────────────────────────────── */

test("normalizeAnswer strips case, spacing, punctuation, macrons", () => {
  assert.equal(C.normalizeAnswer("Ō-soto Gari!"), "osotogari");
  assert.equal(C.normalizeAnswer("  seoi   nage "), "seoinage");
  assert.equal(C.normalizeAnswer("123"), "");
});

test("levenshtein distances", () => {
  assert.equal(C.levenshtein("", ""), 0);
  assert.equal(C.levenshtein("abc", "abc"), 0);
  assert.equal(C.levenshtein("abc", "abd"), 1);
  assert.equal(C.levenshtein("abc", ""), 3);
  assert.equal(C.levenshtein("kitten", "sitting"), 3);
});

test("matchAnswer: forgiving but not sloppy", () => {
  const others = (name) => THROWS.map((t) => t.name).filter((n) => n !== name);
  assert.ok(C.matchAnswer("osoto gari", "Osoto Gari", others("Osoto Gari")));
  assert.ok(C.matchAnswer("O-Soto-Gari", "Osoto Gari", others("Osoto Gari")));
  assert.ok(C.matchAnswer("osoto gsri", "Osoto Gari", others("Osoto Gari")));      // 1 typo
  assert.ok(C.matchAnswer("harai tsurikomi ashi", "Harai Tsurikomi Ashi", others("Harai Tsurikomi Ashi")));
  assert.ok(C.matchAnswer("harai tsurikomi ashee", "Harai Tsurikomi Ashi", others("Harai Tsurikomi Ashi"))); // 2 edits, long name
  assert.ok(!C.matchAnswer("", "Osoto Gari", others("Osoto Gari")));
  assert.ok(!C.matchAnswer("kosoto gari", "Osoto Gari", others("Osoto Gari")));    // a DIFFERENT throw must never match
  assert.ok(!C.matchAnswer("uchi mata", "Osoto Gari", others("Osoto Gari")));
  assert.ok(!C.matchAnswer("o goshi", "O Guruma", others("O Guruma")));            // short names: no tolerance
});

test("matchAnswer: every throw matches itself and no other throw", () => {
  const names = THROWS.map((t) => t.name);
  for (const t of THROWS) {
    const others = names.filter((n) => n !== t.name);
    assert.ok(C.matchAnswer(t.name, t.name, others), t.name);
    for (const u of THROWS) {
      if (u.name === t.name) continue;
      assert.ok(!C.matchAnswer(u.name, t.name, names.filter((n) => n !== t.name)),
        `${u.name} wrongly matches ${t.name}`);
    }
  }
});

/* ── Hints ──────────────────────────────────────────────────── */

test("maskName levels", () => {
  assert.equal(C.maskName("Osoto Gari", 1), "O____ G___");
  assert.equal(C.maskName("Osoto Gari", 2), "O_o_o G_r_");
  assert.equal(C.maskName("O Goshi", 1), "O G____");
  // punctuation stays visible so hyphenated meanings keep their shape
  assert.equal(C.maskName("Lift-Pull Hip", 1), "L___-____ H__");
});

test("matchAnswer: exact kanji is accepted, other throws' kanji is not", () => {
  const osoto = THROWS.find((t) => t.name === "Osoto Gari");
  const others = THROWS.map((t) => t.name).filter((n) => n !== osoto.name);
  assert.ok(C.matchAnswer("大外刈", "Osoto Gari", others, osoto.kanji));
  assert.ok(C.matchAnswer(" 大外刈 ", "Osoto Gari", others, osoto.kanji)); // whitespace tolerated
  assert.ok(!C.matchAnswer("小外刈", "Osoto Gari", others, osoto.kanji)); // Kosoto Gari's kanji
  assert.ok(C.matchAnswer("osoto gari", "Osoto Gari", others, osoto.kanji)); // romaji still fine
});

/* ── Day streak ─────────────────────────────────────────────── */

test("computeDayStreak counts consecutive days, tolerates today unplayed", () => {
  const now = new Date("2026-07-17T12:00:00").getTime();
  const day = 86400000;
  const act = {};
  assert.equal(C.computeDayStreak(act, now), 0);
  act[C.ymd(now)] = 1;
  assert.equal(C.computeDayStreak(act, now), 1);
  act[C.ymd(now - day)] = 2;
  act[C.ymd(now - 2 * day)] = 1;
  assert.equal(C.computeDayStreak(act, now), 3);
  // gap breaks the streak
  act[C.ymd(now - 4 * day)] = 1;
  assert.equal(C.computeDayStreak(act, now), 3);
  // today not yet studied → streak from yesterday still counts
  delete act[C.ymd(now)];
  assert.equal(C.computeDayStreak(act, now), 2);
});

test("sanitizeActivity keeps only valid ymd keys with positive counts", () => {
  const out = C.sanitizeActivity({ "2026-07-17": 3, "junk": 5, "2026-07-16": -1, "2026-07-15": 2.9 });
  assert.deepEqual(out, { "2026-07-17": 3, "2026-07-15": 2 });
  assert.deepEqual(C.sanitizeActivity(null), {});
  assert.deepEqual(C.sanitizeActivity([1]), {});
});

/* ── Filtering ──────────────────────────────────────────────── */

test("filterThrows: query matches name, english, kanji, and group", () => {
  const all = C.filterThrows(THROWS, { query: "", belts: null });
  assert.equal(all.length, 47);

  const byName = C.filterThrows(THROWS, { query: "osoto", belts: null });
  assert.ok(byName.every((t) => t.name.toLowerCase().includes("osoto")));
  assert.ok(byName.length >= 3);

  const byEnglish = C.filterThrows(THROWS, { query: "hip", belts: null });
  assert.ok(byEnglish.length >= 5);

  const byKanji = C.filterThrows(THROWS, { query: "腰", belts: null });
  assert.ok(byKanji.length >= 5);

  const byGroup = C.filterThrows(THROWS, { query: "habukareta", belts: null });
  assert.equal(byGroup.length, 8);
});

test("filterThrows: belts set restricts results", () => {
  const yellow = C.filterThrows(THROWS, { query: "", belts: new Set(["Yellow"]) });
  assert.equal(yellow.length, 8);
  assert.ok(yellow.every((t) => t.belt === "Yellow"));
  const none = C.filterThrows(THROWS, { query: "", belts: new Set() });
  assert.equal(none.length, 0);
});
