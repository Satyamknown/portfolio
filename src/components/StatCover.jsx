// Generated greyscale stat cover, built from a project's own CMS data:
// first metric as the big figure, next two alongside on wide sizes, first tag
// as the eyebrow. Used on project cards and as the case-study page hero.

// "15-page" + "SRS" reads better on a cover as "15" + "page SRS": keep the big
// figure numeric so it never wraps, and fold any word part into the label.
function splitStat(metric) {
  // Ranges like "24-28" stay whole; "15-page" still splits.
  const match = /^([~<>]?[\d.,]+(?:[-–][\d.,]+)?[%+kKmMx×]?)[\s-]*(.*)$/.exec(metric.value || '');
  if (!match) return { value: metric.value, label: metric.label };
  const [, num, word] = match;
  return { value: num, label: [word, metric.label].filter(Boolean).join(' ') };
}

export default function StatCover({ project, size = 'wide', className = '' }) {
  const lead = project.metrics?.[0] ? splitStat(project.metrics[0]) : null;
  const rest = size === 'narrow' ? [] : (project.metrics || []).slice(1, 3);
  const eyebrow = project.tags?.[0] || project.role || 'Case study';
  return (
    <div className={`bn-cover ${className}`.trim()}>
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
