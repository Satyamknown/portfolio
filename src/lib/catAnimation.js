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
// its arc, or the cat gets cropped mid-jump. The canvas carries a matching
// aspect-ratio in CSS so this box always maps exactly onto it.
const LOGICAL_W = 360;
const LOGICAL_H = 250;
const GROUND_Y = 215; // the "ledge" the cat peeks over and later sits on
const CENTER_X = 180;
const BASE_SCALE = 0.78;
const JUMP_HEIGHT = 55;

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

// Pacing is deliberately slow: the cat should read as a calm character, not a
// twitchy loop. Poses hold long enough to register, and idle poses stay on the
// baseline — no bobbing — so the canvas looks still between beats.

// Attention loop A — peek, wave, point, back.
const patternA = () => [
  step(F.PEEK, 1200),
  step(F.WAVE, 900),
  step(F.POINT, 1500),
  step(F.PEEK, 900),
  step(F.PEEK, rand(2400, 3600))
];

// Attention loop B — more expressive, adds tap + get ready.
const patternB = () => [
  step(F.PEEK, 1000),
  step(F.WAVE, 900),
  step(F.POINT, 1400),
  step(F.TAP, 1000),
  step(F.READY, 1500),
  step(F.PEEK, 900),
  step(F.PEEK, rand(2200, 3400))
];

// Quietest loop — just a look at the form and a long settle.
const patternC = () => [
  step(F.PEEK, 1300),
  step(F.POINT, 1500),
  step(F.PEEK, 1000),
  step(F.PEEK, rand(3000, 4200))
];

// The fake-out: crouches like it will jump, thinks better of it.
// Deliberately never reaches TAKEOFF/AIR/LANDING.
const patternFake = () => [
  step(F.PEEK, 1000),
  step(F.POINT, 1300),
  step(F.READY, 1400),
  step(F.CROUCH, 900, { y: 5, e: 'easeInCubic' }),
  step(F.CROUCH, 700, { y: 5 }),
  step(F.CROUCH, 220, { y: -5, e: 'easeOutCubic' }), // tiny bounce sells the joke
  step(F.PEEK, 700, { e: 'easeOutCubic' }),
  step(F.PEEK, rand(2600, 3600))
];

const IDLE_PATTERNS = [patternA, patternB, patternC, patternA, patternC];

/* ---------------------------------- voice ---------------------------------- */
// The cat's entire worldview: filling the form gets it fed.

const LINES = {
  idle: [
    'fill this in and i get fed. that is the whole deal.',
    'he only feeds me when someone writes in. no pressure.',
    'still empty. still starving.',
    'one form, one bowl of food. i do not make the rules.'
  ],
  fake: ['i was going to jump. i thought better of it.'],
  focus: ['YES. right there. keep going.'],
  jump: ['SUBMITTED!! FOOD!!'],
  settled: ['thank you! abhishek is feeding me now — he will reply soon. 🐾'],
  happy: ['worth it. 10/10 would peek again.'],
  error: ['that did not go through. try again? i am still hungry.']
};

// Idle chatter is rate-limited so a line stays up long enough to actually read.
// Reactions to what the user did (focus, submit, failure) bypass this.
const IDLE_LINE_GAP_MS = 14000;

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

export function createCatAnimation(canvas, { onSettled, onSay } = {}) {
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
  let lastLine = null;
  let lastSaidAt = -Infinity;

  const stage = canvas.parentElement;
  let tallPose = null;

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

  function say(bucket, throttled = false) {
    const now = performance.now();
    if (throttled && now - lastSaidAt < IDLE_LINE_GAP_MS) return;
    const line = pick(LINES[bucket]);
    if (line === lastLine) return;
    lastLine = line;
    lastSaidAt = now;
    onSay?.(line);
  }

  function play(seq, nextMode, lineBucket) {
    queue = seq;
    stepIndex = 0;
    stepElapsed = 0;
    if (nextMode) mode = nextMode;
    prevFrame = curFrame;
    if (lineBucket) say(lineBucket);
  }

  function queueNextIdle() {
    // Fake jump shows up now and then rather than every cycle.
    const fake = Math.random() < 0.25;
    queue = fake ? patternFake() : pick(IDLE_PATTERNS)();
    stepIndex = 0;
    stepElapsed = 0;
    mode = 'idle';
    prevFrame = curFrame;
    say(fake ? 'fake' : 'idle', true); // throttled — idle chatter stays readable
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
      play(waitSequence(), 'waiting', 'settled');
    } else if (mode === 'waiting') {
      // Occasionally a happy beat, otherwise keep waiting calmly.
      const glad = Math.random() < 0.35;
      play(glad ? happySequence() : waitSequence(), 'waiting', glad ? 'happy' : null);
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

  // The bubble sits at one of two fixed heights rather than chasing the head
  // every frame — tracking per-frame made the whole canvas look restless.
  // Short poses (peeking over the ledge) use the low spot; the tall seated
  // poses use the high one, and CSS eases the single change between them.
  const TALL_POSES = new Set([F.LANDING, F.SETTLE, F.SIT, F.BLINK, F.TILT, F.HAPPY]);

  function publishStance() {
    if (!stage) return;
    const tall = TALL_POSES.has(curFrame);
    if (tall === tallPose) return;
    tallPose = tall;
    stage.dataset.stance = tall ? 'tall' : 'low';
  }

  function render() {
    const scale = cssW / LOGICAL_W;
    // Bottom-align: the baseline must land just above the form regardless of
    // canvas height, so spare room accrues above the cat, not below it.
    const offsetY = cssH - LOGICAL_H * scale;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.translate(0, offsetY);
    ctx.scale(scale, scale);

    if (prevFrame !== curFrame && pose.blend < 1) {
      drawFrame(prevFrame, 1 - pose.blend);
    }
    drawFrame(curFrame, 1);
    ctx.restore();

    publishStance();
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
      if (mode === 'idle') play(focusSequence(), 'focus', 'focus');
    },
    submitSuccess() {
      if (mode === 'jumping' || mode === 'waiting' || mode === 'happy') return;
      settledFired = false;
      play(jumpSequence(), 'jumping', 'jump');
    },
    submitError() {
      if (mode === 'jumping' || mode === 'waiting') return;
      play(errorSequence(), 'error', 'error');
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
      say('idle');
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
        say('settled');
      },
      submitError() {
        say('error');
      },
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
