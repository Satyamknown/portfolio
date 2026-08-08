import { useState, useEffect } from 'react';

export default function Splash({ onComplete }) {
  const [stage, setStage] = useState('drawing'); // 'drawing' | 'text' | 'exit' | 'done'
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setReducedMotion(true);
      setStage('exit');
      const timer = setTimeout(() => {
        setStage('done');
        onComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }

    // Timeline sequence:
    // 0ms - 1700ms: Signature image pen trace animation
    // 1700ms: Signature complete
    // 1800ms - 2400ms: Name text fades & slides up
    // 2600ms: Begin smooth splash exit fade
    // 3100ms: Splash completely unmounted
    const textTimer = setTimeout(() => {
      setStage('text');
    }, 1700);

    const exitTimer = setTimeout(() => {
      setStage('exit');
    }, 2500);

    const doneTimer = setTimeout(() => {
      setStage('done');
      onComplete?.();
    }, 3100);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  const showName = stage === 'text' || stage === 'exit';
  const isExiting = stage === 'exit';

  return (
    <div
      className={`splash-overlay ${isExiting ? 'splash-exit' : ''}`}
      onClick={() => {
        setStage('exit');
        setTimeout(() => {
          setStage('done');
          onComplete?.();
        }, 400);
      }}
      role="button"
      tabIndex={0}
      aria-label="Skip loading animation"
    >
      <div className="splash-content">
        {/* Signature image cropped tightly & animated via CSS clip trace */}
        <div className="splash-signature-wrap">
          <img
            src="/signature.png"
            alt="Abhishek Manjhi Signature"
            className={`splash-signature-img ${reducedMotion ? 'reduced-motion' : ''}`}
          />
        </div>

        {/* Name typography underneath */}
        <div className={`splash-name ${showName ? 'visible' : ''}`}>
          Abhishek Manjhi
        </div>
      </div>
    </div>
  );
}

