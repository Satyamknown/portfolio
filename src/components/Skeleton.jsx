// Skeleton screens: grey shapes in the layout the content will take, so a page
// never shows "Loading…" and nothing jumps when the data lands. Each skeleton
// reuses the real layout classes (bn-pgrid, bn-case-head, dz-cards…), so it
// follows the same grid and breakpoints as the page it stands in for.

export function Sk({ w, h = 14, r, className = '', style }) {
  return (
    <span
      className={`sk ${className}`}
      style={{ width: w, height: h, borderRadius: r, ...style }}
      aria-hidden="true"
    />
  );
}

// Wrapper: announces the busy state to screen readers without any visible text.
function Busy({ as: Tag = 'div', className = '', children, label = 'Loading content' }) {
  return (
    <Tag className={`sk-wrap ${className}`} aria-busy="true" role="status">
      <span className="sk-sr">{label}</span>
      {children}
    </Tag>
  );
}

export function SkLines({ lines = 3, last = '62%', h = 14, gap = 10 }) {
  return (
    <span className="sk-lines" style={{ gap }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Sk key={i} h={h} w={i === lines - 1 ? last : '100%'} />
      ))}
    </span>
  );
}

// Same rhythm as ProjectBento: rows of two, alternating wide / narrow.
const GRID_SIZES = ['wide', 'narrow', 'narrow', 'wide'];

export function ProjectGridSkeleton({ count = 4 }) {
  return (
    <Busy className="bn-pgrid" label="Loading case studies">
      {Array.from({ length: count }, (_, i) => (
        <div className={`bn-pcard bn-pcard--${GRID_SIZES[i % 4]} sk-card`} key={i} aria-hidden="true">
          <Sk className="sk-cover" r={20} />
          <div className="bn-pcard-foot">
            <Sk w={42} h={42} r={11} />
            <span className="bn-pcard-text sk-lines" style={{ gap: 8 }}>
              <Sk w="46%" h={16} />
              <Sk w="72%" h={12} />
            </span>
            <Sk w={60} h={32} r={999} />
          </div>
        </div>
      ))}
    </Busy>
  );
}

export function CaseStudySkeleton() {
  return (
    <Busy as="article" className="bn bn-page bn-case" label="Loading case study">
      <Sk w={64} h={14} style={{ margin: '0 4px 28px' }} />
      <header className="bn-case-head">
        <Sk className="bn-case-icon" h={null} r={28} />
        <div className="bn-case-id sk-lines" style={{ gap: 14, flex: 1 }}>
          <Sk w="52%" h={44} r={10} />
          <Sk w="70%" h={18} />
          <Sk w="38%" h={13} />
          <span style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Sk w={110} h={40} r={999} />
            <Sk w={130} h={40} r={999} />
          </span>
        </div>
      </header>

      <dl className="bn-stats" style={{ '--n': 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div className="bn-stat sk-lines" style={{ gap: 10 }} key={i}>
            <Sk w="44%" h={30} r={8} />
            <Sk w="80%" h={12} />
          </div>
        ))}
      </dl>

      <section className="bn-case-section">
        <Sk w={90} h={22} style={{ marginBottom: 16 }} />
        <div className="bn-previews bn-previews--2">
          {[0, 1, 2].map((i) => (
            <div className="bn-preview" key={i}>
              <Sk className="sk-cover" r={20} />
            </div>
          ))}
        </div>
      </section>

      <section className="bn-case-body">
        <div className="bn-case-main sk-lines" style={{ gap: 28 }}>
          <Sk w={120} h={22} />
          {[0, 1, 2].map((i) => (
            <span className="sk-lines" style={{ gap: 12 }} key={i}>
              <Sk w="34%" h={24} r={8} />
              <SkLines lines={4} last="54%" h={15} gap={10} />
            </span>
          ))}
        </div>
        <aside className="bn-case-aside">
          {[5, 3].map((rows, i) => (
            <div className="bn-aside-card sk-lines" style={{ gap: 12 }} key={i}>
              <Sk w="40%" h={16} />
              <SkLines lines={rows} last="70%" h={12} />
            </div>
          ))}
        </aside>
      </section>
    </Busy>
  );
}

