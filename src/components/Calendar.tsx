import { useEffect, useId, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { dateFromKey, localDateKey, monthCells, monthLabel } from '../lib/calendar';
import type { Activity } from '../types/portal';

export default function Calendar({
  activities,
  selectedDate,
  initialDate,
  onSelect,
  large = false,
}: {
  activities: Activity[];
  selectedDate?: string;
  initialDate?: string;
  onSelect: (date: string) => void;
  large?: boolean;
}) {
  const [month, setMonth] = useState(() => dateFromKey(initialDate || localDateKey(new Date())));
  const labelId = useId();
  useEffect(() => {
    if (initialDate) setMonth(dateFromKey(initialDate));
  }, [initialDate]);
  const today = localDateKey(new Date());
  const cells = monthCells(month);
  const fullWeekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  return (
    <section
      className={`calendar-panel panel ${large ? 'calendar-large' : ''}`}
      aria-labelledby={labelId}
    >
      <div className="panel-heading">
        <h2 id={labelId}>
          <CalendarDays size={27} strokeWidth={1.5} />
          Calendário
        </h2>
      </div>
      <div className="calendar-month">
        <button
          className="icon-button"
          aria-label="Mês anterior"
          onClick={() =>
            setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
          }
        >
          <ChevronLeft size={18} />
        </button>
        <span aria-live="polite">{monthLabel(month)}</span>
        <button
          className="icon-button"
          aria-label="Próximo mês"
          onClick={() =>
            setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
          }
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
          <span key={index} title={fullWeekdays[index]}>
            {day}
          </span>
        ))}
      </div>
      <div className="calendar-days">
        {cells.map((date, index) => {
          if (!date) return <span className="calendar-blank" key={`blank-${index}`} />;
          const deadlines = activities.filter(
            (activity) => activity.dueDate === date && activity.status === 'open',
          ).length;
          const label = dateFromKey(date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          return (
            <button
              key={date}
              className={`calendar-day ${deadlines ? 'has-deadline' : ''} ${date === today ? 'is-today' : ''} ${date === selectedDate ? 'is-selected' : ''}`}
              onClick={() => onSelect(date)}
              aria-label={`${label}${deadlines ? `, ${deadlines} atividade${deadlines > 1 ? 's' : ''} em aberto` : ''}`}
              aria-pressed={date === selectedDate}
              aria-current={date === today ? 'date' : undefined}
            >
              <span>{dateFromKey(date).getDate()}</span>
              {large && deadlines > 0 && (
                <span className="day-deadline-count">
                  {deadlines} {deadlines === 1 ? 'prazo' : 'prazos'}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {large && (
        <div className="calendar-legend">
          <span>
            <i className="legend-deadline" />
            Atividade em aberto
          </span>
          <span>
            <i className="legend-today" />
            Hoje
          </span>
        </div>
      )}
    </section>
  );
}
