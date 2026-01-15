export interface UserProfile {
  age: string;
  region: string;
  status: string;
  goals: string;
  primaryGoal: string;
  timeCapacity: string;
  docLevel: string;
}

export interface Policy {
  id: string;
  name: string;
  category: string;
  target: string;
  region: string; // 'Daegu' | 'Gyeongbuk' | 'Both'
  benefits: string;
  requirements: string;
  process: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  link?: string;
}

export enum AppState {
  FORM = 'FORM',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
