export default function ImpactStrip({ items }) {
  if (!items?.length) return null;
  return (
    <section className="dz-impact" aria-label="Impact">
      <div className="dz-in">
        <div className="dz-kicker">Impact</div>
        <ul className={`dz-impact-grid n${Math.min(items.length, 4)}`}>
          {items.map((m, i) => (
            <li key={i}>
              <span className="dz-impact-value">{m.value}</span>
              <span className="dz-impact-label">{m.label}</span>
              {m.note && <span className="dz-impact-note">{m.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
