import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ProjectGridSkeleton } from '../components/Skeleton.jsx';
import ProjectBento from '../components/ProjectBento.jsx';
import { ArrowUpRight, Download } from '../components/Icons.jsx';
import { home, profile, companies, microcopy, emailCompose, isListed } from '../data/site.js';
import '../bento.css';

const monogram = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

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

  // Featured slugs (site.js) lead and take the large tiles; the rest keep CMS order.
  const ordered = useMemo(() => {
    const withImages = projects.filter(isListed);
    const lead = (home.featured || [])
      .map((slug) => withImages.find((p) => p.slug === slug))
      .filter(Boolean);
    return [...lead, ...withImages.filter((p) => !lead.includes(p))];
  }, [projects]);

  const intro = home.intro;

  return (
    <div ref={rootRef} className="bn">
      {/* ---------- Worked with: infinite logo marquee ---------- */}
      {/* A handful of logos sits still; scrolling them would loop the same three. */}
      <section
        className={`bn-marquee${companies.length < 5 ? ' bn-marquee--static' : ''}`}
        aria-label="Companies I have worked with"
      >
        <span className="bn-eyebrow">Worked with</span>
        <div className="bn-marquee-window">
          {/* Two identical runs; the track slides by exactly one run, so the loop is seamless. */}
          <div className="bn-marquee-track">
            {(companies.length < 5 ? [0] : [0, 1]).map((run) => (
              <ul className="bn-marquee-run" key={run} aria-hidden={run === 1 || undefined}>
                {companies.map((c) => (
                  <li className={`bn-co${c.logo ? ' bn-co--logo' : ''}`} key={c.name}>
                    {c.logo ? (
                      // A real logo already carries the name, so it stands alone.
                      c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer" tabIndex={run === 1 ? -1 : undefined}>
                          <img className="bn-co-logo" src={c.logo} alt={c.name} loading="lazy" />
                        </a>
                      ) : (
                        <img className="bn-co-logo" src={c.logo} alt={c.name} loading="lazy" />
                      )
                    ) : (
                      <>
                        <span className="bn-co-mark">{monogram(c.name)}</span>
                        <span className="bn-co-name">{c.name}</span>
                      </>
                    )}
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
          <div>
            <p className="bn-name">
              {profile.name} · {intro.role}
            </p>
            <h1 className="bn-headline">{intro.headline}</h1>
            <p className="bn-lede">{intro.body}</p>
            {intro.proof?.length > 0 && (
              <dl className="bn-proof">
                {intro.proof.map((p) => (
                  <div key={p.label}>
                    <dt>{p.value}</dt>
                    <dd>{p.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="bn-intro-top">
            <span className="bn-status">
              <span className="bn-dot" />
              {profile.status}
            </span>
            <span className="bn-intro-right">
              <span className="bn-meta">{profile.location}</span>
              <a className="bn-btn bn-btn--sm" href={profile.resume} download="Abhishek-Manjhi-Resume.pdf">
                Resume <Download />
              </a>
            </span>
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
          <ProjectGridSkeleton />
        ) : ordered.length === 0 ? (
          <div className="empty">
            <h3>Nothing published yet</h3>
            <p>{microcopy.workEmpty}</p>
          </div>
        ) : (
          <ProjectBento projects={ordered} />
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
            <a className="bn-btn" href={emailCompose} target="_blank" rel="noreferrer">
              Email <ArrowUpRight />
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
