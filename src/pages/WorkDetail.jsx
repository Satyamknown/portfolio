import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, formatDate } from '../lib/api.js';
import Markdown from '../components/Markdown.jsx';
import Loading from '../components/Loading.jsx';

export default function WorkDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
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
  }, [slug]);

  if (!loaded) return <Loading />;

  if (error || !project) {
    return (
      <section className="first">
        <div className="empty">
          <h3>Case study not found</h3>
          <p>{error || "This one doesn't exist or isn't published."}</p>
          <Link to="/work" className="btn btn-ghost btn-sm">
            ← Back to work
          </Link>
        </div>
      </section>
    );
  }

  const meta = [project.role, project.client, project.year].filter(Boolean);

  return (
    <article>
      <div className="article-head">
        <div className="eyebrow">Case study</div>
        <h1>{project.title}</h1>
        <div className="article-meta">
          {project.version && <span className="index-ver">{project.version}</span>}
          {meta.map((m) => (
            <span key={m}>
              <span className="index-dot">·</span> {m}
            </span>
          ))}
          <span>
            <span className="index-dot">·</span> {formatDate(project.updatedAt)}
          </span>
        </div>
        {project.metrics?.length > 0 && (
          <div className="metrics">
            {project.metrics.map((m, i) => (
              <span className="metric" key={i}>
                {m.value} {m.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {project.coverImage && <img className="cover" src={project.coverImage} alt={project.title} />}

      <Markdown>{project.body}</Markdown>

      <Link to="/work" className="btn btn-ghost btn-sm" style={{ marginBottom: 60 }}>
        ← All case studies
      </Link>
    </article>
  );
}
