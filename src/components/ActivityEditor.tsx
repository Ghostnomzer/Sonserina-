import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { subjects } from '../data/portal';
import { addDays, localDateKey } from '../lib/calendar';
import type { Activity, SubjectId } from '../types/portal';
import Modal from './Modal';

export default function ActivityEditor({
  activity,
  defaultSubject,
  onSave,
  onClose,
}: {
  activity?: Activity;
  defaultSubject?: SubjectId;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [subjectId, setSubjectId] = useState<SubjectId>(
    activity?.subjectId ?? defaultSubject ?? 'pocoes',
  );
  const [dueDate, setDueDate] = useState(activity?.dueDate ?? localDateKey(addDays(new Date(), 1)));
  return (
    <Modal title={activity ? 'Editar atividade' : 'Uma nova conquista'} onClose={onClose}>
      <p className="modal-intro">
        Dê um nome ao seu próximo passo e defina quando ele deve acontecer.
      </p>
      <form
        className="portal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          onSave({
            id: activity?.id ?? crypto.randomUUID(),
            title: title.trim(),
            description: description.trim(),
            subjectId,
            dueDate,
            status: activity?.status ?? 'open',
          });
        }}
      >
        <label>
          Título da atividade
          <input
            autoFocus
            required
            maxLength={140}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Revisar os ingredientes da Poção Polissuco"
          />
        </label>
        <div className="form-row">
          <label>
            Disciplina
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value as SubjectId)}
            >
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
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button-primary" disabled={!title.trim()}>
            {activity ? <Check size={17} /> : <Plus size={17} />}
            {activity ? 'Salvar alterações' : 'Criar atividade'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
