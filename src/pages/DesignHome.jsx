import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDesignHead from '../components/design/useDesignHead.js';
import '../design-home.css';

// The design portfolio's front door, one screen after another, the way it was designed on the canvas:
// 1. the hero; scrolling fades it away,
// 2. the crate (a live three.js copy of the Blender model) jumps up, the folders rattle and settle,
// 3. then the tools (left) and experience (right) come in.
// three.js and the model load lazily, after the hero is on screen, so the first paint stays light.

const BASE = '/design/home/';
const PROJECTS = [
  { name: 'Stratalite', slug: 'stratalite' },
  { name: 'Cequens', slug: null },
  { name: 'Pacific Coast Contracting', slug: 'pacific-coast-contracting' },
  { name: 'Skooltag', slug: 'skooltag' },
  { name: 'RoohConnect', slug: null },
  { name: 'AI in my design workflow', slug: 'ai-design-workflow' },
];

const DESIGN_TOOLS = [
  ['Figma', 'figma-color.svg'],
  ['Blender', 'blender-color.svg'],
  ['Spline', 'spline.png'],
  ['Rive', 'rive-color.svg'],
  ['LottieFiles', 'lottiefiles-color.svg'],
  ['Claude', 'claude-color.svg'],
];
const BUILD_TOOLS = [
  ['MongoDB', 'mongodb-color.svg'],
  ['Express', 'express-color.svg'],
  ['React', 'react-color.svg'],
  ['Node.js', 'nodedotjs-color.svg'],
];
const EXPERIENCE = [
  {
    logo: 'rsquare.png',
    org: 'Rsquare Web Studio',
    roles: [
      ['Product Design Lead', 'Oct 2025 – now'],
      ['Product Designer', 'Jul 2022 – Sep 2025'],
      ['UI/UX Designer Intern', 'Jan – Jun 2022'],
    ],
  },
  { logo: 'skooltag-mark.png', org: 'Student Junction · Skooltag', roles: [['Freelance Product Designer', '2024']] },
  { logo: 'mu.png', org: 'University of Mumbai', roles: [['B.E. Computer Engineering', '2024']] },
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
      <div className="dh-corners">
        <span>Thane, India</span>
        <span>©2026</span>
      </div>
    </section>
  );
}

function Tools() {
  const row = (list) =>
    list.map(([name, file]) => <img key={name} src={BASE + file} alt={name} title={name} width="44" height="44" />);
  return (
    <div className="dh-tools dh-reveal" aria-label="Tools I use">
      <div className="dh-tools-grid">{row(DESIGN_TOOLS)}</div>
      <div className="dh-tools-grid dh-tools-grid--build">{row(BUILD_TOOLS)}</div>
    </div>
  );
}

function Experience() {
  return (
    <div className="dh-exp" id="about">
      {EXPERIENCE.map((e, k) => (
        <section key={e.org} className="dh-exp-item dh-reveal" style={{ '--d': `${120 + k * 90}ms` }}>
          <img src={BASE + e.logo} alt="" width="36" height="36" />
          <div>
            <h3>{e.org}</h3>
            <ul>
              {e.roles.map(([r, d]) => (
                <li key={r}>
                  <span>{r}</span>
                  <span className="dh-muted">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
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

  // Load three.js and the model once the page has painted; play the jump when the crate is in view.
  useEffect(() => {
    let alive = true;
    let seen = false;
    let played = false;
    const play = () => {
      if (!played && seen && api.current) {
        played = true;
        api.current.playIntro();
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          seen = true;
          play();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(wrap.current);
    const start = () =>
      import('../components/design/crateScene.js')
        .then(({ createCrate }) =>
          createCrate(host.current, {
            reducedMotion: reducedMotion(),
            onHover: (i) => setTarget(i),
            onClick: (i, pointer) => (pointer === 'mouse' ? openRef.current(i) : setTarget(i)),
            onIntroDone: () => onSettled(),
          })
        )
        .then((c) => {
          if (!alive) return c.dispose();
          api.current = c;
          setReady(true);
          play();
        })
        .catch(() => {
          if (alive) {
            setFailed(true);
            onSettled();
          }
        });
    const id = 'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
    return () => {
      alive = false;
      io.disconnect();
      'cancelIdleCallback' in window ? cancelIdleCallback(id) : clearTimeout(id);
      api.current?.dispose();
      api.current = null;
    };
  }, [onSettled]);

  useEffect(() => {
    api.current?.setTarget(target);
  }, [target, ready]);

  const step = (d) => setTarget((t) => (t < 0 ? (d > 0 ? 0 : n - 1) : (t + d + n) % n));
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
        <div ref={host} className="dh-gl-host" role="img" aria-label="A blue crate of manila folders, one per project, with company stickers on its sides" />
      </div>

      {/* keyboard and screen-reader route to the same projects */}
      <ul className="dh-sr">
        {PROJECTS.map((p, i) => (
          <li key={p.name}>
            {p.slug ? (
              <a href={`/design/${p.slug}`} onFocus={() => setTarget(i)} onBlur={() => setTarget(-1)} onClick={(e) => { e.preventDefault(); open(i); }}>
                {p.name}
              </a>
            ) : (
              <span>{p.name}, case study coming soon</span>
            )}
          </li>
        ))}
      </ul>

      {fine ? (
        <p className="dh-caption dh-reveal" aria-live="polite">
          {shown ? (shown.slug ? `${shown.name} · click to open` : `${shown.name} · case study coming soon`) : 'Hover a folder · click to open'}
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
          {shown &&
            (shown.slug ? (
              <button type="button" className="dh-open" onClick={() => open(target)}>
                Open {shown.name} →
              </button>
            ) : (
              <p className="dh-soon">Case study coming soon</p>
            ))}
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
        <Tools />
        <Crate onSettled={onSettled} />
        <Experience />
        <div className="dh-corners dh-reveal" style={{ '--d': '420ms' }}>
          <span>Selected work · {PROJECTS.length} projects</span>
          <Link to="/design/all" className="dh-all">
            All case studies →
          </Link>
        </div>
      </section>
    </div>
  );
}
