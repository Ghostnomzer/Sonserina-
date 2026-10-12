import { useEffect, useState } from 'react';

type MotionPreference = 'enabled' | 'paused' | null;
const storageKey = 'sonserina.motion.v1';
const mediaQuery = '(prefers-reduced-motion: reduce)';

function readPreference(): MotionPreference {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'enabled' || value === 'paused' ? value : null;
  } catch {
    return null;
  }
}

export function useMotionPreference() {
  const [preference, setPreference] = useState<MotionPreference>(readPreference);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(mediaQuery).matches);

  useEffect(() => {
    const media = window.matchMedia(mediaQuery);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const enabled = preference === null ? !reducedMotion : preference === 'enabled';

  function toggle() {
    const next = enabled ? 'paused' : 'enabled';
    setPreference(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // O controle funciona também quando o navegador não permite persistir a preferência.
    }
  }

  return { enabled, toggle };
}
