import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDesignHead from '../components/design/useDesignHead.js';
import '../design-home.css';

// The design portfolio's front door, one screen after another, the way it was designed on the canvas:
// 1. the hero, with the crate (a live three.js copy of the Blender model) peeking up from the
//    bottom half, logo side to the viewer; scrolling fades the headline away,
// 2. the scroll carries the crate up and turns it into the isometric pose; the folders rattle and settle,
// 3. then the caption comes in. The crate sits alone on its pedestal: no side columns.
// three.js and the model load lazily, after the hero is on screen, so the first paint stays light.

const BASE = '/design/home/';
// In folder order, back to front, as built in design-portfolio-blender/build.py (Stratalite is the
// front folder). Facts come from each published case study; fields left out are not known yet.
const PROJECTS = [
  {
    name: 'AI in my design workflow',
    slug: 'ai-design-workflow',
    kicker: 'Process · AI',
    lines: [
      'On Stratalite, AI browser agents mapped every screen of the live product, one role at a time.',
      'I kept the design calls: how the boards read, what counted as a problem, which gaps went to the client. I also built flowmap, the tool that turns captured screens into FigJam boards.',
    ],
    rows: [
      ['Years', '2026'],
      ['Role', 'Design Lead, Rsquare Web Studio'],
      ['Scope', 'Flow mapping, AI agents, tooling'],
    ],
  },
  {
    name: 'Cequens',
    slug: null,
    kicker: 'Product design · Communications platform',
    lines: ['A communications platform that lets businesses reach their customers over SMS, WhatsApp, voice and more.'],
    rows: [],
  },
  {
    name: 'Pacific Coast Contracting',
    slug: 'pacific-coast-contracting',
    kicker: 'Brand · Websites',
    lines: [
      'A Vancouver home-services contractor that came in for a rebrand.',
      'I recommended splitting it into four trade brands, planned each site from search demand, and shipped 88 pages across four websites with the dev team.',
    ],
    rows: [
      ['Years', '2025 – now'],
      ['Role', 'Design Lead, Rsquare Web Studio'],
      ['Scope', 'Brand structure, IA, page plans, visual design'],
    ],
  },
  {
    name: 'Skooltag',
    slug: 'skooltag',
    kicker: 'Product design · Retail app',
    lines: [
      'A Delhi NCR school-uniform shop, selling in person since 1989, moving online with an app parents can trust.',
      'I built the brand and the component library from zero, designed the parent app over five iterations, and handed off 85 screens with a clickable prototype.',
    ],
    rows: [
      ['Years', '2021 – 2022'],
      ['Role', 'UI/UX Designer, Student Junction'],
      ['Scope', 'Brand, component library, app UX/UI, prototyping'],
    ],
  },
  {
    name: 'RoohConnect',
    slug: null,
    kicker: 'Product design · Community',
    lines: ['A more intentional way to connect: helping the UK Muslim community find meaningful connections through shared values and future alignment.'],
    rows: [['Role', 'Senior product designer']],
  },
  {
    name: 'Stratalite',
    slug: 'stratalite',
    kicker: 'Product design · B2B SaaS',
    lines: [
      'A Vancouver marketplace where property companies post work and vendors complete it under their managers.',
      'I owned the UX and UI from the first whiteboard session to the screens now live in beta, and designed the access model behind five roles that each see a different product.',
    ],
    rows: [
      ['Years', '2026'],
      ['Role', 'Design Lead, Rsquare Web Studio'],
      ['Scope', 'Product UX, UI, access model, flows'],
    ],
  },
];


