import { useRef, useState } from 'react';
import { errorMessage } from '../lib/errors';

export function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const running = useRef(false);
  async function run(action: () => Promise<void>) {
    if (running.current) return false;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      return true;
    } catch (failure) {
      setError(errorMessage(failure));
      return false;
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run, clearError: () => setError('') };
}
