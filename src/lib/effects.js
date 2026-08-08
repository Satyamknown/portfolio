// Homepage-only interaction effects from the design handoff: custom cursor,
// sticker trail, smooth-scroll lerp, and scroll drift on work cards.
// Desktop (pointer:fine) only. Returns a cleanup function; everything here is
// module-local DOM state, deliberately outside React.

const STICKERS = ['やあ!', '✳', '→', '☺', '★', 'デザイン', '✌', 'PM', '♪'];
const STICKER_COLORS = ['#35c24a', '#1a1815', '#35c24a'];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// Where each stage of the showreel sits along the scroll track (0 → 1).
const GROW_END = 0.42; // pill has become fullscreen
const EXIT_START = 0.72; // fullscreen starts shrinking away
const TRACK_VH = 1.7; // scroll distance the whole sequence occupies

/**
 * Drives the hero capsule: it grows from its pill footprint to a fullscreen
 * showreel, holds, then shrinks and fades upward so Selected Work follows.
 *
 * The reel is lifted to position:fixed and its geometry is written every frame
 * from the slot's live rect, so it reads as one continuous element rather than
 * a swap between two.
 */
export function initReel({ slot, reel, track, fadeOut = [] }) {
  if (!slot || !reel || !track) return () => {};

  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  const narrow = window.matchMedia('(max-width:920px)');

  let raf = null;
  let running = false;

  const clear = () => {
    reel.classList.remove('is-driving');
    reel.removeAttribute('style');
    track.style.height = '';
    fadeOut.forEach((el) => el && (el.style.opacity = ''));
  };

  const draw = () => {
    raf = null;
    // A frame queued just before cleanup would otherwise keep rescheduling
    // itself forever — StrictMode's double-invoke makes that easy to hit.
    if (!running) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const end = Math.max(1, track.offsetTop + track.offsetHeight - vh);
    const p = clamp(window.scrollY / end, 0, 1);

    // Hero copy steps aside early so the video isn't competing with it.
    const textFade = 1 - easeInOut(clamp(p / 0.3, 0, 1));
    fadeOut.forEach((el) => el && (el.style.opacity = String(textFade)));

    if (p <= 0) {
      reel.classList.remove('is-driving');
      reel.removeAttribute('style');
      raf = requestAnimationFrame(draw);
      return;
    }

    reel.classList.add('is-driving');

    // Rest geometry is wherever the in-flow slot currently is.
    const s = slot.getBoundingClientRect();
    const grow = easeInOut(clamp(p / GROW_END, 0, 1));

    const w = lerp(s.width, vw, grow);
    const h = lerp(s.height, vh, grow);
    const left = lerp(s.left, 0, grow);
    const top = lerp(s.top, 0, grow);
    let radius = lerp(200, 0, grow);

    let opacity = 1;
    let transform = 'none';
    if (p > EXIT_START) {
      const exit = easeInOut(clamp((p - EXIT_START) / (1 - EXIT_START), 0, 1));
      opacity = 1 - exit;
      radius = lerp(0, 28, exit);
      transform = `translateY(${(-exit * 12).toFixed(2)}vh) scale(${lerp(1, 0.88, exit).toFixed(4)})`;
    }

    reel.style.position = 'fixed';
    reel.style.zIndex = '30';
    // inset is a shorthand for top/right/bottom/left, so it has to be cleared
    // before the explicit left/top below — not after, or it wipes them.
    reel.style.inset = 'auto';
    reel.style.left = `${left.toFixed(1)}px`;
    reel.style.top = `${top.toFixed(1)}px`;
    reel.style.width = `${w.toFixed(1)}px`;
    reel.style.height = `${h.toFixed(1)}px`;
    reel.style.borderRadius = `${radius.toFixed(1)}px`;
    reel.style.opacity = opacity.toFixed(3);
    reel.style.transform = transform;
    reel.style.pointerEvents = p > 0.05 ? 'none' : '';
    reel.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';

    raf = requestAnimationFrame(draw);
  };

  const start = () => {
    if (running) return;
    running = true;
    track.style.height = `${TRACK_VH * 100}vh`;
    raf = requestAnimationFrame(draw);
  };

  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    clear();
  };

  const sync = () => (narrow.matches || reduced.matches ? stop() : start());

  sync();
  narrow.addEventListener('change', sync);
  reduced.addEventListener('change', sync);

  return () => {
    narrow.removeEventListener('change', sync);
    reduced.removeEventListener('change', sync);
    stop();
  };
}

