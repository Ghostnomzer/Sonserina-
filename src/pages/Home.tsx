import type { Activity, PageId, SubjectId } from '../types/portal';
import { sortByDeadline } from '../lib/calendar';
import ActivitiesPanel from '../components/ActivitiesPanel';
import Calendar from '../components/Calendar';
import MotivationCard from '../components/MotivationCard';
import SubjectsPanel from '../components/SubjectsPanel';
import SummaryCards from '../components/SummaryCards';
import WelcomeBanner from '../components/WelcomeBanner';

export default function Home({
  activities,
  onNavigate,
  onSelectActivity,
  onSelectSubject,
  onSelectDate,
}: {
  activities: Activity[];
  onNavigate: (page: PageId) => void;
  onSelectActivity: (id: string) => void;
  onSelectSubject: (id: SubjectId) => void;
  onSelectDate: (date: string) => void;
}) {
  const openActivities = sortByDeadline(
    activities.filter((activity) => activity.status === 'open'),
  );
  return (
    <>
      <WelcomeBanner />
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <SummaryCards activities={activities} onNavigate={onNavigate} />
          <ActivitiesPanel
            activities={openActivities.slice(0, 5)}
            onSelect={onSelectActivity}
            onViewAll={() => onNavigate('atividades')}
            emptyMessage="Tudo em dia! Suas atividades em aberto aparecerão aqui."
          />
        </div>
        <div className="dashboard-secondary">
          <SubjectsPanel onSelect={onSelectSubject} />
          <Calendar activities={activities} onSelect={onSelectDate} />
          <MotivationCard />
        </div>
      </div>
    </>
  );
}
