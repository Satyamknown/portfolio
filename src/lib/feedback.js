const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SOUND_COOLDOWN_MS = 80;
const BASE_VOLUME = 0.18;
const CAT_VOLUME = 0.22;
const SCROLL_VOLUME = 0.14;

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
  success: { freq: 280, length: 0.1, type: 'triangle', volume: BASE_VOLUME * 1.1, attack: 0.003, release: 0.09 },
  error: { freq: 140, length: 0.1, type: 'sine', volume: BASE_VOLUME * 0.95, attack: 0.004, release: 0.1 },
  scroll: { freq: 220, length: 0.05, type: 'triangle', volume: SCROLL_VOLUME, attack: 0.002, release: 0.04 },
  meow: { freq: 520, length: 0.11, type: 'triangle', volume: CAT_VOLUME, attack: 0.006, release: 0.08 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const now = () => performance.now();

function hasCooldown(key) {
  const last = cooldowns.get(key) || 0;
  return now() - last < SOUND_COOLDOWN_MS;
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
    if (name === 'soft' || name === 'meow') emitVibration([5]);
  }

  if (!audioUnlocked) return;
  playTone({ ...preset, volume, detune: opts.detune ?? (Math.random() * 10 - 5) });
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
    playPreset('success');
  },
  error() {
    playPreset('error');
  },
  scroll() {
    playPreset('scroll');
  },
  meow() {
    playPreset('meow', { detune: Math.random() * 24 - 12 });
  }
};

export default feedback;
