import { Link } from 'react-router-dom';
import { brandIcon, monogram } from '../lib/brand.js';
import StatCover from './StatCover.jsx';

// Shared by the homepage and /work. Each project gets a generated stat cover
// built from its own CMS data (first metric, first tag), so no cover image is
// needed and new projects get a cover automatically. Covers are greyscale; the
// accent colour only marks the eyebrow and the rule under the number.

// Rows of two on a 3-column grid, alternating wide/narrow so the bento has
// rhythm: [wide narrow] [narrow wide] ... An odd last project spans the row.
function bentoLayout(count) {
  return Array.from({ length: count }, (_, i) => {
    if (count % 2 === 1 && i === count - 1) return 'full';
    const row = Math.floor(i / 2);
    const first = i % 2 === 0;
    return (row % 2 === 0) === first ? 'wide' : 'narrow';
  });
}

function ProjectCard({ project, size = 'wide' }) {
  const meta = [project.client?.split('·')[0]?.trim(), project.year].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/work/${project.slug}`}
      className={`bn-pcard bn-pcard--${size}`}
      data-cursor="open-folder"
    >
      <StatCover project={project} size={size} />
      <div className="bn-pcard-foot">
        <span className="bn-pcard-icon" aria-hidden="true">
          {brandIcon(project.slug) ? <img src={brandIcon(project.slug)} alt="" /> : monogram(project.title)}
        </span>
        <span className="bn-pcard-text">
          <span className="bn-pcard-title">{project.title}</span>
          {meta && <span className="bn-pcard-meta">{meta}</span>}
        </span>
        <span className="bn-pill">View</span>
      </div>
    </Link>
  );
}

export default function ProjectBento({ projects }) {
  const sizes = bentoLayout(projects.length);
  return (
    <div className="bn-pgrid">
      {projects.map((p, i) => (
        <ProjectCard key={p._id || p.slug} project={p} size={sizes[i]} />
      ))}
    </div>
  );
}
