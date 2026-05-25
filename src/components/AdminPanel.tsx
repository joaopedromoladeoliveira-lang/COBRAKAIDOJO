import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Users, Users2, Trophy, DollarSign, Bell, Sparkles, AlertCircle, BookOpen, Trash, UploadCloud, Check, ShoppingBag, Tag, Image as ImageIcon, Database, RefreshCw, Terminal } from 'lucide-react';
import { Lesson, User, Tournament, StoreItem } from '../types';

export const AdminPanel: React.FC<{
  lessons: Lesson[];
  onAddLesson: (newL: Lesson) => void;
  onRemoveLesson: (id: string) => void;
  students: User[];
  onRemoveStudent: (id: string) => void;
  onPromoteStudent: (id: string, newRole: User['role']) => void;
  tournaments: Tournament[];
  onAddTournament: (newT: Tournament) => void;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
  onAddGlobalMessage: (msg: string) => void;
  storeItems: StoreItem[];
  onAddStoreItem: (newItem: StoreItem) => void;
  onRemoveStoreItem: (id: string) => void;
}> = ({
  lessons,
  onAddLesson,
  onRemoveLesson,
  students,
  onRemoveStudent,
  onPromoteStudent,
  tournaments,
  onAddTournament,
  triggerSound,
  onAddGlobalMessage,
  storeItems,
  onAddStoreItem,
  onRemoveStoreItem
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'students' | 'tournaments' | 'notifs' | 'store' | 'supabase'>('lessons');

  // Supabase Integration States
  const [supabaseStatus, setSupabaseStatus] = useState<{ configured: boolean; connected?: boolean; message?: string; error?: string } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState<'cloud' | 'local' | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchSupabaseStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err) {
      setSupabaseStatus({ configured: false, message: 'Não foi possível se comunicar com o servidor Dojo.' });
    } finally {
      setStatusLoading(false);
    }
  };

  const syncFromCloud = async () => {
    if (!window.confirm('Atenção: baixar dados da Nuvem irá substituir todas as informações locais atuais do Dojo e do Fórum. Continuar?')) return;
    setSyncLoading('cloud');
    triggerSound('gong');
    try {
      const res = await fetch('/api/supabase/sync-from-cloud', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('OSS! Sincronizado com sucesso! Dados locais atualizados com a Nuvem Supabase.');
        fetchSupabaseStatus();
        window.location.reload(); // Quick refresh to load sync data
      } else {
        alert('Erro na sincronização: ' + (data.error || 'Erro desconhecido. Verifique no painel Supabase se criou a tabela dojo_state.'));
      }
    } catch (err: any) {
      alert('Falha crítica ao contactar o servidor.');
    } finally {
      setSyncLoading(null);
    }
  };

  const syncToCloud = async () => {
    if (!window.confirm('Tem certeza de que quer fazer o Upload (subir)? Isso irá sobrescrever qualquer dado que esteja guardado no Supabase atualmente.')) return;
    setSyncLoading('local');
    triggerSound('belt');
    try {
      const res = await fetch('/api/supabase/sync-to-cloud', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('OSS! Envio concluído! Todos os dados locais do Dojo foram guardados com êxito na nuvem do Supabase.');
        fetchSupabaseStatus();
      } else {
        alert('Falha ao enviar: ' + (data.error || 'Erro desconhecido. Não foi possível persistir no Supabase.'));
      }
    } catch (err: any) {
      alert('Falha ao contactar o servidor.');
    } finally {
      setSyncLoading(null);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'supabase') {
      fetchSupabaseStatus();
    }
  }, [activeSubTab]);

  // Add Lesson Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'Kata' | 'Kumite' | 'Kihon' | 'Defesa Pessoal' | 'Alongamento' | 'Filosofia'>('Kihon');
  const [newLevel, setNewLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado' | 'Faixa Preta'>('Iniciante');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [newDuration, setNewDuration] = useState('10:00');
  const [newInstructor, setNewInstructor] = useState('Prof. Paulo Souza');
  const [newExerciseInput, setNewExerciseInput] = useState('');
  const [newExercisesList, setNewExercisesList] = useState<string[]>([]);
  const [newIsPremium, setNewIsPremium] = useState(false);

  // File upload states for video / thumbnail
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [thumbUploadProgress, setThumbUploadProgress] = useState(0);
  const [isThumbUploading, setIsThumbUploading] = useState(false);

  // Add Shop Item Form State
  const [storeItemName, setStoreItemName] = useState('');
  const [storeItemPrice, setStoreItemPrice] = useState<number>(100);
  const [storeItemOriginalPrice, setStoreItemOriginalPrice] = useState<string>('');
  const [storeItemCategory, setStoreItemCategory] = useState<'Kimonos' | 'Faixas' | 'Camisetas' | 'Acessórios' | 'Luvas'>('Kimonos');
  const [storeItemImage, setStoreItemImage] = useState('');
  const [storeItemSizes, setStoreItemSizes] = useState<string>('M, G, GG');
  // Upload and drag/drop states for store item image
  const [storeItemFile, setStoreItemFile] = useState<File | null>(null);
  const [isDraggingStoreItem, setIsDraggingStoreItem] = useState(false);
  const [storeItemUploadProgress, setStoreItemUploadProgress] = useState(0);
  const [isStoreItemUploading, setIsStoreItemUploading] = useState(false);

  // Add Tournament Form State
  const [tourName, setTourName] = useState('');
  const [tourCat, setTourCat] = useState('Kumite Masculino Absoluto');
  const [tourCountry, setTourCountry] = useState('Brasil');

  // Broadcast Message Form State
  const [broadcastInput, setBroadcastInput] = useState('');

  const simulateVideoUpload = (file: File) => {
    setVideoFile(file);
    setIsVideoUploading(true);
    setVideoUploadProgress(15);
    triggerSound('nav');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setVideoUploadProgress(50);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileData: reader.result })
        });
        const data = await res.json();
        setVideoUploadProgress(100);
        setIsVideoUploading(false);
        if (data.url) {
          setNewVideoUrl(data.url);
          triggerSound('gong');
        } else {
          alert('Erro ao enviar vídeo: ' + (data.error || 'Erro desconhecido'));
        }
      } catch (err: any) {
        setVideoUploadProgress(0);
        setIsVideoUploading(false);
        alert('Falha de rede no upload do vídeo: ' + err.message);
      }
    };
    reader.onerror = () => {
      setVideoUploadProgress(0);
      setIsVideoUploading(false);
      alert('Erro ao processar o arquivo de vídeo.');
    };
  };

  const simulateThumbUpload = (file: File) => {
    setThumbFile(file);
    setIsThumbUploading(true);
    setThumbUploadProgress(20);
    triggerSound('nav');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setThumbUploadProgress(60);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileData: reader.result })
        });
        const data = await res.json();
        setThumbUploadProgress(100);
        setIsThumbUploading(false);
        if (data.url) {
          setNewThumbnailUrl(data.url);
          triggerSound('punch');
        } else {
          alert('Erro ao enviar capa: ' + (data.error || 'Erro desconhecido'));
        }
      } catch (err: any) {
        setThumbUploadProgress(0);
        setIsThumbUploading(false);
        alert('Falha de rede no upload da capa: ' + err.message);
      }
    };
    reader.onerror = () => {
      setThumbUploadProgress(0);
      setIsThumbUploading(false);
      alert('Erro ao processar capa.');
    };
  };

  const simulateStoreItemUpload = (file: File) => {
    setStoreItemFile(file);
    setIsStoreItemUploading(true);
    setStoreItemUploadProgress(20);
    triggerSound('nav');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setStoreItemUploadProgress(70);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileData: reader.result })
        });
        const data = await res.json();
        setStoreItemUploadProgress(100);
        setIsStoreItemUploading(false);
        if (data.url) {
          setStoreItemImage(data.url);
          triggerSound('punch');
        } else {
          alert('Erro ao enviar foto do produto: ' + (data.error || 'Erro desconhecido'));
        }
      } catch (err: any) {
        setStoreItemUploadProgress(0);
        setIsStoreItemUploading(false);
        alert('Falha de rede no upload da foto do produto: ' + err.message);
      }
    };
    reader.onerror = () => {
      setStoreItemUploadProgress(0);
      setIsStoreItemUploading(false);
      alert('Erro ao processar foto.');
    };
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExerciseInput.trim()) {
      setNewExercisesList([...newExercisesList, newExerciseInput.trim()]);
      setNewExerciseInput('');
      triggerSound('nav');
    }
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const defaultThumbnail = newThumbnailUrl.trim() || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200';

    const newL: Lesson = {
      id: 'lesson-' + Date.now().toString(),
      title: newTitle,
      description: newDescription,
      category: newCategory,
      level: newLevel,
      videoUrl: newVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: defaultThumbnail,
      duration: newDuration,
      views: 12,
      likes: 3,
      exercises: newExercisesList.length > 0 ? newExercisesList : ['Manter base firme por 2 minutos', 'Fazer Hikite puxado com kime'],
      comments: [],
      isPremium: newIsPremium,
      instructor: newInstructor
    };

    onAddLesson(newL);
    triggerSound('gong');

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewVideoUrl('');
    setNewThumbnailUrl('');
    setNewDuration('10:00');
    setNewExercisesList([]);
    alert('Nova aula cadastrada com sucesso no tatame dojo!');
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourName.trim()) return;

    const newT: Tournament = {
      id: 'tour-' + Date.now().toString(),
      name: tourName,
      category: tourCat,
      status: 'Inscrições Abertas',
      registeredUsersCount: 1,
      participants: ['joaopedromoladeoliveira@gmail.com'],
      bracket: [
        {
          round: 1,
          matches: [
            { id: 'm1', player1: 'Carlos Silva', player2: 'Aline Aoki', score1: 3, score2: 1, winner: 'Carlos Silva' },
            { id: 'm2', player1: 'Filipe Souza', player2: 'Sua Inscrição', score1: undefined, score2: undefined }
          ]
        }
      ],
      country: tourCountry,
      date: 'Junho, 2026'
    };

    onAddTournament(newT);
    triggerSound('gong');
    setTourName('');
    alert('Campeonato inserido com sucesso na arena!');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    onAddGlobalMessage(broadcastInput);
    setBroadcastInput('');
    triggerSound('gong');
    alert('Notificação sincronizada com sucesso para todos os karatecas!');
  };

  const handleCreateStoreItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeItemName.trim()) return;

    const sizesArr = storeItemSizes
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    const newItem: StoreItem = {
      id: 'store-' + Date.now().toString(),
      name: storeItemName,
      price: Number(storeItemPrice) || 0,
      originalPrice: storeItemOriginalPrice ? Number(storeItemOriginalPrice) : undefined,
      image: storeItemImage || 'https://images.unsplash.com/photo-1517438476312-10d79c07750d?auto=format&fit=crop&q=80&w=200',
      category: storeItemCategory,
      rating: 5.0,
      sizes: sizesArr.length > 0 ? sizesArr : ['M', 'G', 'GG']
    };

    onAddStoreItem(newItem);
    triggerSound('gong');

    // Reset
    setStoreItemName('');
    setStoreItemPrice(100);
    setStoreItemOriginalPrice('');
    setStoreItemImage('');
    setStoreItemSizes('M, G, GG');
    setStoreItemFile(null);
    alert('Produto inserido com sucesso na Armaria do Dojo!');
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* High-Level Overview Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <DollarSign className="w-5 h-5 text-green-500" />
          <span className="text-neutral-500 text-[10px] block">ARRECADAÇÃO SUPORTE</span>
          <span className="text-xl font-black text-white">R$ 4.860,00</span>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <BookOpen className="w-5 h-5 text-red-500" />
          <span className="text-neutral-500 text-[10px] block">AULAS NO CATÁLOGO</span>
          <span className="text-xl font-black text-white">{lessons.length} aulas</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <Users className="w-5 h-5 text-yellow-500" />
          <span className="text-neutral-500 text-[10px] block">ALUNOS MATRICULADOS</span>
          <span className="text-xl font-black text-white">{students.length} karatecas</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <Trophy className="w-5 h-5 text-orange-500" />
          <span className="text-neutral-500 text-[10px] block">CHAMPIONSHIPS ARENAS</span>
          <span className="text-xl font-black text-white">{tournaments.length} torneios</span>
        </div>
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex border-b border-neutral-800 gap-6 font-mono text-xs">
        <button 
          onClick={() => { setActiveSubTab('lessons'); triggerSound('nav'); }}
          className={`pb-2.5 transition-colors uppercase font-bold tracking-wider ${activeSubTab === 'lessons' ? 'border-b-2 border-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Gerir Conteúdos
        </button>
        <button 
          onClick={() => { setActiveSubTab('students'); triggerSound('nav'); }}
          className={`pb-2.5 transition-colors uppercase font-bold tracking-wider ${activeSubTab === 'students' ? 'border-b-2 border-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Gerir Alunos &amp; Promover Admin
        </button>
        <button 
          onClick={() => { setActiveSubTab('tournaments'); triggerSound('nav'); }}
          className={`pb-2.5 transition-colors uppercase font-bold tracking-wider ${activeSubTab === 'tournaments' ? 'border-b-2 border-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Gerir Campeonatos
        </button>
        <button 
          onClick={() => { setActiveSubTab('notifs'); triggerSound('nav'); }}
          className={`pb-2.5 transition-colors uppercase font-bold tracking-wider ${activeSubTab === 'notifs' ? 'border-b-2 border-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Anúncios Dojo
        </button>
        <button 
          onClick={() => { setActiveSubTab('store'); triggerSound('nav'); }}
          className={`pb-2.5 transition-colors uppercase font-bold tracking-wider ${activeSubTab === 'store' ? 'border-b-2 border-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Gerir Loja (Shop)
        </button>
        <button 
          onClick={() => { setActiveSubTab('supabase'); triggerSound('nav'); }}
          className={`pb-2.5 transition-colors uppercase font-bold tracking-wider ${activeSubTab === 'supabase' ? 'border-b-2 border-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          Integração Supabase
        </button>
      </div>

      {/* Content manage view */}
      {activeSubTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Lesson Form Column */}
          <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-black font-mono text-red-500 uppercase tracking-widest flex items-center gap-1">
              <Plus className="w-4 h-4" /> Cadastrar Novo Treinamento
            </h4>

            <form onSubmit={handleCreateLesson} className="space-y-3 font-mono text-xs text-neutral-300">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Título da Aula</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Mae-Geri Keage e Kekomi Avançado"
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Professor / Instrutor</label>
                <select 
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                >
                  <option value="Prof. Paulo Souza">Prof. Paulo Souza</option>
                  <option value="Sensei Cobra Kai AI">Sensei Cobra Kai AI</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Categoria</label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                  >
                    <option value="Kihon">Kihon</option>
                    <option value="Kata">Kata</option>
                    <option value="Kumite">Kumite</option>
                    <option value="Defesa Pessoal">Defesa Pessoal</option>
                    <option value="Alongamento">Alongamento</option>
                    <option value="Filosofia">Filosofia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Nível Mínimo</label>
                  <select 
                    value={newLevel} 
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Faixa Preta">Faixa Preta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Duração (Minutos)</label>
                  <input 
                    type="text" 
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="12:15" 
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white" 
                  />
                </div>
                <div className="space-y-1 flex items-center pt-5 pl-2 gap-1.5">
                  <input 
                    type="checkbox" 
                    id="premium-check"
                    checked={newIsPremium}
                    onChange={(e) => setNewIsPremium(e.target.checked)}
                    className="accent-yellow-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="premium-check" className="cursor-pointer text-[10px] text-neutral-300 font-bold">AULA PREMIUM/PRÓ</label>
                </div>
              </div>

              {/* VIDEO UPLOADER ZONE */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 font-bold block">CARREGAR VÍDEO DA AULA</label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                  onDragLeave={() => setIsDraggingVideo(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingVideo(false); if (e.dataTransfer.files?.[0]) simulateVideoUpload(e.dataTransfer.files[0]); }}
                  onClick={() => { document.getElementById('lesson-video-file-input')?.click(); }}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                    isDraggingVideo 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : videoFile 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-neutral-800 hover:border-neutral-600 bg-black'
                  }`}
                >
                  <input 
                    type="file" 
                    id="lesson-video-file-input" 
                    accept="video/*" 
                    onChange={(e) => { if (e.target.files?.[0]) simulateVideoUpload(e.target.files[0]); }} 
                    className="hidden" 
                  />
                  {isVideoUploading ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                        <span>Carregando arquivo...</span>
                        <span>{videoUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-150" style={{ width: `${videoUploadProgress}%` }} />
                      </div>
                    </div>
                  ) : videoFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <Check className="w-5 h-5 text-emerald-500 animate-bounce" />
                      <span className="text-[10px] text-white font-bold truncate max-w-full">{videoFile.name}</span>
                      <span className="text-[9px] text-neutral-500">Vídeo pronto para o tatame</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <UploadCloud className="w-5 h-5 text-amber-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-neutral-300">Arraste ou clique para enviar vídeo</span>
                      <span className="text-[8px] text-neutral-500">Suporta MP4, WebM e outros</span>
                    </div>
                  )}
                </div>
                {/* Optional manual fallback */}
                <input 
                  type="text" 
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Ou insira um link URL do vídeo (opcional)" 
                  className="w-full bg-black/80 border border-neutral-800 rounded p-1.5 text-[11px] text-neutral-400 placeholder-neutral-600 mt-1" 
                />
              </div>

              {/* THUMBNAIL UPLOADER ZONE */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 font-bold block font-mono">CARREGAR CAPA / THUMBNAIL</label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingThumb(true); }}
                  onDragLeave={() => setIsDraggingThumb(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingThumb(false); if (e.dataTransfer.files?.[0]) simulateThumbUpload(e.dataTransfer.files[0]); }}
                  onClick={() => { document.getElementById('lesson-thumb-file-input')?.click(); }}
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                    isDraggingThumb 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : thumbFile 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-neutral-800 hover:border-neutral-600 bg-black'
                  }`}
                >
                  <input 
                    type="file" 
                    id="lesson-thumb-file-input" 
                    accept="image/*" 
                    onChange={(e) => { if (e.target.files?.[0]) simulateThumbUpload(e.target.files[0]); }} 
                    className="hidden" 
                  />
                  {isThumbUploading ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                        <span>Processando imagem...</span>
                        <span>{thumbUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-150" style={{ width: `${thumbUploadProgress}%` }} />
                      </div>
                    </div>
                  ) : thumbFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] text-white font-bold truncate max-w-full">{thumbFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] text-neutral-300">Arraste ou clique para enviar capa</span>
                    </div>
                  )}
                </div>
                {/* Optional manual fallback */}
                <input 
                  type="text" 
                  value={newThumbnailUrl}
                  onChange={(e) => setNewThumbnailUrl(e.target.value)}
                  placeholder="Ou insira um link URL da capa (opcional)" 
                  className="w-full bg-black/80 border border-neutral-800 rounded p-1.5 text-[11px] text-neutral-400 placeholder-neutral-600 mt-1" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Descrição do Aprendizado</label>
                <textarea 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Escreva um resumo..." 
                  className="w-full h-14 bg-black border border-neutral-800 rounded p-2 text-white font-sans resize-none"
                  required
                />
              </div>

              {/* Exercises add bar */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400">Exercício Proposto (+XP)</label>
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    value={newExerciseInput}
                    onChange={(e) => setNewExerciseInput(e.target.value)}
                    placeholder="Repita 10 vezes..." 
                    className="flex-1 bg-black border border-neutral-800 rounded p-1.5 text-white" 
                  />
                  <button onClick={handleAddExercise} type="button" className="bg-neutral-800 hover:bg-neutral-700 px-2.5 rounded font-black text-white text-xs">+</button>
                </div>

                <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
                  {newExercisesList.map((ex, idx) => (
                    <span key={idx} className="bg-neutral-950 border border-neutral-800 text-[9px] px-1.5 rounded text-neutral-300 truncate max-w-[120px]">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-lg flex items-center justify-center gap-1 shadow uppercase text-xs"
              >
                Salvar Aula no Banco dojo
              </button>
            </form>
          </div>

          {/* Catalog Listing with removal button Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black font-mono text-neutral-500 uppercase tracking-wider">Aulas Atuais no Tatame ({lessons.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map(les => (
                <div key={les.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-3 relative justify-between">
                  <div className="flex gap-2 min-w-0">
                    <img src={les.thumbnailUrl} alt={les.title} className="w-16 h-10 object-cover rounded bg-black shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate max-w-[140px]">{les.title}</h5>
                      <span className="text-[9px] font-mono text-yellow-500 block uppercase mt-0.5">{les.category} • {les.instructor}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { onRemoveLesson(les.id); triggerSound('punch'); }}
                    className="p-1.5 border border-red-950 hover:bg-red-950/20 text-red-500 rounded transition-colors self-center shrink-0"
                    title="Remover Aula"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {les.isPremium && (
                    <span className="absolute -top-1 -left-1 bg-yellow-500 text-black text-[7px] font-bold px-1 rounded uppercase shadow">PRO</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Promover Admin System Tab */}
      {activeSubTab === 'students' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-neutral-800 pb-2.5">
            <h4 className="text-sm font-black font-mono text-white uppercase flex items-center gap-1.5">
              <Users2 className="w-5 h-5 text-yellow-500" /> Diretório Geral do Dojo • Painel Administrativo
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              Seguindo seus requisitos: <span className="text-yellow-400 font-bold">Como administrador principal, promova outros membros a Sensei ou Admin</span> para auxiliar na gestão do dojo, ou remova alunos inapropriados.
            </p>
          </div>

          {/* Students list layout */}
          <div className="space-y-3 font-mono text-xs">
            {students.map(std => {
              const rootAdmin = std.email === 'joaopedromoladeoliveira@gmail.com' || std.email === 'joaopedromolaoliveira@gmail.com';

              return (
                <div key={std.id} className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-white">{std.name}</h5>
                      <span className="text-[8px] bg-red-950 text-red-400 font-black px-1.5 py-0.5 rounded uppercase leading-none">
                        {std.belt}
                      </span>
                      <span className="text-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase font-bold">
                        {std.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 truncate max-w-sm">
                      Email: {rootAdmin ? "Omitido por Segurança" : std.email} • Level {std.level} ({std.xp} XP)
                    </p>
                  </div>

                  {/* Promotion choices buttons row */}
                  <div className="flex items-center gap-2">
                    {rootAdmin ? (
                      <span className="text-[9px] text-neutral-600 uppercase border border-neutral-850 px-2.5 py-1 rounded">Administrador Principal</span>
                    ) : (
                      <>
                        <button 
                          onClick={() => { onPromoteStudent(std.id, 'student'); triggerSound('nav'); }}
                          className={`text-[9px] font-bold px-2 py-1 border rounded uppercase ${std.role === 'student' ? 'bg-neutral-800 border-neutral-700 text-white' : 'border-neutral-800 text-neutral-500'}`}
                        >
                          Membro
                        </button>
                        <button 
                          onClick={() => { onPromoteStudent(std.id, 'sensei'); triggerSound('belt'); }}
                          className={`text-[9px] font-bold px-2 py-1 border rounded uppercase ${std.role === 'sensei' ? 'bg-orange-500/20 border-orange-600 text-orange-400' : 'border-neutral-800 text-neutral-500'}`}
                        >
                          SENSEI
                        </button>
                        <button 
                          onClick={() => { onPromoteStudent(std.id, 'admin'); triggerSound('gong'); }}
                          className={`text-[9px] font-bold px-2 py-1 border rounded uppercase ${std.role === 'admin' ? 'bg-red-600 border-red-500 text-white' : 'border-red-900/30 text-red-500 hover:text-white hover:bg-red-500/20'}`}
                        >
                          Tornar ADMIN
                        </button>

                        <button 
                          onClick={() => { onRemoveStudent(std.id); triggerSound('punch'); }}
                          className="p-1 px-2 border border-red-950 hover:bg-red-950/20 rounded text-red-500 transition-all text-[8px] font-bold uppercase shrink-0"
                          title="Remover Aluno"
                        >
                          Banir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tournaments creator */}
      {activeSubTab === 'tournaments' && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
          <h4 className="text-xs font-black font-mono text-red-500 uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-4 h-4" /> Criar Novo Campeonato Arena
          </h4>

          <form onSubmit={handleCreateTournament} className="space-y-3 font-mono text-xs text-neutral-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Nome do Torneio</label>
                <input 
                  type="text" 
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  placeholder="Ex: Taça Paulo Souza 5ª Edição" 
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white" 
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Categoria Combate</label>
                <input 
                  type="text" 
                  value={tourCat}
                  onChange={(e) => setTourCat(e.target.value)}
                  placeholder="Ex: Kumite Avançado" 
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Sede País</label>
                <select 
                  value={tourCountry} 
                  onChange={(e) => setTourCountry(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="USA">USA</option>
                  <option value="Japão">Japão</option>
                  <option value="Alemanha">Alemanha</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold p-3 rounded-lg font-mono text-xs uppercase"
            >
              Iniciar Torneio
            </button>
          </form>
        </div>
      )}

      {/* Advertising virtual notifications column */}
      {activeSubTab === 'notifs' && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
          <h4 className="text-xs font-black font-mono text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-yellow-500 animate-bounce" /> Broadcast Global de Notificações
          </h4>

          <form onSubmit={handleSendBroadcast} className="space-y-3 font-mono text-xs text-neutral-300">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400">Mensagem do Comunicado (Surgirá no topo do app para todos os alunos!):</label>
              <input 
                type="text" 
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                placeholder="Ex: ATENÇÃO ATLETAS! Copa do Mundo de Karate Shotokan inicia em 5 dias. Inscreva-se!" 
                className="w-full bg-black border border-neutral-800 rounded p-3 text-white" 
                required
              />
            </div>

            <button 
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black p-3 rounded-lg uppercase text-xs"
            >
              Disparar Anúncio
            </button>
          </form>
        </div>
      )}

      {/* Shop management subtab */}
      {activeSubTab === 'store' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-neutral-300">
          
          {/* Add Shop Item Form Column */}
          <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-black font-mono text-red-500 uppercase tracking-widest flex items-center gap-1">
              <Plus className="w-4 h-4" /> Cadastrar Novo Produto
            </h4>

            <form onSubmit={handleCreateStoreItem} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Nome do Produto</label>
                <input 
                  type="text" 
                  value={storeItemName}
                  onChange={(e) => setStoreItemName(e.target.value)}
                  placeholder="Ex: Kimono Shotokan Tradicional"
                  className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Preço (R$)</label>
                  <input 
                    type="number" 
                    value={storeItemPrice}
                    onChange={(e) => setStoreItemPrice(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Preço Org. (Opcional)</label>
                  <input 
                    type="number" 
                    value={storeItemOriginalPrice}
                    onChange={(e) => setStoreItemOriginalPrice(e.target.value)}
                    placeholder="Sem desconto"
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Categoria</label>
                  <select 
                    value={storeItemCategory} 
                    onChange={(e) => setStoreItemCategory(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white font-sans"
                  >
                    <option value="Kimonos">Kimonos</option>
                    <option value="Faixas">Faixas</option>
                    <option value="Camisetas">Camisetas</option>
                    <option value="Luvas">Luvas</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400">Tamanhos (Sep. vírgula)</label>
                  <input 
                    type="text" 
                    value={storeItemSizes}
                    onChange={(e) => setStoreItemSizes(e.target.value)}
                    placeholder="Ex: P, M, G, GG"
                    className="w-full bg-black border border-neutral-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              {/* IMAGE DRAG & DROP ZONE */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 font-bold block">FOTO / IMAGEM DO PRODUTO</label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingStoreItem(true); }}
                  onDragLeave={() => setIsDraggingStoreItem(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingStoreItem(false); if (e.dataTransfer.files?.[0]) simulateStoreItemUpload(e.dataTransfer.files[0]); }}
                  onClick={() => { document.getElementById('store-item-file-input')?.click(); }}
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                    isDraggingStoreItem 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : storeItemFile 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-neutral-800 hover:border-neutral-600 bg-black'
                  }`}
                >
                  <input 
                    type="file" 
                    id="store-item-file-input" 
                    accept="image/*" 
                    onChange={(e) => { if (e.target.files?.[0]) simulateStoreItemUpload(e.target.files[0]); }} 
                    className="hidden" 
                  />
                  {isStoreItemUploading ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                        <span>Carregando imagem...</span>
                        <span>{storeItemUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-150" style={{ width: `${storeItemUploadProgress}%` }} />
                      </div>
                    </div>
                  ) : storeItemFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] text-white font-bold truncate max-w-full">{storeItemFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <ImageIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="text-[10px] text-neutral-300">Arraste ou clique para enviar foto</span>
                    </div>
                  )}
                </div>
                {/* Fallback image path input */}
                <input 
                  type="text" 
                  value={storeItemImage}
                  onChange={(e) => setStoreItemImage(e.target.value)}
                  placeholder="Ou link URL da foto (opcional)" 
                  className="w-full bg-black/80 border border-neutral-800 rounded p-1.5 text-[11px] text-neutral-400 mt-1" 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-lg flex items-center justify-center gap-1 shadow uppercase text-xs"
              >
                Cadastrar na Loja
              </button>
            </form>
          </div>

          {/* Current products list */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black font-mono text-neutral-400 uppercase tracking-wider">Produtos Atuais na Vitrine ({storeItems.length})</h4>
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
              <div className="space-y-3 font-mono text-[11px]">
                {storeItems.map(item => (
                  <div key={item.id} className="bg-neutral-950 p-3 rounded-lg border border-neutral-855 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded bg-white p-1 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate max-w-[200px] md:max-w-md">{item.name}</p>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mt-0.5">
                          {item.category} • Preço: <span className="text-yellow-400 font-bold">R$ {item.price},00</span> {item.originalPrice ? `(De: R$ ${item.originalPrice},00)` : ''}
                        </span>
                        <span className="text-[9px] text-neutral-500 mt-1 block">Tamanhos: {item.sizes.join(', ')}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => { onRemoveStoreItem(item.id); triggerSound('punch'); }}
                      className="p-1.5 border border-red-950 hover:bg-red-950/20 text-red-500 rounded transition"
                      title="Deletar Produto"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {storeItems.length === 0 && (
                  <p className="text-xs italic text-neutral-500 text-center py-6">Nenhum produto cadastrado na vitrine.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Supabase connection manager view */}
      {activeSubTab === 'supabase' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Connection Status Card */}
            <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-black font-mono text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500 animate-pulse" /> Status do Supabase
              </h4>

              {statusLoading ? (
                <div className="flex items-center gap-2 py-4 text-xs font-mono text-neutral-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />
                  Verificando credenciais de nuvem...
                </div>
              ) : supabaseStatus ? (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-black/40 border border-neutral-850 p-3 rounded-lg flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${supabaseStatus.connected ? 'bg-emerald-500 animate-pulse' : supabaseStatus.configured ? 'bg-amber-500' : 'bg-neutral-600'}`} />
                    <div>
                      <p className="font-bold text-white uppercase text-[10px]">
                        {supabaseStatus.connected ? 'ATIVO & SINCRO' : supabaseStatus.configured ? 'TABELA INEXISTENTE' : 'OFFLINE / LOCAL'}
                      </p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">
                        {supabaseStatus.message}
                      </p>
                    </div>
                  </div>

                  {supabaseStatus.configured && (
                    <div className="space-y-2 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Diagnóstico Técnico:</p>
                      <p className="text-[10px] text-neutral-300">
                        Configurado no .env: <span className="text-emerald-500 font-bold">Sim ✔</span>
                      </p>
                      <p className="text-[10px] text-neutral-300">
                        Conexão com Banco: {supabaseStatus.connected ? (
                          <span className="text-emerald-500 font-bold">Ok ✔</span>
                        ) : (
                          <span className="text-rose-500 font-bold">Erro ✖</span>
                        )}
                      </p>
                      {supabaseStatus.error && (
                        <p className="text-[9px] text-red-400 bg-red-950/20 p-1.5 rounded border border-red-900/40 mt-1 max-w-full overflow-x-auto">
                          Detalhe: {supabaseStatus.error}
                        </p>
                      )}
                    </div>
                  )}

                  {!supabaseStatus.configured && (
                    <div className="bg-yellow-950/10 p-3 rounded-lg border border-yellow-905/20 text-[10px] text-amber-500/90 leading-relaxed">
                      💡 Para salvar as aulas, campeonatos, e posts do fórum na nuvem persistentemente de graça, siga o tutorial rápido ao lado.
                    </div>
                  )}

                  <button 
                    onClick={fetchSupabaseStatus}
                    className="w-full bg-neutral-800 hover:bg-neutral-750 text-white font-bold py-2 rounded flex items-center justify-center gap-1.5 text-[10px] uppercase transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Atualizar Diagnóstico
                  </button>

                </div>
              ) : (
                <div className="text-xs italic text-neutral-500 font-mono">Status indisponível.</div>
              )}
            </div>

            {/* Cloud Storage Synchronization Controls */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-black font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-400" /> Ações de Sincronização em Lote
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sync UP (Local to Cloud) */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                      📤 SUBIR DADOS PARA SUPABASE
                    </h5>
                    <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                      Envia todas as aulas, alunos, anúncios e fuleiros cadastrados localmente agora para a nuvem. Isso sobrescreve a cópia da nuvem atual.
                    </p>
                  </div>
                  <button 
                    onClick={syncToCloud}
                    disabled={syncLoading !== null || !supabaseStatus?.configured}
                    className="w-full bg-blue-650 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-650 text-white font-black py-2.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 font-mono transition"
                  >
                    {syncLoading === 'local' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Exportar para Supabase (Upload)'
                    )}
                  </button>
                </div>

                {/* Sync DOWN (Cloud to Local cache) */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                      📥 BAIXAR DADOS DA NUVEM
                    </h5>
                    <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                      Atualiza o servidor com as informações mais frescas guardadas na nuvem. Útil para restauração após reiniciar a máquina de hospedagem.
                    </p>
                  </div>
                  <button 
                    onClick={syncFromCloud}
                    disabled={syncLoading !== null || !supabaseStatus?.configured}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black py-2.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 font-mono transition"
                  >
                    {syncLoading === 'cloud' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Importar do Supabase (Download)'
                    )}
                  </button>
                </div>
              </div>

              {/* Steps To configure Supabase */}
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-850 space-y-3">
                <h5 className="text-[11px] font-bold text-yellow-500 font-mono flex items-center gap-1">
                  <Terminal className="w-4 h-4 text-yellow-500" /> COMO CONECTAR SEU PRÓPRIO SUPABASE NO DOJO
                </h5>
                <ol className="text-[10px] text-neutral-400 font-mono space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-yellow-400 underline">supabase.com</a></li>
                  <li>Crie um novo projeto, vá no menu de <b className="text-white">SQL Editor</b> e crie a tabela rodando o script abaixo:</li>
                </ol>

                <div className="relative">
                  <pre className="bg-neutral-900 text-neutral-300 text-[9px] p-3 rounded-lg border border-neutral-800 overflow-x-auto font-mono max-h-36">
                    {`CREATE TABLE IF NOT EXISTS dojo_state (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS dojo_state (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="absolute right-2 top-2 bg-black hover:bg-neutral-800 border border-neutral-700 text-[9px] text-white px-2 py-1 rounded transition"
                  >
                    {copiedSql ? 'Copiado!' : 'Copiar Script SQL'}
                  </button>
                </div>

                <div className="text-[10px] text-neutral-400 leading-relaxed font-mono pt-1">
                  🧩 Após criar a tabela, pegue o <span className="text-white font-bold">URL</span> e a <span className="text-white font-bold">Anon Key</span> em <i>Project Settings {'->'} API</i> e defina-os nos segredos da aplicação como <code className="text-yellow-400 bg-neutral-900 px-1 py-0.5 rounded">SUPABASE_URL</code> e <code className="text-yellow-400 bg-neutral-900 px-1 py-0.5 rounded">SUPABASE_ANON_KEY</code>.
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
