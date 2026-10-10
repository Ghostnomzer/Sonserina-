import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { addDays, localDateKey } from '../lib/calendar';
import type { Activity, Subject, SubjectId } from '../types/portal';
import Modal from './Modal';

export default function ActivityEditor({
  activity,
  subjects,
  defaultSubject,
  onSave,
  onClose,
}: {
  activity?: Activity;
  subjects: Subject[];
  defaultSubject?: SubjectId;
  onSave: (activity: Activity) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [subjectId, setSubjectId] = useState<SubjectId>(
    activity?.subjectId ?? defaultSubject ?? subjects[0]?.id ?? '',
  );
  const [dueDate, setDueDate] = useState(activity?.dueDate ?? localDateKey(addDays(new Date(), 1)));
  const action = useAsyncAction();
  return (
    <Modal
      title={activity ? 'Editar atividade' : 'Uma nova conquista'}
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <p className="modal-intro">Defina a atividade e o prazo para os membros da casa.</p>
      <form
        className="portal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !subjectId) return;
          void action.run(() =>
            onSave({
              id: activity?.id ?? crypto.randomUUID(),
              title: title.trim(),
              description: description.trim(),
              subjectId,
              dueDate,
              status: activity?.status ?? 'open',
            }),
          );
        }}
      >
        <fieldset className="form-fields" disabled={action.busy}>
          <label>
            Título da atividade
            <input
              autoFocus
              required
              maxLength={140}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="O que precisa ser entregue?"
            />
          </label>
          <div className="form-row">
            <label>
              Disciplina
              <select
                required
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value as SubjectId)}
              >
                <option value="" disabled>
                  Selecione uma disciplina
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prazo
              <input
                type="date"
                required
                min="1900-01-01"
                max="9999-12-31"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>
          <label>
            Descrição
            <textarea
              rows={4}
              maxLength={800}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Anote instruções, ideias ou o que precisa ser entregue."
            />
          </label>
          {action.error && (
            <p className="form-error" role="alert">
              {action.error}
            </p>
          )}
          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={!title.trim() || !subjectId}
            >
              {activity ? <Check size={17} /> : <Plus size={17} />}
              {action.busy ? 'Salvando...' : activity ? 'Salvar alterações' : 'Criar atividade'}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
