// Context-aware custom cursor. Desktop (pointer:fine) only, vanilla DOM —
// deliberately outside React so high-frequency pointermove never triggers a
// render. Five states, driven by the closest ancestor's [data-cursor]:
// default (arrow), factory (hero H1), open-folder (project cards), and
// paw / paw-closed (contact). See index.css "Custom cursor" for sizing.
//
// setCursorState() is exported so a real interaction (form submit) can force
// the paw-closed state without wiring cursor logic into that component.

const ICONS = {
  default: `
    <polygon class="cc-body" points="6,3 6,36 14,28 19,40 25,37.5 20,26 31,26" />
  `,
  factory: `
    <g class="cc-body">
      <rect x="7" y="21" width="34" height="20" rx="1.5" />
      <rect x="11" y="8" width="6" height="15" />
      <rect x="21" y="12" width="6" height="11" />
      <rect x="31" y="8" width="6" height="15" />
    </g>
    <g class="cc-cut">
      <rect x="13" y="29" width="5" height="5" />
      <rect x="21.5" y="29" width="5" height="5" />
      <rect x="30" y="29" width="5" height="5" />
    </g>
  `,
  'open-folder': `
    <path class="cc-body" d="M5 17 L5 39 L43 39 L43 21 L23 21 L19 15 L5 15 Z" />
    <g transform="rotate(-8 24 12)">
      <rect class="cc-paper" x="15" y="3" width="20" height="15" rx="1" />
      <line class="cc-paperline" x1="18" y1="8" x2="30" y2="8" />
      <line class="cc-paperline" x1="18" y1="12" x2="26" y2="12" />
    </g>
  `,
  paw: `
    <g class="cc-body">
      <ellipse cx="24" cy="30" rx="13" ry="11" />
      <circle cx="10" cy="15" r="5.5" />
      <circle cx="20" cy="8" r="5.5" />
      <circle cx="29" cy="8" r="5.5" />
      <circle cx="38" cy="15" r="5.5" />
    </g>
    <ellipse class="cc-cut" cx="24" cy="31" rx="5.5" ry="4.5" />
  `,
  'paw-closed': `
    <path class="cc-body" d="M24 7 C35 7 42 15 42 26 C42 36 34 42 24 42 C14 42 6 36 6 26 C6 15 13 7 24 7 Z" />
    <g class="cc-cut" opacity="0.85">
      <circle cx="15" cy="16" r="2.6" />
      <circle cx="22" cy="10.5" r="2.6" />
      <circle cx="30" cy="10.5" r="2.6" />
      <circle cx="37" cy="16" r="2.6" />
    </g>
  `
};

let applyExternalState = null;

/** Forces a cursor state (e.g. on a real click) for `holdMs` before hover
 * detection is allowed to take back over. Purely visual — never wire real
 * interaction logic through this. */
export function setCursorState(name, holdMs = 700) {
  applyExternalState?.(name, holdMs);
}

export function initCustomCursor() {
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (!finePointer) return () => {};

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = reducedMotionQuery.matches;

  document.body.classList.add('cc-active');

  // Split in two: the outer element is repositioned every rAF frame (must
  // stay untransitioned or it'll lag behind the pointer); the inner element
  // only changes on a state swap, so it's free to CSS-transition its size
  // and the scale-down/up morph without fighting the per-frame position.
  const el = document.createElement('div');
  el.className = 'custom-cursor';
  const inner = document.createElement('div');
  inner.className = 'cc-inner cur-default';
  inner.innerHTML = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${ICONS.default}</svg>`;
  el.appendChild(inner);
  document.body.appendChild(el);

  let mx = -100;
  let my = -100;
  let cx = -100;
  let cy = -100;
  let raf = null;
  let currentState = 'default';
  let morphTimer = null;
  let holdUntil = 0;

  function setIcon(name) {
    inner.querySelector('svg').innerHTML = ICONS[name];
  }

  function applyState(name) {
    if (name === currentState) return;
    currentState = name;
    clearTimeout(morphTimer);

    if (reducedMotion) {
      setIcon(name);
      inner.className = `cc-inner cur-${name}`;
      return;
    }

    inner.classList.add('is-morphing');
    morphTimer = setTimeout(() => {
      setIcon(name);
      inner.className = `cc-inner cur-${name}`;
    }, 120);
  }

  applyExternalState = (name, holdMs) => {
    holdUntil = performance.now() + holdMs;
    applyState(name);
  };

  const onPointerMove = (e) => {
    mx = e.clientX;
    my = e.clientY;

    if (performance.now() < holdUntil) return;
    const target = e.target.closest ? e.target.closest('[data-cursor]') : null;
    applyState(target ? target.dataset.cursor : 'default');
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const loop = () => {
    const t = reducedMotion ? 1 : 0.22;
    cx += (mx - cx) * t;
    cy += (my - cy) * t;
    el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const onReducedMotionChange = () => {
    reducedMotion = reducedMotionQuery.matches;
  };
  reducedMotionQuery.addEventListener('change', onReducedMotionChange);

  return () => {
    document.body.classList.remove('cc-active');
    window.removeEventListener('pointermove', onPointerMove);
    reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
    if (raf) cancelAnimationFrame(raf);
    clearTimeout(morphTimer);
    applyExternalState = null;
    el.remove();
  };
}
