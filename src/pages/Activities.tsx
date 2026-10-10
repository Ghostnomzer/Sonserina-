import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { subjectById } from '../data/portal';
import { sortByDeadline } from '../lib/calendar';
import type { Activity, Subject, SubjectId } from '../types/portal';
import ActivitiesPanel from '../components/ActivitiesPanel';
import PageHeading from '../components/PageHeading';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function Activities({
  activities,
  subjects,
  subjectFilter,
  onFilterSubject,
  onSelect,
  onCreate,
}: {
  activities: Activity[];
  subjects: Subject[];
  subjectFilter: SubjectId | 'all';
  onFilterSubject: (id: SubjectId | 'all') => void;
  onSelect: (id: string) => void;
  onCreate?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'open' | 'completed'>('all');
  const filtered = useMemo(
    () =>
      sortByDeadline(
        activities.filter(
          (activity) =>
            (subjectFilter === 'all' || activity.subjectId === subjectFilter) &&
            (status === 'all' || activity.status === status) &&
            normalize(
              `${activity.title} ${activity.description} ${subjectById(subjects, activity.subjectId)?.name ?? ''}`,
            ).includes(normalize(query)),
        ),
      ),
    [activities, subjects, subjectFilter, status, query],
  );
  const openCount = activities.filter((activity) => activity.status === 'open').length;

  return (
    <>
      <PageHeading
        eyebrow="Ambição em movimento"
        title="Minhas Atividades"
        description="Organize seus próximos passos. Cada entrega é uma conquista."
      >
        {onCreate && (
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={18} />
            Nova atividade
          </button>
        )}
      </PageHeading>
      <section className="activity-toolbar panel" aria-label="Filtros de atividades">
        <div className="filter-top">
          <label className="search-field">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Buscar atividades</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar uma atividade..."
            />
            {query && (
              <button
                className="icon-button"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
              >
                <X size={15} />
              </button>
            )}
          </label>
          <label className="subject-filter">
            <span className="sr-only">Filtrar por disciplina</span>
            <select
              value={subjectFilter}
              onChange={(event) => onFilterSubject(event.target.value as SubjectId | 'all')}
            >
              <option value="all">Todas as disciplinas</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="status-tabs" aria-label="Filtrar por situação">
          {[
            { id: 'all' as const, label: 'Todas', count: activities.length },
            { id: 'open' as const, label: 'Em aberto', count: openCount },
            { id: 'completed' as const, label: 'Concluídas', count: activities.length - openCount },
          ].map((tab) => (
            <button
              key={tab.id}
              aria-pressed={status === tab.id}
              className={status === tab.id ? 'selected' : ''}
              onClick={() => setStatus(tab.id)}
            >
              {tab.label}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>
      </section>
      <ActivitiesPanel
        subjects={subjects}
        activities={filtered}
        title={`${filtered.length} ${filtered.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}`}
        onSelect={onSelect}
        emptyMessage={
          activities.length
            ? 'Nenhuma atividade corresponde aos filtros. Experimente outra busca ou disciplina.'
            : onCreate
              ? 'Cadastre a primeira atividade da casa.'
              : 'As atividades cadastradas pelo administrador aparecerão aqui.'
        }
      />
    </>
  );
}
