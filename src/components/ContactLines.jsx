// Quiet line drawing behind the contact cat: three envelopes floating over a
// small tray, drawn in the same isometric hairline style as the case-study
// film. Purely decorative; it never takes focus and rests under reduced motion.

const ISO = (x, y, z) => [(x - y), (x + y) / 2 - z];

// Points round a rounded rectangle in the ground plane, centred on (0, 0).
function ring(w, d, r, steps = 6) {
  const pts = [];
  const corners = [
    [w / 2 - r, -d / 2 + r, -Math.PI / 2],
    [w / 2 - r, d / 2 - r, 0],
    [-w / 2 + r, d / 2 - r, Math.PI / 2],
    [-w / 2 + r, -d / 2 + r, Math.PI]
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (i / steps) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return pts;
}

const path = (pts) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

// A thin rounded plate: silhouette (top + bottom ring), one inner crease,
// and an optional envelope flap across the top face.
function Plate({ w, d, r, t, z = 0, flap = false, hi = false }) {
  const top = ring(w, d, r).map(([x, y]) => ISO(x, y, z + t));
  const bottom = ring(w, d, r).map(([x, y]) => ISO(x, y, z));
  const inner = ring(w - 8, d - 8, Math.max(r - 4, 1)).map(([x, y]) => ISO(x, y, z + t));
  const xs = top.map(([x]) => x);
  const left = top[xs.indexOf(Math.min(...xs))];
  const right = top[xs.indexOf(Math.max(...xs))];
  const [cx, cy] = ISO(0, 0, z + t);
  const [lx, ly] = ISO(-w / 2 + 4, -d / 2 + 4, z + t);
  const [rx, ry] = ISO(w / 2 - 4, -d / 2 + 4, z + t);
  return (
    <g>
      <path d={path(bottom)} className="cl-solid" />
      <line x1={left[0]} y1={left[1]} x2={left[0]} y2={left[1] + t} className="cl-sil" />
      <line x1={right[0]} y1={right[1]} x2={right[0]} y2={right[1] + t} className="cl-sil" />
      <path d={path(top)} className={`cl-solid ${hi ? 'cl-hi' : ''}`} />
      <path d={path(inner)} className="cl-crease" />
      {flap && <path d={`M${lx} ${ly}L${cx} ${cy + 6}L${rx} ${ry}`} className="cl-crease" />}
    </g>
  );
}

export default function ContactLines() {
  return (
    <svg className="contact-lines" viewBox="-200 -170 400 300" aria-hidden="true" focusable="false">
      {/* dashed guides from each envelope down to the tray */}
      <g className="cl-guides">
        <line x1="-96" y1="-58" x2="-30" y2="70" />
        <line x1="0" y1="-112" x2="0" y2="62" />
        <line x1="96" y1="-40" x2="30" y2="70" />
      </g>
      <g transform="translate(0 78)">
        <Plate w={150} d={110} r={14} t={8} />
      </g>
      <g transform="translate(-96 -58)">
        <g className="cl-float cl-float--a">
        <Plate w={64} d={44} r={6} t={3} flap />
        </g>
      </g>
      <g transform="translate(0 -112)">
        <g className="cl-float cl-float--b">
        <Plate w={76} d={52} r={7} t={3} flap hi />
        </g>
      </g>
      <g transform="translate(96 -40)">
        <g className="cl-float cl-float--c">
        <Plate w={60} d={42} r={6} t={3} flap />
        </g>
      </g>
    </svg>
  );
}
