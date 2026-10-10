import { useEffect, useRef } from 'react';
import { Bell, BookOpen, CalendarDays, ClipboardList, Home, UserRound, X } from 'lucide-react';
import type { PageId } from '../types/portal';
import { Ornament, SerpentMark } from './Marks';

export const navigation = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'atividades', label: 'Minhas Atividades', icon: ClipboardList },
  { id: 'calendario', label: 'Calendário', icon: CalendarDays },
  { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
  { id: 'avisos', label: 'Avisos', icon: Bell },
  { id: 'perfil', label: 'Perfil', icon: UserRound },
] as const;

export default function Sidebar({
  page,
  open,
  onClose,
}: {
  page: PageId;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('a[aria-current="page"]')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = ref.current?.querySelectorAll<HTMLElement>('a, button');
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <button
          className="drawer-backdrop"
          tabIndex={-1}
          aria-label="Fechar menu"
          onClick={onClose}
        />
      )}
      <aside
        ref={ref}
        id="portal-sidebar"
        className={`sidebar ${open ? 'sidebar-open' : ''}`}
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label="Navegação do portal"
      >
        <div className="sidebar-inner">
          <div className="drawer-heading">
            <SerpentMark />
            <span>Sala comunal</span>
            <button className="icon-button" onClick={onClose} aria-label="Fechar menu">
              <X size={22} />
            </button>
          </div>
          <nav aria-label="Menu principal">
            <ul className="nav-list">
              {navigation.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`nav-link ${page === id ? 'active' : ''}`}
                    aria-current={page === id ? 'page' : undefined}
                    onClick={onClose}
                  >
                    <Icon size={23} strokeWidth={1.5} />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="sidebar-quote">
            <SerpentMark />
            <blockquote>
              Grandes conquistas começam com pequenos passos bem direcionados.
            </blockquote>
            <Ornament />
          </div>
        </div>
      </aside>
    </>
  );
}
