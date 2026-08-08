const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

export function initScrollIndicator() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.createElement('div');
  const thumb = document.createElement('div');
  container.className = 'scroll-indicator';
  container.setAttribute('aria-hidden', 'true');
  thumb.className = 'scroll-indicator__thumb';
  thumb.setAttribute('aria-hidden', 'true');
  container.appendChild(thumb);
  document.body.appendChild(container);

  let raf = null;
  let isDragging = false;
  let dragOffset = 0;
  let targetScroll = window.scrollY;
  let currentTop = 0;
  let currentHeight = 0;
  let hideTimeout = null;
  const crossed = new Set([0]);

  const getViewportHeight = () => window.visualViewport?.height || window.innerHeight;

const layout = () => ({
    viewportHeight: getViewportHeight(),
    contentHeight: document.documentElement.scrollHeight
  });

  const updateThumb = () => {
    const { viewportHeight, contentHeight } = layout();
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const progress = maxScroll ? targetScroll / maxScroll : 0;
    const thumbHeight = clamp(viewportHeight * (viewportHeight / contentHeight), 36, viewportHeight * 0.24);
    const top = clamp(progress * (viewportHeight - thumbHeight), 0, viewportHeight - thumbHeight);
    currentHeight = thumbHeight;
    if (reducedMotion) {
      currentTop = top;
      thumb.style.transform = `translateY(${top}px)`;
      thumb.style.height = `${thumbHeight}px`;
      return;
    }

    thumb.style.height = `${thumbHeight}px`;
    currentTop = lerp(currentTop, top, 0.16);
    thumb.style.transform = `translateY(${currentTop}px)`;
  };

  const setActive = () => {
    container.classList.add('scroll-indicator--active');
    container.classList.remove('scroll-indicator--idle');
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = window.setTimeout(() => {
      container.classList.remove('scroll-indicator--active');
      container.classList.add('scroll-indicator--idle');
    }, 950);
  };

  const maybeTriggerMilestone = () => {
    const { viewportHeight, contentHeight } = layout();
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    const progress = maxScroll ? targetScroll / maxScroll : 0;
    const percent = Math.round(progress * 100);
    const milestones = [0, 25, 50, 75, 100];

    milestones.forEach((threshold) => {
      if (percent >= threshold && !crossed.has(threshold)) {
        crossed.add(threshold);
      }
      if (percent < threshold - 2 && crossed.has(threshold)) {
        crossed.delete(threshold);
      }
    });
  };

  const refresh = () => {
    targetScroll = window.scrollY;
    setActive();
    maybeTriggerMilestone();
  };

  const onScroll = () => {
    targetScroll = window.scrollY;
    setActive();
    maybeTriggerMilestone();
  };

  const onResize = () => {
    targetScroll = window.scrollY;
    updateThumb();
  };

  const onPointerDown = (event) => {
    if (event.target !== thumb) return;
    event.preventDefault();
    isDragging = true;
    dragOffset = event.clientY - thumb.getBoundingClientRect().top;
    thumb.setPointerCapture(event.pointerId);
    container.classList.add('scroll-indicator--dragging');
    setActive();
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    const bounds = container.getBoundingClientRect();
    const position = clamp(event.clientY - bounds.top - dragOffset, 0, bounds.height - currentHeight);
    const fraction = bounds.height > currentHeight ? position / (bounds.height - currentHeight) : 0;
    const { viewportHeight, contentHeight } = layout();
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    targetScroll = fraction * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: 'auto' });
  };

  const onPointerUp = (event) => {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove('scroll-indicator--dragging');
    if (event.pointerId != null && event.target === thumb) {
      thumb.releasePointerCapture(event.pointerId);
    }
    setActive();
  };

  const loop = () => {
    updateThumb();
    raf = requestAnimationFrame(loop);
  };

  refresh();
  raf = requestAnimationFrame(loop);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  thumb.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    thumb.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    if (hideTimeout) clearTimeout(hideTimeout);
    container.remove();
  };
}
