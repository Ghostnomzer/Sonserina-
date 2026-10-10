-- Somente para o PostgreSQL temporário de CI. Não aplicar ao projeto Supabase.
-- Reproduz o acesso aos claims assinados recebido pelas funções auth.uid/auth.jwt.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users(id uuid primary key, email text, aud text, role text);
create function auth.jwt() returns jsonb language sql stable
  as $$ select nullif(current_setting('request.jwt.claims', true), '')::jsonb $$;
create function auth.uid() returns uuid language sql stable
  as $$ select (auth.jwt() ->> 'sub')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;
create publication supabase_realtime;
