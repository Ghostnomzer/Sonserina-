# Portal da Sonserina

Portal acadêmico em React, TypeScript e Vite, com o visual da Sonserina e persistência preparada para Supabase. Interface em português, responsiva e acessível por teclado.

**Site:** https://ghostnomzer.github.io/Sonserina-/

A aplicação começa vazia: nenhuma disciplina, atividade, aviso ou informação de perfil é criada automaticamente. Os exemplos da primeira versão e seu armazenamento local foram removidos.

## Dados e acesso

- O administrador cadastra, edita e exclui disciplinas, atividades e avisos.
- Todos os membros autenticados veem o mesmo conteúdo da casa.
- Cada membro tem seu próprio perfil, registro de conclusão e avisos lidos.
- O Supabase Auth gerencia contas com e-mail e senha, confirmação de e-mail e recuperação de senha.
- As tabelas têm Row Level Security. Uma conta comum não pode alterar conteúdo compartilhado, acessar dados pessoais de outra pessoa ou promover a si mesma a administradora.
- Uma disciplina com atividades vinculadas não pode ser excluída. A interface explica como resolver.
- As alterações são confirmadas pelo servidor antes de mostrar sucesso. Falhas preservam o formulário para uma nova tentativa.
- Realtime e atualização ao reconectar mantêm as informações atualizadas. O calendário usa datas sem conversão para UTC.

A chave `sonserina.portal.v1`, que guardava os exemplos da versão anterior, é removida no primeiro acesso. O navegador guarda somente a sessão do Supabase Auth; os dados do portal ficam no banco.

## Executar

Requisitos: Node.js 22.12 ou superior e npm.

```bash
npm ci
npm run dev
```

Para gerar e conferir a produção:

```bash
npm test
npm run build
npm run preview
```

## Configurar o Supabase

A conexão precisa de um projeto Supabase dedicado. Enquanto `src/config/supabase.ts` estiver vazio, o portal exibe os estados vazios e informa que está sendo preparado; o login e o salvamento ainda não ficam disponíveis.

1. Crie o projeto na organização escolhida.
2. Aplique a migração em `supabase/migrations/` ao projeto, usando o fluxo de migrações do Supabase ou o SQL Editor. A migração não insere dados de exemplo.
3. Informe a URL e a chave **publishable** em `src/config/supabase.ts`. Ambas são identificadores públicos e podem acompanhar o código publicado. As políticas RLS protegem os dados.
4. Em **Authentication → URL Configuration**, configure `https://ghostnomzer.github.io/Sonserina-/` como Site URL e como Redirect URL permitido. Para testes locais, acrescente `http://localhost:5173/` e `http://127.0.0.1:5173/` à lista de redirects.
5. Mantenha a confirmação de e-mail ativada. Em **Authentication → Providers → Email**, confira que cadastros por e-mail estão habilitados. O envio dos e-mails depende da configuração SMTP e dos limites do projeto.
6. No SQL Editor, autorize o e-mail escolhido para o administrador:

```sql
insert into public.portal_admins (email)
values (lower('email-do-administrador@example.com'))
on conflict (email) do nothing;
```

A autorização não cria uma conta nem define uma senha. O administrador deve cadastrar sua conta no site, confirmar o e-mail e entrar. Os controles de gerenciamento aparecem após o login autorizado. A lista de administradores só pode ser alterada por uma conexão administrativa do banco; cada conta consegue consultar apenas sua própria autorização.

**Nunca coloque chaves `secret`, `service_role` ou a senha do banco no frontend ou no repositório.**

Para apontar um ambiente local a outro projeto, copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Esses valores têm prioridade sobre a configuração pública. Os arquivos `.env.local` não são versionados.

## Tabelas

| Tabela              | Dados                      | Acesso                                 |
| ------------------- | -------------------------- | -------------------------------------- |
| `subjects`          | Disciplinas e responsáveis | Membros leem; administrador altera     |
| `activities`        | Atividades e prazos        | Membros leem; administrador altera     |
| `notices`           | Avisos compartilhados      | Membros leem; administrador altera     |
| `portal_admins`     | E-mails autorizados        | Conta consulta somente sua autorização |
| `profiles`          | Nome, ano e objetivo       | Somente o próprio membro               |
| `activity_progress` | Atividades concluídas      | Somente o próprio membro               |
| `notice_reads`      | Avisos lidos               | Somente o próprio membro               |

## Organização do código

```text
src/
  config/supabase.ts       URL e chave pública do projeto
  lib/supabase.ts          Cliente e sessão Supabase
  lib/portalRepository.ts  Consultas paginadas e operações no banco
  hooks/usePortal.ts      Carregamento, sessão, progresso e sincronização
  components/             Blocos visuais, formulários e diálogos
  pages/                  Início, atividades, calendário, disciplinas, avisos e perfil
  data/portal.ts          Estado inicial vazio e opções de ícones
  types/                  Tipos da aplicação e do banco
  styles/                 Tema, fontes e comportamento responsivo
supabase/
  config.toml             Configuração para desenvolvimento local
  migrations/             Esquema, permissões, RLS e Realtime
  tests/portal_rls.sql     Verificação de acesso e integridade com rollback
  tests/bootstrap.sql     Base mínima para PostgreSQL temporário de CI
public/
  images/                 Artes locais em WebP
  fonts/                  Fontes locais e licenças
```

`supabase/tests/bootstrap.sql` é exclusivo do banco temporário de testes. Não aplique esse arquivo ao projeto Supabase. O `config.toml` descreve o ambiente local e não altera automaticamente as configurações de autenticação do projeto remoto.

## Publicação e verificação

Alterações na `main` são publicadas automaticamente pelo workflow `.github/workflows/pages.yml`. A configuração do GitHub Pages já usa GitHub Actions.

As verificações incluem TypeScript, build de produção, calendário, estado inicial vazio, progresso por membro e paginação além do limite de linhas da API. Antes de publicar, o workflow também aplica a migração a um PostgreSQL temporário e testa as políticas: edição por administrador, leitura por membro, isolamento do perfil e progresso, bloqueio de promoção indevida e acesso anônimo, integridade das disciplinas e limpeza de registros vinculados. Os registros dos testes SQL são desfeitos com `ROLLBACK`.

Para uma compilação manual no mesmo subdiretório do GitHub Pages:

```bash
VITE_BASE_PATH=/Sonserina-/ npm run build
VITE_BASE_PATH=/Sonserina-/ npm run preview
```

## Artes e fontes

As ilustrações foram geradas seguindo a direção visual da referência e comprimidas em WebP. Cinzel, Cormorant Garamond e Inter são hospedadas localmente; as licenças SIL Open Font License estão em `public/fonts/`. Os ícones vêm de Lucide, sob licença ISC.
