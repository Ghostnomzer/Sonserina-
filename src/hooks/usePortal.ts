import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createInitialState } from '../data/portal';
import { supabase, getSupabase } from '../lib/supabase';
import {
  deleteRecord,
  fetchPortal,
  writeActivity,
  writeNotice,
  writeProfile,
  writeProgress,
  writeRead,
  writeSubject,
} from '../lib/portalRepository';
import { errorMessage } from '../lib/errors';
import type { Activity, Notice, PortalState, Profile, Subject } from '../types/portal';

function upsertItem<T extends { id: string }>(items: T[], value: T) {
  return items.some((item) => item.id === value.id)
    ? items.map((item) => (item.id === value.id ? value : item))
    : [...items, value];
}

export function usePortal() {
  const [state, setState] = useState(createInitialState);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const activeUser = useRef<string | null>(null);
  const loadSequence = useRef(0);
  const mutationLock = useRef(false);

  // O armazenamento da primeira versão continha exemplos. Os dados do portal agora vêm do servidor.
  useEffect(() => {
    try {
      localStorage.removeItem('sonserina.portal.v1');
    } catch {
      /* Navegador sem armazenamento. */
    }
    if (!supabase) return;
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      activeUser.current = session?.user.id ?? null;
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setPasswordRecovery(false);
    });
    void supabase.auth
      .getSession()
      .then(({ error: failure }) => {
        if (active && failure) {
          setError(errorMessage(failure));
          setAuthLoading(false);
        }
      })
      .catch((failure) => {
        if (active) {
          setError(errorMessage(failure));
          setAuthLoading(false);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = user?.id;
  const refresh = useCallback(async () => {
    if (!userId || !supabase || mutationLock.current) return;
    const sequence = ++loadSequence.current;
    setLoading(true);
    try {
      const result = await fetchPortal(supabase, userId);
      if (sequence !== loadSequence.current || activeUser.current !== userId) return;
      setState(result.state);
      setIsAdmin(result.isAdmin);
      setError('');
    } catch (failure) {
      if (sequence === loadSequence.current && activeUser.current === userId)
        setError(errorMessage(failure));
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    ++loadSequence.current;
    setState(createInitialState());
    setIsAdmin(false);
    setError('');
    setLoading(false);
    void refresh();
    if (!userId || !supabase) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void refresh();
      }, 200);
    };
    const channel = supabase.channel(`portal-${userId}`);
    for (const table of ['subjects', 'activities', 'notices', 'portal_admins']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh);
    }
    for (const table of ['profiles', 'activity_progress', 'notice_reads']) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        scheduleRefresh,
      );
    }
    channel.subscribe();
    const onVisible = () => {
      if (document.visibilityState === 'visible') scheduleRefresh();
    };
    window.addEventListener('online', scheduleRefresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      ++loadSequence.current;
      clearTimeout(timer);
      void supabase?.removeChannel(channel);
      window.removeEventListener('online', scheduleRefresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, refresh]);

  async function mutate<T>(
    operation: (id: string) => Promise<T>,
    update: (current: PortalState, result: T) => PortalState,
  ) {
    const id = activeUser.current;
    if (!id) throw { code: 'session_changed' };
    if (mutationLock.current) throw { code: 'operation_pending' };
    mutationLock.current = true;
    setSaving(true);
    ++loadSequence.current;
    try {
      const result = await operation(id);
      if (activeUser.current !== id) throw { code: 'session_changed' };
      setState((current) => update(current, result));
    } finally {
      mutationLock.current = false;
      setSaving(false);
      setLoading(false);
      if (activeUser.current === id) void refresh();
    }
  }

  function saveActivity(activity: Activity) {
    return mutate(
      () => writeActivity(getSupabase(), activity),
      (current, saved) => ({
        ...current,
        activities: upsertItem(current.activities, saved),
      }),
    );
  }

  function toggleActivity(id: string) {
    const activity = state.activities.find((item) => item.id === id);
    if (!activity) return Promise.reject({ code: 'record_missing' });
    const nextStatus = activity.status === 'open' ? 'completed' : 'open';
    return mutate(
      (userId) => writeProgress(getSupabase(), userId, activity),
      (current) => ({
        ...current,
        activities: current.activities.map((activity) =>
          activity.id === id ? { ...activity, status: nextStatus } : activity,
        ),
      }),
    );
  }

  function deleteActivity(id: string) {
    return mutate(
      () => deleteRecord(getSupabase(), 'activities', id),
      (current) => ({
        ...current,
        activities: current.activities.filter((activity) => activity.id !== id),
      }),
    );
  }

  function saveProfile(profile: Profile) {
    return mutate(
      (id) => writeProfile(getSupabase(), id, profile),
      (current, saved) => ({ ...current, profile: saved }),
    );
  }

  function markNoticeRead(id: string) {
    return mutate(
      (userId) => writeRead(getSupabase(), userId, id),
      (current) => ({
        ...current,
        readNotices: [...new Set([...current.readNotices, id])],
      }),
    );
  }

  function saveSubject(subject: Subject) {
    return mutate(
      () => writeSubject(getSupabase(), subject),
      (current, saved) => ({ ...current, subjects: upsertItem(current.subjects, saved) }),
    );
  }
  function deleteSubject(id: string) {
    return mutate(
      () => deleteRecord(getSupabase(), 'subjects', id),
      (current) => ({ ...current, subjects: current.subjects.filter((item) => item.id !== id) }),
    );
  }
  function saveNotice(notice: Notice) {
    return mutate(
      () => writeNotice(getSupabase(), notice),
      (current, saved) => ({ ...current, notices: upsertItem(current.notices, saved) }),
    );
  }
  function deleteNotice(id: string) {
    return mutate(
      () => deleteRecord(getSupabase(), 'notices', id),
      (current) => ({
        ...current,
        notices: current.notices.filter((item) => item.id !== id),
        readNotices: current.readNotices.filter((item) => item !== id),
      }),
    );
  }
  async function signOut() {
    const { error: failure } = await getSupabase().auth.signOut({ scope: 'local' });
    if (failure) throw failure;
  }

  return {
    state,
    user,
    authLoading,
    loading,
    saving,
    isAdmin,
    error,
    refresh,
    signOut,
    configured: Boolean(supabase),
    passwordRecovery,
    finishPasswordRecovery: () => setPasswordRecovery(false),
    saveActivity,
    toggleActivity,
    deleteActivity,
    saveProfile,
    markNoticeRead,
    saveSubject,
    deleteSubject,
    saveNotice,
    deleteNotice,
  };
}
