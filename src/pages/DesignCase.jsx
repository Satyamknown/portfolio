import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { designApi } from '../lib/designApi.js';
import Markdown from '../components/Markdown.jsx';
import AccessMatrix from '../components/design/AccessMatrix.jsx';
import useDesignHead from '../components/design/useDesignHead.js';
import '../design.css';
import '../design-home.css';
import '../design-case.css';

// A case study, laid out like the owner's reference (amylalai.com/stitch): a full-width cover, a
// sticky index on the left, and a main column that leads with images and keeps the words short.
// Content comes from the CMS (/api/design-studies/:slug); this page only lays it out.

// The cover band takes each project's own colour, the same as its folder cover in the crate.
const COVER = {
  stratalite: '#0d0d0f',
  'pacific-coast-contracting': '#101012',
  skooltag: '#ffd800',
  'ai-design-workflow': '#f4f3ee',
};

function Carousel({ images }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d) => setI((k) => (k + d + n) % n);
  const touch = useRef(null);
  const img = images[i];
  return (
    <figure
      className="dc-carousel"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="dc-carousel-stage">
        <a href={img.src} target="_blank" rel="noreferrer" title="Open the full-size image">
          <img key={img.src} src={img.src} alt={img.alt || ''} loading="lazy" decoding="async" />
        </a>
        {n > 1 && (
          <>
            <button type="button" className="dc-arrow dc-arrow--prev" aria-label="Previous image" onClick={() => go(-1)}>
              ‹
            </button>
            <button type="button" className="dc-arrow dc-arrow--next" aria-label="Next image" onClick={() => go(1)}>
              ›
            </button>
          </>
        )}
      </div>
      {img.caption && <figcaption>{img.caption}</figcaption>}
      {n > 1 && (
        <div className="dc-dots" aria-hidden="true">
          {images.map((_, k) => (
            <span key={k} className={k === i ? 'is-on' : ''} />
          ))}
        </div>
      )}
    </figure>
  );
}

function Images({ images }) {
  const real = (images || []).filter((m) => m.src && !m.placeholder);
  if (!real.length) return null;
  if (real.length === 1) {
    const img = real[0];
    return (
      <figure className="dc-figure">
        <a href={img.src} target="_blank" rel="noreferrer" title="Open the full-size image">
          <img src={img.src} alt={img.alt || ''} loading="lazy" decoding="async" />
        </a>
        {img.caption && <figcaption>{img.caption}</figcaption>}
      </figure>
    );
  }
  return <Carousel images={real} />;
}

const sectionId = (i) => `s${i + 1}`;

export default function DesignCase() {
  const { slug } = useParams();
  const [study, setStudy] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState('overview');

  useDesignHead(study ? `${study.title} · Abhishek Manjhi` : 'Case study · Abhishek Manjhi');

  // Arriving from a folder in the /design crate: its cover filled the screen, so start under the
  // same colour and fade it away once the case study is in.
  useEffect(() => {
    let flag = null;
    try {
      flag = sessionStorage.getItem('dz-takeover');
      sessionStorage.removeItem('dz-takeover');
    } catch {
      return undefined;
    }
    if (!flag) return undefined;
    const veil = document.createElement('div');
    veil.setAttribute('aria-hidden', 'true');
    veil.style.cssText = `position:fixed;inset:0;z-index:60;background:${COVER[slug] || '#0a0a0a'};opacity:1;transition:opacity 620ms ease;pointer-events:none`;
    document.body.appendChild(veil);
    const t1 = setTimeout(() => (veil.style.opacity = '0'), 240);
    const t2 = setTimeout(() => veil.remove(), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      veil.remove();
    };
  }, [slug]);

  useEffect(() => {
    setStudy(null);
    setError(null);
    designApi
      .get(slug)
      .then(setStudy)
      .catch((e) => setError(e.message));
    window.scrollTo(0, 0);
  }, [slug]);

  const index = useMemo(
    () => [['overview', 'Overview'], ...(study?.sections || []).map((s, i) => [sectionId(i), s.label || s.heading || `Part ${i + 1}`])],
    [study]
  );

  // highlight the section being read
  useEffect(() => {
    if (!study) return undefined;
    const els = index.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [study, index]);

  if (error) {
    return (
      <div className="dh dc">
        <div className="dc-missing">
          <h1>Case study not found</h1>
          <p>{error}</p>
          <Link to="/design#work">← Back to the work</Link>
        </div>
      </div>
    );
  }

  const meta = study
    ? [
        ['Role', study.role],
        ['Timeline', study.timeline],
        ['Team', study.team],
        ['Tools', study.tools?.join(', ')],
      ].filter(([, v]) => v)
    : [];

  return (
    <div className="dh dc">
      <header className="dh-head">
        <Link to="/design" className="dh-name">
          Abhishek Manjhi
        </Link>
        <nav aria-label="Primary">
          <Link to="/design#work">Work</Link>
          <Link to="/design#about">About</Link>
        </nav>
        <Link to="/contact" className="dh-contact">
          Contact
        </Link>
      </header>

      <section className="dc-cover" style={{ background: COVER[slug] || '#ecebe6' }}>
        {study &&
          (study.heroVideo ? (
            <video className="dc-cover-media" src={study.heroVideo} poster={study.heroImage} autoPlay muted loop playsInline />
          ) : (
            <img className="dc-cover-media" src={study.heroImage} alt={study.heroAlt || study.title} fetchpriority="high" />
          ))}
      </section>

      <div className="dc-body">
        <aside className="dc-side" aria-label="On this page">
          <Link to="/design#work" className="dc-back">
            ← Back
          </Link>
          <p className="dc-side-title">{study?.title}</p>
          <ol>
            {index.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className={active === id ? 'is-on' : ''}>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <main className="dc-main">
          {!study ? (
            <div className="dc-loading" aria-busy="true" />
          ) : (
            <>
              <section id="overview" className="dc-sec">
                <span className="dc-kicker">Overview</span>
                <h1 className="dc-title">{study.tagline || study.title}</h1>
                {study.summary && <p className="dc-lede">{study.summary}</p>}
                {meta.length > 0 && (
                  <dl className="dc-meta">
                    {meta.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {study.impact?.length > 0 && (
                  <ul className="dc-impact">
                    {study.impact.slice(0, 4).map((m, k) => (
                      <li key={k}>
                        <span className="dc-impact-value">{m.value}</span>
                        <span className="dc-impact-label">{m.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {study.sections?.map((s, i) => {
                const card = i === 0 || s.type === 'decision';
                return (
                  <section key={i} id={sectionId(i)} className={`dc-sec ${card ? 'dc-sec--card' : ''}`}>
                    {s.label && <span className="dc-kicker">{s.label}</span>}
                    {s.heading && <h2 className="dc-heading">{s.heading}</h2>}
                    {s.body && (
                      <div className="dc-text">
                        <Markdown>{s.body}</Markdown>
                      </div>
                    )}
                    {s.type === 'matrix' && (
                      <div className="dc-matrix">
                        <AccessMatrix data={s.data} />
                      </div>
                    )}
                    <Images images={s.images} />
                  </section>
                );
              })}

              {study.next && (
                <Link to={`/design/${study.next.slug}`} className="dc-next">
                  <span className="dc-kicker">Next project</span>
                  <span className="dc-next-title">
                    {study.next.title} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              )}
            </>
          )}
        </main>
      </div>

      <footer className="dc-foot">
        <span>Abhishek Manjhi · Lead product designer</span>
        <span>
          <Link to="/contact">Contact</Link> · <a href="/design/resume.pdf">Resume</a>
        </span>
      </footer>
    </div>
  );
}
