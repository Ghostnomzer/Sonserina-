import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import type { Activity, Notice, PortalState, Profile, Subject, SubjectIcon } from '../types/portal';
import { createInitialState } from '../data/portal';

type Client = SupabaseClient<Database>;
type Rows = Database['public']['Tables'];

const PAGE_SIZE = 500;

export async function readAllRows<T>(
  request: (from: number, to: number) => PromiseLike<{ data: T[] | null; error?: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const result = await request(from, from + PAGE_SIZE - 1);
    if (result.error) throw result.error;
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export function toSubject(row: Rows['subjects']['Row']): Subject {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    professor: row.professor,
    icon: row.icon as SubjectIcon,
  };
}

export function toActivity(row: Rows['activities']['Row'], completed: Set<string>): Activity {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: completed.has(row.id) ? 'completed' : 'open',
  };
}

export async function fetchPortal(client: Client, userId: string) {
  const [subjects, activities, notices, profile, progress, reads, admins] = await Promise.all([
    readAllRows((from, to) =>
      client.from('subjects').select('*').order('name').order('id').range(from, to).throwOnError(),
    ),
    readAllRows((from, to) =>
      client
        .from('activities')
        .select('*')
        .order('due_date')
        .order('created_at')
        .order('id')
        .range(from, to)
        .throwOnError(),
    ),
    readAllRows((from, to) =>
      client
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to)
        .throwOnError(),
    ),
    client
      .from('profiles')
      .select('name,year,goal')
      .eq('user_id', userId)
      .maybeSingle()
      .throwOnError(),
    readAllRows((from, to) =>
      client
        .from('activity_progress')
        .select('activity_id')
        .eq('user_id', userId)
        .order('activity_id')
        .range(from, to)
        .throwOnError(),
    ),
    readAllRows((from, to) =>
      client
        .from('notice_reads')
        .select('notice_id')
        .eq('user_id', userId)
        .order('notice_id')
        .range(from, to)
        .throwOnError(),
    ),
    client.from('portal_admins').select('email').throwOnError(),
  ]);
  const completed = new Set(progress.map((row) => row.activity_id));
  const state: PortalState = {
    subjects: subjects.map(toSubject),
    activities: activities.map((row) => toActivity(row, completed)),
    notices: notices.map(({ id, title, body, category }) => ({
      id,
      title,
      body,
      category,
    })),
    profile: profile.data ?? createInitialState().profile,
    readNotices: reads.map((row) => row.notice_id),
  };
  return { state, isAdmin: Boolean(admins.data?.length) };
}

export async function writeActivity(client: Client, activity: Activity) {
  const { data } = await client
    .from('activities')
    .upsert({
      id: activity.id,
      subject_id: activity.subjectId,
      title: activity.title,
      description: activity.description,
      due_date: activity.dueDate,
    })
    .select('*')
    .single()
    .throwOnError();
  return toActivity(data, activity.status === 'completed' ? new Set([activity.id]) : new Set());
}

export async function writeSubject(client: Client, subject: Subject) {
  const { data } = await client
    .from('subjects')
    .upsert(subject)
    .select('*')
    .single()
    .throwOnError();
  return toSubject(data);
}

export async function writeNotice(client: Client, notice: Notice) {
  const { data } = await client
    .from('notices')
    .upsert(notice)
    .select('id,title,body,category')
    .single()
    .throwOnError();
  return data;
}

export async function writeProfile(client: Client, userId: string, profile: Profile) {
  const { data } = await client
    .from('profiles')
    .upsert({ user_id: userId, ...profile })
    .select('name,year,goal')
    .single()
    .throwOnError();
  return data;
}

export async function writeProgress(client: Client, userId: string, activity: Activity) {
  if (activity.status === 'open') {
    await client
      .from('activity_progress')
      .upsert({ user_id: userId, activity_id: activity.id })
      .throwOnError();
  } else {
    await client
      .from('activity_progress')
      .delete()
      .eq('user_id', userId)
      .eq('activity_id', activity.id)
      .throwOnError();
  }
}

export async function writeRead(client: Client, userId: string, noticeId: string) {
  await client.from('notice_reads').upsert({ user_id: userId, notice_id: noticeId }).throwOnError();
}

export async function deleteRecord(
  client: Client,
  table: 'activities' | 'subjects' | 'notices',
  id: string,
) {
  await client.from(table).delete().eq('id', id).select('id').single().throwOnError();
}
