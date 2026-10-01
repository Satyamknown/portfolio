import { useState } from 'react';

// One image with an optional caption. Without a usable src (not exported yet, or the
// file fails to load) it renders a labelled frame instead of a broken image.
// `zoomable` wraps the image in a link to the full-size file, so a tap on a phone opens
// it on its own, where it can be zoomed. Leave it off inside another link (the index cards).
export default function Shot({ image, eager = false, zoomable = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const { src, alt, caption, placeholder } = image || {};
  const missing = placeholder || !src || failed;
  const img = (
    <img
      src={src}
      alt={alt || ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  return (
    <figure className={`dz-shot ${missing ? 'is-missing' : ''} ${className}`}>
      {missing ? (
        <div className="dz-ph" role="img" aria-label={alt || 'Screen to come'}>
          <span className="dz-ph-tag">Frame to come</span>
          <span className="dz-ph-label">{alt || 'Screen'}</span>
        </div>
      ) : (
        <div className="dz-shot-frame">
          {zoomable ? (
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="dz-shot-open"
              title="Open the full-size image"
            >
              {img}
              <span className="dz-shot-hint" aria-hidden="true">
                Full size ↗
              </span>
            </a>
          ) : (
            img
          )}
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
