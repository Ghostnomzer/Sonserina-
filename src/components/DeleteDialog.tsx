import { Trash2 } from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import Modal from './Modal';

export default function DeleteDialog({
  name,
  kind,
  onDelete,
  onClose,
}: {
  name: string;
  kind: 'disciplina' | 'aviso';
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const action = useAsyncAction();
  return (
    <Modal
      title={`Excluir ${kind}`}
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <p className="modal-intro">
        Excluir “{name}”? Este conteúdo será removido do portal para todos os membros.
      </p>
      {kind === 'disciplina' && (
        <p className="modal-intro">
          Uma disciplina só pode ser removida quando não tiver atividades vinculadas.
        </p>
      )}
      {action.error && (
        <p className="form-error" role="alert">
          {action.error}
        </p>
      )}
      <div className="form-actions">
        <button className="button button-secondary" disabled={action.busy} onClick={onClose}>
          Cancelar
        </button>
        <button
          className="button button-danger"
          disabled={action.busy}
          onClick={() => {
            void action.run(onDelete);
          }}
        >
          <Trash2 size={17} />
          {action.busy ? 'Excluindo...' : 'Confirmar exclusão'}
        </button>
      </div>
    </Modal>
  );
}
