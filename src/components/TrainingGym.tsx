import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Sparkles, Check, Dumbbell, Calendar, Clock, Trophy } from 'lucide-react';

export const TrainingGym: React.FC<{
  onGainXP: (xp: number) => void;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({ onGainXP, triggerSound }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'pushups' | 'calendar'>('timer');

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes standard
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPreset, setTimerPreset] = useState(180);

  // Pushups tracker state
  const [pushupsCount, setPushupsCount] = useState(0);
  const [pushupCombo, setPushupCombo] = useState(0);
  const [highestPushupCount, setHighestPushupCount] = useState(0);

  // Calendar program state
  const calendarProgram = [
    { day: 'Segunda-feira', time: '09:00', focus: 'Kihon Básico & Força', instructor: 'Sem. Paulo Souza', completed: true },
    { day: 'Terça-feira', time: '14:00', focus: 'Kata Heian Shodan', instructor: 'Sensei AI', completed: true },
    { day: 'Quarta-feira', time: '19:30', focus: 'Combate e Kumite Livre', instructor: 'Sem. Paulo Souza', completed: false },
    { day: 'Quinta-feira', time: '10:00', focus: 'Defesa Pessoal Prática', instructor: 'Sensei AI', completed: false },
    { day: 'Sexta-feira', time: '18:00', focus: 'Shotokan Filosofia & Kime', instructor: 'Sem. Paulo Souza', completed: false }
  ];

  // Timer loop
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      triggerSound('gong');
      // Reward finishing a workout timer
      onGainXP(15);
      alert('Treinamento concluído com sucesso! Oss!');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handlePresetSelect = (secs: number) => {
    triggerSound('nav');
    setIsTimerRunning(false);
    setTimerPreset(secs);
    setTimerSeconds(secs);
  };

  const handleTimerToggle = () => {
    triggerSound('punch');
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    triggerSound('nav');
    setIsTimerRunning(false);
    setTimerSeconds(timerPreset);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Pushup detector simulator
  const handleDetectPushup = () => {
    triggerSound('punch');
    setPushupsCount(p => {
      const next = p + 1;
      if (next > highestPushupCount) {
        setHighestPushupCount(next);
      }
      return next;
    });
    setPushupCombo(c => {
      const next = c + 1;
      if (next % 10 === 0) {
        triggerSound('belt');
        onGainXP(10); // Gain +10 XP every 10 pushups combo!
      }
      return next;
    });
  };

  const handleResetPushups = () => {
    triggerSound('nav');
    setPushupsCount(0);
    setPushupCombo(0);
  };

  return (
    <div className="space-y-8">
      
      {/* Visual selectors header tabs */}
      <div className="flex border border-neutral-800 rounded-xl p-1 bg-black gap-1 text-xs font-mono max-w-md mx-auto">
        <button 
          onClick={() => { setActiveTab('timer'); triggerSound('nav'); }}
          className={`flex-1 py-2.5 rounded-lg uppercase tracking-wider font-bold transition-all ${activeTab === 'timer' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          Cronômetro Luta
        </button>
        <button 
          onClick={() => { setActiveTab('pushups'); triggerSound('nav'); }}
          className={`flex-1 py-2.5 rounded-lg uppercase tracking-wider font-bold transition-all ${activeTab === 'pushups' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          Flexômetro (+XP)
        </button>
        <button 
          onClick={() => { setActiveTab('calendar'); triggerSound('nav'); }}
          className={`flex-1 py-2.5 rounded-lg uppercase tracking-wider font-bold transition-all ${activeTab === 'calendar' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
        >
          Cronograma dojo
        </button>
      </div>

      {activeTab === 'timer' && (
        <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center space-y-6">
          
          <div className="space-y-1">
            <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider">Temporizador Kumite</h3>
            <p className="text-[10px] text-neutral-500 font-sans">Ajuste o ritmo do seu treino. Ao zerar obterá +15 XP no tatame.</p>
          </div>

          {/* Big timer circle */}
          <div className="relative w-44 h-44 rounded-full border-4 border-yellow-500/10 flex items-center justify-center mx-auto bg-radial bg-black shadow-inner">
            <div className="absolute inset-0 rounded-full border border-red-500/20 animate-pulse" />
            
            <div className="space-y-1 z-10">
              <span className="text-3xl font-black text-white font-mono">{formatTime(timerSeconds)}</span>
              <span className="block text-[10px] text-yellow-500 uppercase font-mono tracking-widest">{isTimerRunning ? 'Treinando' : 'Pausado'}</span>
            </div>
          </div>

          {/* Presets selectors */}
          <div className="flex justify-center gap-1.5 font-mono text-[10px]">
            <button 
              onClick={() => handlePresetSelect(60)}
              className={`px-3 py-1.5 rounded border transition-all ${timerPreset === 60 ? 'bg-yellow-500 border-yellow-400 text-black font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              1 Min (Rápido)
            </button>
            <button 
              onClick={() => handlePresetSelect(180)}
              className={`px-3 py-1.5 rounded border transition-all ${timerPreset === 180 ? 'bg-yellow-500 border-yellow-400 text-black font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              3 Min (Stand.)
            </button>
            <button 
              onClick={() => handlePresetSelect(300)}
              className={`px-3 py-1.5 rounded border transition-all ${timerPreset === 300 ? 'bg-yellow-500 border-yellow-400 text-black font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'}`}
            >
              5 Min (Preta)
            </button>
          </div>

          {/* Controls buttons */}
          <div className="flex gap-2.5 font-mono text-xs max-w-xs mx-auto pt-2">
            <button 
              onClick={handleTimerReset}
              className="flex-1 bg-neutral-950 border border-neutral-850 p-3 rounded-lg text-neutral-300 hover:bg-neutral-800 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> Reiniciar
            </button>
            <button 
              onClick={handleTimerToggle}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-1"
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />} {isTimerRunning ? 'Pausar' : 'Iniciar'}
            </button>
          </div>

        </div>
      )}

      {activeTab === 'pushups' && (
        <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider">Contador de Flexões</h3>
            <p className="text-[10px] text-neutral-500 font-sans">
              Toque na tela no ritmo das suas flexões (ou use inclinador mobile). <span className="text-yellow-400 font-bold">Acumule +10 XP a cada 10 flexões de punho!</span>
            </p>
          </div>

          {/* Pushups Score displays */}
          <div className="grid grid-cols-2 gap-4 text-left font-mono text-xs">
            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-850">
              <span className="text-neutral-500 block">Sessão Atual:</span>
              <span className="text-2xl font-black text-white">{pushupsCount} reps</span>
            </div>
            
            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-850">
              <span className="text-neutral-500 block">Recorde Geral:</span>
              <span className="text-2xl font-black text-yellow-500">{highestPushupCount} reps</span>
            </div>
          </div>

          {/* Big Tap Tracker Panel */}
          <button 
            type="button"
            onClick={handleDetectPushup}
            className="w-full bg-[#080808] hover:bg-red-950/20 active:bg-red-950/40 border border-dashed border-red-900/40 rounded-xl py-12 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
          >
            <Flame className="w-10 h-10 text-red-600 animate-bounce group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest">TOQUE PARA CONTAR FLEXÃO</span>
            <span className="text-[10px] text-neutral-600">Ritmo Combo: x{pushupCombo}</span>
          </button>

          {/* Reset progress */}
          <button 
            onClick={handleResetPushups}
            className="text-[11px] underline text-neutral-500 hover:text-white font-mono block mx-auto leading-none"
          >
            Zerar Sessão
          </button>

        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="max-w-xl mx-auto bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-left space-y-4">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-500" /> Grade Geral de Treinamento
            </h3>
            <p className="text-[10px] text-neutral-500 font-sans">
              Aulas ao vivo na academia pelo Prof. Paulo Souza. Treine e assine a chamada por QR Code!
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {calendarProgram.map(item => (
              <div 
                key={item.day} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.completed 
                    ? 'bg-neutral-950 border-neutral-850 text-neutral-400' 
                    : 'bg-red-950/10 border-red-900/30 text-neutral-200'
                }`}
              >
                <div>
                  <span className="text-[10px] bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-yellow-500 font-bold mb-1.5 inline-block">
                    {item.day} • {item.time}
                  </span>
                  <h4 className="text-xs font-bold text-white">{item.focus}</h4>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Instrutor: {item.instructor}</span>
                </div>

                {item.completed ? (
                  <span className="text-[9px] font-bold text-green-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Concluso
                  </span>
                ) : (
                  <button 
                    onClick={() => { triggerSound('gong'); alert('Presença QR Code confirmada para a aula!'); }}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-black uppercase tracking-wider px-2 header font-bold py-1 rounded"
                  >
                    Chamada QR
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
