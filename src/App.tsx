import React, { useState, useEffect } from 'react';
import { 
  CobraKaiLogo, 
  TeamPauloSouzaLogo 
} from './components/Logos';
import { SenseiAI } from './components/SenseiAI';
import { NetflixPlayer } from './components/NetflixPlayer';
import { TournamentBracket } from './components/TournamentBracket';
import { DojoCommunity } from './components/DojoCommunity';
import { DojoStore } from './components/DojoStore';
import { BeltSection } from './components/BeltSection';
import { TrainingGym } from './components/TrainingGym';
import { AdminPanel } from './components/AdminPanel';
import { User, Lesson, Tournament, ForumPost, StoreItem } from './types';
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  Dumbbell, 
  ShoppingBag, 
  LogOut, 
  ChevronRight, 
  Lock, 
  Bell, 
  Sparkles, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Award,
  Users2,
  Mail,
  UserCheck
} from 'lucide-react';

// Live Web Audio Synthesizer for Retro Dojo feel sounds
function playSound(type: 'nav' | 'punch' | 'belt' | 'gong') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (type === 'nav') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'punch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'belt') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'gong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(108, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(102, ctx.currentTime + 0.7);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.15);
    }
  } catch (err) {
    console.warn('Synthesizer audio failed to bind:', err);
  }
}

interface KarateLocalStorageDb {
  users: User[];
  lessons: Lesson[];
  storeItems: StoreItem[];
  tournaments: Tournament[];
  posts: ForumPost[];
  broadcastMessages: string[];
}

