import { useEffect, useRef } from 'react';

// On phones a side panel becomes a drawer: it opens half way, a pull up opens it full height, a
// pull down closes it. The pull starts on the grab bar, or anywhere once the drawer's own content is
// scrolled to its top. Desktop panels are untouched.
export default function useDrawer(onClose, key) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(max-width: 1100px)').matches) return undefined;
    let y0 = null;
    let h0 = 0;
    let mode = null; // 'drag' | 'scroll'
    let h = 0;
    const start = (e) => {
      y0 = e.touches[0].clientY;
      h0 = h = el.getBoundingClientRect().height;
      mode = null;
    };
    const move = (e) => {
      if (y0 == null) return;
      const dy = e.touches[0].clientY - y0;
      if (!mode) {
        if (Math.abs(dy) < 6) return;
        const grab = e.target.closest?.('.dh-drawer-grab');
        const full = el.classList.contains('is-full');
        mode = grab || (dy > 0 && el.scrollTop <= 0) || (dy < 0 && !full) ? 'drag' : 'scroll';
        if (mode === 'drag') el.classList.add('is-dragging');
      }
      if (mode !== 'drag') return;
      e.preventDefault();
      h = Math.max(80, Math.min(window.innerHeight * 0.92, h0 - dy));
      el.style.height = `${h}px`;
    };
    const end = () => {
      if (mode === 'drag') {
        const half = window.innerHeight * 0.6;
        const full = window.innerHeight * 0.92;
        el.classList.remove('is-dragging');
        el.style.height = '';
        if (h < half - 90 && h < h0 - 60) close.current?.();
        else el.classList.toggle('is-full', h > (half + full) / 2);
      }
      y0 = null;
      mode = null;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, [key]); // a panel that re-mounts its element (new project) gets the listeners again
  return ref;
}
