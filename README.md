# 柔 Judo Throws — Flashcards & Quiz

Study **53 throws of Kodokan judo** — the full **Gokyo no Waza**, the **Habukareta Waza**, and five of the **Shinmeisho no Waza** — flip-card studying, five quiz modes, spaced repetition, a full technique library, and a **glossary of general judo terms** (commands, roles, the phases of a throw, breakfalls, stances and footwork, the words throw names are built from, the waza families, and contest scoring). Vanilla HTML/CSS/JS, **no dependencies, no build step, works offline** (and straight from `file://`).

**Live app → https://7h35c4r3cr0w.github.io/Judo-Throw-Flashcards/**

![Vanilla HTML/CSS/JS · No dependencies](https://img.shields.io/badge/stack-vanilla%20html%2Fcss%2Fjs-1c2029?style=for-the-badge)
![Offline first](https://img.shields.io/badge/offline-PWA-22c55e?style=for-the-badge)
![Storage](https://img.shields.io/badge/storage-localStorage-3498db?style=for-the-badge)

---

## Quick start

**Use it online:** open the [live app](https://7h35c4r3cr0w.github.io/Judo-Throw-Flashcards/) — it installs as a PWA and works offline after the first visit.

**Or run it locally:** download/clone the repo and double-click `index.html`. That's it — every animation is bundled.

---

## What's inside

```
.
├── index.html               ← markup for all views
├── css/style.css            ← design system (dark "sumi ink" / light "washi paper" themes)
├── js/data.js               ← the 53 throws (+ ATJA kyu tags) + 102 general terms (romaji, kanji, English)
├── js/core.js               ← pure logic: decks, distractors, spaced repetition, sanitizers
├── js/app.js                ← state, rendering, wiring
├── sw.js                    ← service worker (full offline precache)
├── manifest.webmanifest     ← PWA install metadata
├── icons/                   ← 柔 hanko app icon (SVG + PNG)
├── images/technique/        ← 53 throw animations (.gif)
├── kano_jigoro.jpg          ← Kanō Jigorō portrait
├── tests/core.test.mjs      ← unit tests (node --test, zero dependencies)
└── download_images.ps1      ← optional: re-download GIFs from the source
```

---

## Features

### 📇 Study — real flashcards
- 3D flip cards: animation on the front, name · kanji · meaning · group on the back
- **ATJA kyu tags** — 24 throws show the grade where the ATJA Judo Kyu Curriculum first tests them, with ATJA's own English name (e.g. *ATJA 6th kyu · Major Outside Reaping Throw*). Search **“6th kyu”**, **“orange”**, or an ATJA name to pull up just that belt's throws
- Choose the front: **Animation**, **Japanese name**, or **English meaning**
- **← / →** browse, **Space** flip, swipe on mobile, shuffle
- Mark cards **✓ I know this** / **↻ Needs review** — marks feed the spaced-repetition scheduler
- Filter by belt group, search, or show only cards that are **due**, **flagged**, or **unseen**

### 🎯 Quiz — five modes
| Mode | You see | You answer |
|---|---|---|
| 🎬 **Visual** | The throw animation | Pick the Japanese name |
| 📖 **EN → JP** | English meaning | Pick the Japanese name |
| 🈶 **JP → EN** | Japanese name | Pick the English meaning |
| ⌨️ **Type It** | The throw animation | **Type** the name — no options, forgiving spelling |
| 🧠 **Smart Drill** | Mixed questions | Due + weakest throws first |

- **Smart distractors** — wrong options are drawn from *confusable* throws (Osoto Gari vs Osoto Guruma vs Osoto Otoshi…), not random picks
- **Hints** (`H`) — first the name's shape (`O____ G___`), then more letters plus a 50/50 that greys out two wrong options
- Pause/replay the animation (also auto-pauses under `prefers-reduced-motion`)
- Optional auto-advance on correct answers, streak tracking, per-question feedback with kanji
- Answers update the spaced-repetition schedule automatically

### 🗂 Library
- All 53 throws grouped by belt, searchable by romaji, kanji, English, or group
- Tap any throw for the full animation, names, and your personal stats
- Per-belt **mastery bars** show how much of each group you've locked in

### 🈁 Terms — the language of the dojo
- **102 general judo terms** (not throws) organized into nine categories: **Commands & Etiquette**, **Core Concepts**, **Roles & Phases**, **Fundamentals** (breakfalls, stances, footwork), **Body & Direction**, **Reading Throw Names** (o · ko · soto · uchi · gari · harai…, so any throw's name translates itself), **Technique Categories**, **Pins, Chokes & Locks** (the 17 katame-waza on the ATJA kyu exam, each noted with its grade), and **Scoring & Penalties**
- Two ways to study: **flashcards** (flip romaji · kanji → meaning, with prev / next / shuffle) or a grouped **glossary** — both filter by category and search across romaji, kanji, meaning, and notes
- Each term carries its kanji/kana, a concise gloss, and a teaching note; fact-checked against the Kodokan, the IJF rules, and the Wikipedia judo glossary (e.g. the current **68** nage-waza and **32** katame-waza, post-2017 revision, and the **yuko** score the IJF brought back in 2025)
- The Fundamentals, directions, and scoring additions follow Sensei Sami's *Basics of Judo* class notes (CAJA, July 2025)
- **Quiz** the terms on screen — JP → EN, EN → JP, or Mixed — with wrong answers drawn from the same category so they stay plausible
- Terms use the same **spaced repetition** as throws: mark *I know this* / *Needs review* (`K` / `R`), filter by **Due**, **Marked review**, or **Not yet studied**, and see accuracy, Leitner box, and a *due* badge on every card and glossary tile

### 🔁 Spaced repetition (Leitner)
- 5 boxes with 0/1/3/7/14-day intervals; correct answers promote, misses demote
- Throws and terms each keep their own schedule; the home screen's **Due for Review** tile adds them up (e.g. *12 throws · 5 terms*)
- One tap on that tile drills **everything due** — throws and terms together, most overdue first
- A **day-streak** counter rewards showing up (any finished quiz or study mark counts)

### 📊 Progress
- Test history with per-question breakdowns, lifetime accuracy, mastered count, best streak
- "Throws to Focus On" — your weakest throws, with a one-tap **🎯 Drill these**
- **Export / import** all data as JSON from the History dialog (your stats aren't hostage to one browser)

### Design & accessibility
- Dark **sumi-ink** and light **washi-paper** themes (follows your system, toggleable)
- Keyboard-first: press **?** for the shortcut list
- Screen-reader support (live feedback announcements, dialog focus traps, meaningful labels), WCAG-checked contrast, ≥44px touch targets, `prefers-reduced-motion` respected

### Privacy
Everything is local. No analytics, no server calls. Data lives in `localStorage` under `judo_quiz_*_v1` keys (fully compatible with the previous version of this app).

---

### 🕹️ Ippon Toss — a silly mini-game
- **Dojo break** on the Home screen: hold to break uke's balance, release in the
  glowing zone, and send them ragdolling across the tatami
- Referee calls — **IPPON! / WAZA-ARI! / YUKO / MATTE** — with confetti, dust,
  and a very dizzy uke
- Every throw is named after a real Gokyo or Habukareta throw (kanji included), and you earn
  belt ranks one ippon at a time (progress saved locally)
- Works with touch, mouse, or **Space** — and it never traps page scrolling on mobile

## Keyboard shortcuts

| Key | Action |
|---|---|
| `?` | Show shortcuts |
| `Esc` | Close dialog |
| `1–4` | Pick an answer (quiz) |
| `H` | Hint — press twice for 50/50 (quiz) |
| `T` | Toggle dark / light theme |
| `Enter` / `Space` | Next question (quiz) |
| `←` `→` | Previous / next card (study · terms) |
| `Space` / `F` | Flip card (study · terms) |
| `K` / `R` | Mark known / needs review (study · terms) |
| `S` | Shuffle deck (study · terms) |

---

## The throws

53 of the 68 recognized Kodokan throws — the full **Gokyo no Waza**, all 8 **Habukareta Waza** (techniques preserved from the 1895 list), and the 5 **Shinmeisho no Waza** (newer Kodokan throws) that have a clean animation:

- **Dai Ikkyo** (1st group) — 8 throws
- **Dai Nikyo** (2nd group) — 8 throws
- **Dai Sankyo** (3rd group) — 8 throws
- **Dai Yonkyo** (4th group) — 8 throws
- **Dai Gokyo** (5th group) — 8 throws
- **Habukareta Waza** (preserved) — 8 throws
- **Shinmeisho no Waza** (newer) — 5 throws: Morote Gari, Kibisu Gaeshi, Harai Makikomi, Sode Tsurikomi Goshi, Ippon Seoi Nage

The belt-color grouping (Yellow → Brown) is a common club convention for the five Gokyo sets, not a Kodokan standard.

---

## For developers

```bash
# run the tests (Node ≥ 18, no dependencies)
node --test tests/core.test.mjs

# serve locally (any static server works; file:// works too)
python3 -m http.server 8080
```

- All throw data lives in `js/data.js` — add or edit entries and the UI rebuilds itself.
- Pure logic (`js/core.js`) is dependency-free and fully unit-tested; UI code (`js/app.js`) stays thin.
- Bump `CACHE_VERSION` in `sw.js` whenever you change any precached file, or returning visitors keep the old version.
- Deployed via GitHub Pages from `main` (root). Anything merged to `main` goes live in ~a minute.

### Project ethos

- **No build step, no dependencies** — plain files that will still run in 10 years.
- **Local first** — works offline, works from disk, your data never leaves the browser.

---

## Credits

- **Throw animations** courtesy of [judo-caja.com](https://judo-caja.com/techniques.html); Kata Guruma and the Shinmeisho no Waza from [judoinfo.com](https://judoinfo.com/?p=180), redrawn onto clean full-size frames.
- **Portrait of Kanō Jigorō** via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Portrait_of_late_Mr._Kano.jpg) (public domain).
- **Technique list** from [Wikipedia: Kodokan Judo techniques](https://en.wikipedia.org/wiki/List_of_Kodokan_Judo_techniques).
- **Kyu grades & ATJA names** from the ATJA Judo Kyu Curriculum (v2.0), the syllabus CAJA tests to.

## License

MIT — see [`LICENSE`](./LICENSE). Animations and the portrait remain the property of their respective owners and are used here for educational purposes.
