# CodeAlpha_Tasks

Frontend Development Internship task submissions for [CodeAlpha](https://www.codealpha.tech).

---

## Repository Structure

```
CodeAlpha_Tasks/
├── task-2-calculator/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── task-4-music-player/
    ├── index.html
    ├── script.js
    ├── playlist.js
    ├── styles.css
    ├── songs/
    └── artworks/
```

---

## Tasks

### ✅ Task 2 — Calculator

A vanilla JS calculator with three themes and full keyboard support.

**Requirements met**
- All four arithmetic operations: `+`, `−`, `×`, `÷`
- Button-based UI with a main display and live result preview
- Real-time result display as the second operand is typed
- Clear, sign toggle, percent, and backspace functions
- **Bonus:** Full keyboard support + three switchable themes (Dark, Light, Neon)

**Setup** — open `task-2-calculator/index.html` directly in a browser. No server required.

---

### ✅ Task 4 — Music Player

A vanilla JS music player with dynamic album-art theming and a playlist overlay.

**Requirements met**
- Play, pause, next, previous controls
- Song title, artist, and duration display
- Progress bar with seek support and volume control
- **Bonus:** Full playlist with autoplay, shuffle, repeat modes, and ColorThief theming that adapts the UI to each track's album art

**Setup** — must be served over HTTP due to audio and canvas CORS restrictions:

```bash
# from the task-4-music-player/ directory
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:PORT` in your browser.

---

## Internship

**Organisation:** CodeAlpha  
**Domain:** Frontend Development  
**Website:** [www.codealpha.tech](https://www.codealpha.tech)
