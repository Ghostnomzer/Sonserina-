import { useEffect, useState } from 'react';
import { createInitialState } from '../data/portal';
import { loadPortalState, savePortalState } from '../lib/storage';
import type { Activity, Profile } from '../types/portal';

export function usePortal() {
  const [state, setState] = useState(() => loadPortalState(createInitialState()));
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    setStorageAvailable(savePortalState(state));
  }, [state]);

  function saveActivity(activity: Activity) {
    setState((current) => ({
      ...current,
      activities: current.activities.some((item) => item.id === activity.id)
        ? current.activities.map((item) => (item.id === activity.id ? activity : item))
        : [...current.activities, activity],
    }));
  }

  function toggleActivity(id: string) {
    setState((current) => ({
      ...current,
      activities: current.activities.map((activity) =>
        activity.id === id
          ? { ...activity, status: activity.status === 'open' ? 'completed' : 'open' }
          : activity,
      ),
    }));
  }

  function deleteActivity(id: string) {
    setState((current) => ({
      ...current,
      activities: current.activities.filter((activity) => activity.id !== id),
    }));
  }

  function saveProfile(profile: Profile) {
    setState((current) => ({ ...current, profile }));
  }

  function markNoticeRead(id: string) {
    setState((current) => ({
      ...current,
      readNotices: [...new Set([...current.readNotices, id])],
    }));
  }

  return {
    state,
    storageAvailable,
    saveActivity,
    toggleActivity,
    deleteActivity,
    saveProfile,
    markNoticeRead,
  };
}
