import type { Activity } from '../types/portal';

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = dateFromKey(value);
  return !Number.isNaN(date.getTime()) && localDateKey(date) === value;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(key: string): string {
  return dateFromKey(key).toLocaleDateString('pt-BR');
}

export function monthLabel(date: Date): string {
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthCells(date: Date): (string | null)[] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: firstDay.getDay() }, () => null);
  for (let day = 1; day <= days; day++)
    cells.push(localDateKey(new Date(date.getFullYear(), date.getMonth(), day)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function upcomingActivities(
  activities: Activity[],
  today = new Date(),
  days = 7,
): Activity[] {
  const start = localDateKey(today);
  const end = localDateKey(addDays(today, days));
  return activities
    .filter(
      (activity) =>
        activity.status === 'open' && activity.dueDate >= start && activity.dueDate <= end,
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function sortByDeadline(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
