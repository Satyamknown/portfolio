export default function ImpactStrip({ items }) {
  if (!items?.length) return null;
  return (
    <section className="dz-impact" aria-label="In numbers">
      <div className="dz-in">
        <div className="dz-kicker">In numbers</div>
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
