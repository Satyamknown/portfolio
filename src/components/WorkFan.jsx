import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

// A hand-of-cards spread for Selected Work. Ports the fan/hover physics from
// a Tailwind reference component onto this site's own markup and CSS
// vocabulary (work-card / work-card-img, mono labels, hairline borders) —
// see index.css "Selected Work — fan carousel" for the paired styles.
//
// Positioning is done in plain pixels rather than GSAP's xPercent/yPercent
// centering trick: this environment doesn't compose xPercent/yPercent with a
// rem-string x/y target into a real transform (it resolves to identity), so
// the center point is computed from the container/card's actual rendered
// box instead and baked into a single numeric x/y per card.

const pad = (n, w) => String(n).padStart(w, '0');

const MAX_VISIBLE = 7;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 }
];

// How many cards the fan shows at once. Seven only fits on a desktop-width
// container; cramming that many into a phone leaves each card unreadable and
// pushes the outer ones off both edges, so narrow screens show a shallower
// hand. The deck still revolves through every project either way.
function getVisibleSlots(width) {
  if (width < 640) return 3;
  if (width < 1024) return 5;
  return MAX_VISIBLE;
}

// Horizontal spread, as a fraction of the base x offsets. Tuned per
// breakpoint so the outermost card stays inside the container: the widest
// slot sits at 30 * multiplier rem from center.
function getResponsiveMultiplier(width) {
  if (width < 400) return 0.13;
  if (width < 640) return 0.16;
  if (width < 768) return 0.34;
  if (width < 1024) return 0.44;
  return 1.0;
}

function getHeightMultiplier(width) {
  let idealPx;
  if (width < 480) idealPx = 15 * 16;
  else if (width < 640) idealPx = 17 * 16;
  else if (width < 768) idealPx = 18 * 16;
  else if (width < 1024) idealPx = 21 * 16;
  else idealPx = 23 * 16;

  const available = window.innerHeight * 0.55;
  if (available >= idealPx) return 1;
  return available / idealPx;
}

// A three- or five-card hand wants a gentler arc than a seven-card one —
// reusing the full rotation/drop at low counts makes the outer cards dive
// below the deck and collide with the rail and caption beneath it.
function arcFor(slotCount) {
  if (slotCount <= 3) return { rot: 14, drop: 3.4 };
  if (slotCount <= 5) return { rot: 18, drop: 5.2 };
  return { rot: 21, drop: 7.3 };
}

