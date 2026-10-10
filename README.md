# Portal da Sonserina

Portal acadêmico inspirado na referência visual da Sonserina: verde profundo, prata, tipografia clássica, um cabeçalho com serpente e um castelo no banner de boas-vindas. Interface em português, responsiva e com navegação por teclado.

**Endereço no GitHub Pages:** https://ghostnomzer.github.io/Sonserina-/

## Executar

Requisitos: Node.js 22.12 ou superior e npm.

```bash
npm ci
npm run dev
```

O endereço local aparece no terminal. Para gerar e conferir a versão de produção:

```bash
npm test
npm run build
npm run preview
```

## Funcionalidades

- Tela inicial com contadores, atividades em aberto, disciplinas e calendário.
- Criação, edição, conclusão, reabertura e exclusão de atividades.
- Busca por título, descrição ou disciplina, com filtros por situação e disciplina.
- Calendário mensal com prazos destacados e consulta das atividades de cada dia.
- Seis disciplinas com acesso às respectivas atividades.
- Avisos que podem ser marcados como lidos.
- Perfil com nome, ano e objetivo pessoal.
- Menu móvel, diálogos acessíveis e respeito à preferência por movimento reduzido.

O primeiro acesso cria cinco atividades de demonstração, com datas relativas ao dia de abertura. O contador de próximos prazos considera os próximos sete dias. Atividades, perfil e avisos lidos são salvos no `localStorage` deste navegador; cada navegador tem seus próprios dados. A aplicação informa quando o navegador impede o salvamento.

## Organização

```text
public/
  images/                Artes em WebP: cabeçalho, castelo, brasão e serpente
  fonts/                 Fontes locais e suas licenças
  favicon.svg            Ícone da aba
src/
  components/            Blocos visuais, calendário e diálogos
  pages/                 Início, atividades, calendário, disciplinas, avisos e perfil
  data/portal.ts         Disciplinas, avisos e atividades de demonstração
  types/portal.ts        Tipos dos dados
  hooks/usePortal.ts     Estado do portal e operações sobre os dados
  lib/                   Datas, persistência, caminhos de assets e testes
  styles/
    tokens.css           Cores, fontes e dimensões do tema
    fonts.css            Declarações das fontes locais
    global.css           Estilos básicos, formulários e acessibilidade
    portal.css           Layout, componentes e páginas
    responsive.css       Adaptação para diferentes larguras
  App.tsx                Navegação e composição da aplicação
  main.tsx               Inicialização do React
.github/workflows/ci.yml     Verificação automática de testes e build
.github/workflows/pages.yml  Publicação no GitHub Pages
```

## Personalizar

Altere as cores e as fontes em `src/styles/tokens.css`. Edite disciplinas e avisos em `src/data/portal.ts`. As artes ficam separadas em `public/images/` para facilitar a troca. As novas atividades podem ser cadastradas pela própria interface.

A navegação usa URLs com hash, como `#atividades`, compatíveis com hospedagem estática. O build gera a pasta `dist/`.

O workflow `Publicar GitHub Pages` verifica o projeto e publica a pasta `dist/` a cada alteração na `main`. A configuração do Pages no repositório usa **GitHub Actions** como origem.

Para a primeira publicação:

1. Abra [Settings → Pages](https://github.com/Ghostnomzer/Sonserina-/settings/pages) e selecione **GitHub Actions** no campo **Source**.
2. Abra [Actions → Publicar GitHub Pages](https://github.com/Ghostnomzer/Sonserina-/actions/workflows/pages.yml), clique em **Run workflow** e escolha a branch `main`.
3. Aguarde o job de publicação terminar. As próximas alterações na `main` publicam automaticamente.

Se a hospedagem usa um subdiretório, informe o caminho ao construir. Exemplo para este repositório no GitHub Pages:

```bash
VITE_BASE_PATH=/Sonserina-/ npm run build
```

## Verificação

Os testes cobrem anos bissextos, alinhamento do calendário, mudanças de mês/ano, fusos horários, limites dos próximos prazos e recuperação de dados salvos ou corrompidos. O build também verifica o TypeScript.

## Artes e fontes

As ilustrações foram geradas para este projeto seguindo a direção visual da referência, e comprimidas em WebP. As fontes Cinzel, Cormorant Garamond e Inter são hospedadas localmente; suas licenças SIL Open Font License estão em `public/fonts/`. Os ícones vêm de Lucide, sob licença ISC.
