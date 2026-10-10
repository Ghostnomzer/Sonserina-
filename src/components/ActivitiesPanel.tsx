import { ArrowRight, CalendarDays, CheckCheck } from 'lucide-react';
import { subjectById } from '../data/portal';
import { formatDate } from '../lib/calendar';
import type { Activity, Subject } from '../types/portal';
import { SerpentMark, SubjectIcon } from './Marks';

export default function ActivitiesPanel({
  activities,
  subjects,
  onSelect,
  onViewAll,
  title = 'Atividades em aberto',
  emptyMessage = 'Nenhuma atividade por aqui. Sua próxima conquista começa com um novo plano.',
}: {
  activities: Activity[];
  subjects: Subject[];
  onSelect: (id: string) => void;
  onViewAll?: () => void;
  title?: string;
  emptyMessage?: string;
}) {
  return (
    <section className="activities-panel panel" aria-label={title}>
      <div className="panel-heading">
        <h2>
          <SerpentMark />
          {title}
        </h2>
        {onViewAll && (
          <button className="text-button" onClick={onViewAll}>
            Ver todas <ArrowRight size={15} />
          </button>
        )}
      </div>
      {activities.length ? (
        <ul className="activity-list">
          {activities.map((activity) => {
            const subject = subjectById(subjects, activity.subjectId);
            return (
              <li key={activity.id}>
                <button
                  className={`activity-row ${activity.status === 'completed' ? 'activity-completed' : ''}`}
                  onClick={() => onSelect(activity.id)}
                >
                  <span className="activity-icon">
                    <SubjectIcon type={subject?.icon ?? 'book'} size={25} />
                  </span>
                  <span className="activity-content">
                    <span className="activity-subject">
                      {subject?.name ?? 'Disciplina indisponível'}
                    </span>
                    <span className="activity-title">{activity.title}</span>
                    <span className="activity-description">
                      {activity.description || 'Abra a atividade para ver os detalhes.'}
                    </span>
                    <span className="activity-date">
                      <CalendarDays size={13} aria-hidden="true" />
                      Prazo: {formatDate(activity.dueDate)}
                    </span>
                  </span>
                  <span
                    className={`status-pill ${activity.status === 'completed' ? 'status-completed' : ''}`}
                  >
                    {activity.status === 'completed' ? 'Concluída' : 'Em aberto'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <CheckCheck size={35} strokeWidth={1.3} aria-hidden="true" />
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