// Writing index rows.
export function ListSkeleton({ rows = 3 }) {
  return (
    <Busy className="index-list" label="Loading posts">
      {Array.from({ length: rows }, (_, i) => (
        <div className="index-row sk-row" key={i} aria-hidden="true">
          <span className="sk-lines" style={{ gap: 12 }}>
            <Sk w={90} h={11} />
            <Sk w="58%" h={22} r={8} />
            <Sk w="86%" h={14} />
          </span>
        </div>
      ))}
    </Busy>
  );
}

// A single post.
export function ArticleSkeleton() {
  return (
    <Busy as="article" label="Loading post">
      <div className="article-head sk-lines" style={{ gap: 14 }}>
        <Sk w={70} h={11} />
        <Sk w="74%" h={40} r={10} />
        <Sk w="40%" h={13} />
      </div>
      <span className="sk-lines" style={{ gap: 26, marginTop: 28 }}>
        {[0, 1, 2].map((i) => (
          <SkLines key={i} lines={4} last="48%" h={15} />
        ))}
      </span>
    </Busy>
  );
}

// /design index cards: one lead card across the row, then pairs.
export function DesignCardsSkeleton() {
  return (
    <Busy className="dz-cards" label="Loading projects">
      {[0, 1, 2].map((i) => (
        <div className={`dz-card sk-dz-card ${i === 0 ? 'is-lead' : ''}`} key={i} aria-hidden="true">
          <Sk className="sk-dz-shot" r={0} />
          <div className="dz-card-body sk-lines" style={{ gap: 12 }}>
            <Sk w="30%" h={12} />
            <Sk w="70%" h={i === 0 ? 40 : 26} r={8} />
            <SkLines lines={2} last="60%" h={13} />
          </div>
        </div>
      ))}
    </Busy>
  );
}

// /design/:slug
export function DesignDetailSkeleton() {
  return (
    <Busy as="article" className="dz dz-detail" label="Loading case study">
      <header className="dz-head">
        <div className="dz-in sk-lines" style={{ gap: 16 }}>
          <Sk w={110} h={13} />
          <Sk w={80} h={11} />
          <Sk w="64%" h={48} r={10} />
          <Sk w="48%" h={18} />
          <SkLines lines={2} last="40%" h={15} />
        </div>
      </header>
      <div className="dz-hero">
        <div className="dz-in">
          <Sk className="sk-dz-hero" r={0} />
        </div>
      </div>
    </Busy>
  );
}

// Admin tables: a few rows of title + meta + actions.
export function AdminSkeleton({ rows = 5 }) {
  return (
    <Busy className="sk-admin" label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div className="sk-admin-row" key={i} aria-hidden="true">
          <span className="sk-lines" style={{ gap: 8, flex: 1 }}>
            <Sk w={`${40 + ((i * 17) % 30)}%`} h={16} />
            <Sk w="24%" h={11} />
          </span>
          <Sk w={64} h={30} r={999} />
          <Sk w={64} h={30} r={999} />
        </div>
      ))}
    </Busy>
  );
}

// Before the app knows whether the visitor is in: the shape of the home page.
export function SiteSkeleton() {
  return (
    <Busy className="bn sk-site" label="Loading">
      <div className="sk-site-head" aria-hidden="true">
        <Sk w={120} h={30} r={8} />
        <span style={{ display: 'flex', gap: 10 }}>
          <Sk w={70} h={36} r={999} />
          <Sk w={110} h={36} r={999} />
        </span>
      </div>
      <section className="bn-hero" aria-hidden="true">
        <div className="bn-card bn-intro sk-lines" style={{ gap: 16, justifyContent: 'flex-start' }}>
          <Sk w={140} h={14} />
          <Sk w="80%" h={44} r={10} />
          <Sk w="60%" h={44} r={10} />
          <SkLines lines={3} last="50%" h={15} />
        </div>
        <div className="bn-card bn-photo">
          <Sk className="sk-fill" r={0} />
        </div>
      </section>
      <div style={{ height: 'var(--bn-gap, 16px)' }} />
      <ProjectGridSkeleton count={2} />
    </Busy>
  );
}
