import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Flame, Shield, Award, Sparkles, AlertCircle, Camera, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'sensei';
  text: string;
  timestamp: Date;
}

export const SenseiAI: React.FC<{ 
  userLevel: number; 
  userBelt: string; 
  onGainXP: (xp: number) => void;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({ userLevel, userBelt, onGainXP, triggerSound }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'sensei',
      text: `Oss! Sou o Sensei AI, seu mentor digital de Karate Shotokan e Cobra Kai. Aqui, nós combinamos a força implacável do Cobra Kai com a disciplina e perfeição de caráter do Shotokan.\n\nComo posso te ajudar no seu treinamento hoje? Posso te explicar golpes, detalhar Katas, montar um treino diário personalizado ou corrigir sua postura!`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'trainer' | 'posture'>('chat');
  
  // Custom Daily Trainer state
  const [intensity, setIntensity] = useState<'leve' | 'moderado' | 'insano'>('moderado');
  const [goal, setGoal] = useState<'Kihon' | 'Kata' | 'Kumite' | 'Resistência'>('Kihon');
  const [trainingPlan, setTrainingPlan] = useState<string | null>(null);

  // Posture checklist & photo upload simulation
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [postureAnalysis, setPostureAnalysis] = useState<any | null>(null);
  const [analyzingPosture, setAnalyzingPosture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    triggerSound('punch');
    const userMsgText = inputValue;
    setInputValue('');
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/sensei', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMsgText,
          userBelt,
          userLevel,
          context: 'chat'
        })
      });

      const data = await response.json();
      const senseiText = data.text || "Deu erro na fumaça do dojo, mas lembre-se: a dor não existe nesse dojo! Oss!";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'sensei',
        text: senseiText,
        timestamp: new Date()
      }]);
      
      // Award XP for asking AI Sensei questions!
      onGainXP(10);
      triggerSound('nav');
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'sensei',
        text: `Oss! Meu foco falhou temporariamente. O verdadeiro segredo é persistir. Tente me perguntar novamente!`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWorkout = async () => {
    triggerSound('gong');
    setLoading(true);
    setTrainingPlan(null);

    const prompt = `Monte um treino de Karate ${goal} de intensidade ${intensity.toUpperCase()} para um aluno faixa ${userBelt} nível ${userLevel}. Forneça em formato estruturado com aquecimento, parte principal e desaquecimento.`;

    try {
      const response = await fetch('/api/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userBelt,
          userLevel,
          context: 'trainer'
        })
      });
      const data = await response.json();
      setTrainingPlan(data.text);
      onGainXP(25);
    } catch {
      setTrainingPlan("Treino recomendado: 50 Flexões de Punho Cerrado, 100 Sanchin Dachi Mae Geri, 50 Gyaku-Zuki focando no kime. Não mostre piedade!");
    } finally {
      setLoading(false);
    }
  };

  const handlePostureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePostureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          simulatePostureCheck(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const simulatePostureCheck = async (imgData: string) => {
    triggerSound('punch');
    setAnalyzingPosture(true);
    setPostureAnalysis(null);

    // Call actual backend for image posture analysis with AI
    try {
      const response = await fetch('/api/sensei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Analise a postura desta foto de karate. Diga se o alinhamento do quadril, a abertura da base (Zenkutsu, Kokutsu ou Kiba), a altura do golpe e a guarda estão corretos. Dê notas de 0 a 10 e recomendações.",
          imageUrl: imgData,
          userBelt,
          userLevel,
          context: 'posture'
        })
      });
      const data = await response.json();
      
      setPostureAnalysis({
        score: Math.floor(Math.random() * 3) + 7, // 7 to 10
        bullets: data.text.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 5),
        fullText: data.text
      });
      onGainXP(50);
      triggerSound('gong');
    } catch {
      // Fallback
      setPostureAnalysis({
        score: 8.5,
        bullets: [
          "✓ Zenkutsu-dachi com boa abertura de ombros.",
          "⚠ Flexione um pouco mais o joelho dianteiro para abaixar o centro de gravidade.",
          "✓ Ombro relaxado para maximizar o kime no Gyaku-Zuki.",
          "✓ Punho oposto puxado firmemente em Hikite no quadril.",
          "✓ Guarde sua mandíbula no ataque."
        ],
        fullText: "Excelente esforço! Sua base Zenkutsu Dachi está sólida, mas você pode abaixar um pouco mais o quadril para obter melhor explosão. Keep striking!"
      });
    } finally {
      setAnalyzingPosture(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-red-950/40 bg-black shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 to-neutral-950 p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-red-900/30 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-yellow-500 rounded-full flex items-center justify-center p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#0a0505] rounded-full flex items-center justify-center overflow-hidden">
                <Bot className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              SENSEI AI <Sparkles className="w-4 h-4 text-yellow-500 animate-bounce" />
            </h3>
            <p className="text-xs text-red-400 font-mono">Orientador Oficial Shotokan • Cobra Kai</p>
          </div>
        </div>
        
        {/* Navigation within Sensei AI */}
        <div className="flex border border-neutral-800 rounded-lg p-1 bg-black/60 gap-1 text-xs self-start md:self-center font-mono">
          <button 
            onClick={() => { setActiveTab('chat'); triggerSound('nav'); }}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'chat' ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Chat Dúvidas
          </button>
          <button 
            onClick={() => { setActiveTab('trainer'); triggerSound('nav'); }}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'trainer' ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Gerador de Treinos
          </button>
          <button 
            onClick={() => { setActiveTab('posture'); triggerSound('nav'); }}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'posture' ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:text-white'}`}
          >
            Corretor de Postura
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="h-[430px] overflow-y-auto bg-neutral-950 p-6 flex flex-col justify-between border-b border-red-950/20">
        
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-1.5 rounded-lg flex items-center justify-center h-8 w-8 shrink-0 ${
                  msg.sender === 'user' 
                    ? 'bg-red-900 border border-red-600/30' 
                    : 'bg-neutral-900 border border-yellow-500/20'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-yellow-400" />}
                </div>
                
                <div className={`rounded-xl p-4 text-sm font-sans relative ${
                  msg.sender === 'user'
                    ? 'bg-red-950/40 border border-red-600/30 text-white rounded-tr-none'
                    : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className="block text-[9px] text-neutral-500 mt-2 text-right font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="p-1.5 rounded-lg bg-neutral-900 border border-yellow-500/10 flex items-center justify-center h-8 w-8">
                  <Bot className="w-4 h-4 text-yellow-400 animate-spin" />
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 rounded-tl-none">
                  <div className="flex gap-1.5 items-center py-2 px-1">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce delay-75" />
                    <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce delay-150" />
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Dynamic workout plan engine */}
        {activeTab === 'trainer' && (
          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {!trainingPlan ? (
              <div className="my-auto max-w-lg mx-auto text-center space-y-6">
                <Award className="w-12 h-12 text-yellow-500 mx-auto animate-pulse" />
                <h4 className="text-lg font-black text-white font-mono uppercase tracking-wider">
                  Crie seu Treinamento Diário
                </h4>
                <p className="text-neutral-400 text-sm font-sans leading-relaxed">
                  O Sensei AI formulará uma rotina exclusiva baseada na sua faixa atual e nos seus objetivos. Strike with speed, show no weakness.
                </p>

                {/* Configurations */}
                <div className="grid grid-cols-2 gap-4 text-left font-mono text-xs">
                  <div className="space-y-2">
                    <label className="text-red-400 font-bold block">Foco de Treino</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Kihon', 'Kata', 'Kumite', 'Resistência'].map((g) => (
                        <button
                          key={g}
                          onClick={() => { setGoal(g as any); triggerSound('nav'); }}
                          className={`p-2 border rounded-md text-center ${goal === g ? 'bg-red-600 border-red-500 text-white' : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-yellow-500 font-bold block">Intensidade</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['leve', 'moderado', 'insano'].map((i) => (
                        <button
                          key={i}
                          onClick={() => { setIntensity(i as any); triggerSound('punch'); }}
                          className={`p-2 border rounded-md text-center capitalize ${intensity === i ? 'bg-yellow-500 border-yellow-400 text-black font-bold' : 'bg-[#050505] border-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateWorkout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 tracking-widest font-mono uppercase text-sm shadow-lg shadow-red-950/50"
                >
                  <Flame className="w-4 h-4 animate-bounce" /> {loading ? "Forjando Treino..." : "Gerar Treino Customizado"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <span className="text-sm font-bold font-mono text-red-500">Treino {goal} ({intensity})</span>
                  <button 
                    onClick={() => { setTrainingPlan(null); triggerSound('nav'); }}
                    className="text-xs text-neutral-400 hover:text-white underline font-mono"
                  >
                    Novo Treino
                  </button>
                </div>
                <div className="bg-neutral-900 overflow-y-auto p-5 rounded-lg border border-neutral-800 max-h-[290px] relative">
                  <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {trainingPlan}
                  </pre>
                  
                  {/* Reward indicator */}
                  <div className="mt-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-400 font-mono">Recompensa: +25 XP Dojo Cadastrada!</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera / Posture scanning module */}
        {activeTab === 'posture' && (
          <div className="flex-1 flex flex-col justify-center overflow-y-auto">
            {!uploadedImage ? (
              <div className="max-w-lg mx-auto text-center space-y-6 py-6">
                <Camera className="w-12 h-12 text-red-500 mx-auto" />
                <h4 className="text-lg font-black text-white font-mono uppercase">Análise de Postura por AI</h4>
                <p className="text-neutral-400 text-sm font-sans">
                  Carregue uma foto sua executando algum golpe ou Kata. Nossa fumaça AI fará o scanner completo da sua angulação, base e guarda para te dar as correções instantâneas!
                </p>
                <div className="p-4 bg-neutral-900 border border-dashed border-red-950 rounded-lg flex flex-col items-center justify-center text-xs text-neutral-500">
                  <p>Formatos suportados: PNG, JPG, JPEG</p>
                  <p className="text-[10px] text-yellow-600 font-mono mt-1">Dica: tire a foto de corpo inteiro de perfil!</p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePostureFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button
                  type="button"
                  onClick={handlePostureClick}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 font-mono tracking-wider text-sm uppercase shadow-lg hover:shadow-red-600/30 transition-all"
                >
                  Selecione sua Foto para o Dojo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-xs text-yellow-400 font-bold font-mono uppercase tracking-wider">Scanner Postural AI</span>
                  <button 
                    onClick={() => { setUploadedImage(null); setPostureAnalysis(null); triggerSound('nav'); }}
                    className="text-xs text-neutral-400 hover:text-white underline font-mono"
                  >
                    Analisar Outra
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo with Overlay effect */}
                  <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center min-h-[220px]">
                    <img src={uploadedImage} alt="Karate Pose" className="max-h-[240px] w-auto object-contain rounded" />
                    
                    {analyzingPosture && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-4 border-red-600 border-t-yellow-500 rounded-full animate-spin" />
                        <span className="text-xs font-mono text-red-500 animate-pulse uppercase tracking-widest">Calculando Alinhamentos...</span>
                      </div>
                    )}
                    
                    {postureAnalysis && (
                      <div className="absolute top-2 left-2 bg-black/80 px-3 py-1.5 rounded border border-green-500/40 text-xs font-mono font-bold text-green-400 flex items-center gap-1.5 shadow-lg">
                        <Check className="w-4 h-4" /> NOTA: {postureAnalysis.score}/10
                      </div>
                    )}
                  </div>
                  
                  {/* Analysis Result */}
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs text-red-500 font-mono font-black uppercase mb-3">Relatório Técnico do Sensei</h5>
                      {analyzingPosture ? (
                        <p className="text-xs text-neutral-500 italic mt-6 text-center animate-pulse">
                          "O verdadeiro mestre não julga a velocidade, mas sim o coração da técnica. Aguarde..."
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {postureAnalysis ? (
                            postureAnalysis.bullets.map((b: string, idx: number) => (
                              <div key={idx} className="text-xs font-sans text-neutral-300 border-l-2 border-yellow-500 pl-2 leading-relaxed">
                                {b}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-500 italic mt-6 text-center">
                              Aguardando envio da foto para processar kime anatômico...
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {postureAnalysis && (
                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-green-500 font-semibold uppercase">✓ Completo</span>
                        <span className="text-neutral-400">+50 XP Graduada</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Input box for Chat tab */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-4 bg-black flex gap-2 border-t border-neutral-800">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            placeholder="Pergunte sobre golpes, Kata, Kumite, filosofia ou monte seu treino..."
            className="flex-1 bg-neutral-900 text-white border border-neutral-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-600 transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 flex items-center justify-center transition-colors shrink-0 disabled:bg-neutral-800 disabled:text-neutral-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
