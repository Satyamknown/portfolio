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

    // Timeline sequence for normal motion:
    // 0ms - 1800ms: Signature stroke drawing
    // 1800ms: Signature completes
    // 1900ms - 2400ms: Name text fades & slides up
    // 2500ms: Begin smooth splash exit fade
    // 3000ms: Splash completely unmounted
    const textTimer = setTimeout(() => {
      setStage('text');
    }, 1800);

    const exitTimer = setTimeout(() => {
      setStage('exit');
    }, 2600);

    const doneTimer = setTimeout(() => {
      setStage('done');
      onComplete?.();
    }, 3200);

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
        {/* Signature SVG */}
        <div className="splash-signature-wrap">
          <svg
            className={`splash-signature-svg ${reducedMotion ? 'reduced-motion' : ''}`}
            viewBox="0 0 460 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 1. Diagonal left stroke of 'A' */}
            <path
              className="sig-stroke sig-stroke-1"
              pathLength="1000"
              d="M 118,302 C 145,268 172,234 200,196"
              stroke="#171512"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2. Tall ascender loop of 'A' */}
            <path
              className="sig-stroke sig-stroke-2"
              pathLength="1000"
              d="M 194,222 C 214,142 238,62 244,28 C 247,11 243,9 237,24 C 220,68 196,162 190,318"
              stroke="#171512"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3. Cursive "bbhishek" lettering */}
            <path
              className="sig-stroke sig-stroke-3"
              pathLength="1000"
              d="M 192,250 C 196,232 205,210 211,210 C 215,210 213,225 209,247 C 215,228 225,208 231,208 C 235,208 233,227 229,247 C 234,215 246,165 252,165 C 256,165 251,212 247,245 C 253,232 260,231 266,240 M 272,228 L 273,238 M 271,215 L 272,217 M 279,240 C 283,230 291,230 294,237 C 298,241 301,220 307,168 C 311,168 305,216 302,245 C 309,232 316,231 322,240 C 328,230 338,230 340,240 C 343,230 353,168 358,168 C 362,168 356,216 353,245 C 358,235 370,230 380,234 C 386,237 390,234 394,228"
              stroke="#171512"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 4. Underline / flourish slash */}
            <path
              className="sig-stroke sig-stroke-4"
              pathLength="1000"
              d="M 112,308 C 205,284 315,258 408,232"
              stroke="#171512"
              strokeWidth="3.0"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Name typography underneath */}
        <div className={`splash-name ${showName ? 'visible' : ''}`}>
          Abhishek Manjhi
        </div>
      </div>
    </div>
  );
}
