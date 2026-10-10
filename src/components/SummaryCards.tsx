import { BookOpen, CalendarDays, ClipboardList } from 'lucide-react';
import { subjects } from '../data/portal';
import { upcomingActivities } from '../lib/calendar';
import type { Activity, PageId } from '../types/portal';

export default function SummaryCards({
  activities,
  onNavigate,
}: {
  activities: Activity[];
  onNavigate: (page: PageId) => void;
}) {
  const items = [
    {
      label: 'Atividades em aberto',
      count: activities.filter((activity) => activity.status === 'open').length,
      icon: ClipboardList,
      page: 'atividades' as const,
    },
    {
      label: 'Próximos prazos',
      count: upcomingActivities(activities).length,
      icon: CalendarDays,
      page: 'calendario' as const,
      hint: 'Prazos nos próximos 7 dias',
    },
    { label: 'Disciplinas', count: subjects.length, icon: BookOpen, page: 'disciplinas' as const },
  ];
  return (
    <div className="summary-grid">
      {items.map(({ label, count, icon: Icon, page, hint }) => (
        <button
          key={label}
          className="summary-card panel"
          onClick={() => onNavigate(page)}
          title={hint}
        >
          <Icon size={31} strokeWidth={1.5} aria-hidden="true" />
          <span className="summary-label">{label}</span>
          <span className="summary-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
