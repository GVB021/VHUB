export type MediaType = 'video' | 'audio' | 'text' | 'quiz' | 'slide';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  mediaType: MediaType;
  isSpecial?: boolean;
  slideBgUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Dublagem' | 'Fonoaudiologia' | 'Carreira';
  imageUrl: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos os níveis';
  lessons: Lesson[];
}

