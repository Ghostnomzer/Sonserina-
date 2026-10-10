import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { usePortal } from './hooks/usePortal';
import type { Activity, PageId, SubjectId } from './types/portal';
import Header from './components/Header';
import Sidebar, { navigation } from './components/Sidebar';
import Footer from './components/Footer';
import ActivityEditor from './components/ActivityEditor';
import ActivityDetail from './components/ActivityDetail';
import Home from './pages/Home';
import Activities from './pages/Activities';
import CalendarPage from './pages/CalendarPage';
import Subjects from './pages/Subjects';
import Notices from './pages/Notices';
import Profile from './pages/Profile';

function currentPage(): PageId {
  const hash = window.location.hash.slice(1);
  return navigation.find((item) => item.id === hash)?.id ?? 'inicio';
}

export default function App() {
  const portal = usePortal();
  const [page, setPage] = useState<PageId>(currentPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [calendarDate, setCalendarDate] = useState<string>();
  const [detailId, setDetailId] = useState<string>();
  const [editor, setEditor] = useState<{ activity?: Activity }>();
  const [toast, setToast] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onHashChange = () => {
      setPage(currentPage());
      setMenuOpen(false);
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = `${navigation.find((item) => item.id === page)?.label} | Portal da Sonserina`;
    setMenuOpen(false);
  }, [page]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 761px)');
    const closeDesktopMenu = () => {
      if (media.matches) setMenuOpen(false);
    };
    media.addEventListener('change', closeDesktopMenu);
    return () => media.removeEventListener('change', closeDesktopMenu);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  function navigate(nextPage: PageId) {
    window.location.hash = nextPage;
    setPage(nextPage);
  }

  function selectSubject(id: SubjectId) {
    setSubjectFilter(id);
    navigate('atividades');
  }
  function selectDate(date: string) {
    setCalendarDate(date);
    navigate('calendario');
  }
  function handleSave(activity: Activity) {
    portal.saveActivity(activity);
    setEditor(undefined);
    setToast(editor?.activity ? 'Atividade atualizada.' : 'Sua próxima conquista foi planejada.');
  }
  const detail = portal.state.activities.find((activity) => activity.id === detailId);

  return (
    <div className="portal-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
          mainRef.current?.scrollIntoView();
        }}
      >
        Pular para o conteúdo
      </a>
      <Header
        profile={portal.state.profile}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((current) => !current)}
      />
      <div className="portal-body">
        <Sidebar page={page} open={menuOpen} onClose={closeMenu} />
        <main id="main-content" ref={mainRef} tabIndex={-1} className="main-content">
          {!portal.storageAvailable && (
            <p className="storage-warning" role="status">
              Este navegador está impedindo o salvamento. Suas alterações ficam disponíveis enquanto
              esta página estiver aberta.
            </p>
          )}
          <div key={page} className="page-content">
            {page === 'inicio' && (
              <Home
                activities={portal.state.activities}
                onNavigate={(next) => {
                  if (next === 'atividades') setSubjectFilter('all');
                  if (next === 'calendario') setCalendarDate(undefined);
                  navigate(next);
                }}
                onSelectActivity={setDetailId}
                onSelectSubject={selectSubject}
                onSelectDate={selectDate}
              />
            )}
            {page === 'atividades' && (
              <Activities
                activities={portal.state.activities}
                subjectFilter={subjectFilter}
                onFilterSubject={setSubjectFilter}
                onSelect={setDetailId}
                onCreate={() => setEditor({})}
              />
            )}
            {page === 'calendario' && (
              <CalendarPage
                activities={portal.state.activities}
                initialDate={calendarDate}
                onSelectActivity={setDetailId}
              />
            )}
            {page === 'disciplinas' && (
              <Subjects activities={portal.state.activities} onSelect={selectSubject} />
            )}
            {page === 'avisos' && (
              <Notices readNotices={portal.state.readNotices} onRead={portal.markNoticeRead} />
            )}
            {page === 'perfil' && (
              <Profile
                profile={portal.state.profile}
                activities={portal.state.activities}
                onSave={(profile) => {
                  portal.saveProfile(profile);
                  setToast('Seu perfil foi atualizado.');
                }}
              />
            )}
          </div>
          <Footer />
        </main>
      </div>
      {detail && !editor && (
        <ActivityDetail
          key={detail.id}
          activity={detail}
          onClose={() => setDetailId(undefined)}
          onEdit={() => {
            setEditor({ activity: detail });
            setDetailId(undefined);
          }}
          onToggle={() => {
            portal.toggleActivity(detail.id);
            setDetailId(undefined);
            setToast(
              detail.status === 'open'
                ? 'Mais uma conquista. Atividade concluída!'
                : 'Atividade reaberta.',
            );
          }}
          onDelete={() => {
            portal.deleteActivity(detail.id);
            setDetailId(undefined);
            setToast('Atividade excluída.');
          }}
        />
      )}
      {editor && (
        <ActivityEditor
          key={editor.activity?.id ?? 'new'}
          activity={editor.activity}
          defaultSubject={subjectFilter === 'all' ? undefined : subjectFilter}
          onSave={handleSave}
          onClose={() => setEditor(undefined)}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button className="icon-button" onClick={() => setToast('')} aria-label="Fechar mensagem">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
