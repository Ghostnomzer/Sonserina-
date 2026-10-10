export type PageId = 'inicio' | 'atividades' | 'calendario' | 'disciplinas' | 'avisos' | 'perfil';
export type SubjectId = string;
export type ActivityStatus = 'open' | 'completed';
export type SubjectIcon = 'flask' | 'shield' | 'wand' | 'book' | 'plant' | 'skull';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: SubjectIcon;
  description: string;
  professor: string;
}

export interface Activity {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  dueDate: string;
  status: ActivityStatus;
}

export interface Profile {
  name: string;
  year: string;
  goal: string;
}

export interface PortalState {
  subjects: Subject[];
  activities: Activity[];
  profile: Profile;
  notices: Notice[];
  readNotices: string[];
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: string;
}
