import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle, LogIn, LogOut, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { usePortal } from './hooks/usePortal';
import { useAsyncAction } from './hooks/useAsyncAction';
import { subjectById } from './data/portal';
import type { Activity, Notice, PageId, Subject, SubjectId } from './types/portal';
import Header from './components/Header';
import Sidebar, { navigation } from './components/Sidebar';
import Footer from './components/Footer';
import ActivityEditor from './components/ActivityEditor';
import ActivityDetail from './components/ActivityDetail';
import AuthDialog from './components/AuthDialog';
import SubjectEditor from './components/SubjectEditor';
import NoticeEditor from './components/NoticeEditor';
import DeleteDialog from './components/DeleteDialog';
import Home from './pages/Home';
import Activities from './pages/Activities';
import CalendarPage from './pages/CalendarPage';
import Subjects from './pages/Subjects';
import Notices from './pages/Notices';
import Profile from './pages/Profile';

type Editor =
  | { kind: 'activity'; value?: Activity }
  | { kind: 'subject'; value?: Subject }
  | { kind: 'notice'; value?: Notice };
type Deletion = { kind: 'subject'; value: Subject } | { kind: 'notice'; value: Notice };

function currentPage(): PageId {
  const hash = window.location.hash.slice(1);
  return navigation.find((item) => item.id === hash)?.id ?? 'inicio';
}

