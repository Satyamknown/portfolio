const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SOUND_COOLDOWN_MS = 80;
const PURR_COOLDOWN_MS = 3000;
const BASE_VOLUME = 0.18;
const SCROLL_VOLUME = 0.14;
const MEOW_FILE = '/cat/meow.mp3';
const MEOW_VOLUME = 0.3; // recorded clip, not synthesized — tune to taste
const PAW_TAP_FILE = '/cat/paw-tap.wav';
const PAW_TAP_VOLUME = 0.15; // recorded clip, kept quieter than the meow greeting

const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
let audioCtx = null;
let masterGain = null;
let audioUnlocked = false;
let initListeners = false;
const cooldowns = new Map();

const presets = {
  tap: { freq: 320, length: 0.06, type: 'triangle', volume: BASE_VOLUME, attack: 0.002, release: 0.05 },
  type: { freq: 300, length: 0.04, type: 'triangle', volume: BASE_VOLUME * 0.82, attack: 0.002, release: 0.03 },
  soft: { freq: 260, length: 0.08, type: 'triangle', volume: BASE_VOLUME * 0.92, attack: 0.003, release: 0.08 },
  error: { freq: 140, length: 0.1, type: 'sine', volume: BASE_VOLUME * 0.95, attack: 0.004, release: 0.1 },
  scroll: { freq: 220, length: 0.05, type: 'triangle', volume: SCROLL_VOLUME, attack: 0.002, release: 0.04 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const now = () => performance.now();

function hasCooldown(key, window = SOUND_COOLDOWN_MS) {
  const last = cooldowns.get(key) || 0;
  return now() - last < window;
}

function setCooldown(key) {
  cooldowns.set(key, now());
}

function createAudioContext() {
  if (audioCtx || reducedMotion) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(audioCtx.destination);
    audioUnlocked = true;
    audioCtx.resume().catch(() => {});
  } catch {
    audioCtx = null;
    masterGain = null;
    audioUnlocked = false;
  }
}

function unlockAudio() {
  if (audioUnlocked || reducedMotion) return;
  createAudioContext();
}

function initAudioUnlock() {
  if (initListeners || reducedMotion) return;
  initListeners = true;

  const handler = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', handler, true);
    window.removeEventListener('touchstart', handler, true);
    window.removeEventListener('keydown', handler, true);
  };

  window.addEventListener('pointerdown', handler, true);
  window.addEventListener('touchstart', handler, true);
  window.addEventListener('keydown', handler, true);
}

function playTone({ freq, length, type, volume, attack, release, detune = 0 }) {
  if (reducedMotion || !audioCtx || !masterGain) return;

  const context = audioCtx;
  const gainNode = context.createGain();
  const oscillator = context.createOscillator();
  const nowTime = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.value = freq;
  oscillator.detune.value = detune;
  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  gainNode.gain.setValueAtTime(0.0001, nowTime);
  gainNode.gain.linearRampToValueAtTime(clamp(volume, 0.001, 0.35), nowTime + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, nowTime + length + release);

  oscillator.start(nowTime);
  oscillator.stop(nowTime + length + release + 0.02);

  oscillator.onended = () => {
    oscillator.disconnect();
    gainNode.disconnect();
  };
}

