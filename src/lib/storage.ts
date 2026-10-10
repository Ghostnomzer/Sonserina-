import { subjects } from '../data/portal';
import { isValidDateKey } from './calendar';
import type { PortalState } from '../types/portal';

export const STORAGE_KEY = 'sonserina.portal.v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPortalState(value: unknown): value is PortalState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.activities) ||
    !isRecord(value.profile) ||
    !Array.isArray(value.readNotices)
  )
    return false;
  const { name, year, goal } = value.profile;
  if (typeof name !== 'string' || typeof year !== 'string' || typeof goal !== 'string')
    return false;
  const ids = new Set<string>();
  return (
    value.readNotices.every((id) => typeof id === 'string') &&
    value.activities.every((activity) => {
      if (
        !isRecord(activity) ||
        typeof activity.id !== 'string' ||
        !activity.id ||
        ids.has(activity.id)
      )
        return false;
      ids.add(activity.id);
      return (
        typeof activity.title === 'string' &&
        activity.title.trim().length > 0 &&
        typeof activity.description === 'string' &&
        subjects.some((subject) => subject.id === activity.subjectId) &&
        isValidDateKey(activity.dueDate) &&
        (activity.status === 'open' || activity.status === 'completed')
      );
    })
  );
}

export function loadPortalState(fallback: PortalState): PortalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved: unknown = JSON.parse(raw);
    return isPortalState(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function savePortalState(state: PortalState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
