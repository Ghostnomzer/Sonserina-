-- Conteúdo compartilhado da casa. Nenhum exemplo é inserido nesta migração.
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  icon text not null default 'book' check (icon in ('book', 'flask', 'shield', 'wand', 'plant', 'skull')),
  description text not null default '' check (char_length(description) <= 800),
  professor text not null default '' check (char_length(professor) <= 100),
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 140),
  description text not null default '' check (char_length(description) <= 800),
  due_date date not null check (due_date between date '1900-01-01' and date '9999-12-31'),
  created_at timestamptz not null default now()
);
create index activities_subject_id_idx on public.activities(subject_id);
create index activities_deadline_idx on public.activities(due_date, created_at, id);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 140),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  category text not null default '' check (char_length(category) <= 60),
  created_at timestamptz not null default now()
);

-- A lista de administradores é controlada pelo proprietário do projeto.
-- O e-mail é uma identidade assinada pelo Supabase Auth, nunca user_metadata.
-- Cadastrar uma conta não permite adicionar permissões a essa lista.
create table public.portal_admins (
  email text primary key check (email = lower(btrim(email)) and char_length(email) between 3 and 254)
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  year text not null default '' check (year = '' or year in ('1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano')),
  goal text not null default '' check (char_length(goal) <= 140)
);

create table public.activity_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, activity_id)
);
create index activity_progress_activity_id_idx on public.activity_progress(activity_id);

create table public.notice_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  notice_id uuid not null references public.notices(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, notice_id)
);
create index notice_reads_notice_id_idx on public.notice_reads(notice_id);

-- RLS e privilégios explícitos em todas as tabelas expostas.
-- Sessões anônimas não são membros da casa.
do $$
declare portal_table text;
begin
  foreach portal_table in array array['subjects', 'activities', 'notices', 'portal_admins', 'profiles', 'activity_progress', 'notice_reads'] loop
    execute format('alter table public.%I enable row level security', portal_table);
    execute format('revoke all on public.%I from public, anon, authenticated', portal_table);
    execute format(
      'create policy email_members_only on public.%I as restrictive for all to authenticated using ((select auth.uid()) is not null and (select auth.jwt() ->> ''is_anonymous'') is distinct from ''true'') with check ((select auth.uid()) is not null and (select auth.jwt() ->> ''is_anonymous'') is distinct from ''true'')',
      portal_table
    );
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.subjects, public.activities, public.notices to authenticated;
grant select on public.portal_admins to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.activity_progress, public.notice_reads to authenticated;

create policy admin_identity on public.portal_admins for select to authenticated
  using (email = (select lower(auth.jwt() ->> 'email')));

-- A subconsulta de administradores respeita a RLS de portal_admins.
-- Cada conta vê somente sua própria autorização.
create policy members_read_subjects on public.subjects for select to authenticated using (true);
create policy admins_create_subjects on public.subjects for insert to authenticated
  with check ((select exists(select 1 from public.portal_admins)));
create policy admins_update_subjects on public.subjects for update to authenticated
  using ((select exists(select 1 from public.portal_admins)))
  with check ((select exists(select 1 from public.portal_admins)));
create policy admins_delete_subjects on public.subjects for delete to authenticated
  using ((select exists(select 1 from public.portal_admins)));

create policy members_read_activities on public.activities for select to authenticated using (true);
create policy admins_create_activities on public.activities for insert to authenticated
  with check ((select exists(select 1 from public.portal_admins)));
create policy admins_update_activities on public.activities for update to authenticated
  using ((select exists(select 1 from public.portal_admins)))
  with check ((select exists(select 1 from public.portal_admins)));
create policy admins_delete_activities on public.activities for delete to authenticated
  using ((select exists(select 1 from public.portal_admins)));

create policy members_read_notices on public.notices for select to authenticated using (true);
create policy admins_create_notices on public.notices for insert to authenticated
  with check ((select exists(select 1 from public.portal_admins)));
create policy admins_update_notices on public.notices for update to authenticated
  using ((select exists(select 1 from public.portal_admins)))
  with check ((select exists(select 1 from public.portal_admins)));
create policy admins_delete_notices on public.notices for delete to authenticated
  using ((select exists(select 1 from public.portal_admins)));

create policy own_profile_select on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy own_profile_insert on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy own_profile_update on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy own_progress_select on public.activity_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy own_progress_insert on public.activity_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy own_progress_update on public.activity_progress for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_progress_delete on public.activity_progress for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy own_notice_reads_select on public.notice_reads for select to authenticated
  using ((select auth.uid()) = user_id);
create policy own_notice_reads_insert on public.notice_reads for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy own_notice_reads_update on public.notice_reads for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_notice_reads_delete on public.notice_reads for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Atualizações do conteúdo chegam às contas conectadas sem recarregar a página.
alter publication supabase_realtime add table public.subjects, public.activities, public.notices,
  public.portal_admins, public.profiles, public.activity_progress, public.notice_reads;