export default function App() {
  const portal = usePortal();
  const sessionAction = useAsyncAction();
  const [page, setPage] = useState<PageId>(currentPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [calendarDate, setCalendarDate] = useState<string>();
  const [detailId, setDetailId] = useState<string>();
  const [editor, setEditor] = useState<Editor>();
  const [deletion, setDeletion] = useState<Deletion>();
  const [toast, setToast] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const canManage = Boolean(portal.user && portal.isAdmin);

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
    setDetailId(undefined);
    setEditor(undefined);
    setDeletion(undefined);
    setSubjectFilter('all');
    setToast('');
    if (portal.user) setAuthOpen(false);
  }, [portal.user?.id]);

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
  function createActivity() {
    if (!portal.state.subjects.length) {
      setToast('Cadastre uma disciplina para criar a primeira atividade.');
      setEditor({ kind: 'subject' });
    } else setEditor({ kind: 'activity' });
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
          <div className="connection-bar panel">
            <div className="connection-info">
              {portal.authLoading || portal.loading ? (
                <LoaderCircle className="loading-icon" size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
              <span>
                {portal.authLoading ? (
                  'Abrindo seu portal...'
                ) : portal.user ? (
                  <>
                    {canManage ? 'Administrador' : 'Membro da Sonserina'}
                    <small>
                      {portal.saving
                        ? 'Salvando...'
                        : portal.loading
                          ? 'Atualizando...'
                          : 'Seu progresso está vinculado à sua conta.'}
                    </small>
                  </>
                ) : portal.configured ? (
                  'Entre para acompanhar as informações da casa.'
                ) : (
                  'O portal está sendo preparado para receber suas informações.'
                )}
              </span>
            </div>
            {portal.user ? (
              <div className="connection-actions">
                <button
                  className="icon-button"
                  disabled={portal.loading || portal.saving}
                  onClick={() => {
                    void portal.refresh();
                  }}
                  aria-label="Atualizar informações"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  className="text-button"
                  disabled={sessionAction.busy || portal.saving}
                  onClick={() => {
                    void sessionAction.run(portal.signOut);
                  }}
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              portal.configured && (
                <button
                  className="button button-primary"
                  disabled={portal.authLoading}
                  onClick={() => setAuthOpen(true)}
                >
                  <LogIn size={16} />
                  Entrar
                </button>
              )
            )}
          </div>
          {(portal.error || sessionAction.error) && (
            <div className="connection-error" role="alert">
              <p>{portal.error || sessionAction.error}</p>
              {portal.user && (
                <button
                  className="text-button"
                  onClick={() => {
                    void portal.refresh();
                  }}
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}
          <div key={`${page}:${portal.user?.id ?? 'visitor'}`} className="page-content">
            {page === 'inicio' && (
              <Home
                activities={portal.state.activities}
                subjects={portal.state.subjects}
                onNavigate={(next) => {
                  if (next === 'atividades') setSubjectFilter('all');
                  if (next === 'calendario') setCalendarDate(undefined);
                  navigate(next);
                }}
                onSelectActivity={setDetailId}
                onSelectSubject={selectSubject}
                onSelectDate={selectDate}
                onCreateSubject={canManage ? () => setEditor({ kind: 'subject' }) : undefined}
              />
            )}
            {page === 'atividades' && (
              <Activities
                activities={portal.state.activities}
                subjects={portal.state.subjects}
                subjectFilter={subjectFilter}
                onFilterSubject={setSubjectFilter}
                onSelect={setDetailId}
                onCreate={canManage ? createActivity : undefined}
              />
            )}
            {page === 'calendario' && (
              <CalendarPage
                activities={portal.state.activities}
                subjects={portal.state.subjects}
                initialDate={calendarDate}
                onSelectActivity={setDetailId}
              />
            )}
            {page === 'disciplinas' && (
              <Subjects
                subjects={portal.state.subjects}
                activities={portal.state.activities}
                onSelect={selectSubject}
                onCreate={canManage ? () => setEditor({ kind: 'subject' }) : undefined}
                onEdit={(value) => setEditor({ kind: 'subject', value })}
                onDelete={(value) => setDeletion({ kind: 'subject', value })}
              />
            )}
            {page === 'avisos' && (
              <Notices
                notices={portal.state.notices}
                readNotices={portal.state.readNotices}
                onRead={portal.markNoticeRead}
                onCreate={canManage ? () => setEditor({ kind: 'notice' }) : undefined}
                onEdit={(value) => setEditor({ kind: 'notice', value })}
                onDelete={(value) => setDeletion({ kind: 'notice', value })}
              />
            )}
            {page === 'perfil' && (
              <Profile
                profile={portal.state.profile}
                activities={portal.state.activities}
                signedIn={Boolean(portal.user)}
                onSignIn={portal.configured ? () => setAuthOpen(true) : undefined}
                onSave={async (profile) => {
                  await portal.saveProfile(profile);
                  setToast('Seu perfil foi atualizado.');
                }}
              />
            )}
          </div>
          <Footer />
        </main>
      </div>
      {detail && portal.user && !editor && (
        <ActivityDetail
          key={detail.id}
          activity={detail}
          subject={subjectById(portal.state.subjects, detail.subjectId)}
          canManage={canManage}
          onClose={() => setDetailId(undefined)}
          onEdit={() => {
            setEditor({ kind: 'activity', value: detail });
            setDetailId(undefined);
          }}
          onToggle={async () => {
            await portal.toggleActivity(detail.id);
            setDetailId(undefined);
            setToast(
              detail.status === 'open'
                ? 'Mais uma conquista. Atividade concluída!'
                : 'Atividade reaberta.',
            );
          }}
          onDelete={async () => {
            await portal.deleteActivity(detail.id);
            setDetailId(undefined);
            setToast('Atividade excluída.');
          }}
        />
      )}
      {editor?.kind === 'activity' && canManage && (
        <ActivityEditor
          key={editor.value?.id ?? 'new-activity'}
          activity={editor.value}
          subjects={portal.state.subjects}
          defaultSubject={subjectFilter === 'all' ? undefined : subjectFilter}
          onClose={() => setEditor(undefined)}
          onSave={async (activity) => {
            await portal.saveActivity(activity);
            setEditor(undefined);
            setToast('Atividade salva para os membros da casa.');
          }}
        />
      )}
      {editor?.kind === 'subject' && canManage && (
        <SubjectEditor
          key={editor.value?.id ?? 'new-subject'}
          subject={editor.value}
          onClose={() => setEditor(undefined)}
          onSave={async (subject) => {
            await portal.saveSubject(subject);
            setEditor(undefined);
            setToast('Disciplina salva.');
          }}
        />
      )}
      {editor?.kind === 'notice' && canManage && (
        <NoticeEditor
          key={editor.value?.id ?? 'new-notice'}
          notice={editor.value}
          onClose={() => setEditor(undefined)}
          onSave={async (notice) => {
            await portal.saveNotice(notice);
            setEditor(undefined);
            setToast('Aviso publicado.');
          }}
        />
      )}
      {deletion && canManage && (
        <DeleteDialog
          name={deletion.kind === 'subject' ? deletion.value.name : deletion.value.title}
          kind={deletion.kind === 'subject' ? 'disciplina' : 'aviso'}
          onClose={() => setDeletion(undefined)}
          onDelete={async () => {
            if (deletion.kind === 'subject') {
              await portal.deleteSubject(deletion.value.id);
              if (subjectFilter === deletion.value.id) setSubjectFilter('all');
            } else await portal.deleteNotice(deletion.value.id);
            setDeletion(undefined);
            setToast('Registro excluído.');
          }}
        />
      )}
      {(authOpen || portal.passwordRecovery) && portal.configured && (
        <AuthDialog
          key={portal.passwordRecovery ? 'recovery' : 'login'}
          recovery={portal.passwordRecovery}
          onClose={() => {
            setAuthOpen(false);
            portal.finishPasswordRecovery();
          }}
          onSuccess={setToast}
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
