import type { PortalState, Subject, SubjectIcon } from '../types/portal';

export const subjectIconOptions: { value: SubjectIcon; label: string }[] = [
  { value: 'book', label: 'Livro' },
  { value: 'flask', label: 'Poção' },
  { value: 'shield', label: 'Escudo' },
  { value: 'wand', label: 'Varinha' },
  { value: 'plant', label: 'Planta' },
  { value: 'skull', label: 'Caveira' },
];

export function createInitialState(): PortalState {
  return {
    subjects: [],
    activities: [],
    notices: [],
    readNotices: [],
    profile: { name: '', year: '', goal: '' },
  };
}

export function subjectById(subjects: Subject[], id: string): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}
