import { ChevronRight } from 'lucide-react';
import type { Subject, SubjectId } from '../types/portal';
import { SerpentMark, SubjectIcon } from './Marks';

export default function SubjectsPanel({
  subjects,
  onSelect,
  onCreate,
}: {
  subjects: Subject[];
  onSelect: (id: SubjectId) => void;
  onCreate?: () => void;
}) {
  return (
    <section className="subjects-panel panel" aria-labelledby="subjects-title">
      <div className="panel-heading">
        <h2 id="subjects-title">
          <SerpentMark />
          Disciplinas
        </h2>
      </div>
      {subjects.length ? (
        <ul className="subject-list">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <button onClick={() => onSelect(subject.id)}>
                <SubjectIcon type={subject.icon} />
                <span>{subject.name}</span>
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>Suas disciplinas aparecerão aqui.</p>
          {onCreate && (
            <button className="text-button" onClick={onCreate}>
              Cadastrar disciplina
            </button>
          )}
        </div>
      )}
    </section>
  );
}