export function initHomeEffects(root) {
  const cleanups = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;

  // ---- Scroll drift on work cards ----
  if (!reducedMotion) {
    const driftEls = () => (root ? Array.from(root.querySelectorAll('[data-drift]')) : []);
    const onScroll = () => {
      const vh = window.innerHeight;
      driftEls().forEach((el) => {
        const speed = parseFloat(el.dataset.drift) || 0;
        const r = el.getBoundingClientRect();
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translateY(${(-progress * speed * 100).toFixed(1)}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener('scroll', onScroll));
  }

  // ---- Smooth-scroll lerp (desktop only) ----
  if (!reducedMotion && finePointer) {
    let cur = window.scrollY;
    let target = window.scrollY;
    let raf;
    const onWheel = (e) => {
      // Let inner scrollables (editor preview etc.) behave normally
      if (e.target.closest && e.target.closest('.editor, textarea')) return;
      e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target + e.deltaY));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    const loop = () => {
      if (Math.abs(window.scrollY - Math.round(cur)) > 3) cur = target = window.scrollY;
      const diff = target - cur;
      if (Math.abs(diff) > 0.3) {
        cur += diff * 0.11;
        window.scrollTo({ top: cur, behavior: 'instant' });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    cleanups.push(() => {
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf);
    });
  }

  // ---- Custom cursor + sticker trail (desktop only) ----
  if (finePointer) {
    document.body.classList.add('fx-cursor');

    const dot = document.createElement('div');
    dot.style.cssText =
      'position:fixed;z-index:9999;width:8px;height:8px;border-radius:50%;background:#1a1815;pointer-events:none;left:0;top:0;transform:translate(-100px,-100px);';

    const ring = document.createElement('div');
    ring.style.cssText =
      'position:fixed;z-index:9998;width:38px;height:38px;border-radius:50%;border:1.5px solid #35c24a;pointer-events:none;left:0;top:0;display:flex;align-items:center;justify-content:center;transform:translate(-100px,-100px);transition:width 0.25s,height 0.25s,background 0.25s;font-family:"IBM Plex Mono",monospace;font-size:11px;color:#f4f2ed;';

    const star = document.createElement('div');
    star.textContent = '✳';
    star.style.cssText =
      'position:absolute;top:-7px;right:-7px;font-size:14px;color:#35c24a;animation:spinSlow 5s linear infinite;';
    ring.appendChild(star);
    const label = document.createElement('span');
    ring.appendChild(label);
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    const onMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      const t = e.target.closest ? e.target.closest('a, button') : null;
      const card = t && t.closest('#work') && t.querySelector('.work-card-img');
      if (card) {
        ring.style.width = '74px';
        ring.style.height = '74px';
        ring.style.background = 'rgba(53,194,74,0.92)';
        label.textContent = 'view';
        star.style.display = 'none';
      } else if (t) {
        ring.style.width = '56px';
        ring.style.height = '56px';
        ring.style.background = 'rgba(53,194,74,0.15)';
        label.textContent = '';
        star.style.display = 'block';
      } else {
        ring.style.width = '38px';
        ring.style.height = '38px';
        ring.style.background = 'transparent';
        label.textContent = '';
        star.style.display = 'block';
      }
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let si = 0;
    let lastX = -999;
    let lastY = -999;
    const onStickerMove = (e) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy > 8100) {
        lastX = e.clientX;
        lastY = e.clientY;
        const s = document.createElement('div');
        s.textContent = STICKERS[si % STICKERS.length];
        const rot = (Math.random() * 40 - 20).toFixed(0) + 'deg';
        s.style.cssText = `position:fixed;z-index:9997;left:${e.clientX + 10}px;top:${e.clientY - 26}px;pointer-events:none;font-family:'Yomogi','Caveat',cursive;font-weight:700;font-size:${20 + Math.random() * 14}px;color:${STICKER_COLORS[si % STICKER_COLORS.length]};--rot:${rot};animation:stickerPop 0.8s ease-out forwards;transform-origin:center;`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 820);
        si++;
      }
    };
    if (!reducedMotion) window.addEventListener('mousemove', onStickerMove, { passive: true });

    let cursorRaf;
    const follow = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px)`;
      cursorRaf = requestAnimationFrame(follow);
    };
    cursorRaf = requestAnimationFrame(follow);

    cleanups.push(() => {
      document.body.classList.remove('fx-cursor');
      dot.remove();
      ring.remove();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', onStickerMove);
      cancelAnimationFrame(cursorRaf);
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
