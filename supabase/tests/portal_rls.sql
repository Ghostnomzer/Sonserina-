-- Execute com uma conexão PostgreSQL administrativa.
-- Todos os usuários e registros temporários são desfeitos pelo ROLLBACK.
begin;

insert into auth.users(id, email, aud, role) values
 ('10000000-0000-4000-8000-000000000001', 'admin@sonserina.test', 'authenticated', 'authenticated'),
 ('10000000-0000-4000-8000-000000000002', 'member@sonserina.test', 'authenticated', 'authenticated'),
 ('10000000-0000-4000-8000-000000000003', 'other@sonserina.test', 'authenticated', 'authenticated');
insert into public.portal_admins(email) values ('admin@sonserina.test');
insert into public.profiles(user_id, name) values ('10000000-0000-4000-8000-000000000003', 'Outro membro');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","email":"admin@sonserina.test","role":"authenticated","is_anonymous":false}', true);
set local role authenticated;
insert into public.subjects(id, name) values ('20000000-0000-4000-8000-000000000001', 'Disciplina temporária');
insert into public.activities(id, subject_id, title, due_date) values ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Entrega temporária', '2026-10-10');
insert into public.notices(id, title, body) values ('40000000-0000-4000-8000-000000000001', 'Aviso temporário', 'Mensagem temporária');
update public.subjects set description = 'Atualizada pelo administrador' where id = '20000000-0000-4000-8000-000000000001';
update public.activities set title = 'Entrega atualizada' where id = '30000000-0000-4000-8000-000000000001';
update public.notices set body = 'Mensagem atualizada' where id = '40000000-0000-4000-8000-000000000001';
do $$ begin
  if not exists(select 1 from public.portal_admins where email = 'admin@sonserina.test') then raise exception 'Admin não reconhecido'; end if;
  begin
    delete from public.subjects where id = '20000000-0000-4000-8000-000000000001';
    raise exception 'Disciplina com atividade não deveria ser removida';
  exception when foreign_key_violation then null; end;
end $$;

reset role;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","email":"member@sonserina.test","role":"authenticated","is_anonymous":false,"user_metadata":{"role":"admin","email":"admin@sonserina.test"}}', true);
set local role authenticated;
do $$ declare affected integer; begin
  if not exists(select 1 from public.subjects where id = '20000000-0000-4000-8000-000000000001') then raise exception 'Membro precisa ler as disciplinas'; end if;
  if not exists(select 1 from public.activities where id = '30000000-0000-4000-8000-000000000001') then raise exception 'Membro precisa ler as atividades'; end if;
  if not exists(select 1 from public.notices where id = '40000000-0000-4000-8000-000000000001') then raise exception 'Membro precisa ler os avisos'; end if;
  if exists(select 1 from public.portal_admins) then raise exception 'Membro não pode receber papel admin por user_metadata'; end if;
  if exists(select 1 from public.profiles where user_id = '10000000-0000-4000-8000-000000000003') then raise exception 'Perfil de outro membro exposto'; end if;
  begin
    insert into public.subjects(name) values ('Não autorizada');
    raise exception 'Membro conseguiu criar disciplina';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.activities(subject_id, title, due_date) values ('20000000-0000-4000-8000-000000000001', 'Não autorizada', '2026-10-10');
    raise exception 'Membro conseguiu criar atividade';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.notices(title, body) values ('Não autorizado', 'Mensagem');
    raise exception 'Membro conseguiu criar aviso';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.portal_admins(email) values ('member@sonserina.test');
    raise exception 'Membro conseguiu promover sua própria conta';
  exception when insufficient_privilege then null; end;
  update public.subjects set name = 'Alteração indevida' where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Membro conseguiu editar disciplina'; end if;
  update public.activities set title = 'Alteração indevida' where id = '30000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Membro conseguiu editar atividade'; end if;
  update public.notices set body = 'Alteração indevida' where id = '40000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Membro conseguiu editar aviso'; end if;
  delete from public.activities where id = '30000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Membro conseguiu excluir atividade'; end if;
end $$;

insert into public.profiles(user_id, name) values ('10000000-0000-4000-8000-000000000002', 'Membro');
update public.profiles set goal = 'Objetivo pessoal' where user_id = '10000000-0000-4000-8000-000000000002';
insert into public.activity_progress(user_id, activity_id) values ('10000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001');
insert into public.notice_reads(user_id, notice_id) values ('10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000001');
do $$ begin
  begin
    insert into public.activity_progress(user_id, activity_id) values ('10000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001');
    raise exception 'Membro gravou progresso de outra conta';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.notice_reads(user_id, notice_id) values ('10000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000001');
    raise exception 'Membro gravou leitura de outra conta';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set user_id = '10000000-0000-4000-8000-000000000001' where user_id = '10000000-0000-4000-8000-000000000002';
    raise exception 'Membro transferiu perfil para outra conta';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000003","email":"other@sonserina.test","role":"authenticated","is_anonymous":false}', true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.profiles where user_id = '10000000-0000-4000-8000-000000000002') then raise exception 'Perfil privado exposto'; end if;
  if exists(select 1 from public.activity_progress where activity_id = '30000000-0000-4000-8000-000000000001') then raise exception 'Conclusão de outro membro exposta'; end if;
  if exists(select 1 from public.notice_reads where notice_id = '40000000-0000-4000-8000-000000000001') then raise exception 'Leitura de outro membro exposta'; end if;
end $$;

reset role;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","email":"admin@sonserina.test","role":"authenticated","is_anonymous":true}', true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.subjects) or exists(select 1 from public.activities) or exists(select 1 from public.notices) or exists(select 1 from public.portal_admins) then raise exception 'Sessão anônima acessou conteúdo da casa'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform 1 from public.subjects;
    raise exception 'Visitante recebeu acesso à tabela';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","email":"admin@sonserina.test","role":"authenticated","is_anonymous":false}', true);
set local role authenticated;
delete from public.activities where id = '30000000-0000-4000-8000-000000000001';
delete from public.notices where id = '40000000-0000-4000-8000-000000000001';
delete from public.subjects where id = '20000000-0000-4000-8000-000000000001';
reset role;
do $$ begin
  if exists(select 1 from public.activity_progress where activity_id = '30000000-0000-4000-8000-000000000001') then raise exception 'Progresso órfão'; end if;
  if exists(select 1 from public.notice_reads where notice_id = '40000000-0000-4000-8000-000000000001') then raise exception 'Leitura órfã'; end if;
  raise notice 'RLS OK: admin CRUD, member read-only, own profile/progress/read state, no self-promotion, no anonymous access, FK cleanup';
end $$;
rollback;
