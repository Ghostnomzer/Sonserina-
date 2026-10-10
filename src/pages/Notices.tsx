import { Bell, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Notice } from '../types/portal';
import { useAsyncAction } from '../hooks/useAsyncAction';
import PageHeading from '../components/PageHeading';

export default function Notices({
  readNotices,
  notices,
  onRead,
  onCreate,
  onEdit,
  onDelete,
}: {
  readNotices: string[];
  notices: Notice[];
  onRead: (id: string) => Promise<void>;
  onCreate?: () => void;
  onEdit: (notice: Notice) => void;
  onDelete: (notice: Notice) => void;
}) {
  const unread = notices.filter((notice) => !readNotices.includes(notice.id)).length;
  const action = useAsyncAction();
  return (
    <>
      <PageHeading
        eyebrow="Da nossa sala comunal"
        title="Avisos"
        description={
          unread
            ? `Você tem ${unread} ${unread === 1 ? 'aviso para ler' : 'avisos para ler'}. Fique por dentro do portal.`
            : 'Você está em dia com os avisos da sala comunal.'
        }
      >
        {onCreate && (
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={18} />
            Novo aviso
          </button>
        )}
      </PageHeading>
      {action.error && (
        <p className="form-error" role="alert">
          {action.error}
        </p>
      )}
      {!notices.length && (
        <section className="panel empty-state">
          <Bell size={35} strokeWidth={1.3} />
          <p>Nenhum aviso publicado. As novidades da casa aparecerão aqui.</p>
        </section>
      )}
      <div className="notice-list">
        {notices.map((notice) => {
          const read = readNotices.includes(notice.id);
          return (
            <article className={`notice-card panel ${read ? 'notice-read' : ''}`} key={notice.id}>
              <div className="notice-icon">
                <Bell size={24} strokeWidth={1.5} />
              </div>
              <div className="notice-content">
                {notice.category && <span className="eyebrow">{notice.category}</span>}
                <h2>{notice.title}</h2>
                <p>{notice.body}</p>
                <button
                  className="text-button"
                  disabled={read || action.busy}
                  onClick={() => {
                    void action.run(() => onRead(notice.id));
                  }}
                >
                  {read && <Check size={16} />}
                  {read ? 'Lido' : 'Marcar como lido'}
                </button>
                {onCreate && (
                  <div className="record-actions notice-admin-actions">
                    <button className="text-button" onClick={() => onEdit(notice)}>
                      <Pencil size={14} />
                      Editar aviso
                    </button>
                    <button className="text-button delete-button" onClick={() => onDelete(notice)}>
                      <Trash2 size={14} />
                      Excluir aviso
                    </button>
                  </div>
                )}
              </div>
              {!read && <span className="unread-dot" aria-label="Não lido" />}
            </article>
          );
        })}
      </div>
    </>
  );
}
