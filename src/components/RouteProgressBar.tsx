import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const START_PCT = 15;
const FADE_MS = 200;

export default function RouteProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Keep reduced-motion preference in sync if the OS setting changes.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onChange = () => {
      setIsReducedMotion(mq.matches);

      // Immediately hide an active progress bar if the preference changes.
      if (mq.matches) {
        setVisible(false);
        setProgress(0);
      }
    };

    mq.addEventListener('change', onChange);

    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      return;
    }

    // Trigger progress bar when route changes
    setVisible(true);
    setProgress(START_PCT);

    const completeTimer = setTimeout(() => {
      setProgress(100);
    }, 100);

    const fadeTimer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 100 + FADE_MS);

    return () => {
      clearTimeout(completeTimer);
      clearTimeout(fadeTimer);
    };
  }, [location.pathname, location.search, isReducedMotion]);

  if (isReducedMotion || !visible) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page loading"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px]"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #06b6d4, #2563eb)',
        opacity: visible ? 1 : 0,
        transition: 'width 200ms ease-out, opacity 200ms ease-out',
      }}
    />
  );
}