const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useFinePointer() {
  const q = '(hover: hover) and (pointer: fine)';
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setFine(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fine;
}

function Hero() {
  const ref = useRef(null);
  const inner = useRef(null);
  const [dot, setDot] = useState({ x: 0, y: 0, on: false });
  const fine = useFinePointer();

  // Scrolling away fades and lifts the headline, so the hero leaves before the crate arrives.
  useEffect(() => {
    if (reducedMotion()) return undefined;
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)));
        if (inner.current) {
          inner.current.style.opacity = String(1 - p);
          inner.current.style.transform = `translateY(${-60 * p}px)`;
        }
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => {
      window.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, []);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    setDot({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
  };
  return (
    <section
      ref={ref}
      className={`dh-screen dh-hero ${fine && dot.on ? 'is-dotted' : ''}`}
      onMouseMove={fine ? move : undefined}
      onMouseLeave={() => setDot((d) => ({ ...d, on: false }))}
    >
      <div ref={inner} className="dh-hero-in">
        <h1 className="dh-hero-title">
          <span className="dh-line">Lead product designer at Rsquare Web Studio.</span>
          <span className="dh-line dh-l2">Four years of building with purpose.</span>
        </h1>
      </div>
      {fine ? (
        <span
          className="dh-dot"
          aria-hidden="true"
          style={dot.on ? { transform: `translate(${dot.x - 12}px, ${dot.y - 12}px)` } : undefined}
        />
      ) : (
        <span className="dh-dot dh-dot--float" aria-hidden="true" />
      )}
    </section>
  );
}



// The order a visitor steps through projects: front folder first (Stratalite), then backwards.
const TOUR = PROJECTS.map((_, k) => PROJECTS.length - 1 - k);

// The project panel: opens on the right when a folder is clicked, written like a short CV entry.
// Previous and next step through the folders; Esc closes, the arrow keys step.
function ProjectPanel({ i, onClose, onOpenCase, onGo }) {
  const p = PROJECTS[i];
  const at = TOUR.indexOf(i);
  const prev = TOUR[(at - 1 + TOUR.length) % TOUR.length];
  const next = TOUR[(at + 1) % TOUR.length];
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onGo(next);
      if (e.key === 'ArrowLeft') onGo(prev);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose, onGo, next, prev]);
  return (
    <aside className="dh-panel" key={i} aria-labelledby="dh-panel-title">
      <div className="dh-panel-top">
        <span className="dh-panel-kicker">{p.kicker}</span>
        <button type="button" className="dh-panel-close" aria-label="Close project" onClick={onClose}>
          ×
        </button>
      </div>
      <h2 id="dh-panel-title" className="dh-panel-name" style={{ '--d': '60ms' }}>
        {p.name}
      </h2>
      {p.lines.map((t, k) => (
        <p key={k} className="dh-panel-line" style={{ '--d': `${120 + k * 70}ms` }}>
          {t}
        </p>
      ))}
      {p.rows.length > 0 && (
        <dl className="dh-panel-rows" style={{ '--d': '280ms' }}>
          {p.rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="dh-panel-end" style={{ '--d': '360ms' }}>
        {p.slug ? (
          <a href={`/design/${p.slug}`} onClick={(e) => { e.preventDefault(); onOpenCase(i); }}>
            View the whole case study <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="dh-panel-soon">Case study coming soon</span>
        )}
      </div>
      <nav className="dh-panel-steps" aria-label="Projects" style={{ '--d': '420ms' }}>
        <button type="button" onClick={() => onGo(prev)} aria-label={`Previous project: ${PROJECTS[prev].name}`}>
          <span aria-hidden="true">←</span> {PROJECTS[prev].name}
        </button>
        <span className="dh-panel-count" aria-hidden="true">
          {at + 1} / {TOUR.length}
        </span>
        <button type="button" onClick={() => onGo(next)} aria-label={`Next project: ${PROJECTS[next].name}`}>
          {PROJECTS[next].name} <span aria-hidden="true">→</span>
        </button>
      </nav>
    </aside>
  );
}

function Crate({ onSettled }) {
  const fine = useFinePointer();
  const navigate = useNavigate();
  const host = useRef(null);
  const wrap = useRef(null);
  const api = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState(-1);
  const [takeover, setTakeover] = useState(null);
  const [panel, setPanel] = useState(-1);
  const panelRef = useRef(-1);
  panelRef.current = panel;
  const touch = useRef(null);
  const n = PROJECTS.length;

  // Clicking a folder: its black cover grows out of the crate until it fills the screen, then the
  // case study opens under it (DesignDetail fades the black away).
  const open = useCallback(
    (i) => {
      const p = PROJECTS[i];
      if (!p.slug) return;
      const pts = api.current?.coverQuad(i);
      if (reducedMotion() || !pts) {
        navigate(`/design/${p.slug}`);
        return;
      }
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      const start = {
        left: Math.min(...xs),
        top: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
      setTakeover({ i, start, grown: false });
      requestAnimationFrame(() => requestAnimationFrame(() => setTakeover((t) => t && { ...t, grown: true })));
      setTimeout(() => {
        try {
          sessionStorage.setItem('dz-takeover', '1');
        } catch {
          /* fine without it: the case page just appears without the fade */
        }
        navigate(`/design/${p.slug}`);
      }, 720);
    },
    [navigate]
  );
  const openRef = useRef(open);
  openRef.current = open;

  // Load three.js and the model right after the page paints. The scroll then drives the crate
  // from its hero pose to its Work pose; the Work pose is wherever .dh-box sits in the layout.
  useEffect(() => {
    let alive = true;
    const layout = () => {
      const c = api.current;
      const b = wrap.current?.querySelector('.dh-box');
      if (!c || !b) return;
      const r = b.getBoundingClientRect();
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const docTop = r.top + window.scrollY;
      const size = r.height;
      c.setLayout({ cx: r.left + r.width / 2, cy: docTop + size / 2 - maxScroll, size }, window.innerHeight * 0.5 + size * 0.4);
    };
    import('../components/design/crateScene.js')
      .then(({ createCrate }) =>
        createCrate(host.current, {
          reducedMotion: reducedMotion(),
          onHover: (i) => panelRef.current < 0 && setTarget(i),
          onClick: (i, pointer) => (pointer === 'mouse' || panelRef.current >= 0 ? setPanel(i) : setTarget(i)),
          onIntroDone: () => onSettled(),
        })
      )
      .then((c) => {
        if (!alive) return c.dispose();
        api.current = c;
        layout();
        // the crate falls in once the headline has finished rising (about 1.1 s after load)
        c.playDrop(Math.max(performance.now() + 120, 1150));
        setReady(true);
      })
      .catch(() => {
        if (alive) {
          setFailed(true);
          onSettled();
        }
      });
    window.addEventListener('resize', layout);
    return () => {
      alive = false;
      window.removeEventListener('resize', layout);
      api.current?.dispose();
      api.current = null;
    };
  }, [onSettled]);

  useEffect(() => {
    api.current?.setTarget(target);
  }, [target, ready]);
  // the open project stays lifted; the crate slides left to make room for the panel
  useEffect(() => {
    api.current?.setFocus(panel >= 0);
    if (panel >= 0) setTarget(panel);
  }, [panel, ready]);
  const closePanel = useCallback(() => {
    setPanel(-1);
    setTarget(-1);
  }, []);
  // While a project is open the page holds the Work view: it never slides back to the hero under
  // the panel. Scrolling up just closes the panel (and stays on the crate); after that it scrolls.
  useEffect(() => {
    if (panel < 0) return undefined;
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    html.classList.add('dh-has-panel');
    let pull = 0;
    let lastY = null;
    const up = (dy) => {
      pull += dy;
      if (pull > 60) closePanel();
    };
    const wheel = (e) => {
      if (e.target.closest?.('.dh-panel') && e.target.closest('.dh-panel').scrollHeight > e.target.closest('.dh-panel').clientHeight) return;
      e.preventDefault();
      if (e.deltaY < 0) up(-e.deltaY);
    };
    const tstart = (e) => (lastY = e.touches[0].clientY);
    const tmove = (e) => {
      if (e.target.closest?.('.dh-panel')) return; // the sheet itself may scroll on phones
      e.preventDefault();
      if (lastY != null) up(e.touches[0].clientY - lastY);
      lastY = e.touches[0].clientY;
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('touchstart', tstart, { passive: true });
    window.addEventListener('touchmove', tmove, { passive: false });
    return () => {
      html.style.overflow = before;
      html.classList.remove('dh-has-panel');
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('touchstart', tstart);
      window.removeEventListener('touchmove', tmove);
    };
  }, [panel, closePanel]);

  // arrows and swipes follow the same order as the panel: the front folder (Stratalite) first
  const step = (d) => setTarget((t) => (t < 0 ? TOUR[d > 0 ? 0 : n - 1] : TOUR[(TOUR.indexOf(t) + d + n) % n]));
  const shown = target >= 0 ? PROJECTS[target] : null;

  const full = (() => {
    // the cover is a 16:10 black card; grown, it covers the whole screen
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.max(vw, vh * 1.6);
    return { left: (vw - w) / 2, top: (vh - w / 1.6) / 2, width: w, height: w / 1.6 };
  })();

  return (
    <div className="dh-crate" ref={wrap}>
      <div
        className={`dh-box ${ready ? 'is-ready' : ''} ${failed ? 'is-failed' : ''}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
        }}
      >
        {/* the still render stands in only if the 3D cannot run */}
        {failed && (
          <img
            className="dh-poster"
            src={BASE + 'box-rest.webp'}
            alt="A blue crate of manila folders, one per project, with company stickers on its sides"
            width="1100"
            height="1100"
          />
        )}
      </div>
      {/* the 3D layer covers the window; .dh-box above only marks where the crate lands */}
      <div ref={host} className={`dh-gl-host ${ready ? 'is-ready' : ''}`} role="img" aria-label="A blue crate of manila folders, one per project, with company stickers on its sides" />

      {/* keyboard and screen-reader route to the same projects */}
      <ul className="dh-sr">
        {PROJECTS.map((p, i) => (
          <li key={p.name}>
            {p.slug ? (
              <a href={`/design/${p.slug}`} onFocus={() => setTarget(i)} onClick={(e) => { e.preventDefault(); setPanel(i); }}>
                {p.name}
              </a>
            ) : (
              <button type="button" onFocus={() => setTarget(i)} onClick={() => setPanel(i)}>
                {p.name}
              </button>
            )}
          </li>
        ))}
      </ul>

      {panel >= 0 && <ProjectPanel i={panel} onClose={closePanel} onOpenCase={open} onGo={setPanel} />}

      {panel >= 0 ? null : fine ? (
        <p className="dh-caption dh-pill dh-reveal" aria-live="polite">
          <span className="dh-pill-a">{shown ? shown.name : 'Hover to preview'}</span>
          <span className="dh-pill-sep" aria-hidden="true" />
          <span className="dh-pill-b">
            Click to open
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 11 11 3M5 3h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </p>
      ) : (
        <div className="dh-swipe dh-reveal">
          <div className="dh-swipe-row">
            <button type="button" className="dh-arrow" aria-label="Previous project" onClick={() => step(-1)}>
              ‹
            </button>
            <div className="dh-swipe-name" aria-live="polite">
              {shown ? shown.name : 'Swipe or tap a folder'}
            </div>
            <button type="button" className="dh-arrow" aria-label="Next project" onClick={() => step(1)}>
              ›
            </button>
          </div>
          <div className="dh-dots" aria-hidden="true">
            {PROJECTS.map((p, i) => (
              <span key={p.name} className={i === target ? 'is-on' : ''} />
            ))}
          </div>
          {shown && (
            <button type="button" className="dh-open" onClick={() => setPanel(target)}>
              Open {shown.name} →
            </button>
          )}
        </div>
      )}

      {takeover && (
        <div className={`dh-takeover ${takeover.grown ? 'is-grown' : ''}`} aria-hidden="true">
          <img src={`${BASE}cover-${PROJECTS[takeover.i].slug}.webp`} alt="" style={takeover.grown ? full : takeover.start} />
        </div>
      )}
    </div>
  );
}

export default function DesignHome() {
  useDesignHead('Abhishek Manjhi · Lead product designer');
  const [settled, setSettled] = useState(false);
  const onSettled = useCallback(() => setSettled(true), []);
  return (
    <div className="dh">
      <header className="dh-head">
        <Link to="/design" className="dh-name">
          Abhishek Manjhi
        </Link>
        <nav aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#about">About</a>
        </nav>
        <Link to="/contact" className="dh-contact">
          Contact
        </Link>
      </header>
      <Hero />
      <section className={`dh-screen dh-work ${settled ? 'is-settled' : ''}`} id="work">
        <Crate onSettled={onSettled} />
      </section>
      {/* fixed to the corners of the window on every screen */}
      <div className="dh-corners" aria-hidden="true">
        <span>Thane, India</span>
        <span>©2026</span>
      </div>
    </div>
  );
}
