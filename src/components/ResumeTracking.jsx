import { useMemo, useState } from 'react';

// Landing pages worth a column. Anything else a link reached is summed under "Other".
const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/work/pacific-coast-contracting', label: 'PCC' },
  { to: '/work/stratalite', label: 'Stratalite' },
  { to: '/work/skooltag', label: 'Skooltag' }
];
const KNOWN = new Set(PAGES.map((p) => p.to));

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'opened', label: 'Opened' },
  { id: 'unopened', label: 'Not opened' }
];

const istFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

function relative(date, now) {
  const seconds = Math.max(0, Math.round((now - date) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

function Count({ value, muted }) {
  return <span className={`track-num ${value ? '' : 'is-zero'} ${muted ? 'is-bot' : ''}`}>{value || 0}</span>;
}

export default function ResumeTracking({ links, stats }) {
  const [filter, setFilter] = useState('all');
  const now = Date.now();

  const rows = useMemo(() => {
    return links
      .map((link) => {
        const s = stats[link._id] || { pages: {}, bots: 0, lastBotAt: null };
        const other = Object.entries(s.pages)
          .filter(([to]) => !KNOWN.has(to))
          .reduce((sum, [, n]) => sum + n, 0);
        return {
          link,
          pages: s.pages,
          other,
          bots: s.bots,
          lastBotAt: s.lastBotAt ? new Date(s.lastBotAt) : null,
          last: link.lastOpenedAt ? new Date(link.lastOpenedAt) : null
        };
      })
      .sort((a, b) => (b.last?.getTime() || 0) - (a.last?.getTime() || 0) || a.link.label.localeCompare(b.link.label));
  }, [links, stats]);

  const opened = rows.filter((r) => r.link.opens > 0).length;
  const shown = rows.filter((r) =>
    filter === 'opened' ? r.link.opens > 0 : filter === 'unopened' ? !(r.link.opens > 0) : true
  );
  const showOther = rows.some((r) => r.other > 0);

  return (
    <div className="track">
      <div className="track-head">
        <div>
          <h3 className="track-title">Resume tracking</h3>
          <p className="track-summary">
            {opened} of {rows.length} links opened by a person. Page counts and bot hits cover the last 180 days.
          </p>
        </div>
        <div className="track-filter" role="group" aria-label="Filter links">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="track-scroll">
        <table className="track-table">
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col" className="num">Opens</th>
              <th scope="col">Last opened (IST)</th>
              {PAGES.map((p) => (
                <th key={p.to} scope="col" className="num">{p.label}</th>
              ))}
              {showOther && <th scope="col" className="num">Other</th>}
              <th scope="col" className="num is-bot" title="Link previews, crawlers and mail scanners. Not counted as opens.">
                Bots
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td className="track-empty" colSpan={PAGES.length + (showOther ? 5 : 4)}>
                  {filter === 'opened' ? 'Nobody has opened a link yet.' : 'Every link has been opened.'}
                </td>
              </tr>
            ) : (
              shown.map(({ link, pages, other, bots, lastBotAt, last }) => (
                <tr key={link._id} className={link.opens > 0 ? 'is-opened' : ''}>
                  <th scope="row" className="track-company">
                    <span className="track-label">{link.label}</span>
                    <span className="track-token">
                      {link.token}
                      {!link.active && <span className="status-tag draft">Paused</span>}
                    </span>
                  </th>
                  <td className="num">
                    <span className={`track-opens ${link.opens ? '' : 'is-zero'}`}>{link.opens || 0}</span>
                  </td>
                  <td>
                    {last ? (
                      <>
                        <span className="track-rel">{relative(last, now)}</span>
                        <span className="track-abs">{istFormat.format(last)}</span>
                      </>
                    ) : (
                      <span className="track-never">Never</span>
                    )}
                  </td>
                  {PAGES.map((p) => (
                    <td key={p.to} className="num"><Count value={pages[p.to]} /></td>
                  ))}
                  {showOther && <td className="num"><Count value={other} /></td>}
                  <td className="num" title={lastBotAt ? `Last bot hit ${istFormat.format(lastBotAt)} IST` : undefined}>
                    <Count value={bots} muted />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
