import { useEffect } from 'react';
import 'photoswipe/style.css';

// Every case-study image opens full screen: pinch, scroll or double-click to
// zoom, drag to pan, arrows between images. The preview tiles repeat the first
// body images, so the gallery is de-duplicated by src.
const SELECTOR = '.bn-case-main .prose img, .bn-preview-img img';

function size(img) {
  if (img.naturalWidth) return Promise.resolve([img.naturalWidth, img.naturalHeight]);
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => resolve([probe.naturalWidth, probe.naturalHeight]);
    probe.onerror = () => resolve([1600, 1000]);
    probe.src = img.currentSrc || img.src;
  });
}

export default function useImageZoom(ready) {
  useEffect(() => {
    if (!ready) return undefined;
    let pswp = null;

    async function onClick(e) {
      const target = e.target.closest?.(SELECTOR);
      if (!target) return;
      e.preventDefault();

      const seen = new Map();
      for (const img of document.querySelectorAll(SELECTOR)) {
        const src = img.currentSrc || img.src;
        if (!seen.has(src)) seen.set(src, img);
      }
      const imgs = [...seen.values()];
      const index = Math.max(0, imgs.findIndex((img) => (img.currentSrc || img.src) === (target.currentSrc || target.src)));
      const sizes = await Promise.all(imgs.map(size));

      const { default: PhotoSwipe } = await import('photoswipe');
      pswp = new PhotoSwipe({
        dataSource: imgs.map((img, i) => ({
          src: img.currentSrc || img.src,
          width: sizes[i][0],
          height: sizes[i][1],
          alt: img.alt
        })),
        index,
        initialZoomLevel: 'fit',
        // Zoom is relative to the fitted size, so small and huge images both get a real close-up.
        secondaryZoomLevel: (z) => Math.max(z.fit * 2.5, Math.min(1, z.fit * 4)),
        maxZoomLevel: (z) => Math.max(z.fit * 6, 2),
        wheelToZoom: true,
        bgOpacity: 0.92,
        showHideAnimationType: 'fade'
      });
      pswp.init();
    }

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      pswp?.destroy();
    };
  }, [ready]);
}