// Short filtered noise burst — used for the physical, non-tonal beats (a paw
// hitting a surface, a soft landing thud) that a pure oscillator can't sell.
function playNoiseBurst({ duration, volume, filterType = 'bandpass', filterFreq = 900, filterQ = 1.2, attack = 0.002 }) {
  if (reducedMotion || !audioCtx || !masterGain) return;

  const context = audioCtx;
  const nowTime = context.currentTime;
  const sampleCount = Math.max(1, Math.round(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  filter.Q.value = filterQ;

  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0.0001, nowTime);
  gainNode.gain.linearRampToValueAtTime(clamp(volume, 0.001, 0.35), nowTime + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, nowTime + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  source.start(nowTime);
  source.stop(nowTime + duration + 0.02);

  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gainNode.disconnect();
  };
}

function emitVibration(pattern) {
  if (reducedMotion || !canVibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore vibration errors
  }
}

function playPreset(name, opts = {}) {
  const preset = presets[name];
  if (!preset) return;
  if (hasCooldown(name)) return;
  setCooldown(name);

  const volume = clamp((opts.volume ?? preset.volume), 0.01, 0.35);
  if (canVibrate) {
    if (name === 'tap') emitVibration([8]);
    if (name === 'scroll') emitVibration([4]);
    if (name === 'soft') emitVibration([5]);
  }

  if (!audioUnlocked) return;
  playTone({ ...preset, volume, detune: opts.detune ?? (Math.random() * 10 - 5) });
}

// A real recorded "mew" clip rather than a synthesized tone. Fires once per
// form focus (caller gates it). Independent of the Web Audio unlock chain —
// HTMLAudioElement.play() from inside a genuine user-gesture handler (the
// field's onFocus) doesn't need it.
let meowAudio = null;

function getMeowAudio() {
  if (!meowAudio) {
    meowAudio = new Audio(MEOW_FILE);
    meowAudio.preload = 'auto';
    meowAudio.volume = MEOW_VOLUME;
  }
  return meowAudio;
}

function playMeow() {
  if (hasCooldown('meow')) return;
  setCooldown('meow');
  emitVibration([5]);
  if (reducedMotion) return;

  const audio = getMeowAudio();
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// A real recorded paw-tap clip. Cloned per play (rather than reused like
// meowAudio) because taps can land in quick succession — the focus gesture
// pats twice ~150ms apart — and a shared element would cut itself off.
let pawTapAudio = null;

function getPawTapAudio() {
  if (!pawTapAudio) {
    pawTapAudio = new Audio(PAW_TAP_FILE);
    pawTapAudio.preload = 'auto';
  }
  return pawTapAudio;
}

function playPawTap() {
  if (hasCooldown('pawTap')) return;
  setCooldown('pawTap');
  emitVibration([3]);
  if (reducedMotion) return;

  const instance = getPawTapAudio().cloneNode(true);
  instance.volume = PAW_TAP_VOLUME;
  instance.play().catch(() => {});
}

// Subtle landing "boop" — a soft low pitch-drop plus a faint low thud, timed
// to the jump sequence's landing frame.
function playBoop() {
  if (hasCooldown('boop')) return;
  setCooldown('boop');
  emitVibration([6]);
  if (!audioUnlocked || reducedMotion || !audioCtx || !masterGain) return;

  const context = audioCtx;
  const nowTime = context.currentTime;

  const osc = context.createOscillator();
  const gainNode = context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(210, nowTime);
  osc.frequency.exponentialRampToValueAtTime(100, nowTime + 0.09);

  gainNode.gain.setValueAtTime(0.0001, nowTime);
  gainNode.gain.linearRampToValueAtTime(0.13, nowTime + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, nowTime + 0.13);

  osc.connect(gainNode);
  gainNode.connect(masterGain);
  osc.start(nowTime);
  osc.stop(nowTime + 0.15);
  osc.onended = () => {
    osc.disconnect();
    gainNode.disconnect();
  };

  playNoiseBurst({ duration: 0.05, volume: 0.035, filterType: 'lowpass', filterFreq: 220, filterQ: 0.7, attack: 0.002 });
}

// A tiny cheerful chime for a genuinely successful submission — three short
// ascending notes, quiet and quick rather than a game-y jingle.
function playChime() {
  if (hasCooldown('chime')) return;
  setCooldown('chime');
  emitVibration([6, 40, 6]);
  if (!audioUnlocked || reducedMotion || !audioCtx || !masterGain) return;

  const context = audioCtx;
  const startTime = context.currentTime;
  const notes = [660, 830, 990];

  notes.forEach((freq, i) => {
    const t = startTime + i * 0.075;
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.linearRampToValueAtTime(0.12, t + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
    osc.onended = () => {
      osc.disconnect();
      gainNode.disconnect();
    };
  });
}

function playShuffle() {
  if (hasCooldown('shuffle', 120)) return;
  setCooldown('shuffle');
  emitVibration([4]);
  if (!audioUnlocked || reducedMotion || !audioCtx || !masterGain) return;

  playTone({
    freq: 250 + Math.random() * 16 - 8,
    length: 0.04,
    type: 'triangle',
    volume: SCROLL_VOLUME * 1.2,
    attack: 0.002,
    release: 0.03,
    detune: Math.random() * 16 - 8
  });

  playNoiseBurst({
    duration: 0.032,
    volume: 0.038,
    filterType: 'highpass',
    filterFreq: 1600,
    filterQ: 1.1,
    attack: 0.0025
  });
}

// Very subtle purr ambience for the cat's settled/happy beat — a low tone
// with a gentle low-frequency tremolo so it reads as a rumble, not a drone.
function playPurr() {
  if (hasCooldown('purr', PURR_COOLDOWN_MS)) return;
  setCooldown('purr');
  if (!audioUnlocked || reducedMotion || !audioCtx || !masterGain) return;

  const context = audioCtx;
  const nowTime = context.currentTime;
  const duration = 1.4;

  const osc = context.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 95;

  const mainGain = context.createGain();
  mainGain.gain.setValueAtTime(0.0001, nowTime);
  mainGain.gain.linearRampToValueAtTime(0.032, nowTime + 0.3);
  mainGain.gain.setValueAtTime(0.032, nowTime + duration - 0.35);
  mainGain.gain.exponentialRampToValueAtTime(0.0001, nowTime + duration);

  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 26; // purr rumble rate

  const lfoGain = context.createGain();
  lfoGain.gain.value = 0.012; // gentle ripple on top of mainGain's envelope

  lfo.connect(lfoGain);
  lfoGain.connect(mainGain.gain);

  osc.connect(mainGain);
  mainGain.connect(masterGain);

  osc.start(nowTime);
  lfo.start(nowTime);
  osc.stop(nowTime + duration + 0.05);
  lfo.stop(nowTime + duration + 0.05);

  osc.onended = () => {
    osc.disconnect();
    mainGain.disconnect();
    lfo.disconnect();
    lfoGain.disconnect();
  };
}

const feedback = {
  init() {
    initAudioUnlock();
  },
  unlockAudio() {
    unlockAudio();
  },
  tap() {
    playPreset('tap');
  },
  type() {
    playPreset('type');
  },
  soft() {
    playPreset('soft');
  },
  success() {
    playChime();
  },
  error() {
    playPreset('error');
  },
  scroll() {
    playPreset('scroll');
  },
  shuffle() {
    playShuffle();
  },
  meow() {
    playMeow();
  },
  pawTap() {
    playPawTap();
  },
  boop() {
    playBoop();
  },
  purr() {
    playPurr();
  }
};

export default feedback;
