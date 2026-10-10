import { useState } from 'react';
import { CalendarDays, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { subjectById } from '../data/portal';
import { formatDate } from '../lib/calendar';
import type { Activity } from '../types/portal';
import { SubjectIcon } from './Marks';
import Modal from './Modal';

export default function ActivityDetail({
  activity,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onClose: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const subject = subjectById(activity.subjectId);
  return (
    <Modal title="Sua atividade" onClose={onClose}>
      <div className="detail-subject">
        <SubjectIcon type={subject.icon} />
        <span>{subject.name}</span>
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
      <p className="detail-deadline">
        <CalendarDays size={18} />
        Prazo: {formatDate(activity.dueDate)}
      </p>
      {confirmDelete ? (
        <div className="delete-confirmation">
          <p>Excluir esta atividade? Ela será removida do seu calendário.</p>
          <div className="form-actions">
            <button className="button button-secondary" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </button>
            <button className="button button-danger" onClick={onDelete}>
              <Trash2 size={16} />
              Confirmar exclusão
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="form-actions detail-actions">
            <button className="button button-secondary" onClick={onEdit}>
              <Pencil size={16} />
              Editar
            </button>
            <button className="button button-primary" onClick={onToggle}>
              {activity.status === 'open' ? <Check size={17} /> : <RotateCcw size={17} />}
              {activity.status === 'open' ? 'Marcar como concluída' : 'Reabrir atividade'}
            </button>
          </div>
          <button className="text-button delete-button" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} />
            Excluir atividade
          </button>
        </>
      )}
    </Modal>
  );
}
