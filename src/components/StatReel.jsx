import { useEffect, useState } from 'react';

// The hero capsule until a real showreel exists: the headline number from each
// case study, cycling. Same figures as the designed covers in
// public/case-studies/<slug>/cover.webp, set as text so they stay sharp.
const STATS = [
  {
    slug: 'pacific-coast-contracting',
    label: 'Delivery tracking',
    value: '27',
    line: 'genuinely open of 163 the client flagged',
    project: 'Pacific Coast Contracting'
  },
  {
    slug: 'skooltag',
    label: 'Requirements',
    value: '15',
    line: 'pages of backend requirements',
    project: 'Skooltag'
  },
  {
    slug: 'stratalite',
    label: 'Acceptance testing',
    value: '106',
    line: 'test cases in 3 passes, 12 flagged',
    project: 'Stratalite'
  }
];

const HOLD_MS = 3200;

export default function StatReel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = window.setInterval(() => setActive((i) => (i + 1) % STATS.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <a
      className="stat-reel"
      href="#work"
      aria-label="Selected work: Pacific Coast Contracting, Skooltag, Stratalite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {STATS.map((s, i) => (
        <div className="stat-reel-card" data-active={i === active} aria-hidden={i !== active} key={s.slug}>
          <span className="stat-reel-label">Case study / {s.label}</span>
          <span className="stat-reel-value">{s.value}</span>
          <span className="stat-reel-rule" />
          <span className="stat-reel-line">{s.line}</span>
          <span className="stat-reel-project">{s.project}</span>
        </div>
      ))}
      <span className="stat-reel-dots" aria-hidden="true">
        {STATS.map((s, i) => (
          <i key={s.slug} data-active={i === active} />
        ))}
      </span>
    </a>
  );
}
