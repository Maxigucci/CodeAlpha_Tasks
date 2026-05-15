# Music Player

A vanilla JS music player with dynamic album-art theming.

---

## Setup

No build step required. The project runs directly in the browser via a local server.

**Prerequisites**

- A local static file server (e.g. [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code, or `npx serve`)
- A browser with ES module support (any modern browser)

**File structure expected**

```
project/
├── index.html
├── script.js
├── playlist.js
├── styles.css
├── Poppins-Regular.ttf
├── MaterialSymbolsRounded_Filled-Regular.ttf
├── songs/
│   └── *.mp3
└── artworks/
    └── *.jpg / *.png
```

**Running it**

```bash
# Using serve
npx serve .

# Or with Python
python3 -m http.server 8080
```

Then open `http://localhost:PORT` in your browser.

> **Note:** The player must be served over HTTP — opening `index.html` directly as a `file://` URL will block audio playback and ColorThief's canvas reads due to CORS restrictions.

---

## Usage

### Playback
- **Play / Pause** — center button in the controls row
- **Skip** — previous/next buttons either side of play
- **Seek** — drag the progress bar

### Volume
- **Vertical slider** between the volume icon and queue icon — drag up to increase, down to decrease
- **Mute toggle** — click the volume icon; click again to restore

### Shuffle
- Click the **shuffle** icon to enable — a dot appears beneath it when active
- Disabling shuffle resumes sequential playback from the current track

### Repeat
- Click the **repeat** icon to cycle through modes:
  - No dot — off
  - Dot, `repeat` icon — repeat all
  - Dot, `repeat_one` icon — repeat current track

### Queue
- Click the **queue** icon (top right) to open the playlist overlay
- Click any track to load and play it immediately
- The currently playing track is highlighted with an equaliser icon
- Click the **back arrow** (top left of overlay) to return to the player

---

## Adding Tracks

Edit `playlist.js` and append an entry to the array:

```js
{
  src: "./songs/your-file.mp3",
  title: "Track Title",
  artist: "Artist Name",
  artwork: "./artworks/your-artwork.jpg"
}
```

Artwork should be square and at least 300×300px for best results with ColorThief theming.
