import { Fragment, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

// Landing pages worth a column. Anything else a link reached is summed under "Other".
const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/work/pacific-coast-contracting', label: 'PCC' },
  { to: '/work/stratalite', label: 'Stratalite' },
  { to: '/work/skooltag', label: 'Skooltag' }
];
// The design resume lands on the /design case studies instead.
const DESIGN_PAGES = [
  { to: '/design', label: 'Design home' },
  { to: '/design/stratalite', label: 'Stratalite' },
  { to: '/design/pacific-coast-contracting', label: 'PCC' },
  { to: '/design/skooltag', label: 'Skooltag' },
  { to: '/design/ai-design-workflow', label: 'AI' }
];
const isDesignPage = (to) => to === '/design' || to.startsWith('/design/');
const KNOWN = new Set(PAGES.map((p) => p.to));

const PAGE_LABEL = Object.fromEntries([
  ...PAGES.map((p) => [p.to, p.label]),
  ...DESIGN_PAGES.map((p) => [p.to, p.to === '/design' ? 'Design home' : `Design: ${p.label}`])
]);

// What each logged hit counted as, for the per-company hit list.
const KIND = {
  person: 'Counted as an open',
  mine: 'Yours, not counted',
  bot: 'Bot, not counted',
  scan: 'Scanner burst, not counted'
};

// Which resume a link was printed on. Links from before the tag existed count as PM.
const TRACKS = [
  { id: 'all', label: 'All resumes' },
  { id: 'pm', label: 'PM' },
  { id: 'design', label: 'Design' }
];
const trackOf = (link) => link.track || 'pm';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'opened', label: 'Opened' },
  { id: 'unopened', label: 'Not opened' }
];

const timeFormat = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

const appliedFormat = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });

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

