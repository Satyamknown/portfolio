import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import Inline from '../components/Inline.jsx';
import {
  profile,
  positioning,
  objection,
  requirements,
  inProgress,
  contact,
  microcopy
} from '../data/site.js';

function SectionLabel({ n, children }) {
  return (
    <div className="section-label">
      <span className="section-num">{n}</span>
      {children}
    </div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className="hero">
        <div className="eyebrow">{profile.eyebrow}</div>
        <h1>{profile.name}</h1>

        <div className="version-line">
          <span>{profile.from}</span>
          <span className="version-arrow">→</span>
          <b>{profile.to}</b>
          <span className="chip-beta">{profile.stage}</span>
          <span className="version-sprint">{profile.sprint}</span>
        </div>

        <p className="hero-lede">{positioning}</p>

        <div className="hero-actions">
          <Link to="/work" className="btn btn-primary">
            View case studies →
          </Link>
          <Link to="/writing" className="btn btn-ghost">
            Read the writing
          </Link>
        </div>
      </header>

      {/* ---------- 01 Why a designer ---------- */}
      <section>
        <SectionLabel n="01">Why a designer, for a PM seat</SectionLabel>
        <div className="objection">
          {objection.map((para, i) => (
            <p key={i}>
              <Inline>{para}</Inline>
            </p>
          ))}
        </div>
      </section>

      {/* ---------- 02 Requirements met ---------- */}
      <section>
        <SectionLabel n="02">Requirements met</SectionLabel>
        <div className="req-grid">
          {requirements.map((r) => (
            <article className="req-card" key={r.competency}>
              <div className="req-competency">{r.competency}</div>
              <h3 className="req-claim">{r.claim}</h3>
              <p className="req-evidence">{r.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- 03 Shipped ---------- */}
      <section>
        <SectionLabel n="03">Shipped</SectionLabel>

        {!loaded ? (
          <Loading />
        ) : projects.length === 0 ? (
          <div className="empty">
            <h3>Nothing published yet</h3>
            <p>{microcopy.workEmpty}</p>
          </div>
        ) : (
          <>
            <div className="index-list">
              {projects.map((p) => (
                <Link to={`/work/${p.slug}`} className="index-row" key={p._id}>
                  <div className="index-top">
                    {p.version && <span className="index-ver">{p.version}</span>}
                    <span className="index-title">{p.title}</span>
                  </div>
                  {p.summary && <div className="index-summary">{p.summary}</div>}
                  {[p.role, p.client, p.year].some(Boolean) && (
                    <div className="index-meta">
                      {[p.role, p.client, p.year].filter(Boolean).join('  ·  ')}
                    </div>
                  )}
                  {p.metrics?.length > 0 && (
                    <div className="metrics">
                      {p.metrics.map((m, i) => (
                        <span className="metric" key={i}>
                          {m.value} {m.label}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <Link to="/work" className="section-more">
              All case studies →
            </Link>
          </>
        )}
      </section>

      {/* ---------- 04 In progress ---------- */}
      <section>
        <SectionLabel n="04">In progress</SectionLabel>
        <p className="section-intro">{inProgress.intro}</p>

        <div className="progress-list">
          {inProgress.items.map((item) => (
            <div className="progress-item" key={item.name}>
              <div className="progress-head">
                <span className="progress-name">{item.name}</span>
                <span className="progress-pct">{item.percent}%</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={item.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={item.name}
              >
                <div className="progress-fill" style={{ width: `${item.percent}%` }} />
              </div>
              <p className="progress-detail">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 05 Contact ---------- */}
      <section id="contact">
        <SectionLabel n="05">Contact</SectionLabel>
        <h2 className="contact-heading">{contact.heading}</h2>
        <p className="contact-body">{contact.body}</p>

        <dl className="contact-fields">
          <div>
            <dt>Based in</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className="status-tag">{profile.status}</span>
            </dd>
          </div>
        </dl>

        <div className="hero-actions">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <a className="btn btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="btn btn-ghost" href={profile.resume}>
            Resume (PDF)
          </a>
        </div>
      </section>
    </>
  );
}
