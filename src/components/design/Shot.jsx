import { useState } from 'react';

// One image with an optional caption. Without a usable src (not exported yet, or the
// file fails to load) it renders a labelled frame instead of a broken image.
export default function Shot({ image, eager = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const { src, alt, caption, placeholder } = image || {};
  const missing = placeholder || !src || failed;

  return (
    <figure className={`dz-shot ${missing ? 'is-missing' : ''} ${className}`}>
      {missing ? (
        <div className="dz-ph" role="img" aria-label={alt || 'Screen to come'}>
          <span className="dz-ph-tag">Frame to come</span>
          <span className="dz-ph-label">{alt || 'Screen'}</span>
        </div>
      ) : (
        <div className="dz-shot-frame">
          <img
            src={src}
            alt={alt || ''}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
          />
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
