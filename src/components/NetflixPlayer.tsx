import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, SkipForward, Flame, Sparkles, MessageSquare, ChevronRight, Lock, Clock, ThumbsUp, CheckCircle2, BookOpen } from 'lucide-react';
import { Lesson } from '../types';

export const NetflixPlayer: React.FC<{
  lessons: Lesson[];
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
  userBelt: string;
  onLessonCompleted: (lessonId: string) => void;
  completedLessons: string[];
  onAddComment: (lessonId: string, commentText: string) => void;
  onLikeLesson: (lessonId: string) => void;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
  userBelt,
  onLessonCompleted,
  completedLessons,
  onAddComment,
  onLikeLesson,
  triggerSound
}) => {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center col-span-3 text-neutral-300 font-mono w-full">
        <BookOpen className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">Aulas de Karatê</h3>
        <p className="text-xs text-neutral-400 mt-2">Nenhum conteúdo disponível ainda</p>
        <p className="text-[10px] text-neutral-500 mt-2 max-w-sm mx-auto font-sans leading-relaxed">
          Nenhuma aula ou vídeo foi cadastrado no tatame digital até o momento pelo Sensei Administrador.
        </p>
      </div>
    );
  }

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const isCompleted = completedLessons.includes(activeLesson.id);

  // States for dynamic streaming player simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [videoQuality, setVideoQuality] = useState('Auto (1080p)');
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [videoProgress, setVideoProgress] = useState(45); // simulated progress percentage
  const [autoPlay, setAutoPlay] = useState(true);

  const beltHierarchy = ['branca', 'amarela', 'vermelha', 'laranja', 'verde', 'roxa', 'marrom', 'preta'];

  // Helper to check if a user is locked out of premium lesson
  const isLocked = (lesson: Lesson) => {
    if (!lesson.isPremium) return false;
    // Premium locks if user is White Belt ('branca') or Yellow Belt ('amarela') and it's a premium high-end lesson, unless user ranks up!
    if (userBelt === 'branca' || userBelt === 'amarela') {
      return true;
    }
    return false;
  };

  const handlePlayPause = () => {
    triggerSound('punch');
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVideoProgress(val);
    if (val >= 95 && !isCompleted) {
      // Auto complete when reaching end
      onLessonCompleted(activeLesson.id);
      triggerSound('belt');
    }
  };

  const handleSpeedToggle = () => {
    triggerSound('nav');
    const speeds = ['0.5x', '1.0x', '1.5x', '2.0x'];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleQualityToggle = () => {
    triggerSound('nav');
    const qualities = ['Auto (1080p)', '720p', '480p'];
    const nextIdx = (qualities.indexOf(videoQuality) + 1) % qualities.length;
    setVideoQuality(qualities[nextIdx]);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(activeLesson.id, commentText);
    setCommentText('');
    triggerSound('nav');
  };

  const handleLocalLike = () => {
    onLikeLesson(activeLesson.id);
    triggerSound('punch');
  };

  const handleFinishLessonManual = () => {
    setVideoProgress(100);
    onLessonCompleted(activeLesson.id);
    triggerSound('gong');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 2 Cols: Main Player and Details */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Cinematic Netflix Player Container */}
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner flex flex-col justify-end group shadow-2xl">
          
          {/* Mock Video Visuals / Background Theme Frame */}
          {isLocked(activeLesson) ? (
            <div className="absolute inset-0 bg-[#050505]/95 flex flex-col items-center justify-center space-y-4 p-6 text-center">
              <Lock className="w-16 h-16 text-rose-550 animate-bounce" />
              <h3 className="text-xl font-bold font-mono tracking-wide text-white text-rose-660">AULA PREMIUM BLOQUEADA</h3>
              <p className="text-sm text-neutral-400 max-w-md font-sans leading-relaxed">
                Este treinamento avançado requer graduação mínima de <span className="text-amber-500 font-bold">Faixa Vermelha</span>. Continue treinando para desbloquear!
              </p>
              <div className="bg-rose-950/20 border border-white/10 rounded-lg p-3 text-xs text-rose-450 max-w-xs font-mono">
                Sua faixa atual: <span className="uppercase font-bold text-amber-500">{userBelt}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Floating ambient theme / placeholder representation */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {isPlaying ? (
                  <div className="relative w-full h-full flex flex-col bg-[#050505] rounded-lg items-center justify-center overflow-hidden border border-white/5">
                    
                    {/* Pulsing graphic to simulate video feedback */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.1),transparent_70%)] animate-pulse" />
                    
                    {/* Fighter shadow mockup performing gyaku zuki */}
                    <svg viewBox="0 0 400 200" className="w-[80%] h-auto opacity-70 filter drop-shadow-[0_0_10px_rgba(225,29,72,0.3)]">
                      <line x1="10" y1="180" x2="390" y2="180" stroke="#e11d48" strokeWidth="4" />
                      <g fill="#000" stroke="#f59e0b" strokeWidth="2">
                        {/* Front stance fighter */}
                        <circle cx="160" cy="50" r="14" fill="#e11d48" />
                        <path d="M 160,64 L 175,90 M 160,64 L 140,90" />
                        <path d="M 160,64 L 160,110 L 145,160 L 130,180" />
                        <path d="M 160,110 L 180,155 L 195,180" />
                        {/* Laser focus strike line for Shotokan */}
                        <path d="M 175,90 L 260,90" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
                        <circle cx="260" cy="90" r="4" fill="#ca8a04" />
                      </g>
                    </svg>

                    {/* Dynamic Subtitles Overlay */}
                    {showSubtitles && (
                      <div className="absolute bottom-16 bg-black/80 px-4 py-2 border border-neutral-800 rounded font-sans text-xs text-yellow-500 max-w-md text-center">
                        &quot;Sensei: Mantenha os cotovelos fechados no Hikite. O quadril gera a força explosiva do Zuki!&quot;
                      </div>
                    )}

                    {/* Quick simulated controls indicators */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded text-[10px] font-mono text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                      STREAMING • {videoQuality} • {playbackSpeed}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-black/90 group/thumbnail cursor-pointer" onClick={handlePlayPause}>
                    <img 
                      src={activeLesson.thumbnailUrl} 
                      alt={activeLesson.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/thumbnail:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                    
                    {/* Big Netflix Play Button */}
                    <button 
                      type="button"
                      className="relative w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center p-0.5 shadow-2xl hover:scale-110 active:scale-95 transition-all text-white hover:bg-rose-500 red-glow"
                    >
                      <Play className="w-10 h-10 fill-white ml-1" />
                    </button>

                    <div className="absolute bottom-4 left-4 text-left font-sans">
                      <span className="text-xs bg-rose-950/40 border border-rose-900/30 text-rose-450 font-mono font-bold px-2.5 py-1 rounded mb-2 inline-block">
                        {activeLesson.category}
                      </span>
                      <h4 className="text-white text-lg font-black tracking-tight uppercase">{activeLesson.title}</h4>
                    </div>
                  </div>
                )}
              </div>

              {/* Streaming Overlay Controls Bar */}
              <div className="bg-gradient-to-t from-black via-neutral-950/90 to-transparent p-4 flex flex-col space-y-3 z-10">
                {/* Timeline slider Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {Math.floor((videoProgress / 100) * 12)}:{String(Math.floor((videoProgress % 30))).padStart(2, '0')}
                  </span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={videoProgress} 
                    onChange={handleProgressChange}
                    className="flex-1 accent-rose-600 bg-neutral-800 h-1 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-neutral-400 font-mono">{activeLesson.duration}</span>
                </div>

                {/* Sub-controls line */}
                <div className="flex items-center justify-between text-white font-mono text-xs">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handlePlayPause}
                      className="hover:text-rose-500 transition-colors"
                      title={isPlaying ? "Pausar" : "Assistir"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>
                    
                    <button 
                      onClick={() => { setIsMuted(!isMuted); triggerSound('nav'); }} 
                      className="hover:text-rose-500 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <button 
                      onClick={() => { setShowSubtitles(!showSubtitles); triggerSound('nav'); }}
                      className={`hover:text-rose-400 transition-colors uppercase font-bold text-[10px] px-1.5 py-0.5 rounded border ${showSubtitles ? 'bg-rose-950/40 border-rose-500 text-white' : 'border-neutral-700 text-neutral-400'}`}
                    >
                      CC
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quality toggler */}
                    <button onClick={handleQualityToggle} className="hover:text-yellow-400 transition-colors select-none text-[10px] bg-neutral-900/60 p-1 border border-neutral-800 rounded">
                      {videoQuality}
                    </button>

                    {/* Playback speed toggle */}
                    <button onClick={handleSpeedToggle} className="hover:text-yellow-400 transition-colors select-none text-[10px] bg-neutral-900/60 p-1 border border-neutral-800 rounded">
                      Vel: {playbackSpeed}
                    </button>

                    {/* Auto complete lesson */}
                    <button 
                      onClick={handleFinishLessonManual}
                      disabled={isCompleted}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                        isCompleted 
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {isCompleted ? "Concluída" : "Concluir Aula"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Video metadata description, likes and core exercises */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-rose-950/30 border border-rose-900/30 text-rose-450 px-2.5 py-1 rounded uppercase font-mono font-bold">
                  {activeLesson.category}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Instrutor: {activeLesson.instructor} • Nível {activeLesson.level}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">{activeLesson.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleLocalLike}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050505] hover:bg-neutral-800 border border-white/10 text-xs font-mono text-neutral-300 transition-all"
              >
                <ThumbsUp className="w-4 h-4 text-rose-500" /> {activeLesson.likes} likes
              </button>
              
              <div className="text-xs font-mono text-neutral-400 bg-[#050505] px-3 py-1.5 rounded-lg border border-white/10">
                {activeLesson.views} visualizações
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold font-mono text-amber-500 uppercase">Resumo da Aula</h3>
            <p className="text-neutral-300 text-sm leading-relaxed font-sans">{activeLesson.description}</p>
          </div>

          {/* Connected Exercises */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold font-mono text-rose-500 uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 animate-bounce text-rose-500" /> Atividades &amp; Desafios Propostos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {activeLesson.exercises.map((ex, idx) => (
                <div key={idx} className="bg-black/40 p-3 rounded-md border border-white/5 flex items-start gap-2 text-neutral-300">
                  <span className="text-amber-500 font-bold">{idx + 1}.</span>
                  <p>{ex}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Comments section */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6 shadow-xl">
          <h3 className="text-md font-bold font-mono text-white flex items-center gap-2 uppercase">
            <MessageSquare className="w-5 h-5 text-rose-500" /> Discussões do Dojo ({activeLesson.comments.length})
          </h3>

          <form onSubmit={handlePostComment} className="flex gap-3">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Pergunte aos colegas, compartilhe seu progresso..."
              className="flex-1 bg-[#050505] border border-white/10 text-white rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-rose-600 font-sans transition-all"
            />
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="bg-rose-600 hover:bg-rose-500 red-glow font-bold text-xs uppercase text-white font-mono px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
              Comentar
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {activeLesson.comments.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 font-mono">Seja o primeiro a comentar nesta aula! Oss.</p>
            ) : (
              activeLesson.comments.map((comm) => (
                <div key={comm.id} className="bg-neutral-950/60 p-4 border border-neutral-800/60 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold">{comm.userName}</span>
                      <span className="text-yellow-400 border border-yellow-500/20 px-1 rounded uppercase bg-yellow-500/5 text-[8px]">
                        {comm.userBelt}
                      </span>
                    </div>
                    <span className="text-neutral-500">{comm.date}</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans pl-1 pt-1">{comm.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Side Column: Categories Filter & Lesson Playlist Grid */}
      <div className="space-y-6">
         
        {/* Continuous Watching Dashboard progress */}
        <div className="bg-gradient-to-br from-rose-950/15 via-transparent to-black/60 border border-white/10 p-4 rounded-xl space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400 uppercase font-black">Progresso do Aluno</span>
            <span className="text-rose-450 font-bold">
              {completedLessons.length}/{lessons.length} Concluídas ({Math.round((completedLessons.length / lessons.length) * 100)}%)
            </span>
          </div>
          
          <div className="w-full bg-[#050505] rounded-full h-1.5 overflow-hidden border border-white/5">
            <div 
              className="bg-rose-600 h-full transition-all duration-500"
              style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
            />
          </div>

          <div className="text-[10px] text-neutral-500 font-mono italic">
            * Complete as aulas assistindo até o final ou marcando manualmente como concluídas para crescer seu nível!
          </div>
        </div>

        {/* Classes Catalog Playlist grouped by Categories */}
        <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-white/5 p-4 border-b border-white/10">
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest">
              Catálogo de Vídeos Dojo
            </h3>
          </div>

          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {lessons.map((les) => {
              const active = les.id === activeLessonId;
              const completed = completedLessons.includes(les.id);
              const locked = isLocked(les);

              return (
                <div 
                  key={les.id}
                  onClick={() => {
                    if (!locked) {
                      onSelectLesson(les.id);
                      triggerSound('nav');
                    }
                  }}
                  className={`group p-3 rounded-lg border transition-all text-left flex gap-3 relative cursor-pointer ${
                    active 
                      ? 'bg-rose-950/20 border-rose-600' 
                      : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-white/5'
                  } ${locked ? 'opacity-50 !cursor-not-allowed' : ''}`}
                >
                  {/* Lesson image */}
                  <div className="w-20 h-12 rounded overflow-hidden shrink-0 bg-black relative flex items-center justify-center">
                    <img src={les.thumbnailUrl} alt={les.title} className="w-full h-full object-cover opacity-60" />
                    {locked ? (
                      <Lock className="w-4 h-4 text-rose-500 absolute animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4 text-white hover:scale-125 transition-transform absolute fill-white opacity-80" />
                    )}
                  </div>

                  {/* Lesson context metadata */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-450 transition-colors truncate uppercase">
                      {les.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 mt-1">
                      <span className="uppercase text-amber-500 font-semibold">{les.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" /> {les.duration}
                      </span>
                    </div>
                  </div>

                  {/* Completion status dot/medal */}
                  {completed && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black shadow" title="Aula Concluída" />
                  )}

                  {les.isPremium && (
                    <div className="absolute -top-1 -left-1 bg-amber-500 text-black text-[7px] font-black uppercase px-1 rounded shadow">
                      PRÓ
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
