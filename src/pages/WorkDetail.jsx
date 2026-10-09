import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatDate } from '../lib/api.js';
import { brandIcon, monogram } from '../lib/brand.js';
import Markdown from '../components/Markdown.jsx';
import Loading from '../components/Loading.jsx';
import StatCover from '../components/StatCover.jsx';
import '../bento.css';

// The first images in the case study body double as preview tiles, so the
// header row needs no extra CMS work: ![alt](url "caption").
const IMAGE_RE = /!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+"([^"]*)")?\s*\)/g;
function previewImages(body = '', limit = 2) {
  const out = [];
  for (const m of body.matchAll(IMAGE_RE)) {
    out.push({ alt: m[1], src: m[2], caption: m[3] || m[1] });
    if (out.length >= limit) break;
  }
  return out;
}

// Tagline falls back to the first sentence of the summary until one is set in /admin.
function taglineOf(project) {
  if (project.tagline) return project.tagline;
  // Up to the first colon or sentence end keeps it to one quiet line.
  const first = (project.summary || '').split(/(?<=[.!?])\s|:\s/)[0];
  return first.length > 96 ? `${first.slice(0, 93).replace(/\s+\S*$/, '')}…` : first;
}

export default function WorkDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [others, setOthers] = useState([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(null);
    api
      .getProject(slug)
      .then(setProject)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
    api
      .listProjects()
      .then((list) => setOthers(list.filter((p) => p.slug !== slug).slice(0, 3)))
      .catch(() => setOthers([]));
  }, [slug]);

  const previews = useMemo(() => previewImages(project?.body), [project]);

  if (!loaded) return <Loading />;

  if (error || !project) {
    return (
      <div className="bn bn-page">
        <div className="empty">
          <h3>Case study not found</h3>
          <p>{error || "This one doesn't exist or isn't published."}</p>
          <Link to="/work" className="btn btn-ghost btn-sm">
            ← Back to work
          </Link>
        </div>
      </div>
    );
  }

  const icon = brandIcon(project.slug);
  const client = project.client?.split('·')[0]?.trim();
  const metaLine = [project.role, project.client].filter(Boolean).join(' · ');
  const details = [
    ['Client', project.client],
    ['Role', project.role],
    ['Year', project.year],
    ['Version', project.version],
    ['Updated', formatDate(project.updatedAt)]
  ].filter(([, v]) => v);

  return (
    <article className="bn bn-page bn-case">
      <Link to="/work" className="bn-back">
        ‹ Work
      </Link>

      {/* ---------- Identity ---------- */}
      <header className="bn-case-head">
        <div className="bn-case-icon">
          {icon ? <img src={icon} alt={`${client || project.title} logo`} /> : <span>{monogram(project.title)}</span>}
        </div>
        <div className="bn-case-id">
          <h1 className="bn-case-title">{project.title}</h1>
          {taglineOf(project) && <p className="bn-case-tagline">{taglineOf(project)}</p>}
          {metaLine && <p className="bn-case-meta">{metaLine}</p>}
          <div className="bn-case-actions">
            {project.url && (
              <a className="bn-btn bn-btn--accent" href={project.url} target="_blank" rel="noreferrer">
                Visit site
              </a>
            )}
            <a className="bn-btn" href="#story">
              Read the case study
            </a>
          </div>
        </div>
      </header>

      {/* ---------- Stats strip ---------- */}
      {project.metrics?.length > 0 && (
        <dl className="bn-stats" style={{ '--n': Math.min(project.metrics.length, 6) }}>
          {project.metrics.slice(0, 6).map((m, i) => (
            <div className="bn-stat" key={i}>
              <dd>{m.value}</dd>
              <dt>{m.label}</dt>
            </div>
          ))}
        </dl>
      )}

      {/* ---------- Preview ---------- */}
      <section className="bn-case-section">
        <h2 className="bn-section-title">Preview</h2>
        <div className={`bn-previews bn-previews--${previews.length}`}>
          <div className="bn-preview bn-preview--cover">
            <StatCover project={project} size="wide" />
          </div>
          {previews.map((img) => (
            <figure className="bn-preview" key={img.src}>
              <div className="bn-preview-img">
                <img src={img.src} alt={img.alt} loading="lazy" />
              </div>
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Story + details ---------- */}
      <section className="bn-case-body" id="story">
        <div className="bn-case-main">
          <h2 className="bn-section-title">The story</h2>
          {project.summary && <p className="bn-case-summary">{project.summary}</p>}
          <Markdown>{project.body}</Markdown>
        </div>

        <aside className="bn-case-aside">
          <div className="bn-aside-card">
            <h3 className="bn-aside-title">Details</h3>
            <dl className="bn-aside-list">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {project.tags?.length > 0 && (
            <div className="bn-aside-card">
              <h3 className="bn-aside-title">Focus</h3>
              <div className="bn-chips">
                {project.tags.map((t) => (
                  <span className="bn-chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.url && (
            <a className="bn-aside-card bn-aside-link" href={project.url} target="_blank" rel="noreferrer">
              <span>Visit the live site</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </aside>
      </section>

      {/* ---------- More work ---------- */}
      {others.length > 0 && (
        <section className="bn-case-section bn-more">
          <h2 className="bn-section-title">More work</h2>
          <div className="bn-more-grid">
            {others.map((p) => {
              const oi = brandIcon(p.slug);
              return (
                <Link to={`/work/${p.slug}`} className="bn-more-card" key={p._id || p.slug}>
                  <span className="bn-pcard-icon">
                    {oi ? <img src={oi} alt="" /> : monogram(p.title)}
                  </span>
                  <span className="bn-pcard-text">
                    <span className="bn-pcard-title">{p.title}</span>
                    <span className="bn-pcard-meta">{taglineOf(p)}</span>
                  </span>
                  <span className="bn-pill">View</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
