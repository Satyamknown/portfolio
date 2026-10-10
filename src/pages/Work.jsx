import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { ProjectGridSkeleton } from '../components/Skeleton.jsx';
import ProjectBento from '../components/ProjectBento.jsx';
import { microcopy, isListed } from '../data/site.js';
import '../bento.css';

// Same data and order as before (published projects, CMS order); only the
// presentation changed to the shared stat-cover bento.
export default function Work() {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .listProjects()
      .then((list) => setProjects(list.filter(isListed)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="bn bn-page">
      <header className="bn-page-head">
        <span className="bn-eyebrow">
          Case studies{loaded ? ` · ${String(projects.length).padStart(2, '0')}` : ''}
        </span>
        <h1 className="bn-page-title">Work</h1>
        <p className="bn-page-intro">{microcopy.workIntro}</p>
      </header>

      {!loaded ? (
        <ProjectGridSkeleton />
      ) : projects.length === 0 ? (
        <div className="empty">
          <h3>Nothing here yet</h3>
          <p>{microcopy.workEmpty}</p>
        </div>
      ) : (
        <ProjectBento projects={projects} />
      )}
    </div>
  );
}
