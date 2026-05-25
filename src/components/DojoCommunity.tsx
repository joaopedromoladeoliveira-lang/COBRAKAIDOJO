import React, { useState } from 'react';
import { Send, ThumbsUp, MessageSquare, Flame, CheckCircle2, UserPlus, Gift, Sparkles, Globe, UserCheck, Video } from 'lucide-react';
import { ForumPost, User } from '../types';

export const DojoCommunity: React.FC<{
  posts: ForumPost[];
  students: User[];
  onAddPost: (content: string, mediaUrl?: string, isVideo?: boolean) => void;
  onLikePost: (postId: string) => void;
  onAddReply: (postId: string, content: string) => void;
  currentUser: User;
  onToggleFollow: (studentId: string) => void;
  followingIds: string[];
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({
  posts,
  students,
  onAddPost,
  onLikePost,
  onAddReply,
  currentUser,
  onToggleFollow,
  followingIds,
  triggerSound
}) => {
  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isVideoUpload, setIsVideoUpload] = useState(false);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});

  // Global live chat simulators state
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: '1', userName: 'Carlos Silva', userBelt: 'vermelha', text: 'Oss! Ótima aula de Kata hoje galera, mudei pro nível Vermelha!', time: '10:15' },
    { id: '2', userName: 'Aline Aoki', userBelt: 'preta', text: 'Parabéns Carlos. Mantenha o foco que o Kanku Dai é lindo de dominar.', time: '10:18' },
    { id: '3', userName: 'Filipe Souza', userBelt: 'verde', text: 'Alguém afim de treinar Kihon no parque amanhã cedo?', time: '11:02' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    onAddPost(postContent, mediaUrl || undefined, isVideoUpload);
    setPostContent('');
    setMediaUrl('');
    setIsVideoUpload(false);
    triggerSound('gong');
  };

  const handleAddReplySubmit = (postId: string) => {
    const text = replyText[postId];
    if (!text || !text.trim()) return;
    onAddReply(postId, text);
    setReplyText(prev => ({ ...prev, [postId]: '' }));
    triggerSound('nav');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      userName: currentUser.name,
      userBelt: currentUser.belt,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    triggerSound('punch');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Col 1 & 2: Social Feed */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-sm font-bold font-mono text-red-500 uppercase tracking-wider">Feed do Dojo</h3>
        
        {/* Create Post Form */}
        <form onSubmit={handlePostSubmit} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
          <textarea 
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Compartilhe seu treino, dúvidas, ou um vídeo executando um golpe..."
            className="w-full h-20 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-600 font-sans resize-none"
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 gap-2">
              <input 
                type="text" 
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Link da imagem/vídeo opcional..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none"
              />
              
              <button 
                type="button"
                onClick={() => { setIsVideoUpload(!isVideoUpload); triggerSound('nav'); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold transition-colors ${
                  isVideoUpload 
                    ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500' 
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> {isVideoUpload ? 'Vídeo' : 'Imagem'}
              </button>
            </div>

            <button 
              type="submit"
              disabled={!postContent.trim()}
              className="bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs font-mono px-4 py-2 rounded-lg transition-all shadow disabled:opacity-50"
            >
              Publicar
            </button>
          </div>
        </form>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 text-left">
              {/* Header */}
              <div className="flex justify-between items-center bg-neutral-950/40 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-950 border border-red-500/30 flex items-center justify-center text-xs font-bold font-mono text-white">
                    {post.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-white">{post.userName}</h4>
                      <span className="text-[8px] bg-red-950 text-red-400 font-bold px-1 py-0.5 rounded font-mono uppercase">
                        {post.userBelt}
                      </span>
                    </div>
                    <span className="text-[9px] text-neutral-500 font-mono">{post.date}</span>
                  </div>
                </div>
              </div>

              {/* Content text */}
              <p className="text-xs text-neutral-200 leading-relaxed font-sans">{post.content}</p>

              {/* Media attached */}
              {post.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-neutral-800 max-h-[220px] bg-black">
                  {post.videoUrl ? (
                    <div className="relative w-full h-full aspect-video flex items-center justify-center bg-zinc-950 p-4">
                      {/* Interactive Student-uploaded video simulation */}
                      <Video className="w-8 h-8 text-red-500 animate-pulse" />
                      <span className="text-[10px] text-neutral-400 font-mono ml-2">VÍDEO DE EXERCÍCIO ENVIADO</span>
                    </div>
                  ) : (
                    <img src={post.imageUrl} alt="Anexo do aluno" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="flex gap-4 border-t border-neutral-800/60 pt-3">
                <button 
                  onClick={() => { onLikePost(post.id); triggerSound('punch'); }}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-red-500" /> {post.likes} Kime Likes
                </button>
              </div>

              {/* Replies and replies form */}
              <div className="space-y-3 bg-neutral-950/40 p-3 rounded-lg">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyText[post.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                    placeholder="Responda ou motive..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                  />
                  <button 
                    onClick={() => handleAddReplySubmit(post.id)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-xs text-white px-2.5 rounded font-mono"
                  >
                    Enviar
                  </button>
                </div>

                <div className="space-y-2 truncate">
                  {post.replies.map((rep) => (
                    <div key={rep.id} className="text-[10px] pl-2 border-l border-red-800 font-sans">
                      <span className="text-white font-bold">{rep.userName}: </span>
                      <span className="text-neutral-300">{rep.content}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Col 3: Global Dojo Chat */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold font-mono text-red-500 uppercase tracking-wider">Chat Global</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between h-[450px]">
          {/* Messages list */}
          <div className="space-y-3 overflow-y-auto flex-1 mb-3 pr-1">
            {chatMessages.map(msg => (
              <div key={msg.id} className="text-left space-y-1">
                <div className="flex items-center gap-1 text-[9px] font-mono leading-none">
                  <span className="text-white font-bold">{msg.userName}</span>
                  <span className="text-[7px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-0.5 rounded uppercase font-bold scale-90">
                    {msg.userBelt}
                  </span>
                  <span className="text-neutral-600 font-normal ml-auto">{msg.time}</span>
                </div>
                <div className="bg-neutral-950 p-2 rounded text-[11px] text-neutral-300 font-sans break-words border border-neutral-800/30">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-1.5 border-t border-neutral-800/60 pt-3">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Digite sua mensagem dink..."
              className="flex-1 bg-black border border-neutral-800 text-xs rounded px-2.5 py-2.5 text-white focus:outline-none focus:border-red-600"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="bg-red-600 hover:bg-red-500 p-2 rounded text-white active:scale-95 transition-all text-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Col 4: Students list & followers toggle */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold font-mono text-red-500 uppercase tracking-wider">Atletas do Dojo</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3.5">
          {students.filter(std => std.role !== 'admin').map(std => {
            const isFollowing = followingIds.includes(std.id);

            return (
              <div key={std.id} className="flex items-center justify-between gap-2 text-left pb-2.5 border-b border-neutral-800/60 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h5 className="text-xs font-bold text-white truncate max-w-[120px]">{std.name}</h5>
                    <span className="text-[8px] bg-red-950 text-red-400 font-black px-1 rounded uppercase font-mono leading-none">
                      {std.belt}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 mt-1">
                    <span className="flex items-center gap-0.5"><Globe className="w-3 h-3 text-neutral-500" /> {std.country}</span>
                    <span className="text-neutral-600">•</span>
                    <span>{std.followersCount} seguidores</span>
                  </div>
                </div>

                {std.id !== currentUser.id && (
                  <button 
                    onClick={() => { onToggleFollow(std.id); triggerSound('nav'); }}
                    className={`p-1 px-2 rounded font-mono text-[9px] uppercase font-bold transition-all ${
                      isFollowing 
                        ? 'bg-neutral-950 text-neutral-400 border border-neutral-800' 
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow'
                    }`}
                  >
                    {isFollowing ? 'Seguindo' : '+ Seguir'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
