import playlist from "./playlist.js";

// ─── Elements ────────────────────────────────────────────────────────────────
const img          = document.getElementById('img');
const mainBox      = document.getElementById('mainBox');
const titleEl      = document.getElementById('title');
const artistEl     = document.getElementById('artist');
const btnPlay      = document.getElementById('btn-play');
const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnShuffle   = document.getElementById('btn-shuffle');
const btnRepeat    = document.getElementById('btn-repeat');
const btnQueue     = document.getElementById('btn-queue');
const btnBack      = document.getElementById('btn-back');
const btnVolume    = document.getElementById('btn-volume');
const progress     = document.getElementById('progress');
const volumeSlider = document.getElementById('volume-slider');
const currentTime  = document.getElementById('current-time');
const durationEl   = document.getElementById('duration');
const overlay      = document.getElementById('playlist-overlay');
const listEl       = document.getElementById('playlist-list');

// ─── State ────────────────────────────────────────────────────────────────────
const audio = new Audio();
let currentIndex = 9; // Bliss Wave is index 9
let shuffleOn    = false;
let repeatMode   = 'none'; // 'none' | 'all' | 'one'
let shuffleOrder = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateRangeFill(input, fillColor = 'rgba(255,255,255,0.85)', trackColor = 'rgba(0,0,0,0.2)') {
  const val = (input.value - input.min) / (input.max - input.min) * 100;
  input.style.background = `linear-gradient(to right, ${fillColor} ${val}%, ${trackColor} ${val}%)`;
}

// ─── ColorThief theming ───────────────────────────────────────────────────────
function applyTheme() {
  try {
    const palette = ColorThief.getPaletteSync(img, { colorCount: 3 });
    const [r1, g1, b1] = Object.values(palette[0].rgb());
    const [r2, g2, b2] = Object.values(palette[1].rgb());

    mainBox.style.background = `linear-gradient(160deg, rgb(${r1},${g1},${b1}) 0%, rgb(${r2},${g2},${b2}) 100%)`;

    // Derive text color from luminance of dominant color
    const luminance = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
    const textColor = luminance > 0.55 ? '#111' : '#fff';
    mainBox.style.color = textColor;

    // Re-apply range fills with new text color
    updateRangeFill(progress, textColor === '#fff' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)', textColor === '#fff' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)');
    updateRangeFill(volumeSlider, textColor === '#fff' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)', textColor === '#fff' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)');

    // Thumb color via CSS variable
    mainBox.style.setProperty('--thumb-color', textColor);
  } catch (e) {
    // ColorThief not available or CORS issue — fall back gracefully
    mainBox.style.background = '#1a1a2e';
    mainBox.style.color = '#fff';
  }
}

// ─── Track loading ────────────────────────────────────────────────────────────
function loadTrack(index, autoplay = false) {
  const track = playlist[index];
  currentIndex = index;

  titleEl.textContent  = track.title;
  artistEl.textContent = track.artist;

  // Crossfade artwork
  img.style.opacity = '0';
  img.src = track.artwork;
  img.onload = () => {
    img.style.opacity = '1';
    applyTheme();
  };

  audio.src = track.src;
  audio.load();

  if (autoplay) {
    audio.play().then(() => {
      btnPlay.textContent = 'pause';
    }).catch(() => {});
  } else {
    btnPlay.textContent = 'play_arrow';
  }

  progress.value = 0;
  updateRangeFill(progress);
  currentTime.textContent = '0:00';
  durationEl.textContent  = '0:00';

  highlightActive();
}

// ─── Playback ─────────────────────────────────────────────────────────────────
btnPlay.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().then(() => btnPlay.textContent = 'pause').catch(() => {});
  } else {
    audio.pause();
    btnPlay.textContent = 'play_arrow';
  }
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progress.value = pct;
  updateRangeFill(progress);
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  handleTrackEnd();
});

progress.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
  updateRangeFill(progress);
});

// ─── Volume ───────────────────────────────────────────────────────────────────
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
  updateRangeFill(volumeSlider);
  if (audio.volume === 0) {
    btnVolume.textContent = 'volume_off';
  } else if (audio.volume < 0.5) {
    btnVolume.textContent = 'volume_down';
  } else {
    btnVolume.textContent = 'volume_up';
  }
});

