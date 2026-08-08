import feedback from './feedback.js';
import { initScrollIndicator } from './scrollIndicator.js';

const ACTIONABLE_SELECTOR = 'a[href], button:not(:disabled), input[type="submit"]:not(:disabled), [role="button"]:not([disabled]), .btn:not(:disabled)';
const TYPING_SELECTOR = 'input:not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled])';

export function initInteractionSystem() {
  feedback.init();
  const cleanupScroll = initScrollIndicator();

  const onClick = (event) => {
    const target = event.target.closest ? event.target.closest(ACTIONABLE_SELECTOR) : null;
    if (!target) return;
    feedback.tap();
  };

  const onPointerDown = (event) => {
    const target = event.target.closest ? event.target.closest(ACTIONABLE_SELECTOR) : null;
    if (!target) return;
    target.setAttribute('data-pressed', 'true');
  };

  const releasePressed = (event) => {
    const target = event.target.closest ? event.target.closest('[data-pressed]') : null;
    if (target) target.removeAttribute('data-pressed');
  };

  const onKeyDown = (event) => {
    const target = event.target.closest ? event.target.closest(TYPING_SELECTOR) : null;
    if (!target) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (
      event.key.length === 1 ||
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Enter'
    ) {
      feedback.type();
    }
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('pointerup', releasePressed, true);
  document.addEventListener('pointercancel', releasePressed, true);
  document.addEventListener('keydown', onKeyDown, true);

  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('pointerup', releasePressed, true);
    document.removeEventListener('pointercancel', releasePressed, true);
    document.removeEventListener('keydown', onKeyDown, true);
    cleanupScroll();
  };
}
