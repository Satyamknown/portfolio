import Markdown from '../Markdown.jsx';
import Shot from './Shot.jsx';
import AccessMatrix from './AccessMatrix.jsx';

function Images({ images, layout }) {
  if (!images?.length) return null;
  return (
    <div className={`dz-media dz-media-${layout || 'full'}`}>
      {images.map((img, i) => (
        <Shot key={img.src || img.alt || i} image={img} zoomable />
      ))}
    </div>
  );
}

export default function Section({ section, index }) {
  const { type = 'text', label, heading, body, images, layout, data } = section;
  const num = String(index + 1).padStart(2, '0');

  return (
    <section className={`dz-sec dz-sec-${type}`}>
      <div className="dz-in">
        <div className="dz-sec-grid">
          <div className="dz-sec-label">
            <span className="dz-sec-num">{num}</span>
            {label && <span>{label}</span>}
          </div>
          <div className="dz-sec-main">
            {heading && <h2 className="dz-sec-heading">{heading}</h2>}
            {body && (
              <div className="dz-body">
                <Markdown>{body}</Markdown>
              </div>
            )}
          </div>
        </div>
        {type === 'matrix' && <AccessMatrix data={data} />}
        <Images images={images} layout={layout} />
      </div>
    </section>
  );
}