export default function ResumeTracking({ links, stats, updatedAt, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const refreshNow = () => {
    if (!onRefresh) return;
    setRefreshing(true);
    Promise.resolve(onRefresh()).finally(() => setRefreshing(false));
  };
  const [filter, setFilter] = useState('all');
  const [track, setTrack] = useState('all');
  const [hitsFor, setHitsFor] = useState(null);
  const [busyHit, setBusyHit] = useState(null);
  const [hitError, setHitError] = useState('');
  const markHit = (linkId, hitId, mine) => {
    setBusyHit(hitId);
    setHitError('');
    api
      .setAccessLinkHitOwner(linkId, hitId, mine)
      .then(() => onRefresh && onRefresh())
      .catch((e) => setHitError(e.message))
      .finally(() => setBusyHit(null));
  };
  // Any browser where the owner opens this dashboard stops counting its own share-link clicks.
  const [owner, setOwner] = useState(null);
  useEffect(() => {
    api.setOwner(true).then((r) => setOwner(r.owner)).catch(() => setOwner(null));
  }, []);
  const toggleOwner = () => api.setOwner(!owner).then((r) => setOwner(r.owner)).catch(() => {});
  const now = Date.now();

  const rows = useMemo(() => {
    return links
      .map((link) => {
        // Opens come from the event log (people only, scanner bursts removed), not the raw counter.
        const s = stats[link._id] || { pages: {}, opens: 0, lastOpenedAt: null, bots: 0, scans: 0, lastBotAt: null };
        const other = Object.entries(s.pages)
          .filter(([to]) => !KNOWN.has(to) && !isDesignPage(to))
          .reduce((sum, [, n]) => sum + n, 0);
        const design = Object.entries(s.pages)
          .filter(([to]) => isDesignPage(to))
          .reduce((sum, [, n]) => sum + n, 0);
        return {
          link,
          pages: s.pages,
          other,
          design,
          opens: s.opens || 0,
          recent: s.recent || [],
          bots: (s.bots || 0) + (s.scans || 0),
          lastBotAt: s.lastBotAt ? new Date(s.lastBotAt) : null,
          last: s.lastOpenedAt ? new Date(s.lastOpenedAt) : null
        };
      })
      .sort((a, b) => (b.last?.getTime() || 0) - (a.last?.getTime() || 0) || a.link.label.localeCompare(b.link.label));
  }, [links, stats]);

  const inTrack = rows.filter((r) => track === 'all' || trackOf(r.link) === track);
  const opened = inTrack.filter((r) => r.opens > 0).length;
  const shown = inTrack.filter((r) =>
    filter === 'opened' ? r.opens > 0 : filter === 'unopened' ? !(r.opens > 0) : true
  );
  // Design links get the /design pages as columns; the other views keep the PM pages and sum /design under one column.
  const pageCols = track === 'design' ? DESIGN_PAGES : PAGES;
  const showDesign = track === 'all' && rows.some((r) => r.design > 0 || trackOf(r.link) === 'design');
  const showOther = track !== 'design' && inTrack.some((r) => r.other > 0);
  const columns = pageCols.length + 4 + (showOther ? 1 : 0) + (showDesign ? 1 : 0);

  return (
    <div className="track">
      <div className="track-head">
        <div>
          <h3 className="track-title">Resume tracking</h3>
          <p className="track-summary">
            {opened} of {inTrack.length} {track === 'design' ? 'design ' : track === 'pm' ? 'PM ' : ''}links opened by a person. Page counts and bot hits cover the last 180 days.
          </p>
          {updatedAt && (
            <p className="track-updated">
              Updated {timeFormat.format(updatedAt)} IST. New opens load by themselves every minute.
            </p>
          )}
          {owner !== null && (
            <p className="track-owner">
              {owner
                ? 'This browser is marked as yours: your own clicks on these links are not counted. Open this dashboard once on your phone to do the same there.'
                : 'This browser is counted like any visitor.'}{' '}
              <button type="button" className="track-owner-toggle" onClick={toggleOwner}>
                {owner ? 'Count this browser again' : "Don't count this browser"}
              </button>
            </p>
          )}
        </div>
        <div className="track-actions">
          {onRefresh && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={refreshNow} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
          <div className="track-filter" role="group" aria-label="Resume type">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`btn btn-sm ${track === t.id ? 'btn-primary' : 'btn-ghost'}`}
                aria-pressed={track === t.id}
                onClick={() => setTrack(t.id)}
              >
                {t.label}
              </button>
            ))}
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
      </div>

      <div className="track-scroll">
        <table className="track-table">
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col" className="num">Opens</th>
              <th scope="col">Last opened (IST)</th>
              {pageCols.map((p) => (
                <th key={p.to} scope="col" className="num">{p.label}</th>
              ))}
              {showDesign && <th scope="col" className="num" title="Opens of any /design page">Design</th>}
              {showOther && <th scope="col" className="num">Other</th>}
              <th scope="col" className="num is-bot" title="Link previews, crawlers, mail scanners and systems that fetch every link in a resume at once. Not counted as opens.">
                Bots
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td className="track-empty" colSpan={columns}>
                  {filter === 'opened' ? 'Nobody has opened a link yet.' : 'Every link has been opened.'}
                </td>
              </tr>
            ) : (
              shown.map(({ link, opens, recent, pages, other, design, bots, lastBotAt, last }) => (
                <Fragment key={link._id}>
                  <tr className={opens > 0 ? 'is-opened' : ''}>
                    <th scope="row" className="track-company">
                      <span className="track-label">
                        {link.label}
                        {trackOf(link) === 'design' && <span className="track-tag">Design</span>}
                      </span>
                      {(link.appliedAt || link.jobUrl) && (
                        <span className="track-applied">
                          {link.appliedAt ? `Applied ${appliedFormat.format(new Date(link.appliedAt))}` : 'Not applied'}
                          {link.jobUrl && (
                            <>
                              {' · '}
                              <a href={link.jobUrl} target="_blank" rel="noopener noreferrer">
                                {link.role || 'Job posting'} ↗
                              </a>
                            </>
                          )}
                        </span>
                      )}
                      <span className="track-token">
                        {link.token}
                        {!link.active && <span className="status-tag draft">Paused</span>}
                      </span>
                      {recent.length > 0 && (
                        <button
                          type="button"
                          className="track-owner-toggle track-hits-toggle"
                          aria-expanded={hitsFor === link._id}
                          onClick={() => setHitsFor(hitsFor === link._id ? null : link._id)}
                        >
                          {hitsFor === link._id ? 'Hide hits' : 'See hits'}
                        </button>
                      )}
                    </th>
                    <td className="num">
                      <span className={`track-opens ${opens ? '' : 'is-zero'}`}>{opens}</span>
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
                    {pageCols.map((p) => (
                      <td key={p.to} className="num"><Count value={pages[p.to]} /></td>
                    ))}
                    {showDesign && <td className="num"><Count value={design} /></td>}
                    {showOther && <td className="num"><Count value={other} /></td>}
                    <td className="num" title={lastBotAt ? `Last bot hit ${istFormat.format(lastBotAt)} IST` : undefined}>
                      <Count value={bots} muted />
                    </td>
                  </tr>
                  {hitsFor === link._id && (
                    <tr className="track-hits-row">
                      <td colSpan={columns}>
                        <p className="track-hits-note">
                          Latest {recent.length} {recent.length === 1 ? 'hit' : 'hits'}, newest first. If you opened this link yourself from a browser that was not marked, press That was me.
                        </p>
                        <ul className="track-hits">
                          {[...recent].reverse().map((h) => (
                            <li key={h.id} className={`is-${h.kind}`}>
                              <span className="track-hit-when">{istFormat.format(new Date(h.at))}</span>
                              <span className="track-hit-page">{PAGE_LABEL[h.to] || h.to}</span>
                              <span className="track-hit-device">
                                {h.device}
                                {h.country ? `, ${h.country}` : ''}
                              </span>
                              <span className="track-hit-kind">{KIND[h.kind] || h.kind}</span>
                              {(h.kind === 'person' || h.kind === 'mine') && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-ghost"
                                  disabled={busyHit === h.id}
                                  onClick={() => markHit(link._id, h.id, h.kind === 'person')}
                                >
                                  {busyHit === h.id ? 'Saving…' : h.kind === 'person' ? 'That was me' : 'Count it again'}
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                        {hitError && <p className="track-hits-error">{hitError}</p>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
