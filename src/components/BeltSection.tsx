import React, { useState } from 'react';
import { Award, Shield, Check, Flame, Trophy, Star, Sparkles, BookOpen, AlertCircle, Printer, Share2 } from 'lucide-react';
import { User } from '../types';

export const BeltSection: React.FC<{
  currentUser: User;
  students: User[];
  onGainXP: (xp: number) => void;
  onGraduateBelt: (belt: User['belt']) => void;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({ currentUser, students, onGainXP, onGraduateBelt, triggerSound }) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'quiz' | 'blackbelt'>('evolution');
  
  // Quiz Module State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions = [
    {
      q: 'Quem é considerado o pai do Karate Shotokan moderno?',
      options: ['Sensei Gichin Funakoshi', 'Sensei Kenwa Mabuni', 'Sensei Chojun Miyagi', 'Sensei Hironori Otsuka'],
      correct: 0,
      xpReward: 30
    },
    {
      q: 'No Dojo Kun, qual é o primeiro e mais importante lema que deve ser buscado?',
      options: ['Esforçar-se para a formação do caráter', 'Respeitar os outros', 'Criar o espírito de esforço', 'Conter a agressividade'],
      correct: 0,
      xpReward: 30
    },
    {
      q: 'O que o conceito de "Kime" representa em um golpe de Karatê?',
      options: ['Concentração de força máxima no impacto', 'Velocidade de esquiva', 'A base em arco de ferro', 'Saudação respeitosa aos mestres'],
      correct: 0,
      xpReward: 30
    },
    {
      q: 'Qual base do Karate Shotokan é mais defensiva, com peso distribuído 70% na perna traseira?',
      options: ['Zenkutsu-dachi', 'Kokutsu-dachi', 'Kiba-dachi', 'Sanchin-dachi'],
      correct: 1,
      xpReward: 40
    }
  ];

  // Hierarchy checklist for Black Belt graduation
  const [completedKatas, setCompletedKatas] = useState(false);
  const [kihonDone, setKihonDone] = useState(false);
  const [kumiteDone, setKumiteDone] = useState(false);
  const [philosophyUnderstood, setPhilosophyUnderstood] = useState(false);
  const [blackBeltGraduated, setBlackBeltGraduated] = useState(currentUser.belt === 'preta');

  const graduatedRequirementsCount = [completedKatas, kihonDone, kumiteDone, philosophyUnderstood].filter(Boolean).length;

  const handleSelectAnswer = (idx: number) => {
    setSelectedAnswer(idx);
  };

  const handleNextQuestion = () => {
    triggerSound('punch');
    if (selectedAnswer === quizQuestions[currentQuestionIdx].correct) {
      setQuizScore(prev => prev + 1);
      onGainXP(quizQuestions[currentQuestionIdx].xpReward);
    }

    setSelectedAnswer(null);
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      triggerSound('gong');
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
    setQuizScore(0);
    triggerSound('nav');
  };

  const handleFinalBlackBeltExam = () => {
    if (graduatedRequirementsCount < 4) {
      alert('Você precisa completar as 4 etapas fundamentais para o exame!');
      return;
    }
    triggerSound('gong');
    onGraduateBelt('preta');
    onGainXP(500); // Massive XP for black belt!
    setBlackBeltGraduated(true);
  };

  const beltLabels: Record<User['belt'], { name: string; color: string; border: string }> = {
    branca: { name: 'Faixa Branca', color: 'bg-white text-black', border: 'border-neutral-300' },
    amarela: { name: 'Faixa Amarela', color: 'bg-yellow-400 text-black', border: 'border-yellow-500' },
    vermelha: { name: 'Faixa Vermelha', color: 'bg-red-600 text-white', border: 'border-red-700' },
    laranja: { name: 'Faixa Laranja', color: 'bg-orange-500 text-white', border: 'border-orange-600' },
    verde: { name: 'Faixa Verde', color: 'bg-green-600 text-white', border: 'border-green-700' },
    roxa: { name: 'Faixa Roxa', color: 'bg-purple-600 text-white', border: 'border-purple-700' },
    marrom: { name: 'Faixa Marrom', color: 'bg-[#78350f] text-white', border: 'border-[#451a03]' },
    preta: { name: 'Faixa Preta', color: 'bg-neutral-900 border border-yellow-500/40 text-yellow-500 font-bold', border: 'border-yellow-500/50' }
  };

  const globalRanking = [...students]
    .filter(std => std.role !== 'admin')
    .sort((a, b) => b.xp - a.xp);

  // Auto Belt Up based on XP (Branca -> Amarela -> Vermelha -> Laranja -> Verde -> Roxa -> Marrom)
  // Black belt must be done through exam check manually.
  const handleSimulatedAutoBeltUpgrade = () => {
    triggerSound('belt');
    const belts: User['belt'][] = ['branca', 'amarela', 'vermelha', 'laranja', 'verde', 'roxa', 'marrom'];
    const currentIdx = belts.indexOf(currentUser.belt);
    if (currentIdx !== -1 && currentIdx < belts.length - 1) {
      const nextBelt = belts[currentIdx + 1];
      onGraduateBelt(nextBelt);
      onGainXP(150);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Visual Tab Selection */}
      <div className="flex border border-neutral-800 rounded-xl p-1 bg-black gap-1 text-xs font-mono max-w-md mx-auto">
        <button 
          onClick={() => { setActiveTab('evolution'); triggerSound('nav'); }}
          className={`flex-1 py-3 px-1 rounded-lg uppercase tracking-wider font-bold transition-all ${activeTab === 'evolution' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          Minha Evolução
        </button>
        <button 
          onClick={() => { setActiveTab('quiz'); triggerSound('nav'); }}
          className={`flex-1 py-3 px-1 rounded-lg uppercase tracking-wider font-bold transition-all ${activeTab === 'quiz' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          Dojo Quiz (+XP)
        </button>
        <button 
          onClick={() => { setActiveTab('blackbelt'); triggerSound('nav'); }}
          className={`flex-1 py-3 px-1 rounded-lg uppercase tracking-wider font-bold transition-all ${activeTab === 'blackbelt' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          Formar Faixa Preta 🥋
        </button>
      </div>

      {activeTab === 'evolution' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main User Card and progression stats */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.08),transparent_50%)]" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-red-600 p-0.5 flex items-center justify-center">
                      <div className="w-full h-full bg-[#0a0505] rounded-full flex items-center justify-center text-xl font-bold font-mono text-white">
                        {currentUser.name.charAt(0)}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] font-black rounded px-1 tracking-tighter leading-none">
                      LVL {currentUser.level}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-none mb-1.5">{currentUser.name}</h3>
                    <p className="text-xs text-neutral-400 font-mono">Dojo ID: Souza-Aistudio-{currentUser.id.substring(0, 4)}</p>
                  </div>
                </div>

                {/* Simulated Auto upgrade tool */}
                <div className="space-y-2">
                  <div className={`p-3 px-5 rounded-lg border text-xs font-mono font-bold text-center ${beltLabels[currentUser.belt].color} ${beltLabels[currentUser.belt].border}`}>
                    {beltLabels[currentUser.belt].name.toUpperCase()}
                  </div>
                  {currentUser.belt !== 'preta' && currentUser.belt !== 'marrom' && (
                    <button 
                      onClick={handleSimulatedAutoBeltUpgrade}
                      className="text-[10px] text-yellow-500 hover:text-white underline font-mono block mx-auto py-1"
                    >
                      Avançar Faixa (+EXIME)
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-4 font-mono text-xs text-neutral-300">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>PROGRESSÃO DE EXPERIÊNCIA (XP)</span>
                    <span className="text-yellow-500">{currentUser.xp} XP</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-3 border border-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-yellow-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min((currentUser.xp / 1000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>Faixa Atual</span>
                    <span>Meta Graduação Preta: 1000 XP (Mínimo)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 text-[10px]">
                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                    <span className="text-neutral-500 block">AULAS ASSISTIDAS</span>
                    <span className="text-sm font-black text-white">{currentUser.completedLessons.length} Aulas</span>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                    <span className="text-neutral-500 block">DESAFIOS ENFRENTADOS</span>
                    <span className="text-sm font-black text-white">{currentUser.streak} Combo Streaks</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Dojo hierarchy roadmap */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
              <h4 className="text-sm font-black font-mono text-white uppercase tracking-wider">Caminho do Guerreiro (Graduações)</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[10px] text-center">
                {Object.entries(beltLabels).map(([key, value]) => {
                  const active = currentUser.belt === key;
                  
                  return (
                    <div 
                      key={key} 
                      className={`p-3 rounded-lg border flex flex-col justify-between items-center ${
                        active 
                          ? 'bg-red-950/20 border-red-600 text-white' 
                          : 'bg-neutral-950 border-neutral-850 text-neutral-500'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full mb-1.5 border border-black ${value.color}`} />
                      <span className="font-bold uppercase tracking-wider block mb-1">{key}</span>
                      <span className="text-[8px] text-neutral-500">
                        {key === 'branca' ? 'Início' : key === 'preta' ? 'Lenda EXAM' : '+150 XP'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Leaderboard global ranking column */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold font-mono text-neutral-400 uppercase tracking-wider text-left">Ranking Global do Dojo</h3>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4 text-left">
              <div className="space-y-3">
                {globalRanking.slice(0, 5).map((std, idx) => {
                  const isUser = std.id === currentUser.id;

                  return (
                    <div key={std.id} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      isUser ? 'bg-red-950/30 border-red-600 text-white' : 'bg-neutral-950 border-neutral-900 text-neutral-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-500 font-bold">#{idx + 1}</span>
                        <div>
                          <p className="font-bold">{std.name}</p>
                          <span className="font-mono text-[8px] uppercase text-yellow-400">{std.belt}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-black text-yellow-400">{std.xp}</span> <span className="text-[10px] text-neutral-500">XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* QUIZ SECTION FOR GAINING XP */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto text-left">
          {!quizFinished ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-850 pb-3">
                <span className="text-xs text-yellow-500 font-mono font-bold uppercase tracking-wider">Dojo Quiz - Pergunta {currentQuestionIdx + 1}/{quizQuestions.length}</span>
                <span className="text-xs text-purple-400 font-mono">Prêmio: +{quizQuestions[currentQuestionIdx].xpReward} XP</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white font-sans">{quizQuestions[currentQuestionIdx].q}</h3>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {quizQuestions[currentQuestionIdx].options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;

                  return (
                    <button 
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`w-full p-4.5 text-left border rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-red-950/40 border-red-500 text-white font-bold' 
                          : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                      }`}
                    >
                      <span className="mr-2 text-red-500 font-black">{idx + 1}.</span> {opt}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-lg font-mono text-xs uppercase disabled:opacity-50"
              >
                Confirmar Resposta
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-6">
              <Trophy className="w-14 h-14 text-yellow-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-black font-mono text-white uppercase">Dojo Quiz Respondido!</h3>
              
              <div className="max-w-xs mx-auto p-4 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-xs">
                <p className="text-neutral-400">Taxa de Acertos:</p>
                <div className="text-3xl font-black text-yellow-400 py-1">{quizScore}/{quizQuestions.length}</div>
                <p className="text-[10px] text-green-500 mt-2 font-bold">✓ Seus acertos foram convertidos em bônus para sua graduação!</p>
              </div>

              <button 
                onClick={resetQuiz}
                className="bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-xs uppercase px-8 py-3 rounded-lg shadow"
              >
                Responder Novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* FORMATION OF BLACK BELTS THROUGH THIS EXAM MODULE WITH PRINTABLE PRETTY PDF OR PRINT CERTIFICATES */}
      {activeTab === 'blackbelt' && (
        <div className="max-w-2xl mx-auto text-left space-y-6">
          
          {!blackBeltGraduated ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-md font-black font-mono text-white uppercase flex items-center gap-1.5">
                  🥋 Exame Outorga Oficial: Faixa Preta
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Para obter as assinaturas oficiais do Prof. Paulo Souza (Presidente) e Sensei Cobra Kai, você precisa certificar todas as metas de conhecimento prático e filosófico no app.
                </p>
              </div>

              {/* Requirement checkers */}
              <div className="space-y-3 font-mono text-xs">
                {/* 1 */}
                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-850">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="kata-check"
                      checked={completedKatas}
                      onChange={(e) => { setCompletedKatas(e.target.checked); triggerSound('punch'); }}
                      className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="kata-check" className="cursor-pointer text-neutral-300">
                      Dominar do 1º ao 5º Heian Kata &amp; Tekki Shodan
                    </label>
                  </div>
                  <span className="text-[9px] text-yellow-500 font-bold uppercase">PRÁTICA</span>
                </div>
                
                {/* 2 */}
                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-850">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="kihon-check"
                      checked={kihonDone}
                      onChange={(e) => { setKihonDone(e.target.checked); triggerSound('punch'); }}
                      className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="kihon-check" className="cursor-pointer text-neutral-300">
                      Executar sequências de Kihon (Zuki, Geri, Uke) com alto Kime
                    </label>
                  </div>
                  <span className="text-[9px] text-yellow-500 font-bold uppercase">PRECISÃO</span>
                </div>

                {/* 3 */}
                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-850">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="kumite-check"
                      checked={kumiteDone}
                      onChange={(e) => { setKumiteDone(e.target.checked); triggerSound('punch'); }}
                      className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="kumite-check" className="cursor-pointer text-neutral-300">
                      Participar de pelo menos 1 Torneio Kumite Mundial
                    </label>
                  </div>
                  <span className="text-[9px] text-yellow-500 font-bold uppercase">ARENA</span>
                </div>

                {/* 4 */}
                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-850">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="philosophy-check"
                      checked={philosophyUnderstood}
                      onChange={(e) => { setPhilosophyUnderstood(e.target.checked); triggerSound('punch'); }}
                      className="accent-yellow-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="philosophy-check" className="cursor-pointer text-neutral-300">
                      Entender os preceitos éticos do Dojo Kun de Shotokan
                    </label>
                  </div>
                  <span className="text-[9px] text-yellow-500 font-bold uppercase">FILOSOFIA</span>
                </div>
              </div>

              {graduatedRequirementsCount === 4 ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400 animate-bounce" />
                  <span className="text-xs font-mono font-bold text-green-400">Todos os requisitos compuseram seu kime! Faça o juramento de faixa preta agora.</span>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-center gap-2 text-xs text-yellow-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-mono">Faltam {4 - graduatedRequirementsCount} requisitos para habilitar seu Exame Oficial.</span>
                </div>
              )}

              <button 
                onClick={handleFinalBlackBeltExam}
                disabled={graduatedRequirementsCount < 4}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black py-4 rounded-lg font-mono text-xs uppercase tracking-widest transition-transform select-none disabled:opacity-45"
              >
                Realizar Exame Oficial de Faixa Preta (+500 XP)
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Printable Dynamic Certificate View */}
              <div 
                id="dojo-certificate"
                className="bg-neutral-950 border-8 border-yellow-600 p-8 rounded-xl text-center space-y-8 relative overflow-hidden shadow-2xl tracking-wide max-w-xl mx-auto border-double bg-[radial-gradient(circle_at_center,#1e1c10_0%,#000000_100%)] print:p-12 print:border-4"
              >
                {/* Background watermarks or rings */}
                <div className="absolute inset-0 bg-repeat opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="space-y-1">
                  <h4 className="font-serif text-yellow-500 text-[10px] font-bold tracking-[0.35em] uppercase">TEAM PAULO SOUZA • COBRA KAI</h4>
                  <p className="text-[8px] text-neutral-500 font-mono tracking-widest uppercase">ESCOLA FEDERADA DE ARTES MARCIAIS</p>
                </div>

                <div className="space-y-2">
                  <h1 className="font-serif text-3xl font-black text-white tracking-wider uppercase">DIPLOMA DE GRADUAÇÃO</h1>
                  <p className="text-neutral-400 italic font-serif text-xs">Outorgamos solenemente pelo presente certificado a chancela de dojo:</p>
                </div>

                <div className="py-2.5 max-w-xs mx-auto border-b-2 border-yellow-600/30">
                  <h2 className="font-mono text-xl font-bold text-yellow-400 uppercase tracking-widest">{currentUser.name}</h2>
                </div>

                <div className="max-w-md mx-auto space-y-3 font-sans text-xs text-neutral-300 px-4 leading-relaxed">
                  <p>
                    Reconhecido como <span className="text-yellow-500 font-bold uppercase">FAIXA PRETA 1º DAN</span> de Karate Shotokan, tendo demonstrado com primor e kime implacável todos os Heian Katas, precisão técnica nos Kihons de impacto e sabedoria dink ao Dojo Kun de caráter e retidão.
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 max-w-sm mx-auto font-mono text-[9px] text-neutral-400">
                  <div className="border-t border-yellow-600/40 pt-2 space-y-0.5">
                    <p className="font-bold text-white uppercase italic">Sensei AI</p>
                    <p>Orientador Virtual Cobra Kai</p>
                  </div>
                  
                  <div className="border-t border-yellow-600/40 pt-2 space-y-0.5">
                    <p className="font-bold text-white uppercase italic">Prof Paulo Souza</p>
                    <p>Presidente Executivo Team Souza</p>
                  </div>
                </div>

                <div className="text-[8px] text-neutral-600 font-mono pt-4">
                  Autenticado no banco dojo aistudio-web-run • {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Certificate commands */}
              <div className="flex gap-4 max-w-xl mx-auto font-mono text-xs">
                <button 
                  onClick={() => { window.print(); triggerSound('nav'); }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow"
                >
                  <Printer className="w-4 h-4" /> Imprimir / PDF Certificado
                </button>
                <button 
                  onClick={() => { triggerSound('punch'); alert('Link de validação copiado para compartilhar seu Dan de Faixa Preta!'); }}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-1"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
