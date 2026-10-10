import { ArrowRight, BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Activity, Subject, SubjectId } from '../types/portal';
import { SubjectIcon } from '../components/Marks';
import PageHeading from '../components/PageHeading';

export default function Subjects({
  activities,
  subjects,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: {
  activities: Activity[];
  subjects: Subject[];
  onSelect: (id: SubjectId) => void;
  onCreate?: () => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="Conhecimento é poder"
        title="Suas Disciplinas"
        description="Explore seus estudos e acompanhe as atividades de cada disciplina."
      >
        {onCreate && (
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={18} />
            Nova disciplina
          </button>
        )}
      </PageHeading>
      {!subjects.length && (
        <section className="panel empty-state">
          <BookOpen size={35} strokeWidth={1.3} />
          <p>
            Nenhuma disciplina cadastrada.
            {onCreate
              ? ' Cadastre a primeira para começar.'
              : ' As disciplinas da casa aparecerão aqui.'}
          </p>
        </section>
      )}
      <div className="subject-cards">
        {subjects.map((subject) => {
          const count = activities.filter(
            (activity) => activity.subjectId === subject.id && activity.status === 'open',
          ).length;
          return (
            <article className="subject-card panel" key={subject.id}>
              <div className="subject-card-top">
                <span className="subject-card-icon">
                  <SubjectIcon type={subject.icon} size={31} />
                </span>
                {onCreate && (
                  <div className="record-actions">
                    <button
                      className="icon-button"
                      onClick={() => onEdit(subject)}
                      aria-label={`Editar ${subject.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => onDelete(subject)}
                      aria-label={`Excluir ${subject.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
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
