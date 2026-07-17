# 柔 Judo Throws — Flashcards & Quiz

Study the **47 throws of the Kodokan Gokyo no Waza & Habukareta Waza** — flip-card studying, four quiz modes, spaced repetition, and a full technique library. Vanilla HTML/CSS/JS, **no dependencies, no build step, works offline** (and straight from `file://`).

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
├── js/data.js               ← the 47 throws (romaji, kanji, English, group, belt)
├── js/core.js               ← pure logic: decks, distractors, spaced repetition, sanitizers
├── js/app.js                ← state, rendering, wiring
├── sw.js                    ← service worker (full offline precache)
├── manifest.webmanifest     ← PWA install metadata
├── icons/                   ← 柔 hanko app icon (SVG + PNG)
├── images/technique/        ← 47 throw animations (.gif)
├── kano_jigoro.jpg          ← Kanō Jigorō portrait
├── tests/core.test.mjs      ← unit tests (node --test, zero dependencies)
└── download_images.ps1      ← optional: re-download GIFs from the source
```

---

## Features

### 📇 Study — real flashcards
- 3D flip cards: animation on the front, name · kanji · meaning · group on the back
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
- All 47 throws grouped by belt, searchable by romaji, kanji, English, or group
- Tap any throw for the full animation, names, pronunciation, and your personal stats
- Per-belt **mastery bars** show how much of each group you've locked in

### 🔁 Spaced repetition (Leitner)
- 5 boxes with 0/1/3/7/14-day intervals; correct answers promote, misses demote
- The home screen shows how many throws are **due for review** — one tap starts a Smart Drill
- A **day-streak** counter rewards showing up (any finished quiz or study mark counts)

### 📊 Progress
- Test history with per-question breakdowns, lifetime accuracy, mastered count, best streak
- "Throws to Focus On" — your weakest throws, with a one-tap **🎯 Drill these**
- **Export / import** all data as JSON from the History dialog (your stats aren't hostage to one browser)

### 🔊 Pronunciation
- "Say it" buttons speak each throw's name using your device's built-in speech (a Japanese voice reads the kanji when available) — no downloads, works offline

### Design & accessibility
- Dark **sumi-ink** and light **washi-paper** themes (follows your system, toggleable)
- Keyboard-first: press **?** for the shortcut list
- Screen-reader support (live feedback announcements, dialog focus traps, meaningful labels), WCAG-checked contrast, ≥44px touch targets, `prefers-reduced-motion` respected

### Privacy
Everything is local. No analytics, no server calls. Data lives in `localStorage` under `judo_quiz_*_v1` keys (fully compatible with the previous version of this app).

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `?` | Show shortcuts |
| `Esc` | Close dialog |
| `1–4` | Pick an answer (quiz) |
| `H` | Hint — press twice for 50/50 (quiz) |
| `T` | Toggle dark / light theme |
| `Enter` / `Space` | Next question (quiz) |
| `←` `→` | Previous / next card (study) |
| `Space` / `F` | Flip card (study) |
| `K` / `R` | Mark known / needs review (study) |
| `S` | Shuffle deck (study) |

---

## The throws

47 of the 68 recognized Kodokan throws — the full **Gokyo no Waza** (minus Kata Guruma, whose source animation is broken) plus all 8 **Habukareta Waza** (techniques preserved from the 1895 list):

- **Dai Ikkyo** (1st group) — 8 throws
- **Dai Nikyo** (2nd group) — 8 throws
- **Dai Sankyo** (3rd group) — 7 throws
- **Dai Yonkyo** (4th group) — 8 throws
- **Dai Gokyo** (5th group) — 8 throws
- **Habukareta Waza** (preserved) — 8 throws

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

- **Throw animations** courtesy of [judo-caja.com](https://judo-caja.com/techniques.html).
- **Portrait of Kanō Jigorō** via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Portrait_of_late_Mr._Kano.jpg) (public domain).
- **Technique list** from [Wikipedia: Kodokan Judo techniques](https://en.wikipedia.org/wiki/List_of_Kodokan_Judo_techniques).

## License

MIT — see [`LICENSE`](./LICENSE). Animations and the portrait remain the property of their respective owners and are used here for educational purposes.
