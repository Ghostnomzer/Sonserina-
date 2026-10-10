import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Subject, SubjectIcon as IconType } from '../types/portal';
import { subjectIconOptions } from '../data/portal';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { SubjectIcon } from './Marks';
import Modal from './Modal';

export default function SubjectEditor({
  subject,
  onSave,
  onClose,
}: {
  subject?: Subject;
  onSave: (subject: Subject) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(subject?.name ?? '');
  const [professor, setProfessor] = useState(subject?.professor ?? '');
  const [description, setDescription] = useState(subject?.description ?? '');
  const [icon, setIcon] = useState<IconType>(subject?.icon ?? 'book');
  const action = useAsyncAction();
  return (
    <Modal
      title={subject ? 'Editar disciplina' : 'Nova disciplina'}
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <p className="modal-intro">Cadastre uma disciplina para organizar as atividades da casa.</p>
      <form
        className="portal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          void action.run(() =>
            onSave({
              id: subject?.id ?? crypto.randomUUID(),
              name: name.trim(),
              professor: professor.trim(),
              description: description.trim(),
              icon,
            }),
          );
        }}
      >
        <fieldset className="form-fields" disabled={action.busy}>
          <label>
            Nome da disciplina
            <input
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label>
            Professor ou responsável
            <input
              maxLength={100}
              value={professor}
              onChange={(event) => setProfessor(event.target.value)}
            />
          </label>
          <label>
            Ícone
            <select value={icon} onChange={(event) => setIcon(event.target.value as IconType)}>
              {subjectIconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <span className="icon-preview">
            <SubjectIcon type={icon} size={29} />
            Prévia do ícone
          </span>
          <label>
            Descrição
            <textarea
              rows={3}
              maxLength={800}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
            <button type="submit" className="button button-primary" disabled={!name.trim()}>
              <Check size={17} />
              {action.busy ? 'Salvando...' : 'Salvar disciplina'}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
