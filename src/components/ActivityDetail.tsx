import { useState } from 'react';
import { CalendarDays, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { formatDate } from '../lib/calendar';
import type { Activity, Subject } from '../types/portal';
import { SubjectIcon } from './Marks';
import Modal from './Modal';

export default function ActivityDetail({
  activity,
  subject,
  canManage,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  subject?: Subject;
  canManage: boolean;
  onClose: () => void;
  onToggle: () => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const action = useAsyncAction();
  return (
    <Modal
      title="Sua atividade"
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <div className="detail-subject">
        <SubjectIcon type={subject?.icon ?? 'book'} />
        <span>{subject?.name ?? 'Disciplina indisponível'}</span>
        <span
          className={`status-pill ${activity.status === 'completed' ? 'status-completed' : ''}`}
        >
          {activity.status === 'completed' ? 'Concluída' : 'Em aberto'}
        </span>
      </div>
      <h3 className="detail-title">{activity.title}</h3>
      <p className="detail-description">
        {activity.description || 'Esta atividade ainda não tem uma descrição.'}
      </p>
      <p className="field-hint">A conclusão fica registrada somente no seu progresso.</p>
      {action.error && (
        <p className="form-error" role="alert">
          {action.error}
        </p>
      )}
      <p className="detail-deadline">
        <CalendarDays size={18} />
        Prazo: {formatDate(activity.dueDate)}
      </p>
      {confirmDelete && canManage ? (
        <div className="delete-confirmation">
          <p>
            Excluir esta atividade? Ela será removida do portal e do calendário de todos os membros.
          </p>
          <div className="form-actions">
            <button
              className="button button-secondary"
              disabled={action.busy}
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </button>
            <button
              className="button button-danger"
              disabled={action.busy}
              onClick={() => {
                void action.run(onDelete);
              }}
            >
              <Trash2 size={16} />
              {action.busy ? 'Excluindo...' : 'Confirmar exclusão'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="form-actions detail-actions">
            {canManage && (
              <button className="button button-secondary" disabled={action.busy} onClick={onEdit}>
                <Pencil size={16} />
                Editar
              </button>
            )}
            <button
              className="button button-primary"
              disabled={action.busy}
              onClick={() => {
                void action.run(onToggle);
              }}
            >
              {activity.status === 'open' ? <Check size={17} /> : <RotateCcw size={17} />}
              {action.busy
                ? 'Salvando...'
                : activity.status === 'open'
                  ? 'Marcar como concluída'
                  : 'Reabrir atividade'}
            </button>
          </div>
          {canManage && (
            <button className="text-button delete-button" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              Excluir atividade
            </button>
          )}
        </>
      )}
    </Modal>
  );
}
