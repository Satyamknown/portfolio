// Sound for the /design front door, made in code with Web Audio (no files to load): the crate's
// thud on the grass, the folders' paper-and-cardboard rattle, a soft pop as a folder lifts, a whoosh
// when a card flies out or the planet rolls, the banner plane's propeller, and a small chime when
// the Hire me form goes through. Browsers only allow sound after a click, so the loader ends on an
// Enter button that calls unlock(). The visitor can switch it off; the choice is remembered.
const KEY = 'designSound';

let ctx = null;
let master = null;
let noiseBuf = null;
let engine = null;
let on = true;
try {
  on = window.localStorage.getItem(KEY) !== 'off';
} catch {
  /* private window: sound on, not remembered */
}
const listeners = new Set();

const ready = () => ctx && ctx.state === 'running' && on;

function noise() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

// a burst of filtered noise with a quick attack and an exponential tail
function burst({ at = 0, dur = 0.2, type = 'lowpass', freq = 800, q = 0.7, gain = 0.3, sweep = null }) {
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noise();
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.012, dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.5, dur + 0.05);
}

function tone({ at = 0, dur = 0.2, type = 'sine', from = 200, to = null, gain = 0.2, attack = 0.005 }) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let lastRattle = 0;
let lastPop = 0;

const sound = {
  get on() {
    return on;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  // call from a click: creates or wakes the audio
  unlock() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = on ? 0.7 : 0;
        master.connect(ctx.destination);
      }
      if (ctx.state !== 'running') ctx.resume();
    } catch {
      ctx = null;
    }
  },
  set(value) {
    on = value;
    try {
      window.localStorage.setItem(KEY, on ? 'on' : 'off');
    } catch {
      /* not remembered */
    }
    if (on) this.unlock();
    if (master) master.gain.setTargetAtTime(on ? 0.7 : 0, ctx.currentTime, 0.05);
    listeners.forEach((fn) => fn(on));
  },
  // the crate landing on the grass: a deep thump and a soft brush of turf
  thud(k = 1) {
    if (!ready()) return;
    tone({ dur: 0.45, from: 92, to: 38, gain: 0.55 * k, attack: 0.004 });
    tone({ dur: 0.16, type: 'triangle', from: 180, to: 90, gain: 0.18 * k });
    burst({ dur: 0.22, freq: 900, sweep: 260, gain: 0.32 * k });
    burst({ at: 0.02, dur: 0.35, type: 'bandpass', freq: 2600, q: 0.6, gain: 0.05 * k }); // the grass
  },
  // folders knocking about in the crate: dry paper flicks and little cardboard knocks
  rattle(k = 1) {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastRattle < 70) return;
    lastRattle = now;
    const n = 2 + Math.round(Math.random() * 2 * k);
    for (let i = 0; i < n; i++) {
      const at = Math.random() * 0.12;
      burst({ at, dur: 0.05 + Math.random() * 0.05, type: 'bandpass', freq: 1800 + Math.random() * 2600, q: 1.2, gain: 0.07 * k });
      if (Math.random() < 0.5) tone({ at, dur: 0.05, type: 'triangle', from: 260 + Math.random() * 220, gain: 0.05 * k });
    }
  },
  // a folder lifting out of the crate
  pop() {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastPop < 90) return;
    lastPop = now;
    burst({ dur: 0.09, type: 'bandpass', freq: 3200, q: 1.4, gain: 0.05 });
    tone({ dur: 0.1, from: 520, to: 780, gain: 0.05 });
  },
  // air moving: a card flying out, the planet rolling
  whoosh(dur = 1.2, k = 1) {
    if (!ready()) return;
    burst({ dur, type: 'bandpass', freq: 300, sweep: 1600, q: 0.8, gain: 0.12 * k });
    burst({ at: dur * 0.15, dur: dur * 0.8, type: 'lowpass', freq: 500, sweep: 180, gain: 0.08 * k });
  },
  // the form went through
  chime() {
    if (!ready()) return;
    tone({ dur: 0.9, from: 784, gain: 0.08, attack: 0.01 });
    tone({ at: 0.12, dur: 1.1, from: 1175, gain: 0.07, attack: 0.01 });
  },
  // the banner plane's propeller: a buzzing note pulsed at the blade rate. level 0..1, pitch ~1
  engine(level, pitch = 1) {
    if (!ctx || !master) return;
    if (!engine) {
      if (level <= 0.001 || ctx.state !== 'running') return;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 520;
      const am = ctx.createGain();
      am.gain.value = 0.6;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 26;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.4;
      lfo.connect(lfoGain).connect(am.gain);
      const g = ctx.createGain();
      g.gain.value = 0;
      o.connect(f).connect(am).connect(g).connect(master);
      o.start();
      lfo.start();
      engine = { o, lfo, f, g };
    }
    const t = ctx.currentTime;
    const v = on ? Math.max(0, Math.min(1, level)) * 0.07 : 0;
    engine.g.gain.setTargetAtTime(v, t, 0.12);
    engine.o.frequency.setTargetAtTime(78 * pitch, t, 0.15);
    engine.lfo.frequency.setTargetAtTime(26 * pitch, t, 0.15);
    engine.f.frequency.setTargetAtTime(420 + 500 * pitch * Math.max(0.3, level), t, 0.15);
  },
};

export default sound;
