import { Link } from 'react-router-dom';
import { brandIcons } from '../data/site.js';

// Shared by the homepage and /work. Each project gets a generated stat cover
// built from its own CMS data (first metric, first tag), so no cover image is
// needed and new projects get a cover automatically. Covers are greyscale; the
// accent colour only marks the eyebrow and the rule under the number.

const monogram = (text = '') =>
  text
    .split(/[\s:·]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const brandIcon = (slug = '') => {
  const key = Object.keys(brandIcons).find((k) => slug === k || slug.startsWith(`${k}-`));
  return key ? brandIcons[key] : null;
};

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

// "15-page" + "SRS" reads better on a cover as "15" + "page SRS": keep the big
// figure numeric so it never wraps, and fold any word part into the label.
function splitStat(metric) {
  const match = /^([~<>]?[\d.,]+[%+kKmMx×]?)[\s-]*(.*)$/.exec(metric.value || '');
  if (!match) return { value: metric.value, label: metric.label };
  const [, num, word] = match;
  return { value: num, label: [word, metric.label].filter(Boolean).join(' ') };
}

function StatCover({ project, size }) {
  const lead = project.metrics?.[0] ? splitStat(project.metrics[0]) : null;
  const rest = size === 'narrow' ? [] : (project.metrics || []).slice(1, 3);
  const eyebrow = project.tags?.[0] || project.role || 'Case study';
  return (
    <div className="bn-cover">
      <span className="bn-cover-eyebrow">{eyebrow}</span>
      {lead ? (
        <div className="bn-cover-stat">
          <span className="bn-cover-num">{lead.value}</span>
          <span className="bn-cover-rule" aria-hidden="true" />
          <span className="bn-cover-label">{lead.label}</span>
        </div>
      ) : (
        <div className="bn-cover-stat">
          <span className="bn-cover-num bn-cover-num--title">{project.title}</span>
        </div>
      )}
      {rest.length > 0 && (
        <ul className="bn-cover-side">
          {rest.map(splitStat).map((m, i) => (
            <li key={i}>
              <b>{m.value}</b>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
