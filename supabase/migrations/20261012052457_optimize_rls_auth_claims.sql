-- Materializa os claims assinados uma vez por consulta nas políticas RLS.
-- A autorização continua independente de user_metadata.
do $$
declare portal_table text;
begin
  foreach portal_table in array array['subjects', 'activities', 'notices', 'portal_admins', 'profiles', 'activity_progress', 'notice_reads'] loop
    execute format(
      'alter policy email_members_only on public.%I using ((select auth.uid()) is not null and ((select auth.jwt()) ->> ''is_anonymous'') is distinct from ''true'') with check ((select auth.uid()) is not null and ((select auth.jwt()) ->> ''is_anonymous'') is distinct from ''true'')',
      portal_table
    );
  end loop;
end $$;

alter policy admin_identity on public.portal_admins
  using (email = lower((select auth.jwt()) ->> 'email'));
