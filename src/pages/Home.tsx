import type { Activity, PageId, Subject, SubjectId } from '../types/portal';
import { sortByDeadline } from '../lib/calendar';
import ActivitiesPanel from '../components/ActivitiesPanel';
import Calendar from '../components/Calendar';
import MotivationCard from '../components/MotivationCard';
import SubjectsPanel from '../components/SubjectsPanel';
import SummaryCards from '../components/SummaryCards';
import WelcomeBanner from '../components/WelcomeBanner';

export default function Home({
  activities,
  subjects,
  onNavigate,
  onSelectActivity,
  onSelectSubject,
  onSelectDate,
  onCreateSubject,
}: {
  activities: Activity[];
  subjects: Subject[];
  onNavigate: (page: PageId) => void;
  onSelectActivity: (id: string) => void;
  onSelectSubject: (id: SubjectId) => void;
  onSelectDate: (date: string) => void;
  onCreateSubject?: () => void;
}) {
  const openActivities = sortByDeadline(
    activities.filter((activity) => activity.status === 'open'),
  );
  return (
    <>
      <WelcomeBanner />
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <SummaryCards
            activities={activities}
            subjectCount={subjects.length}
            onNavigate={onNavigate}
          />
          <ActivitiesPanel
            subjects={subjects}
            activities={openActivities.slice(0, 5)}
            onSelect={onSelectActivity}
            onViewAll={() => onNavigate('atividades')}
            emptyMessage="Tudo em dia! Suas atividades em aberto aparecerão aqui."
          />
        </div>
        <div className="dashboard-secondary">
          <SubjectsPanel
            subjects={subjects}
            onSelect={onSelectSubject}
            onCreate={onCreateSubject}
          />
          <Calendar activities={activities} onSelect={onSelectDate} />
          <MotivationCard />
        </div>
      </div>
    </>
  );
}
