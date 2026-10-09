import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { initHomeEffects } from '../lib/effects.js';
import Loading from '../components/Loading.jsx';
import { home, profile, companies, microcopy } from '../data/site.js';
import '../bento.css';

// Placeholder shots until real screenshots land in each project's coverImage.
// Same fallback chain as before the redesign: CMS coverImage → slug mock → cycle.
const MOCKS = {
  'pacific-coast-contracting': '/mocks/mock-pcc.png',
  roohconnect: '/mocks/mock-rooh.png',
  exportkit: '/mocks/mock-exportkit.png',
  stratalite: '/mocks/mock-stratalite.png',
  skooltag: '/mocks/mock-skooltag.png'
};
const MOCK_CYCLE = Object.values(MOCKS);

const monogram = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// Bento sizes on a 6-column grid. Full groups of five tile perfectly:
//   [ big big big big | a a ]
//   [ big big big big | b b ]
//   [ c c c           | d d d ]
// Leftovers are sized so the last row always ends flush, whatever the count.
const GROUP = ['xl', 'sm', 'sm', 'md', 'md'];
const TAIL = { 1: ['full'], 2: ['md', 'md'], 3: ['sm', 'sm', 'sm'], 4: ['md', 'md', 'md', 'md'] };

function bentoSizes(count) {
  const sizes = [];
  const full = Math.floor(count / 5);
  for (let g = 0; g < full; g++) sizes.push(...GROUP);
  const rest = count % 5;
  if (rest) sizes.push(...TAIL[rest]);
  return sizes;
}

function ProjectTile({ project, size }) {
  const meta = [project.client, project.year].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/work/${project.slug}`}
      className={`bn-tile bn-tile--${size}`}
      data-cursor="open-folder"
    >
      <div className="bn-tile-shot">
        <img src={project.image} alt="" loading={size === 'xl' ? 'eager' : 'lazy'} />
      </div>
      <div className="bn-tile-body">
        <div className="bn-tile-text">
          <h3 className="bn-tile-title">{project.title}</h3>
          {size === 'xl' && project.summary && <p className="bn-tile-summary">{project.summary}</p>}
          {meta && <span className="bn-meta">{meta}</span>}
        </div>
        <span className="bn-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const rootRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => initHomeEffects(rootRef.current), []);

  // Featured slugs (site.js) lead and take the large tiles; the rest keep CMS order.
  const ordered = useMemo(() => {
    const withImages = projects.map((p, i) => ({
      ...p,
      image: p.coverImage || MOCKS[p.slug] || MOCK_CYCLE[i % MOCK_CYCLE.length]
    }));
    const lead = (home.featured || [])
      .map((slug) => withImages.find((p) => p.slug === slug))
      .filter(Boolean);
    return [...lead, ...withImages.filter((p) => !lead.includes(p))];
  }, [projects]);

  const sizes = bentoSizes(ordered.length);
  const intro = home.intro;

  return (
    <div ref={rootRef} className="bn">
      {/* ---------- Worked with: infinite logo marquee ---------- */}
      <section className="bn-marquee" aria-label="Companies I have worked with">
        <span className="bn-eyebrow">Worked with</span>
        <div className="bn-marquee-window">
          {/* Two identical runs; the track slides by exactly one run, so the loop is seamless. */}
          <div className="bn-marquee-track">
            {[0, 1].map((run) => (
              <ul className="bn-marquee-run" key={run} aria-hidden={run === 1 || undefined}>
                {companies.map((c) => (
                  <li className="bn-co" key={c.name}>
                    <span className="bn-co-mark">
                      {c.logo ? <img src={c.logo} alt="" /> : monogram(c.name)}
                    </span>
                    <span className="bn-co-name">{c.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Intro + photo ---------- */}
      <section className="bn-hero">
        <div className="bn-card bn-intro">
          <div className="bn-intro-top">
            <span className="bn-status">
              <span className="bn-dot" />
              {profile.status}
            </span>
            <span className="bn-meta">{profile.location}</span>
          </div>
          <div>
            <p className="bn-name">{profile.name}</p>
            <h1 className="bn-headline">{intro.headline}</h1>
            <p className="bn-lede">{intro.body}</p>
          </div>
        </div>

        <figure className="bn-card bn-photo">
          {photoOk ? (
            <img src={intro.photo} alt={intro.photoAlt} onError={() => setPhotoOk(false)} />
          ) : (
            <div className="bn-photo-fallback" aria-label={intro.photoAlt}>
              {monogram(profile.name)}
            </div>
          )}
        </figure>
      </section>

      {/* ---------- Work: every project, one bento ---------- */}
      <section id="work" className="bn-section">
        <div className="bn-section-head">
          <h2 className="bn-section-title">Selected work</h2>
          <Link to="/work" className="bn-meta bn-link">
            All case studies →
          </Link>
        </div>

        {!loaded ? (
          <Loading />
        ) : ordered.length === 0 ? (
          <div className="empty">
            <h3>Nothing published yet</h3>
            <p>{microcopy.workEmpty}</p>
          </div>
        ) : (
          <div className="bn-bento">
            {ordered.map((p, i) => (
              <ProjectTile key={p._id || p.slug} project={p} size={sizes[i]} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Contact: one quiet line, the form lives on /contact ---------- */}
      <section id="contact" className="bn-section">
        <div className="bn-card bn-cta">
          <div>
            <h2 className="bn-cta-title">Let’s talk.</h2>
            <p className="bn-cta-text">{home.intro.contactLine}</p>
          </div>
          <div className="bn-cta-actions">
            <a className="bn-btn" href={`mailto:${profile.email}`}>
              Email
            </a>
            <Link className="bn-btn bn-btn--dark" to="/contact">
              Contact me
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
