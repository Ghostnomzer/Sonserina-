import { useState } from 'react';
import type { Activity, Subject } from '../types/portal';
import { formatDate, localDateKey, sortByDeadline } from '../lib/calendar';
import Calendar from '../components/Calendar';
import PageHeading from '../components/PageHeading';
import ActivitiesPanel from '../components/ActivitiesPanel';

export default function CalendarPage({
  activities,
  subjects,
  initialDate,
  onSelectActivity,
}: {
  activities: Activity[];
  subjects: Subject[];
  initialDate?: string;
  onSelectActivity: (id: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate ?? localDateKey(new Date()));
  const selected = sortByDeadline(
    activities.filter((activity) => activity.dueDate === selectedDate),
  );
  return (
    <>
      <PageHeading
        eyebrow="O tempo a seu favor"
        title="Seu Calendário"
        description="Uma visão dos seus prazos para planejar com antecedência."
      />
      <div className="calendar-page-grid">
        <Calendar
          large
          activities={activities}
          selectedDate={selectedDate}
          initialDate={initialDate}
          onSelect={setSelectedDate}
        />
        <div className="calendar-agenda">
          <ActivitiesPanel
            subjects={subjects}
            title={`Prazos de ${formatDate(selectedDate)}`}
            activities={selected}
            onSelect={onSelectActivity}
            emptyMessage="Nenhuma entrega nesta data. Selecione um dia destacado para ver suas atividades."
          />
          <div className="agenda-note">
            <p>Uma estratégia bem pensada deixa espaço para respirar.</p>
            <span>Selecione uma data para consultar seus prazos.</span>
          </div>
        </div>
      </div>
    </>
  );
}
