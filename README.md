# 柔 Judo Throws Flashcard Quiz

An interactive flashcard quiz for the **67 throws of Kodokan Judo** — visual (GIF) recognition, English ↔ Japanese translation, persistent test history, per‑throw weakness tracking, and a clean dark UI. **One file, no build step, no internet required.**

![Single page app · Vanilla HTML/CSS/JS · No dependencies](https://img.shields.io/badge/stack-vanilla%20html%2Fcss%2Fjs-1c2029?style=for-the-badge)
![Offline first](https://img.shields.io/badge/offline-yes-22c55e?style=for-the-badge)
![Storage](https://img.shields.io/badge/storage-localStorage-3498db?style=for-the-badge)

---

## Quick start (30 seconds)

1. **Download** the repo (green **Code → Download ZIP** button on GitHub) and unzip it, **or** `git clone` it.
2. **Double‑click `index.html`.** That's it.

The page opens in your default browser. Everything is bundled — the 47 throw animations and the portrait of Kanō Jigorō are stored locally in the repo. No server, no Node, no Python, no dependencies.

> **Tip for the smoothest experience:** Chrome, Edge, Firefox, or Safari will all work. The app uses your browser's `localStorage` to remember progress between sessions.

---

## What's inside

```
.
├── index.html              ← the entire app (HTML + CSS + JS)
├── kano_jigoro.jpg         ← hero photo on the home page
├── images/
│   └── technique/          ← 47 throw animations (.gif)
├── download_images.ps1     ← optional: re‑download GIFs from the source
├── README.md
└── LICENSE
```

That's the whole project. Open `index.html` and you're done.

---

## Features

### Three quiz modes

| Mode | What you see | What you pick |
|---|---|---|
| **🎬 Visual Test** | A GIF of the throw being performed | The Japanese name |
| **📝 Text: EN → JP** | English meaning (e.g. *Forward Foot Sweep*) | The Japanese name |
| **🇯🇵 Text: JP → EN** | Japanese name (e.g. *Deashi Harai*) | The English meaning |

### Smart progress tracking

- **Resume on refresh** — accidentally close the tab? The in‑progress quiz is auto‑saved every answer; reopen and click **Resume**.
- **Test history** — every completed (and partial) attempt is logged with score, mode, time, and best streak. Click any row to see a per‑question breakdown.
- **Throws to focus on** — your weakest throws automatically surface on the home page, sorted by accuracy.
- **Mastery tracking** — a throw counts as "mastered" once you've answered it correctly ≥80% over 3+ attempts.
- **Lifetime metrics** — tests taken, overall accuracy, throws mastered (out of 47), and best streak.

### During a quiz

- Big animated GIF with belt‑colored badge (Yellow / Orange / Green / Blue / Brown / Preserved).
- Live progress bar, score, streak, and timer.
- Instant feedback: correct answer turns green, wrong turns red, and the right answer is highlighted.
- **← Home** button anytime — your progress is saved automatically and you can resume later.
- **End now** to save a partial test to history, or discard if you haven't answered anything yet.

### After a quiz

- Big score with contextual praise.
- Metrics: accuracy %, time, best streak, average per question.
- **Review Wrong Answers** — every miss shown with the GIF thumbnail, your wrong choice, and the correct answer.
- **Retry Wrong Only** — instantly start a focused quiz on just the throws you missed.

### Setup options

- **Belt filter** — quiz only Yellow Belt throws, only Brown, any combination, etc.
- **Length** — 10 questions, 20 questions, or every selected throw.
- All settings (belts, mode, length) persist between sessions.

### Privacy

Everything is local. No analytics, no server calls, no telemetry. All your stats live in your browser's `localStorage` under keys prefixed `judo_quiz_*_v1`. Click **⚙️ Reset** in the header to wipe it all.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `1` `2` `3` `4` | Pick the corresponding answer |
| `Enter` / `Space` | Advance to next question |
| `Esc` | Close the History modal |

---

## The throws

47 of the 67 official Kodokan throwing techniques are included — every throw whose animation is hosted on the source page. Grouped by traditional belt syllabus:

- **Dai Ikkyo** (1st group, Yellow): 8 throws — Deashi Harai, Hiza Guruma, Sasae Tsurikomi Ashi, Uki Goshi, Osoto Gari, O Goshi, Ouchi Gari, Seoi Nage
- **Dai Nikyo** (2nd group, Orange): 8 throws
- **Dai Sankyo** (3rd group, Green): 7 throws
- **Dai Yonkyo** (4th group, Blue): 8 throws
- **Gokyo** (5th group, Brown): 8 throws
- **Habukareta Waza** (Preserved 1895 techniques): 8 throws

> **Note:** *Kata Guruma* is omitted because the source page's link points to the wrong animation file.

---

## Sharing it as a live site

Want a public URL instead of asking people to download a ZIP? **GitHub Pages** publishes the app for free in two clicks:

1. Push the repo to GitHub.
2. **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save.**

Within a minute your quiz is live at `https://<your-username>.github.io/<repo-name>/`. No build configuration needed.

---

## For developers

### Refreshing the GIFs

The 47 GIFs in `images/technique/` were downloaded once from [judo-caja.com](https://judo-caja.com/techniques.html). If you ever want to refresh them:

```powershell
powershell -ExecutionPolicy Bypass -File .\download_images.ps1
```

The script skips files that already exist, sends a polite `Referer` header, and reports per‑file success / failure.

### Editing the throw list

All 47 throws live in a single `THROWS` array near the top of the `<script>` block in `index.html`. Each entry:

```js
{ name: "Deashi Harai", english: "Forward Foot Sweep",
  img: "images/technique/deashibarai.gif",
  group: "Dai Ikkyo", belt: "Yellow" }
```

Add, remove, or rename freely — the UI rebuilds itself from this array.

### Project ethos

- **One file** for the app. No build step.
- **No dependencies** — vanilla HTML/CSS/JS so it'll still run in 10 years.
- **Local first** — everything works offline once the repo is on disk.

---

## Credits

- **Throw animations** courtesy of [judo-caja.com](https://judo-caja.com/techniques.html) — the wonderful Kanō Jūdō reference site.
- **Portrait of Kanō Jigorō** via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Portrait_of_late_Mr._Kano.jpg) (public domain).
- **List of techniques** from [Wikipedia: Kodokan Judo techniques](https://en.wikipedia.org/wiki/List_of_Kodokan_Judo_techniques).

---

## License

MIT — see [`LICENSE`](./LICENSE). Use it, fork it, learn from it. Animations and the portrait remain the property of their respective owners and are used here for educational purposes.