btnVolume.addEventListener('click', () => {
  if (audio.volume > 0) {
    audio._prevVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    btnVolume.textContent = 'volume_off';
  } else {
    audio.volume = audio._prevVolume || 1;
    volumeSlider.value = audio.volume;
    btnVolume.textContent = 'volume_up';
  }
  updateRangeFill(volumeSlider);
});

// ─── Skip ─────────────────────────────────────────────────────────────────────
btnNext.addEventListener('click', () => skipTo('next'));
btnPrev.addEventListener('click', () => skipTo('prev'));

function skipTo(direction) {
  const wasPlaying = !audio.paused;
  if (shuffleOn) {
    const pos = shuffleOrder.indexOf(currentIndex);
    const nextPos = direction === 'next'
      ? (pos + 1) % shuffleOrder.length
      : (pos - 1 + shuffleOrder.length) % shuffleOrder.length;
    loadTrack(shuffleOrder[nextPos], wasPlaying);
  } else {
    const next = direction === 'next'
      ? (currentIndex + 1) % playlist.length
      : (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(next, wasPlaying);
  }
}

function handleTrackEnd() {
  if (repeatMode === 'one') {
    audio.currentTime = 0;
    audio.play();
  } else if (repeatMode === 'all') {
    skipTo('next');
  } else {
    // no repeat — advance unless last track
    if (shuffleOn) {
      skipTo('next');
    } else if (currentIndex < playlist.length - 1) {
      loadTrack(currentIndex + 1, true);
    } else {
      btnPlay.textContent = 'play_arrow';
    }
  }
}

// ─── Shuffle ──────────────────────────────────────────────────────────────────
function buildShuffleOrder() {
  const indices = playlist.map((_, i) => i).filter(i => i !== currentIndex);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  shuffleOrder = [currentIndex, ...indices];
}

btnShuffle.addEventListener('click', () => {
  shuffleOn = !shuffleOn;
  btnShuffle.classList.toggle('active', shuffleOn);
  if (shuffleOn) buildShuffleOrder();
});

// ─── Repeat ───────────────────────────────────────────────────────────────────
btnRepeat.addEventListener('click', () => {
  if (repeatMode === 'none') {
    repeatMode = 'all';
    btnRepeat.textContent = 'repeat';
    btnRepeat.classList.add('active');
  } else if (repeatMode === 'all') {
    repeatMode = 'one';
    btnRepeat.textContent = 'repeat_one';
    btnRepeat.classList.add('active');
  } else {
    repeatMode = 'none';
    btnRepeat.textContent = 'repeat';
    btnRepeat.classList.remove('active');
  }
});

// ─── Playlist Overlay ─────────────────────────────────────────────────────────
function buildPlaylist() {
  listEl.innerHTML = '';
  playlist.forEach((track, i) => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.dataset.index = i;
    if (i === currentIndex) item.classList.add('playing');

    item.innerHTML = `
      <img src="${track.artwork}" alt="${track.title}" class="playlist-thumb" />
      <div class="playlist-info">
        <div class="playlist-track-title">${track.title}</div>
        <div class="playlist-track-artist">${track.artist}</div>
      </div>
      <span class="material-icons playlist-playing-icon">graphic_eq</span>
    `;

    item.addEventListener('click', () => {
      loadTrack(i, true);
      closeOverlay();
    });

    listEl.appendChild(item);
  });
}

function highlightActive() {
  document.querySelectorAll('.playlist-item').forEach(item => {
    item.classList.toggle('playing', parseInt(item.dataset.index) === currentIndex);
  });
}

function openOverlay() {
  buildPlaylist();
  overlay.classList.remove('hidden');
  overlay.classList.add('visible');
  // scroll active item into view
  setTimeout(() => {
    const active = listEl.querySelector('.playlist-item.playing');
    if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 300);
}

function closeOverlay() {
  overlay.classList.remove('visible');
  overlay.classList.add('hidden');
}

btnQueue.addEventListener('click', openOverlay);
btnBack.addEventListener('click', closeOverlay);

// ─── Init ─────────────────────────────────────────────────────────────────────
updateRangeFill(volumeSlider);
loadTrack(currentIndex, false);
