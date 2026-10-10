import { Bell, Check } from 'lucide-react';
import { notices } from '../data/portal';
import PageHeading from '../components/PageHeading';

export default function Notices({
  readNotices,
  onRead,
}: {
  readNotices: string[];
  onRead: (id: string) => void;
}) {
  const unread = notices.filter((notice) => !readNotices.includes(notice.id)).length;
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
      />
      <div className="notice-list">
        {notices.map((notice) => {
          const read = readNotices.includes(notice.id);
          return (
            <article className={`notice-card panel ${read ? 'notice-read' : ''}`} key={notice.id}>
              <div className="notice-icon">
                <Bell size={24} strokeWidth={1.5} />
              </div>
              <div className="notice-content">
                <span className="eyebrow">{notice.category}</span>
                <h2>{notice.title}</h2>
                <p>{notice.body}</p>
                <button className="text-button" disabled={read} onClick={() => onRead(notice.id)}>
                  {read && <Check size={16} />}
                  {read ? 'Lido' : 'Marcar como lido'}
                </button>
              </div>
              {!read && <span className="unread-dot" aria-label="Não lido" />}
            </article>
          );
        })}
      </div>
    </>
  );
}
