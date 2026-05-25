export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'sensei' | 'admin';
  belt: 'branca' | 'amarela' | 'vermelha' | 'laranja' | 'verde' | 'roxa' | 'marrom' | 'preta';
  xp: number;
  level: number;
  enrolledDate: string;
  completedLessons: string[]; // lesson ids
  certificates: string[]; // certificate URLs or dynamic values
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  country: string;
  wins: number;
  losses: number;
  trophies: number;
  streak: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'Kata' | 'Kumite' | 'Kihon' | 'Defesa Pessoal' | 'Alongamento' | 'Filosofia';
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Faixa Preta';
  videoUrl: string;
  thumbnailUrl: string;
  duration: string; // e.g. "12:15"
  views: number;
  likes: number;
  exercises: string[];
  comments: Comment[];
  isPremium: boolean;
  instructor: string;
}

export interface Comment {
  id: string;
  userName: string;
  userBelt: string;
  text: string;
  date: string;
}

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userBelt: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string; // user upload video
  likes: number;
  replies: {
    id: string;
    userName: string;
    content: string;
    date: string;
  }[];
  date: string;
}

export interface Tournament {
  id: string;
  name: string;
  category: string;
  status: 'Inscrições Abertas' | 'Em Andamento' | 'Finalizado';
  registeredUsersCount: number;
  participants: string[]; // user emails or ids
  bracket: {
    round: number;
    matches: {
      id: string;
      player1: string;
      player2: string;
      score1?: number;
      score2?: number;
      winner?: string;
    }[];
  }[];
  country: string;
  date: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'Kimonos' | 'Faixas' | 'Camisetas' | 'Acessórios' | 'Luvas';
  rating: number;
  sizes: string[];
}
