/**
 * Contact-form cat — a small canvas character that reacts to the form.
 *
 * The 14 authored poses in /public/cat are the source of truth; nothing here
 * redraws or distorts them. Movement comes from switching poses and
 * interpolating the anchor position, scale and rotation between them.
 *
 * Every pose is anchored to the baseline it was drawn standing on, so poses can
 * be swapped without the cat appearing to hop sideways.
 *
 * React owns the high-level state only. The rAF loop lives here and never
 * triggers a render.
 */

const MANIFEST = '/cat/frames.json';

// Logical animation space, scaled to whatever the canvas actually is.
// Headroom above GROUND_Y has to clear the tallest airborne pose at the top of
// its arc, or the cat gets cropped mid-jump.
const LOGICAL_W = 460;
const LOGICAL_H = 215;
const GROUND_Y = 180; // the "ledge" the cat peeks over and later sits on
const CENTER_X = 230;
const BASE_SCALE = 0.62;
const JUMP_HEIGHT = 42;

const F = {
  PEEK: 1,
  WAVE: 2,
  POINT: 3,
  TAP: 4,
  READY: 5,
  CROUCH: 6,
  TAKEOFF: 7,
  AIR: 8,
  LANDING: 9,
  SETTLE: 10,
  SIT: 11,
  BLINK: 12,
  TILT: 13,
  HAPPY: 14
};

/* ---------------------------------- easing --------------------------------- */

