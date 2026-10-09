// Project cover: the client's live product framed in a browser window (or a
// phone) on a gradient in their brand colours. Config lives in projectCovers
// (src/data/site.js); projects without one fall back to the stat cover.
export default function BrandCover({ cover, title }) {
  const browser = cover.frame !== 'phone';
  return (
    <div className={`bn-bcover bn-bcover--${cover.tone || 'light'}`} style={{ background: cover.background }}>
      {cover.eyebrow && <span className="bn-bcover-eyebrow">{cover.eyebrow}</span>}
      {browser ? (
        <div className="bn-bcover-browser">
          <div className="bn-bcover-bar" aria-hidden="true">
            <span className="bn-bcover-dot" style={{ background: '#ff5f57' }} />
            <span className="bn-bcover-dot" style={{ background: '#febc2e' }} />
            <span className="bn-bcover-dot" style={{ background: '#28c840' }} />
            {cover.domain && <span className="bn-bcover-url">{cover.domain}</span>}
          </div>
          <img src={cover.shot} alt={`${title}: the live product`} loading="lazy" />
        </div>
      ) : (
        <div className="bn-bcover-phone">
          <img src={cover.shot} alt={`${title}: the app`} loading="lazy" />
        </div>
      )}
    </div>
  );
}
