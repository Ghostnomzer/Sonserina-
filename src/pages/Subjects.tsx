import { ArrowRight } from 'lucide-react';
import { subjects } from '../data/portal';
import type { Activity, SubjectId } from '../types/portal';
import { SubjectIcon } from '../components/Marks';
import PageHeading from '../components/PageHeading';

export default function Subjects({
  activities,
  onSelect,
}: {
  activities: Activity[];
  onSelect: (id: SubjectId) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="Conhecimento é poder"
        title="Suas Disciplinas"
        description="Explore seus estudos e acompanhe as atividades de cada disciplina."
      />
      <div className="subject-cards">
        {subjects.map((subject) => {
          const count = activities.filter(
            (activity) => activity.subjectId === subject.id && activity.status === 'open',
          ).length;
          return (
            <article className="subject-card panel" key={subject.id}>
              <span className="subject-card-icon">
                <SubjectIcon type={subject.icon} size={31} />
              </span>
              <h2>{subject.name}</h2>
              <span className="professor-name">{subject.professor}</span>
              <p>{subject.description}</p>
              <div className="subject-card-bottom">
                <span>
                  {count} {count === 1 ? 'atividade em aberto' : 'atividades em aberto'}
                </span>
                <button
                  className="text-button"
                  onClick={() => onSelect(subject.id)}
                  aria-label={`Ver atividades de ${subject.name}`}
                >
                  Ver atividades
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
