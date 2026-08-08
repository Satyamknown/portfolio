import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createCatAnimation } from '../lib/catAnimation.js';

/**
 * Decorative canvas cat that sits above the contact form. Purely presentational —
 * the form stays fully usable without it. The parent drives it imperatively so
 * the animation loop never causes a React render; only the speech line does,
 * and that changes every few seconds at most.
 */
const ContactCat = forwardRef(function ContactCat({ onSettled, prompt }, ref) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const settledRef = useRef(onSettled);
  const [line, setLine] = useState(null);

  settledRef.current = onSettled;

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    animRef.current = createCatAnimation(canvasRef.current, {
      onSettled: () => settledRef.current?.(),
      onSay: (text) => setLine({ text, key: Date.now() })
    });
    return () => animRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (prompt) {
      setLine({ text: prompt, key: Date.now() });
    }
  }, [prompt]);

  useImperativeHandle(ref, () => ({
    focus: () => animRef.current?.focus(),
    submitSuccess: () => animRef.current?.submitSuccess(),
    submitError: () => animRef.current?.submitError()
  }));

  return (
    <div className="cat-stage">
      {line && (
        <p className="cat-bubble" key={line.key}>
          {line.text}
        </p>
      )}
      <canvas ref={canvasRef} className="cat-canvas" aria-hidden="true" />
    </div>
  );
});

export default ContactCat;