const DEFAULT_LOCAL_DB: KarateLocalStorageDb = {
  users: [
    {
      id: 'student-1',
      name: 'João Pedro M. Oliveira',
      email: 'joaopedromoladeoliveira@gmail.com',
      role: 'admin' as const,
      belt: 'preta' as const,
      xp: 850,
      level: 15,
      enrolledDate: '2025-01-20',
      completedLessons: ['kihon-1', 'kata-1'],
      certificates: ['cert-1'],
      followersCount: 228,
      followingCount: 42,
      country: 'Brasil',
      wins: 14,
      losses: 2,
      trophies: 3,
      streak: 5
    },
    {
      id: 'student-2',
      name: 'Carlos Silva',
      email: 'carlossilva@gmail.com',
      role: 'student' as const,
      belt: 'vermelha' as const,
      xp: 410,
      level: 6,
      enrolledDate: '2025-02-14',
      completedLessons: ['kihon-1'],
      certificates: [],
      followersCount: 15,
      followingCount: 30,
      country: 'Brasil',
      wins: 4,
      losses: 3,
      trophies: 0,
      streak: 2
    },
    {
      id: 'student-3',
      name: 'Aline Aoki',
      email: 'alineaoki@gmail.com',
      role: 'sensei' as const,
      belt: 'preta' as const,
      xp: 1240,
      level: 22,
      enrolledDate: '2024-05-10',
      completedLessons: ['kihon-1', 'kata-1', 'kata-2'],
      certificates: ['cert-lenda'],
      followersCount: 304,
      followingCount: 88,
      country: 'Japão',
      wins: 38,
      losses: 5,
      trophies: 6,
      streak: 11
    },
    {
      id: 'student-4',
      name: 'Filipe Souza',
      email: 'filipesouza@gmail.com',
      role: 'student' as const,
      belt: 'verde' as const,
      xp: 610,
      level: 9,
      enrolledDate: '2024-09-01',
      completedLessons: ['kihon-1', 'kihon-2'],
      certificates: [],
      followersCount: 22,
      followingCount: 10,
      country: 'Brasil',
      wins: 8,
      losses: 4,
      trophies: 1,
      streak: 3
    }
  ],
  lessons: [
    {
      id: 'kihon-1',
      title: 'Kihon Básico I: Choku-Zuki e Oizuki',
      description: 'Aprenda os golpes fundamentais de impacto de punho cerrado do Karate Shotokan. O professor detalha o alinhamento corporal e o kime de explosão.',
      category: 'Kihon' as const,
      level: 'Iniciante' as const,
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=350',
      duration: '08:45',
      views: 1420,
      likes: 312,
      exercises: ['Realizar 50 Repetições de socos Choku-Zuki focando no kime', 'Manter Hikite fechado na altura do quadril'],
      isPremium: false,
      instructor: 'Prof. Paulo Souza',
      comments: [
        { id: 'c1', userName: 'Carlos Silva', userBelt: 'vermelha', text: 'Excelente explicação, consegui ajustar a altura do cotovelo!', date: 'ontem' }
      ]
    },
    {
      id: 'kata-1',
      title: 'Kata Heian Shodan: Passo a Passo Completo',
      description: 'O primeiro Kata do estilo Shotokan. Indicado para o desenvolvimento de direção orbital, bases Zenkutsu-dachi sólidas e defesas Gedan-barai.',
      category: 'Kata' as const,
      level: 'Iniciante' as const,
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=350',
      duration: '14:20',
      views: 2420,
      likes: 672,
      exercises: ['Apresentar Heian Shodan no ritmo regulado', 'Concluir todos os giros de costas com equilíbrio'],
      isPremium: false,
      instructor: 'Prof. Paulo Souza',
      comments: []
    },
    {
      id: 'kumite-1',
      title: 'Kumite Avançado: Gyaku-Zuki antecipado e Esquiva',
      description: 'Aprenda técnicas profissionais de combate olímpico com antecipação (sen-no-sen). Especial para lutadores experientes garantirem medalhas.',
      category: 'Kumite' as const,
      level: 'Avançado' as const,
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c07750d?auto=format&fit=crop&q=80&w=350',
      duration: '11:10',
      views: 740,
      likes: 210,
      exercises: ['Simular 20 esquivas laterais conectadas a contra-ataques instantâneos'],
      isPremium: true,
      instructor: 'Prof. Paulo Souza',
      comments: []
    },
    {
      id: 'defesas-1',
      title: 'Defesa Pessoal: Contra-ataque de agarre',
      description: 'Como reagir de forma instantânea contra tentativa de agarre de punhos ou garganta usando o cotovelo e joelhadas explosivas de autodefesa legítima.',
      category: 'Defesa Pessoal' as const,
      level: 'Intermediário' as const,
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=350',
      duration: '09:30',
      views: 930,
      likes: 240,
      exercises: ['Desvencilhar-se simulado focando na base Kiba-Dachi'],
      isPremium: false,
      instructor: 'Sensei Cobra Kai AI',
      comments: []
    }
  ],
  storeItems: [
    {
      id: 'gi-shotokan',
      name: 'Kimono Oficial Shotokan - Team Paulo Souza Heavyweight',
      price: 280,
      originalPrice: 340,
      image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=200',
      category: 'Kimonos' as const,
      rating: 4.9,
      sizes: ['M1', 'M2', 'M3', 'A1', 'A2', 'A3']
    },
    {
      id: 'gi-cobra',
      name: 'Kimono Edição Limitada Cobra Kai "No Mercy" (Black)',
      price: 360,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200',
      category: 'Kimonos' as const,
      rating: 5.0,
      sizes: ['A1', 'A2', 'A3', 'A4']
    },
    {
      id: 'gloves-competition',
      name: 'Luvas de Karatê Homologadas WKF (Kumite)',
      price: 120,
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=200',
      category: 'Luvas' as const,
      rating: 4.7,
      sizes: ['P', 'M', 'G']
    },
    {
      id: 'belt-silk',
      name: 'Faixa Preta Especial de Seda Premium (Bordado Ouro)',
      price: 95,
      image: 'https://images.unsplash.com/photo-1517438476312-10d79c07750d?auto=format&fit=crop&q=80&w=200',
      category: 'Faixas' as const,
      rating: 5.0,
      sizes: ['2.8m', '3.0m', '3.2m']
    },
    {
      id: 'tshirt-cobra',
      name: 'Camiseta Oficial Cobra Kai Dojo "Strike First"',
      price: 70,
      originalPrice: 85,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200',
      category: 'Camisetas' as const,
      rating: 4.8,
      sizes: ['P', 'M', 'G', 'GG']
    },
    {
      id: 'bag-combat',
      name: 'Mochila Esportiva Combat Team Paulo Souza (Impermeável)',
      price: 150,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
      category: 'Acessórios' as const,
      rating: 4.9,
      sizes: ['Único']
    }
  ],
  tournaments: [
    {
      id: 'tour-1',
      name: 'Torneio All Valley Karate Shotokan',
      category: 'Kumite Faixa Preta Absoluto',
      status: 'Inscrições Abertas' as const,
      registeredUsersCount: 12,
      participants: ['alineaoki@gmail.com', 'joaopedromoladeoliveira@gmail.com'],
      bracket: [
        {
          round: 1,
          matches: [
            { id: 'm1', player1: 'Aline Aoki', player2: 'Carlos Silva', score1: 3, score2: 0, winner: 'Aline Aoki' },
            { id: 'm2', player1: 'Filipe Souza', player2: 'Sérgio Santos', score1: 2, score2: 3, winner: 'Sérgio Santos' }
          ]
        },
        {
          round: 2,
          matches: [
            { id: 'm3', player1: 'Aline Aoki', player2: 'Sérgio Santos', score1: undefined, score2: undefined }
          ]
        }
      ],
      country: 'USA',
      date: 'Junho, 2026'
    },
    {
      id: 'tour-2',
      name: 'Copa Regional de Karatê Team Paulo Souza',
      category: 'Kihon & Kata Geral',
      status: 'Em Andamento' as const,
      registeredUsersCount: 24,
      participants: ['alineaoki@gmail.com'],
      bracket: [],
      country: 'Brasil',
      date: 'Maio, 2026'
    }
  ],
  posts: [
    {
      id: 'p-1',
      userId: 'student-3',
      userName: 'Aline Aoki',
      userBelt: 'preta' as const,
      content: 'Oss! Fui aprovada no exame de ábacos e kime técnico! Meu diploma oficial de Faixa Preta está emoldurado no meu quarto. Que orgulho fazer parte da Team Paulo Souza!',
      likes: 18,
      replies: [
        { id: 'rep-1', userName: 'Filipe Souza', content: 'Parabéns maravilhosa! Uma inspiração para todos nós.', date: 'Há 1 hora' }
      ],
      date: 'Há 2 horas'
    }
  ],
  broadcastMessages: [
    "📢 ATENÇÃO ATLETAS: Exame de Graduado dojo habilitado no painel 'Formar Faixa Preta'!",
    "🥋 EVENTO: Treino especial com Prof Paulo Souza nesta Quarta-feira!"
  ]
};