const easing = {
  linear: (t) => t,
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeInCubic: (t) => t * t * t,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  easeOutBack: (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2
};

const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

/* --------------------------------- keyframes -------------------------------- */
// step: { f: frameId, t: ms to reach it, x, y, s, r, e: easing name }
// x/y are offsets from (CENTER_X, GROUND_Y); s multiplies BASE_SCALE.

const step = (f, t, opts = {}) => ({
  f,
  t,
  x: opts.x ?? 0,
  y: opts.y ?? 0,
  s: opts.s ?? 1,
  r: opts.r ?? 0,
  e: opts.e ?? 'easeInOutCubic'
});

// Attention loop A — peek, wave, point, back.
const patternA = () => [
  step(F.PEEK, rand(500, 700)),
  step(F.WAVE, rand(450, 600)),
  step(F.POINT, rand(700, 900)),
  step(F.PEEK, rand(350, 500)),
  step(F.PEEK, rand(700, 1400))
];

// Attention loop B — more expressive, adds tap + get ready.
const patternB = () => [
  step(F.PEEK, 450),
  step(F.WAVE, 450),
  step(F.POINT, 650),
  step(F.TAP, 450),
  step(F.TAP, 260, { y: 3 }),
  step(F.READY, 700),
  step(F.PEEK, 450),
  step(F.PEEK, rand(600, 1200))
];

// Quieter loop — no wave, just a look and a small bob.
const patternC = () => [
  step(F.PEEK, 520),
  step(F.PEEK, 700, { y: -4 }),
  step(F.POINT, 700),
  step(F.PEEK, 480),
  step(F.PEEK, rand(900, 1600))
];

// The fake-out: crouches like it will jump, thinks better of it.
// Deliberately never reaches TAKEOFF/AIR/LANDING.
const patternFake = () => [
  step(F.PEEK, 480),
  step(F.POINT, 620),
  step(F.READY, rand(600, 800)),
  step(F.CROUCH, rand(450, 600), { y: 6, e: 'easeInCubic' }),
  step(F.CROUCH, rand(250, 400), { y: 6 }),
  step(F.CROUCH, 140, { y: -7, e: 'easeOutCubic' }), // tiny bounce sells the joke
  step(F.PEEK, 360, { e: 'easeOutCubic' }),
  step(F.PEEK, rand(900, 1500))
];

const IDLE_PATTERNS = [patternA, patternB, patternC, patternA, patternC];

// Focus nudge — short, never hijacks the user's typing.
const focusSequence = () => [
  step(F.POINT, 260, { e: 'easeOutCubic' }),
  step(F.TAP, 300),
  step(F.TAP, 220, { y: 3 }),
  step(F.READY, 420)
];

// The real jump. Arc is applied on top of these in the renderer.
const jumpSequence = () => [
  step(F.READY, 260, { e: 'easeOutCubic' }),
  step(F.CROUCH, 200, { y: 8, e: 'easeInCubic' }),
  step(F.TAKEOFF, 180, { e: 'easeOutCubic' }),
  step(F.AIR, 350),
  step(F.LANDING, 180, { e: 'easeInCubic' }),
  step(F.LANDING, 90, { y: 6, s: 0.97 }), // soft squash on impact
  step(F.SETTLE, 250, { e: 'easeOutCubic' }),
  step(F.SIT, 320, { e: 'easeOutCubic' })
];

// Slow waiting loop once seated.
const waitSequence = () => [
  step(F.SIT, rand(1800, 2500)),
  step(F.BLINK, rand(250, 350)),
  step(F.SIT, rand(700, 1100)),
  step(F.TILT, rand(700, 1000)),
  step(F.SIT, rand(1500, 2500))
];

const happySequence = () => [
  step(F.BLINK, 280),
  step(F.HAPPY, 420, { e: 'easeOutBack' }),
  step(F.HAPPY, rand(1600, 2400)),
  step(F.SIT, 600)
];

// Submission failed — a nudge back at the form, then normal idle.
const errorSequence = () => [
  step(F.POINT, 300, { e: 'easeOutCubic' }),
  step(F.POINT, 900),
  step(F.PEEK, 400)
];

/* -------------------------------- controller -------------------------------- */

export function createCatAnimation(canvas, { onSettled } = {}) {
  const ctx = canvas.getContext('2d');
  const frames = new Map();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let raf = null;
  let destroyed = false;
  let ready = false;

  let queue = [];
  let stepIndex = 0;
  let stepElapsed = 0;
  let last = 0;

  let mode = 'idle'; // idle | focus | jumping | waiting | happy | error
  let prevFrame = F.PEEK;
  let curFrame = F.PEEK;
  let settledFired = false;

  // Live transform, mutated in place — no per-frame allocation.
  const pose = { x: 0, y: 0, s: 1, r: 0, blend: 1 };

  /* ---- sizing ---- */
  let cssW = 0;
  let cssH = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = rect.width;
    cssH = rect.height;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- loading ---- */

  async function load() {
    const res = await fetch(MANIFEST);
    const list = await res.json();
    await Promise.all(
      list.map(
        (meta) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              frames.set(meta.id, { ...meta, img });
              resolve();
            };
            img.onerror = resolve;
            img.src = `/cat/${meta.file}`;
          })
      )
    );
    ready = frames.size > 0;
  }

  /* ---- queue ---- */

  function play(seq, nextMode) {
    queue = seq;
    stepIndex = 0;
    stepElapsed = 0;
    if (nextMode) mode = nextMode;
    prevFrame = curFrame;
  }

  function queueNextIdle() {
    // Fake jump shows up now and then rather than every cycle.
    const seq = Math.random() < 0.28 ? patternFake() : pick(IDLE_PATTERNS)();
    play(seq, 'idle');
  }

  function advance(dt) {
    if (!queue.length) return;
    stepElapsed += dt;
    const cur = queue[stepIndex];
    if (stepElapsed < cur.t) return;

    stepElapsed -= cur.t;
    stepIndex += 1;
    prevFrame = cur.f;

    if (stepIndex < queue.length) return;

    // Sequence finished — decide what comes next.
    if (mode === 'jumping') {
      mode = 'waiting';
      if (!settledFired) {
        settledFired = true;
        onSettled?.();
      }
      play(waitSequence(), 'waiting');
    } else if (mode === 'waiting') {
      // Occasionally a happy beat, otherwise keep waiting calmly.
      play(Math.random() < 0.35 ? happySequence() : waitSequence(), 'waiting');
    } else {
      queueNextIdle();
    }
  }

  /* ---- render ---- */

  function computePose() {
    if (!queue.length) return;
    const cur = queue[stepIndex] || queue[queue.length - 1];
    const p = Math.min(1, cur.t ? stepElapsed / cur.t : 1);
    const eased = (easing[cur.e] || easing.easeInOutCubic)(p);

    const from = stepIndex > 0 ? queue[stepIndex - 1] : null;
    const fx = from ? from.x : 0;
    const fy = from ? from.y : 0;
    const fs = from ? from.s : 1;
    const fr = from ? from.r : 0;

    pose.x = lerp(fx, cur.x, eased);
    pose.y = lerp(fy, cur.y, eased);
    pose.s = lerp(fs, cur.s, eased);
    pose.r = lerp(fr, cur.r, eased);

    // During the committed jump, ride an arc instead of a straight line.
    if (mode === 'jumping') {
      const air = [F.TAKEOFF, F.AIR, F.LANDING];
      const ai = air.indexOf(cur.f);
      if (ai !== -1) {
        const seg = (ai + p) / air.length;
        pose.y -= JUMP_HEIGHT * Math.sin(Math.PI * seg);
      }
    }

    curFrame = cur.f;
    // Crossfade fast relative to the move, so it reads as motion not ghosting.
    const fadeMs = Math.min(200, cur.t * 0.55);
    pose.blend = fadeMs > 0 ? Math.min(1, stepElapsed / fadeMs) : 1;
  }

  function drawFrame(id, alpha) {
    const f = frames.get(id);
    if (!f || alpha <= 0.002) return;
    const s = BASE_SCALE * pose.s;
    const w = f.width * s;
    const h = f.height * s;
    const x = CENTER_X + pose.x - f.anchorX * s;
    const y = GROUND_Y + pose.y - f.anchorY * s;

    ctx.save();
    ctx.globalAlpha = alpha;
    if (pose.r) {
      ctx.translate(CENTER_X + pose.x, GROUND_Y + pose.y);
      ctx.rotate(pose.r);
      ctx.translate(-(CENTER_X + pose.x), -(GROUND_Y + pose.y));
    }
    ctx.drawImage(f.img, x, y, w, h);
    ctx.restore();
  }

  function render() {
    const scale = cssW / LOGICAL_W;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.save();
    // Bottom-align: the baseline must land just above the form regardless of
    // canvas height, so spare room accrues above the cat, not below it.
    ctx.translate(0, cssH - LOGICAL_H * scale);
    ctx.scale(scale, scale);

    if (prevFrame !== curFrame && pose.blend < 1) {
      drawFrame(prevFrame, 1 - pose.blend);
    }
    drawFrame(curFrame, 1);
    ctx.restore();
  }

  function loop(now) {
    if (destroyed) return;
    const dt = last ? Math.min(now - last, 64) : 16; // clamp tab-switch spikes
    last = now;

    advance(dt);
    computePose();
    render();

    raf = requestAnimationFrame(loop);
  }

  /* ---- public API ---- */

  const api = {
    focus() {
      if (mode === 'idle') play(focusSequence(), 'focus');
    },
    submitSuccess() {
      if (mode === 'jumping' || mode === 'waiting' || mode === 'happy') return;
      settledFired = false;
      play(jumpSequence(), 'jumping');
    },
    submitError() {
      if (mode === 'jumping' || mode === 'waiting') return;
      play(errorSequence(), 'error');
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    }
  };

  // Reduced motion: no choreography, just the calm seated cat.
  if (reduceMotion.matches) {
    load().then(() => {
      if (destroyed) return;
      resize();
      curFrame = F.SIT;
      prevFrame = F.SIT;
      pose.blend = 1;
      render();
    });
    window.addEventListener('resize', () => {
      resize();
      render();
    });
    return {
      focus() {},
      submitSuccess() {
        onSettled?.();
        curFrame = F.HAPPY;
        prevFrame = F.HAPPY;
        render();
      },
      submitError() {},
      destroy: api.destroy
    };
  }

  resize();
  window.addEventListener('resize', resize);
  load().then(() => {
    if (destroyed || !ready) return;
    queueNextIdle();
    raf = requestAnimationFrame(loop);
  });

  return api;
}
