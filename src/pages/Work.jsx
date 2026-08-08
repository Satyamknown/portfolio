import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import { microcopy } from '../data/site.js';

export default function Work() {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className="first">
      <div className="eyebrow">Work</div>
      <h1 className="about-title">Case studies</h1>
      <p className="section-intro">{microcopy.workIntro}</p>

      {!loaded ? (
        <Loading />
      ) : projects.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>{microcopy.workEmpty}</p>
        </div>
      ) : (
        <div className="index-list">
          {projects.map((p) => (
            <Link to={`/work/${p.slug}`} className="index-row" key={p._id} data-cursor="open-folder">
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
      )}
    </section>
  );
}
