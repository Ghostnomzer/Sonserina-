import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Notice } from '../types/portal';
import { useAsyncAction } from '../hooks/useAsyncAction';
import Modal from './Modal';

export default function NoticeEditor({
  notice,
  onSave,
  onClose,
}: {
  notice?: Notice;
  onSave: (notice: Notice) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(notice?.title ?? '');
  const [category, setCategory] = useState(notice?.category ?? '');
  const [body, setBody] = useState(notice?.body ?? '');
  const action = useAsyncAction();
  return (
    <Modal
      title={notice ? 'Editar aviso' : 'Novo aviso'}
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <p className="modal-intro">Compartilhe uma informação com os membros da casa.</p>
      <form
        className="portal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !body.trim()) return;
          void action.run(() =>
            onSave({
              id: notice?.id ?? crypto.randomUUID(),
              title: title.trim(),
              category: category.trim(),
              body: body.trim(),
            }),
          );
        }}
      >
        <fieldset className="form-fields" disabled={action.busy}>
          <label>
            Título
            <input
              autoFocus
              required
              maxLength={140}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Categoria
            <input
              maxLength={60}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Opcional"
            />
          </label>
          <label>
            Mensagem
            <textarea
              required
              rows={5}
              maxLength={2000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
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
              disabled={!title.trim() || !body.trim()}
            >
              <Check size={17} />
              {action.busy ? 'Salvando...' : 'Publicar aviso'}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
