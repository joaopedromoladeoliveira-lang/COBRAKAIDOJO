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

  // Synchronize database with Express server real persistent JSON storage
  const syncDatabase = async () => {
    try {
      const res = await fetch('/api/database');
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
      }
    } catch (err) {
      console.error('Failed to sync with real backend database:', err);
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
      .then(res => res.json())
      .then(user => {
        if (user && !user.error) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      })
      .catch(err => {
        console.error('Auto login restoration error:', err);
      });
    }

    // Load initial database
    syncDatabase();
    
    // Poll every 5 seconds for real collaborative feel
    const interval = setInterval(syncDatabase, 5000);
    return () => clearInterval(interval);
  }, []);

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
    const emailToUse = emailInput || 'joaopedromoladeoliveira@gmail.com';
    const nameToUse = authName.trim() || 'Alexandre Silva';

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToUse, name: nameToUse })
    })
    .then(res => res.json())
    .then(user => {
      if (user && !user.error) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('karate_session_email', user.email);
        syncDatabase();
      } else {
        alert('Erro ao realizar o login.');
      }
    })
    .catch(err => {
      alert('Erro de conexão ao servidor de banco de dados.');
    });
  };

  const handleThirdPartyMockLogin = (type: 'Google' | 'Discord') => {
    // Google triggers real direct register for joaopedromoladeoliveira@gmail.com
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'joaopedromoladeoliveira@gmail.com', name: 'João Pedro M. Oliveira' })
    })
    .then(res => res.json())
    .then(user => {
      if (user && !user.error) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('karate_session_email', user.email);
        syncDatabase();
      }
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
      console.error(err);
    }
  };

  const handleGraduateBelt = async (belt: User['belt']) => {
    triggerSound('belt');
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
      console.error(err);
    }
  };

  // Netflix Lessons handlers
  const handleLessonCompleted = async (lessonId: string) => {
    if (currentUser.completedLessons.includes(lessonId)) return;
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
      console.error(err);
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

    try {
      await fetch('/api/lesson/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, comment: comm })
      });
      await handleAddXP(15); // +15 XP for active commenting
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeLesson = async (lessonId: string) => {
    try {
      await fetch('/api/lesson/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
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

    try {
      await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
      await handleAddXP(40); // 40 XP for sharing contents
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await fetch('/api/post/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
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

    try {
      await fetch('/api/post/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reply: rep })
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async (studentId: string) => {
    try {
      const isFollowing = followingIds.includes(studentId);
      setFollowingIds(prev => isFollowing ? prev.filter(id => id !== studentId) : [...prev, studentId]);

      await fetch('/api/user/toggle_follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: studentId })
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  // Tournament Handles
  const handleJoinTournament = async (tournamentId: string, email: string) => {
    try {
      await fetch('/api/tournament/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, email })
      });
      triggerSound('gong');
      syncDatabase();
      alert('Sua inscrição foi confirmada no campeonato! Prepare o seu Kumite.');
    } catch (err) {
      console.error(err);
    }
  };

  // Admin panel state change triggers
  const handleAddLesson = async (newL: Lesson) => {
    try {
      await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newL)
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLesson = async (id: string) => {
    try {
      await fetch(`/api/lesson/${id}`, { method: 'DELETE' });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStoreItem = async (newItem: StoreItem) => {
    try {
      await fetch('/api/store_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStoreItem = async (id: string) => {
    try {
      await fetch(`/api/store_item/${id}`, { method: 'DELETE' });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (id: string) => {
    try {
      await fetch(`/api/user/${id}`, { method: 'DELETE' });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromoteStudent = async (id: string, newRole: User['role']) => {
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
      console.error(err);
    }
  };

  const handleAddTournament = async (newT: Tournament) => {
    try {
      await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newT)
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGlobalMessage = async (msg: string) => {
    try {
      await fetch('/api/broadcast_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `📢 COMUNICADO SENSEI: ${msg}` })
      });
      syncDatabase();
    } catch (err) {
      console.error(err);
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
                    placeholder="joaopedromolaoliveira@gmail.com" 
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

          {/* SSO Mock login buttons */}
          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Ou entre com plataformas</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-400">
              <button 
                onClick={() => handleThirdPartyMockLogin('Google')}
                className="bg-neutral-900/60 hover:bg-neutral-800 border border-white/5 p-2.5 rounded-lg text-[10px] hover:text-white transition-all"
              >
                Login com Google
              </button>
              <button 
                onClick={() => handleThirdPartyMockLogin('Discord')}
                className="bg-neutral-900/60 hover:bg-neutral-800 border border-white/5 p-2.5 rounded-lg text-[10px] hover:text-white transition-all"
              >
                Login com Discord
              </button>
            </div>
          </div>

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
