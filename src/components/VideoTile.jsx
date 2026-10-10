import { useEffect, useRef, useState } from 'react';

// A preview tile with a play button. The Vimeo player only loads when someone
// presses play, so the case study page stays fast, and it opens large in a
// lightbox because a 16:9 film is unreadable at tile size.
export default function VideoTile({ video }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const opener = openerRef.current;
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open]);

  const src = `https://player.vimeo.com/video/${video.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;

  return (
    <>
      <figure className="bn-preview bn-preview--video">
        <button type="button" className="bn-video-open" onClick={() => setOpen(true)} ref={openerRef}>
          <span className="bn-preview-img">
            <img src={video.poster} alt="" loading="lazy" />
            <span className="bn-video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
            </span>
          </span>
          <span className="bn-video-label">
            Play video{video.duration ? ` · ${video.duration}` : ''}
          </span>
        </button>
        <figcaption>{video.title}</figcaption>
      </figure>

      {open && (
        <div
          className="bn-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bn-lightbox-frame">
            <iframe
              src={src}
              title={video.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button type="button" className="bn-lightbox-close" onClick={() => setOpen(false)} ref={closeRef}>
            Close
          </button>
        </div>
      )}
    </>
  );
}
