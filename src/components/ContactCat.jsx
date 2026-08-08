import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createCatAnimation } from '../lib/catAnimation.js';

/**
 * Decorative canvas cat that sits above the contact form. Purely presentational —
 * the form stays fully usable without it. Parent drives it imperatively so the
 * animation loop never causes a React render.
 */
const ContactCat = forwardRef(function ContactCat({ onSettled }, ref) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const settledRef = useRef(onSettled);

  settledRef.current = onSettled;

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    animRef.current = createCatAnimation(canvasRef.current, {
      onSettled: () => settledRef.current?.()
    });
    return () => animRef.current?.destroy();
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => animRef.current?.focus(),
    submitSuccess: () => animRef.current?.submitSuccess(),
    submitError: () => animRef.current?.submitError()
  }));

  return (
    <div className="cat-stage" aria-hidden="true">
      <canvas ref={canvasRef} className="cat-canvas" />
    </div>
  );
});

export default ContactCat;