export default function App() {
  // Configs
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [enableSound, setEnableSound] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'sensei' | 'belt' | 'forum' | 'tournaments' | 'store' | 'gym' | 'admin'>('lessons');

  // Interactive message notifications broadcast list
  const [broadcastMessages, setBroadcastMessages] = useState<string[]>([
    "📢 ATENÇÃO ATLETAS: Exame de Graduado dojo habilitado no painel 'Formar Faixa Preta'!",
    "🥋 EVENTO: Treino especial com Prof Paulo Souza nesta Quarta-feira!"
  ]);

  // Auth/Login System configurations
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Database lists
  const [students, setStudents] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(null as any);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('kihon-1');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);

  // Local static/offline state toggle
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Helper to safely manipulate and synchronize client-side database
  const updateLocalDb = (updater: (db: typeof DEFAULT_LOCAL_DB) => void) => {
    const localDbStr = localStorage.getItem('karate_local_db') || JSON.stringify(DEFAULT_LOCAL_DB);
    let localDb;
    try {
      localDb = JSON.parse(localDbStr);
    } catch (e) {
      localDb = DEFAULT_LOCAL_DB;
    }
    updater(localDb);
    localStorage.setItem('karate_local_db', JSON.stringify(localDb));
    
    // Instantly refresh states to avoid delays
    setStudents(localDb.users);
    setLessons(localDb.lessons);
    setStoreItems(localDb.storeItems);
    setTournaments(localDb.tournaments);
    setPosts(localDb.posts);
    setBroadcastMessages(localDb.broadcastMessages);
    
    if (currentUser) {
      const matched = localDb.users.find((u: any) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
      }
    }
  };

  // Synchronize database with Express server real persistent JSON storage
  const syncDatabase = async () => {
    try {
      const res = await fetch('/api/database');
      if (!res.ok) {
        throw new Error(`Server status not ok: ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Not local API server or offline fallback');
      }
      const data = await res.json();
      if (data) {
        if (data.users) setStudents(data.users);
        if (data.lessons) {
          setLessons(data.lessons);
          if (data.lessons.length > 0 && (!activeLessonId || activeLessonId === 'kihon-1')) {
            setActiveLessonId(data.lessons[0].id);
          }
        }
        if (data.storeItems) setStoreItems(data.storeItems);
        if (data.tournaments) setTournaments(data.tournaments);
        if (data.posts) setPosts(data.posts);
        if (data.broadcastMessages) setBroadcastMessages(data.broadcastMessages);

        // Update referencing current user details if logged in
        if (currentUser) {
          const matched = data.users?.find((u: any) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (matched) {
            setCurrentUser(matched);
          }
        }
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.warn('Could not sync with the backend server database, using LocalStorage fallback mode.', err);
      setIsOfflineMode(true);
      
      const localDbStr = localStorage.getItem('karate_local_db') || JSON.stringify(DEFAULT_LOCAL_DB);
      let localDb;
      try {
        localDb = JSON.parse(localDbStr);
      } catch (ex) {
        localDb = DEFAULT_LOCAL_DB;
      }
      
      setStudents(localDb.users);
      setLessons(localDb.lessons);
      setStoreItems(localDb.storeItems);
      setTournaments(localDb.tournaments);
      setPosts(localDb.posts);
      setBroadcastMessages(localDb.broadcastMessages);
      
      if (currentUser) {
        const matched = localDb.users?.find((u: any) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (matched) {
          setCurrentUser(matched);
        }
      }
    }
  };

  useEffect(() => {
    // Check if user session already exists in localStorage to restore logins
    const savedEmail = localStorage.getItem('karate_session_email');
    if (savedEmail) {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail })
      })
      .then(async res => {
        if (!res.ok) throw new Error('Restoration API not responsive');
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Not local API server');
        }
        return res.json();
      })
      .then(user => {
        if (user && !user.error) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      })
      .catch(err => {
        console.warn('Auto login restoration API failed, trying client local fallback recovery.');
        const localDbStr = localStorage.getItem('karate_local_db') || JSON.stringify(DEFAULT_LOCAL_DB);
        let localDb;
        try {
          localDb = JSON.parse(localDbStr);
        } catch (ex) {
          localDb = DEFAULT_LOCAL_DB;
        }
        const matched = localDb.users.find((u: any) => u.email.toLowerCase() === savedEmail.toLowerCase());
        if (matched) {
          setCurrentUser(matched);
          setIsLoggedIn(true);
          setIsOfflineMode(true);
        }
      });
    }

    // Load initial database
    syncDatabase();
    
    // Poll every 5 seconds for real collaborative feel (only if online)
    const interval = setInterval(() => {
      if (!isOfflineMode) {
        syncDatabase();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOfflineMode]);

  // Audio trigger wrapper
  const triggerSound = (type: 'nav' | 'punch' | 'belt' | 'gong') => {
    if (enableSound) {
      playSound(type);
    }
  };

  // Authenticate user real API handles
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerSound('gong');

    const emailInput = authEmail.trim();
    const nameToUse = authName.trim() || 'Alexandre Silva';
    const passwordToUse = authPassword;

    if (!emailInput) {
      alert('Por favor, preencha o seu e-mail!');
      return;
    }
    if (!passwordToUse) {
      alert('Por favor, digite a sua senha para autenticação!');
      return;
    }

    const emailToUse = emailInput;

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const bodyObj = isRegistering 
      ? { email: emailToUse, name: nameToUse, password: passwordToUse }
      : { email: emailToUse, password: passwordToUse };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    })
    .then(async res => {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server connection offline or API route missing on static hosting environment.');
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na autenticação.');
      }
      return data;
    })
    .then(user => {
      if (user && !user.error) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('karate_session_email', user.email);
        syncDatabase();
      } else {
        alert(user?.error || 'Erro ao realizar o login.');
      }
    })
    .catch(err => {
      console.warn('Auth API failed or returned error, evaluating offline mode or error details.', err.message);
      
      // Check if it is a real validation error from the backend instead of a network/connection failure
      const isNetworkError = err.message.toLowerCase().includes('failed to fetch') || 
                             err.message.toLowerCase().includes('networkerror') || 
                             err.message.toLowerCase().includes('network error') ||
                             err.message.toLowerCase().includes('cors') ||
                             err.message.toLowerCase().includes('not valid json') ||
                             err.message.toLowerCase().includes('unexpected token') ||
                             err.message.toLowerCase().includes('missing on static') ||
                             err.message.toLowerCase().includes('offline') ||
                             err.message.toLowerCase().includes('status not ok');

      if (!isNetworkError) {
        alert(err.message); // This blocks the login flow and does NOT approve dashboard entry!
        return;
      }

      console.log('Falling back to local simulation database authorized check.');
      setIsOfflineMode(true);
      
      const localDbStr = localStorage.getItem('karate_local_db') || JSON.stringify(DEFAULT_LOCAL_DB);
      let localDb;
      try {
        localDb = JSON.parse(localDbStr);
      } catch (ex) {
        localDb = DEFAULT_LOCAL_DB;
      }
      
      let existing = localDb.users.find((u: any) => u.email.toLowerCase() === emailToUse.toLowerCase());
      
      if (isRegistering) {
        if (existing) {
          alert('Este e-mail já está cadastrado no banco local offline. Por favor, tente fazer login.');
          return;
        }
        
        const isOwnerAdmin = emailToUse.toLowerCase() === 'joaopedromoladeoliveira@gmail.com' || emailToUse.toLowerCase() === 'joaopedromolaoliveira@gmail.com';
        existing = {
          id: 'student-' + Date.now().toString(),
          name: nameToUse,
          email: emailToUse.toLowerCase(),
          password: passwordToUse,
          role: isOwnerAdmin ? 'admin' : 'student',
          belt: isOwnerAdmin ? 'preta' : 'branca',
          xp: 120,
          level: 2,
          enrolledDate: new Date().toISOString().split('T')[0],
          completedLessons: [],
          certificates: [],
          followersCount: 0,
          followingCount: 3,
          country: 'Brasil',
          wins: 0,
          losses: 0,
          trophies: 0,
          streak: 1
        };
        localDb.users.push(existing);
        localStorage.setItem('karate_local_db', JSON.stringify(localDb));
        alert('Matrícula realizada com sucesso na base local!');
      } else {
        // Login mode
        if (!existing) {
          const isOwnerAdmin = emailToUse.toLowerCase() === 'joaopedromoladeoliveira@gmail.com' || emailToUse.toLowerCase() === 'joaopedromolaoliveira@gmail.com';
          if (isOwnerAdmin) {
            existing = {
              id: 'student-1',
              name: 'João Pedro M. Oliveira',
              email: 'joaopedromoladeoliveira@gmail.com',
              password: passwordToUse,
              role: 'admin',
              belt: 'preta',
              xp: 850,
              level: 15,
              enrolledDate: '2025-01-20',
              completedLessons: ['kihon-1', 'kata-1'],
              certificates: ['cert-1'],
              followersCount: 228,
              followingCount: 42,
              country: 'Brasil',
              wins: 14,
              losses: 2,
              trophies: 3,
              streak: 5
            };
            localDb.users.push(existing);
            localStorage.setItem('karate_local_db', JSON.stringify(localDb));
          } else {
            alert('Conta não encontrada localmente. Crie uma nova matrícula!');
            return;
          }
        } else {
          if (existing.password && passwordToUse && existing.password !== passwordToUse) {
            alert('Senha incorreta! Por favor, tente novamente.');
            return;
          }
          if (!existing.password && passwordToUse) {
            existing.password = passwordToUse;
            localStorage.setItem('karate_local_db', JSON.stringify(localDb));
          }
        }
      }
      
      setCurrentUser(existing);
      setIsLoggedIn(true);
      localStorage.setItem('karate_session_email', existing.email);
      
      setStudents(localDb.users);
      setLessons(localDb.lessons);
      setStoreItems(localDb.storeItems);
      setTournaments(localDb.tournaments);
      setPosts(localDb.posts);
      setBroadcastMessages(localDb.broadcastMessages);
    });
  };



  const handleLogout = () => {
    triggerSound('punch');
    setIsLoggedIn(false);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    localStorage.removeItem('karate_session_email');
  };

  // Progression handles
  const handleAddXP = async (xpGain: number) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === currentUser.id);
        if (u) {
          u.xp += xpGain;
          u.level = Math.max(u.level, Math.floor(u.xp / 150) + 1);
        }
      });
      return;
    }
    try {
      const res = await fetch('/api/user/add_xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, xpGain })
      });
      const updatedUser = await res.json();
      if (updatedUser && !updatedUser.error) {
        setCurrentUser(updatedUser);
        syncDatabase();
      }
    } catch (err) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === currentUser.id);
        if (u) {
          u.xp += xpGain;
          u.level = Math.max(u.level, Math.floor(u.xp / 150) + 1);
        }
      });
    }
  };

  const handleGraduateBelt = async (belt: User['belt']) => {
    triggerSound('belt');
    if (isOfflineMode) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === currentUser.id);
        if (u) u.belt = belt;
      });
      alert(`OSS! Parabéns pela graduação na nova faixa: ${belt.toUpperCase()}!`);
      return;
    }
    try {
      const res = await fetch('/api/user/graduate_belt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, belt })
      });
      const updatedUser = await res.json();
      if (updatedUser && !updatedUser.error) {
        setCurrentUser(updatedUser);
        syncDatabase();
        alert(`OSS! Parabéns pela graduação na nova faixa: ${belt.toUpperCase()}!`);
      }
    } catch (err) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === currentUser.id);
        if (u) u.belt = belt;
      });
      alert(`OSS! Parabéns pela graduação na nova faixa: ${belt.toUpperCase()}!`);
    }
  };

  // Netflix Lessons handlers
  const handleLessonCompleted = async (lessonId: string) => {
    if (currentUser.completedLessons.includes(lessonId)) return;
    if (isOfflineMode) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === currentUser.id);
        if (u && !u.completedLessons.includes(lessonId)) {
          u.completedLessons.push(lessonId);
        }
      });
      await handleAddXP(80);
      alert('Parabéns! Aula marcada como concluída. +80 XP!');
      return;
    }
    try {
      const res = await fetch('/api/user/complete_lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, lessonId })
      });
      const updatedUser = await res.json();
      if (updatedUser && !updatedUser.error) {
        setCurrentUser(updatedUser);
        await handleAddXP(80); // Gain +80 XP for finishing a lesson completely!
        syncDatabase();
        alert('Parabéns! Aula marcada como concluída. +80 XP!');
      }
    } catch (err) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === currentUser.id);
        if (u && !u.completedLessons.includes(lessonId)) {
          u.completedLessons.push(lessonId);
        }
      });
      await handleAddXP(80);
      alert('Parabéns! Aula marcada como concluída. +80 XP!');
    }
  };

  const handleAddComment = async (lessonId: string, commentText: string) => {
    const isUserAdmin = currentUser.role === 'admin';
    const comm = {
      id: Date.now().toString(),
      userName: isUserAdmin ? 'Sensei Administrador' : currentUser.name,
      userBelt: currentUser.belt,
      text: commentText,
      date: 'Agora'
    };

    if (isOfflineMode) {
      updateLocalDb(db => {
        const l = db.lessons.find(x => x.id === lessonId);
        if (l) l.comments.unshift(comm);
      });
      await handleAddXP(15);
      return;
    }
    try {
      await fetch('/api/lesson/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, comment: comm })
      });
      await handleAddXP(15); // +15 XP for active commenting
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        const l = db.lessons.find(x => x.id === lessonId);
        if (l) l.comments.unshift(comm);
      });
      await handleAddXP(15);
    }
  };

  const handleLikeLesson = async (lessonId: string) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        const l = db.lessons.find(x => x.id === lessonId);
        if (l) l.likes += 1;
      });
      return;
    }
    try {
      await fetch('/api/lesson/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        const l = db.lessons.find(x => x.id === lessonId);
        if (l) l.likes += 1;
      });
    }
  };

  // Community handlers
  const handleAddPost = async (content: string, mediaUrl?: string, isVideo?: boolean) => {
    const isUserAdmin = currentUser.role === 'admin';
    const newP: ForumPost = {
      id: 'p-' + Date.now().toString(),
      userId: currentUser.id,
      userName: isUserAdmin ? 'Sensei Administrador' : currentUser.name,
      userBelt: currentUser.belt,
      content,
      imageUrl: mediaUrl,
      videoUrl: isVideo ? mediaUrl : undefined,
      likes: 0,
      replies: [],
      date: 'Agora mesmo'
    };

    if (isOfflineMode) {
      updateLocalDb(db => {
        db.posts.unshift(newP);
      });
      await handleAddXP(40);
      return;
    }
    try {
      await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
      await handleAddXP(40); // 40 XP for sharing contents
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.posts.unshift(newP);
      });
      await handleAddXP(40);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        const p = db.posts.find(x => x.id === postId);
        if (p) p.likes += 1;
      });
      return;
    }
    try {
      await fetch('/api/post/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        const p = db.posts.find(x => x.id === postId);
        if (p) p.likes += 1;
      });
    }
  };

  const handleAddReply = async (postId: string, content: string) => {
    const isUserAdmin = currentUser.role === 'admin';
    const rep = {
      id: Date.now().toString(),
      userName: isUserAdmin ? 'Sensei Administrador' : currentUser.name,
      content,
      date: 'Agora'
    };

    if (isOfflineMode) {
      updateLocalDb(db => {
        const p = db.posts.find(x => x.id === postId);
        if (p) p.replies.push(rep);
      });
      return;
    }
    try {
      await fetch('/api/post/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reply: rep })
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        const p = db.posts.find(x => x.id === postId);
        if (p) p.replies.push(rep);
      });
    }
  };

  const handleToggleFollow = async (studentId: string) => {
    const isFollowing = followingIds.includes(studentId);
    setFollowingIds(prev => isFollowing ? prev.filter(id => id !== studentId) : [...prev, studentId]);

    if (isOfflineMode) {
      updateLocalDb(db => {
        const target = db.users.find(u => u.id === studentId);
        if (target) {
          target.followersCount = isFollowing ? Math.max(0, target.followersCount - 1) : target.followersCount + 1;
        }
      });
      return;
    }
    try {
      await fetch('/api/user/toggle_follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: studentId })
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        const target = db.users.find(u => u.id === studentId);
        if (target) {
          target.followersCount = isFollowing ? Math.max(0, target.followersCount - 1) : target.followersCount + 1;
        }
      });
    }
  };

  // Tournament Handles
  const handleJoinTournament = async (tournamentId: string, email: string) => {
    triggerSound('gong');
    if (isOfflineMode) {
      updateLocalDb(db => {
        const t = db.tournaments.find(x => x.id === tournamentId);
        if (t && !t.participants.includes(email)) {
          t.participants.push(email);
          t.registeredUsersCount += 1;
        }
      });
      alert('Sua inscrição foi confirmada no campeonato! Prepare o seu Kumite.');
      return;
    }
    try {
      await fetch('/api/tournament/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, email })
      });
      syncDatabase();
      alert('Sua inscrição foi confirmada no campeonato! Prepare o seu Kumite.');
    } catch (err) {
      updateLocalDb(db => {
        const t = db.tournaments.find(x => x.id === tournamentId);
        if (t && !t.participants.includes(email)) {
          t.participants.push(email);
          t.registeredUsersCount += 1;
        }
      });
      alert('Sua inscrição foi confirmada no campeonato! Prepare o seu Kumite.');
    }
  };

  // Admin panel state change triggers
  const handleAddLesson = async (newL: Lesson) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.lessons.push(newL);
      });
      return;
    }
    try {
      await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newL)
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.lessons.push(newL);
      });
    }
  };

  const handleRemoveLesson = async (id: string) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.lessons = db.lessons.filter(x => x.id !== id);
      });
      return;
    }
    try {
      await fetch(`/api/lesson/${id}`, { method: 'DELETE' });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.lessons = db.lessons.filter(x => x.id !== id);
      });
    }
  };

  const handleAddStoreItem = async (newItem: StoreItem) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.storeItems.push(newItem);
      });
      return;
    }
    try {
      await fetch('/api/store_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.storeItems.push(newItem);
      });
    }
  };

  const handleRemoveStoreItem = async (id: string) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.storeItems = db.storeItems.filter(x => x.id !== id);
      });
      return;
    }
    try {
      await fetch(`/api/store_item/${id}`, { method: 'DELETE' });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.storeItems = db.storeItems.filter(x => x.id !== id);
      });
    }
  };

  const handleRemoveStudent = async (id: string) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.users = db.users.filter(x => x.id !== id);
      });
      return;
    }
    try {
      await fetch(`/api/user/${id}`, { method: 'DELETE' });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.users = db.users.filter(x => x.id !== id);
      });
    }
  };

  const handleUpdateStudentDetails = async (id: string, updatedFields: { xp?: number; level?: number; belt?: User['belt']; role?: User['role'] }) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === id);
        if (u) {
          if (updatedFields.xp !== undefined) u.xp = updatedFields.xp;
          if (updatedFields.level !== undefined) u.level = updatedFields.level;
          if (updatedFields.belt !== undefined) u.belt = updatedFields.belt;
          if (updatedFields.role !== undefined) u.role = updatedFields.role;
        }
      });
      alert('Dados do aluno atualizados localmente!');
      return;
    }
    try {
      const res = await fetch('/api/users/update-admin-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, ...updatedFields })
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        if (id === currentUser.id) {
          setCurrentUser(updated);
        }
        syncDatabase();
        alert('Dados do aluno salvos com sucesso!');
      } else {
        alert('Erro ao salvar os novos dados.');
      }
    } catch (err) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === id);
        if (u) {
          if (updatedFields.xp !== undefined) u.xp = updatedFields.xp;
          if (updatedFields.level !== undefined) u.level = updatedFields.level;
          if (updatedFields.belt !== undefined) u.belt = updatedFields.belt;
          if (updatedFields.role !== undefined) u.role = updatedFields.role;
        }
      });
      alert('Dados do aluno salvos na base offline do dispositivo!');
    }
  };

  const handlePromoteStudent = async (id: string, newRole: User['role']) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === id);
        if (u) u.role = newRole;
      });
      alert(`Cargo atualizado com sucesso para: ${newRole.toUpperCase()}!`);
      return;
    }
    try {
      const res = await fetch('/api/user/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, role: newRole })
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        if (id === currentUser.id) {
          setCurrentUser(updated);
        }
        syncDatabase();
        alert(`Cargo atualizado com sucesso para: ${newRole.toUpperCase()}!`);
      }
    } catch (err) {
      updateLocalDb(db => {
        const u = db.users.find(x => x.id === id);
        if (u) u.role = newRole;
      });
      alert(`Cargo atualizado com sucesso para: ${newRole.toUpperCase()}!`);
    }
  };

  const handleAddTournament = async (newT: Tournament) => {
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.tournaments.push(newT);
      });
      return;
    }
    try {
      await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newT)
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.tournaments.push(newT);
      });
    }
  };

  const handleAddGlobalMessage = async (msg: string) => {
    const formatted = `📢 COMUNICADO SENSEI: ${msg}`;
    if (isOfflineMode) {
      updateLocalDb(db => {
        db.broadcastMessages.unshift(formatted);
      });
      return;
    }
    try {
      await fetch('/api/broadcast_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formatted })
      });
      syncDatabase();
    } catch (err) {
      updateLocalDb(db => {
        db.broadcastMessages.unshift(formatted);
      });
    }
  };

  // Theme support
  const bgClass = themeMode === 'dark' 
    ? 'bg-[#050505] smoke-bg text-neutral-100 selection:bg-rose-600/50' 
    : 'bg-neutral-50 text-neutral-900';

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 transition-colors relative overflow-hidden`}>
        {/* Dynamic Dark smoke / particle effect on background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.1),transparent_75%)] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-[linear-gradient(to_top,rgba(5,5,5,0.95),transparent)]" />
        
        <div className="w-full max-w-md bg-black/80 border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl backdrop-blur-md shadow-rose-950/20 text-center space-y-6">
          {/* Circular Double Branding design */}
          <div className="flex justify-center items-center gap-4 py-2 border-b border-white/10 pb-4">
            <CobraKaiLogo className="w-20 h-20" />
            <div className="h-10 w-px bg-white/20" />
            <TeamPauloSouzaLogo className="w-20 h-20" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-white font-sans uppercase tracking-tighter italic text-rose-600">
              COBRA KAI <span className="text-amber-500 font-mono text-[10px] tracking-[0.2em] uppercase block font-bold not-italic mt-1">★ TEAM PAULO SOUZA ★</span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans">Acesse a maior plataforma de formação de Faixas Pretas Shotokan.</p>
          </div>

          {/* Error / Recovery prompt */}
          {recoverySent ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-mono">
              ✓ Link de recuperação instruído para seu email dink! Verifique a caixa.
              <button onClick={() => setRecoverySent(false)} className="block mx-auto mt-2 underline">Voltar</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs text-neutral-300 text-left">
              
              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400">Nome de Combatente</label>
                  <input 
                    type="text" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Seu nome real" 
                    className="w-full bg-black border border-neutral-800 rounded p-3 text-white focus:border-rose-650 outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400">E-mail Cadastrado</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="exemplo@lucidadojo.com" 
                    className="w-full bg-black border border-neutral-800 rounded p-3 pl-9 text-white focus:border-rose-650 outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                </div>
                <p className="text-[9px] text-neutral-500 italic font-sans mt-0.5">*(Deixe em branco para logar como o administrador original!)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400">Senha Secreta</label>
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-black border border-neutral-800 rounded p-3 text-white focus:border-rose-650 outline-none transition-all"
                />
              </div>

              <div className="flex justify-between text-[10px] text-neutral-500">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="hover:underline text-amber-500 font-bold"
                >
                  {isRegistering ? 'Já tenho conta' : 'Criar Nova Matrícula'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setRecoverySent(true); triggerSound('nav'); }}
                  className="hover:underline hover:text-white"
                >
                  Esqueci Senha
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-1.5 tracking-widest uppercase shadow shadow-rose-950 hover:shadow-rose-600/20 red-glow transition-all"
              >
                {isRegistering ? 'Confirmar Matrícula' : 'Adentrar no Dojo'} <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}



        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-colors pb-12 overflow-x-hidden`}>
      
      {/* Dynamic continuous broadcast alerts banner */}
      <div className="bg-gradient-to-r from-black via-rose-950/40 to-black p-2 h-10 border-b border-white/5 relative overflow-hidden flex items-center">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap text-xs font-mono text-rose-200/90 w-full justify-center">
          {broadcastMessages.map((bm, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 shrink-0 text-amber-500 animate-pulse" /> {bm}
            </span>
          ))}
        </div>
      </div>

      {/* Main Elegant Header bar */}
      <header className="bg-black/60 backdrop-blur-md text-white border-b border-white/10 shadow-2xl py-4 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white/5 border border-white/10 rounded-full">
              <TeamPauloSouzaLogo className="w-14 h-14" />
            </div>
            <div className="p-1 bg-white/5 border border-white/10 rounded-full">
              <CobraKaiLogo className="w-14 h-14" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black font-sans uppercase tracking-tighter text-white flex items-center gap-2 leading-none">
                <span className="text-rose-600 gold-glow">COBRA KAI</span>
                <span className="text-neutral-500 font-light font-serif">|</span>
                <span className="text-amber-500 tracking-[0.05em] text-sm md:text-base">TEAM PAULO SOUZA</span>
              </h1>
              <span className="text-[10px] text-gray-400 font-mono tracking-[0.14em] uppercase block mt-1">Academia de Combate &amp; Shotokan Karate Elite</span>
            </div>
          </div>

          {/* Quick status progress widgets & config bar */}
          <div className="flex items-center flex-wrap gap-4 text-xs font-mono">
            {/* Logged in User Identity & Role Tag */}
            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-left flex flex-col justify-center">
              <span className="text-white font-extrabold text-[11px] leading-tight block">{currentUser.name}</span>
              <div className="flex items-center gap-1.5 mt-1">
                {currentUser.role === 'admin' ? (
                  <span className="bg-red-950/60 border border-red-500 text-red-400 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                    🥋 ADMIN
                  </span>
                ) : currentUser.role === 'sensei' ? (
                  <span className="bg-amber-950/60 border border-amber-500 text-amber-400 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                    🥋 SENSEI
                  </span>
                ) : (
                  <span className="bg-blue-950/60 border border-blue-500 text-blue-400 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                    🥋 ALUNO
                  </span>
                )}
              </div>
            </div>

            {/* XP widget */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-left backdrop-blur-sm shadow-lg">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center font-bold text-amber-500 text-[10px] bg-black">
                {currentUser.level}
              </div>
              <div>
                <span className="text-amber-500 text-[9px] font-bold block leading-none uppercase tracking-wider">FAIXA {currentUser.belt.toUpperCase()}</span>
                <span className="text-white font-extrabold text-xs">{currentUser.xp} XP total</span>
              </div>
            </div>

            {/* Config buttons (Sound, Theme, Admin view toggles) */}
            <div className="flex items-center border border-white/10 rounded bg-black/80 p-1.5 gap-1 shadow-lg">
              <button 
                onClick={() => { setEnableSound(!enableSound); triggerSound('nav'); }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Sons Clicks"
              >
                {enableSound ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => { setThemeMode(themeMode === 'dark' ? 'light' : 'dark'); triggerSound('nav'); }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Claro / Escuro"
              >
                {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-600 hover:text-white text-rose-450 border border-rose-900/40 rounded-lg px-3 py-2 transition-all font-bold uppercase tracking-wider text-[10px]"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area grid */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Navigation Bar links */}
        <div className="flex items-center overflow-x-auto pb-2 border-b border-white/10 gap-2.5 font-mono text-xs select-none scrollbar-thin">
          <button 
            onClick={() => { setActiveTab('lessons'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'lessons' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Dojo Netflix
          </button>
          <button 
            onClick={() => { setActiveTab('sensei'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'sensei' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Sensei AI
          </button>
          <button 
            onClick={() => { setActiveTab('belt'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'belt' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4" /> Graduação
          </button>
          <button 
            onClick={() => { setActiveTab('forum'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'forum' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Dojo Comuni
          </button>
          <button 
            onClick={() => { setActiveTab('tournaments'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'tournaments' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" /> Torneios Kumite
          </button>
          <button 
            onClick={() => { setActiveTab('store'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'store' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Store Armaria
          </button>
          <button 
            onClick={() => { setActiveTab('gym'); triggerSound('nav'); }}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'gym' 
                ? 'bg-rose-600 border-rose-500 text-white red-glow shadow shadow-rose-950/60' 
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Dumbbell className="w-4 h-4" /> Academia
          </button>

          {/* Exposed ONLY to specific root admins as requested */}
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => { setActiveTab('admin'); triggerSound('nav'); }}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-lg border font-bold uppercase transition-all whitespace-nowrap ml-auto ${
                activeTab === 'admin' 
                  ? 'bg-amber-500 border-amber-400 text-black shadow shadow-amber-950/40 gold-glow' 
                  : 'bg-black/60 border-rose-900/40 text-rose-500 hover:bg-rose-950/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> PAINEL ADMIN
            </button>
          )}
        </div>

        {/* Dynamic Inner views container */}
        <div className="pt-4">
          {activeTab === 'lessons' && (
            <NetflixPlayer 
              lessons={lessons}
              activeLessonId={activeLessonId}
              onSelectLesson={(id) => setActiveLessonId(id)}
              userBelt={currentUser.belt}
              onLessonCompleted={handleLessonCompleted}
              completedLessons={currentUser.completedLessons}
              onAddComment={handleAddComment}
              onLikeLesson={handleLikeLesson}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'sensei' && (
            <SenseiAI 
              userBelt={currentUser.belt}
              userLevel={currentUser.level}
              onGainXP={handleAddXP}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'belt' && (
            <BeltSection 
              currentUser={currentUser}
              students={students}
              onGainXP={handleAddXP}
              onGraduateBelt={handleGraduateBelt}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'forum' && (
            <DojoCommunity 
              posts={posts}
              students={students}
              onAddPost={handleAddPost}
              onLikePost={handleLikePost}
              onAddReply={handleAddReply}
              currentUser={currentUser}
              onToggleFollow={handleToggleFollow}
              followingIds={followingIds}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'tournaments' && (
            <TournamentBracket 
              tournaments={tournaments}
              onJoinTournament={handleJoinTournament}
              currentUserEmail={currentUser.email}
              userBelt={currentUser.belt}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'store' && (
            <DojoStore 
              storeItems={storeItems}
              onGainXP={handleAddXP}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'gym' && (
            <TrainingGym 
              onGainXP={handleAddXP}
              triggerSound={triggerSound}
            />
          )}

          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <AdminPanel 
              lessons={lessons}
              onAddLesson={handleAddLesson}
              onRemoveLesson={handleRemoveLesson}
              students={students}
              onRemoveStudent={handleRemoveStudent}
              onPromoteStudent={handlePromoteStudent}
              onUpdateStudentDetails={handleUpdateStudentDetails}
              tournaments={tournaments}
              onAddTournament={handleAddTournament}
              triggerSound={triggerSound}
              onAddGlobalMessage={handleAddGlobalMessage}
              storeItems={storeItems}
              onAddStoreItem={handleAddStoreItem}
              onRemoveStoreItem={handleRemoveStoreItem}
            />
          )}
        </div>

      </main>

      {/* Humble literal humans labels footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-neutral-850 text-center font-mono text-[10px] text-neutral-500 space-y-2">
        <p>COBRA KAI • TEAM PAULO SOUZA MARTIAL ARTS ACADEMY</p>
        <p className="tracking-widest">STRIKE FIRST • STRIKE HARD • NO MERCY • SEEK CHARACTER PERFECTION</p>
        <p className="text-[9px] text-neutral-600">Desenvolvido com kime no AI Studio. Todos os direitos reservados © 2026.</p>
      </footer>

    </div>
  );
}