function getSlotConfig(slotCount, slot) {
  if (slotCount >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = slotCount >> 1;
  const distance = slotCount > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  const { rot, drop } = arcFor(slotCount);
  return {
    rot: distance * rot,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * drop,
    zIndex: 10 - Math.abs(slot - center)
  };
}

function rootFontSize() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

export default function WorkFan({ projects }) {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef(null);
  const prevVisible = useRef(new Set());

  const totalCards = projects.length;

  const [centerIndex, setCenterIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const centerRef = useRef(0);

  // Hand width is viewport-dependent, so it has to live in state — changing
  // it rebuilds the visible window. Resize is rare enough that a render here
  // costs nothing (unlike scroll, which never sets state per event).
  const [visibleSlots, setVisibleSlots] = useState(() =>
    typeof window === 'undefined' ? MAX_VISIBLE : getVisibleSlots(window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setVisibleSlots(getVisibleSlots(window.innerWidth));
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The fan always revolves, whatever the count: the window is as wide as the
  // deck (capped at the breakpoint's slot count) and rotates around
  // centerIndex, so every project takes a turn in the upright center slot.
  const slotCount = Math.min(totalCards, visibleSlots);
  const half = slotCount >> 1;

  const getVisibleMap = useCallback(
    (center) => {
      const map = new Map();
      for (let slot = 0; slot < slotCount; slot++) {
        map.set(((center + slot - half) % totalCards + totalCards) % totalCards, slot);
      }
      return map;
    },
    [totalCards, slotCount, half]
  );

  // ---- Scroll drives the rotation ----
  // The deck is pinned for a runway proportional to the project count; scroll
  // progress across that runway maps straight onto centerIndex, so every
  // project is highlighted in turn without the reader clicking anything.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || totalCards < 2) return undefined;

    let raf = null;

    const measure = () => {
      raf = null;
      const rect = scrollEl.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      if (runway <= 0) return;

      const p = Math.max(0, Math.min(1, -rect.top / runway));
      const next = Math.round(p * (totalCards - 1));
      if (next === centerRef.current) return;

      directionRef.current = next > centerRef.current ? 'right' : 'left';
      centerRef.current = next;
      // Only a handful of state writes across the whole runway — the scroll
      // handler itself never sets state per event.
      setCenterIndex(next);
    };

    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [totalCards]);

  // The caption follows whatever's hovered; falls back to the centered
  // project once the pointer leaves.
  useEffect(() => {
    setFocusIndex(centerIndex);
  }, [centerIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return undefined;

    const cardElements = Array.from(container.querySelectorAll('.fan-card'));
    if (!cardElements.length) return undefined;

    // GSAP tweens aren't touched by the site's global CSS
    // prefers-reduced-motion rule (that only zeroes CSS animation/transition
    // durations) — gate them here instead, same as effects.js and the cat.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = (el, vars) => {
      if (reduceMotion) {
        const { duration: _duration, ease: _ease, delay: _delay, onComplete, ...rest } = vars;
        gsap.set(el, rest);
        onComplete?.();
      } else {
        gsap.to(el, vars);
      }
    };

    // Anchor point: the container's own center, in its local coordinate
    // space. Card width/height come from offsetWidth/Height, which reflect
    // the untransformed layout box regardless of any scale already applied.
    const containerBox = { w: container.offsetWidth, h: container.offsetHeight };
    const cardBox = { w: cardElements[0].offsetWidth, h: cardElements[0].offsetHeight };
    const anchorX = containerBox.w / 2 - cardBox.w / 2;
    const rem = rootFontSize();

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const config = (slot) => getSlotConfig(slotCount, slot);

    // Only the centre card sits at the anchor; every other slot is pushed
    // *down* by the arc. Centring the card alone therefore hangs the outer
    // cards out of the bottom of the box and onto the rail below, so lift
    // the whole deck by half the arc to balance it inside the container.
    const maxDrop = (slotCount >= MAX_VISIBLE ? 7.3 : arcFor(slotCount).drop) * hMult * rem;
    const anchorY = containerBox.h / 2 - cardBox.h / 2 - maxDrop * 0.5;

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: anchorX + x * multiplier * rem,
          y: anchorY + y * hMult * rem,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex
        };

        // overwrite:'auto' throughout: a fast scroll can queue enter/exit
        // tweens on the same card faster than they finish, and without it a
        // stale tween can win and strand a card at full opacity on top of
        // the deck. One live positional tween per card, always.
        if (isFirstMount) {
          gsap.set(card, { x: anchorX, y: anchorY + 8 * hMult * rem, rotation: 0, scale: 0.5, opacity: 0 });
          animate(card, { ...target, duration: 1.2, ease: 'elastic.out(1.05,.78)', delay: 0.2 + slot * 0.06, overwrite: 'auto', onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === 'right' ? 34 : -34;
          gsap.set(card, {
            x: anchorX + enterX * rem,
            y: anchorY + y * hMult * rem,
            rotation: direction === 'right' ? 30 : -30,
            scale: 0.5,
            opacity: 0
          });
          animate(card, { ...target, duration: 0.6, ease: 'power2.out', overwrite: 'auto', onComplete: onCardDone });
        } else {
          animate(card, { ...target, duration: 0.5, ease: 'power2.out', overwrite: 'auto', onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === 'right' ? -34 : 34;
        animate(card, {
          x: anchorX + exitX * rem,
          opacity: 0,
          scale: 0.5,
          rotation: direction === 'right' ? -30 : 30,
          duration: 0.4,
          ease: 'power2.in',
          zIndex: 0,
          overwrite: 'auto'
        });
      } else {
        // Anything outside the window that isn't animating out gets hidden
        // outright. This has to be an unconditional else: StrictMode's
        // double-invoke (and a slot-count change on resize) can overwrite
        // prevVisible before the second pass, leaving a card that is neither
        // "visible" nor "was visible" stranded at full opacity on top of the
        // deck if we only handled the first-mount case here.
        gsap.killTweensOf(card);
        gsap.set(card, { x: anchorX, y: anchorY, opacity: 0, scale: 0.3, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Hover interactions — the fan splays away from whichever card is under
    // the pointer, and the caption below follows it.
    const visibleEntries = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot, cardIndex: i });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot = null;
    let leaveTimer = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot) => {
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 1.8 * hM;
            targetScale *= 1.08;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        animate(el, {
          x: anchorX + targetX * rem,
          y: anchorY + targetY * rem,
          rotation: targetRot,
          scale: targetScale,
          duration: 0.5,
          delay,
          ease: 'elastic.out(1,.75)',
          overwrite: 'auto'
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot, cardIndex }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
        if (activeSlot !== slot) {
          activeSlot = slot;
          updateHoverLayout(slot);
          setFocusIndex(cardIndex);
        }
      };
      el.addEventListener('mouseenter', handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        activeSlot = null;
        updateHoverLayout(null);
        setFocusIndex(centerIndex);
      }, 50);
    };
    container.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => {
      if (!isAnimating.current) updateHoverLayout(activeSlot);
    };
    window.addEventListener('resize', onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener('mouseenter', handler));
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, slotCount]);

  if (!totalCards) return null;

  const focused = projects[focusIndex] || projects[0];

  return (
    <div
      className="fan-scroll"
      ref={scrollRef}
      style={{ '--fan-steps': Math.max(1, totalCards - 1) }}
    >
      <div className="fan-sticky">
        <div className="fan-wrap">
          <div ref={containerRef} className="fan-layout">
            {projects.map((p, index) => (
              <Link key={p._id} to={`/work/${p.slug}`} className="fan-card work-card" data-cursor="open-folder">
                <div className="work-card-img" style={{ aspectRatio: '3/4' }}>
                  <div className="img" style={{ backgroundImage: `url('${p.image}')` }} role="img" aria-label={p.title} />
                </div>
                <span className="fan-card-index">{pad(index + 1, 2)}</span>
              </Link>
            ))}
          </div>

          {/* Passive progress rail — shows how much of the deck is left.
              Deliberately not clickable: scroll is the only control. */}
          <div className="fan-rail" aria-hidden="true">
            {projects.map((_, i) => (
              <span key={i} className={`fan-tick ${i === centerIndex ? 'is-active' : ''}`} />
            ))}
          </div>

          {focused && (
            <Link to={`/work/${focused.slug}`} className="fan-caption" data-cursor="open-folder">
              <div className="fan-caption-row">
                <span className="work-card-title">{focused.title}</span>
                <span className="work-card-index">{pad(focusIndex + 1, 2)} / {pad(totalCards, 2)}</span>
              </div>
              {focused.tags?.length > 0 && <div className="work-card-tags">{focused.tags.join(' — ')}</div>}
              {focused.metrics?.length > 0 && (
                <div className="work-card-metrics">{focused.metrics.map((m) => `${m.value} ${m.label}`).join(' · ')}</div>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
