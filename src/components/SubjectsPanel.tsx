import { ChevronRight } from 'lucide-react';
import { subjects } from '../data/portal';
import type { SubjectId } from '../types/portal';
import { SerpentMark, SubjectIcon } from './Marks';

export default function SubjectsPanel({ onSelect }: { onSelect: (id: SubjectId) => void }) {
  return (
    <section className="subjects-panel panel" aria-labelledby="subjects-title">
      <div className="panel-heading">
        <h2 id="subjects-title">
          <SerpentMark />
          Disciplinas
        </h2>
      </div>
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
    </section>
  );
}
