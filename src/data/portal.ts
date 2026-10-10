import type { Notice, PortalState, Subject } from '../types/portal';
import { addDays, localDateKey } from '../lib/calendar';

export const subjects: Subject[] = [
  {
    id: 'pocoes',
    name: 'Poções',
    icon: 'flask',
    description:
      'Precisão, paciência e um pouco de magia. Descubra a arte de combinar ingredientes extraordinários.',
    professor: 'Professor Slughorn',
  },
  {
    id: 'defesa',
    name: 'Defesa Contra as Artes das Trevas',
    icon: 'shield',
    description:
      'Aprenda feitiços de proteção e conheça as criaturas e forças que habitam o mundo mágico.',
    professor: 'Professor Lupin',
  },
  {
    id: 'transfiguracao',
    name: 'Transfiguração',
    icon: 'wand',
    description:
      'Transforme o comum em extraordinário com concentração, técnica e domínio da sua varinha.',
    professor: 'Professora McGonagall',
  },
  {
    id: 'historia',
    name: 'História da Magia',
    icon: 'book',
    description:
      'Explore as histórias, as casas e os acontecimentos que deram forma ao nosso mundo.',
    professor: 'Professor Binns',
  },
  {
    id: 'criaturas',
    name: 'Trato de Criaturas Mágicas',
    icon: 'plant',
    description:
      'Conheça seres fascinantes e aprenda a cuidar deles com respeito e responsabilidade.',
    professor: 'Professor Hagrid',
  },
  {
    id: 'artes',
    name: 'Artes das Trevas',
    icon: 'skull',
    description:
      'Estude as origens e as consequências da magia sombria por meio de pesquisa e reflexão.',
    professor: 'Professor Snape',
  },
];

export const notices: Notice[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo à sala comunal',
    category: 'Boas-vindas',
    body: 'Este é o seu espaço para organizar estudos e acompanhar cada conquista. Explore as disciplinas, veja os próximos prazos e faça da sua ambição uma rotina.',
  },
  {
    id: 'planning',
    title: 'Uma boa estratégia começa com um plano',
    category: 'Organização',
    body: 'Reserve um momento da semana para conferir o calendário. Você pode criar suas próprias atividades e marcar as entregas concluídas em Minhas Atividades.',
  },
  {
    id: 'house',
    title: 'A força da nossa casa',
    category: 'Sonserina',
    body: 'Ambição, disciplina, estratégia e lealdade. Grandes conquistas começam com pequenos passos bem direcionados.',
  },
];

export function createInitialState(today = new Date()): PortalState {
  const due = (days: number) => localDateKey(addDays(today, days));
  return {
    version: 1,
    profile: { name: '', year: '1º ano', goal: 'Transformar planos em conquistas.' },
    readNotices: [],
    activities: [
      {
        id: 'invisibility',
        subjectId: 'pocoes',
        title: 'Relatório de Experimento — Poção da Invisibilidade',
        description: 'Descrever o processo, resultados e possíveis falhas.',
        dueDate: due(1),
        status: 'open',
      },
      {
        id: 'creatures',
        subjectId: 'defesa',
        title: 'Análise de Criaturas Mágicas',
        description: 'Pesquisa individual sobre uma criatura e suas características.',
        dueDate: due(3),
        status: 'open',
      },
      {
        id: 'transfiguration',
        subjectId: 'transfiguracao',
        title: 'Exercício Prático — Objetos Transfigurados',
        description: 'Apresentar o objeto e explicar o processo utilizado.',
        dueDate: due(6),
        status: 'open',
      },
      {
        id: 'houses',
        subjectId: 'historia',
        title: 'Ensaio — A Influência das Casas de Hogwarts',
        description: 'Texto argumentativo sobre o papel das casas na história da escola.',
        dueDate: due(9),
        status: 'open',
      },
      {
        id: 'dark-arts',
        subjectId: 'artes',
        title: 'Leitura e Resenha — O Legado dos Comensais',
        description: 'Resumir os principais pontos e relacionar com os temas da disciplina.',
        dueDate: due(12),
        status: 'open',
      },
    ],
  };
}

export function subjectById(id: string): Subject {
  return subjects.find((subject) => subject.id === id) ?? subjects[0];
}
