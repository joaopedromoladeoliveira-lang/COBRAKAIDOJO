import React, { useState } from 'react';
import { Award, Shield, User, Globe, Trophy, Plus, MapPin, Target, Sparkles, Check } from 'lucide-react';
import { Tournament } from '../types';

export const TournamentBracket: React.FC<{
  tournaments: Tournament[];
  onJoinTournament: (id: string, userEmail: string) => void;
  currentUserEmail: string;
  userBelt: string;
  triggerSound: (type: 'nav' | 'punch' | 'belt' | 'gong') => void;
}> = ({ tournaments, onJoinTournament, currentUserEmail, userBelt, triggerSound }) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(tournaments[0]?.id || '');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  
  const activeTournament = tournaments.find(t => t.id === selectedTournamentId) || tournaments[0];
  const isRegistered = activeTournament?.participants.includes(currentUserEmail);

  const handleRegister = () => {
    if (!activeTournament) return;
    onJoinTournament(activeTournament.id, currentUserEmail);
    triggerSound('gong');
  };

  const countries = ['all', 'Brasil', 'USA', 'Japão', 'Alemanha'];

  const filteredTournaments = filterCountry === 'all' 
    ? tournaments 
    : tournaments.filter(t => t.country === filterCountry);

  return (
    <div className="space-y-8">
      
      {/* Introduction Hero Section */}
      <div className="bg-gradient-to-r from-neutral-950 via-red-950/40 to-neutral-950 border border-red-950/40 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-yellow-500 font-mono text-xs uppercase font-bold tracking-widest">
            <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" /> Torneios Globais Karate Shotokan
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Arena Kumite Mundial</h2>
          <p className="text-neutral-300 text-sm max-w-2xl font-sans">
            Inscreva-se nos campeonatos globais da escola Team Paulo Souza &amp; Cobra Kai. Derrote oponentes virtuais, suba no ranking mundial por país e garanta suas medalhas digitais e troféus físicos de faixa preta!
          </p>
        </div>
        
        {/* Quick Filter */}
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
          <span>Filtrar País:</span>
          <select 
            value={filterCountry}
            onChange={(e) => { setFilterCountry(e.target.value); triggerSound('nav'); }}
            className="bg-black border border-neutral-800 text-white rounded p-1.5 focus:border-red-600 outline-none"
          >
            {countries.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'Ver Todos' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Tournaments List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-mono text-red-500 uppercase tracking-wider">Torneios Ativos</h3>
          <div className="space-y-3">
            {filteredTournaments.map(t => {
              const isActive = t.id === selectedTournamentId;
              const openRegister = t.status === 'Inscrições Abertas';

              return (
                <div 
                  key={t.id}
                  onClick={() => { setSelectedTournamentId(t.id); triggerSound('nav'); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                    isActive 
                      ? 'bg-red-950/20 border-red-600' 
                      : 'bg-neutral-900 border-neutral-800/80 hover:border-neutral-700/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-red-950 text-red-400 font-bold font-mono uppercase px-2 py-0.5 rounded leading-none">
                      {t.category}
                    </span>
                    <span className={`text-[9px] font-mono uppercase font-bold ${
                      openRegister ? 'text-green-500' : 'text-neutral-500'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5">{t.name}</h4>
                  
                  <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {t.registeredUsersCount} Atletas
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Selected Tournament bracket visualization & registration */}
        <div className="lg:col-span-2 space-y-6">
          {activeTournament ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              
              {/* Tournament Title & Status Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-yellow-500 font-mono flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> {activeTournament.country} • {activeTournament.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{activeTournament.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {isRegistered ? (
                    <div className="bg-green-950/40 border border-green-500/40 text-green-400 font-mono text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> INSCRITO
                    </div>
                  ) : activeTournament.status === 'Inscrições Abertas' ? (
                    <button 
                      onClick={handleRegister}
                      className="bg-red-600 hover:bg-red-500 font-black text-xs uppercase text-white font-mono px-5 py-2.5 rounded-lg transition-transform animate-pulse flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Inscrever-se Arena
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-neutral-500 italic bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800">
                      Inscrições Encerradas
                    </span>
                  )}
                </div>
              </div>

              {/* Tournament bracket Flow chart */}
              <div className="space-y-4">
                <h4 className="text-xs font-black font-mono text-neutral-400 uppercase tracking-wider">Chaveamento Automático do Torneio</h4>
                
                {activeTournament.bracket.length === 0 ? (
                  <div className="bg-neutral-950 border border-red-950/20 p-8 rounded-lg text-center font-mono text-neutral-500 text-xs">
                    * O chaveamento oficial será gerado automaticamente quando o torneio iniciar. Prepare-se!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-x-auto">
                    {activeTournament.bracket.map((roundObj) => (
                      <div key={roundObj.round} className="space-y-4 min-w-[200px]">
                        <h5 className="text-[10px] font-mono uppercase bg-neutral-950 text-yellow-500 py-1 px-2.5 rounded border border-neutral-800/60 inline-block">
                          Rodada {roundObj.round} {roundObj.round === 1 ? '(Semifinal)' : '(Grand Finale)'}
                        </h5>

                        <div className="space-y-3">
                          {roundObj.matches.map((match) => {
                            const p1Winner = match.winner === match.player1;
                            const p2Winner = match.winner === match.player2;

                            return (
                              <div key={match.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2 text-xs relative">
                                {/* Player 1 info */}
                                <div className="flex items-center justify-between font-sans">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded bg-red-600" />
                                    <span className={`font-medium ${p1Winner ? 'text-yellow-400 font-bold' : 'text-neutral-400'}`}>
                                      {match.player1}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-neutral-500">{match.score1 ?? '-'}</span>
                                </div>

                                {/* Divider line */}
                                <div className="border-t border-neutral-900 border-dashed" />

                                {/* Player 2 info */}
                                <div className="flex items-center justify-between font-sans">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded bg-blue-600" />
                                    <span className={`font-medium ${p2Winner ? 'text-yellow-400 font-bold' : 'text-neutral-400'}`}>
                                      {match.player2}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-neutral-500">{match.score2 ?? '-'}</span>
                                </div>

                                {/* Winner indicator badge */}
                                {match.winner && (
                                  <div className="absolute -top-1 right-2 bg-yellow-400/10 border border-yellow-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold text-yellow-500 uppercase font-mono tracking-wider">
                                    Vencedor: {match.winner.split('@')[0]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* World Medal showcase */}
              <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-neutral-950/60 p-4 border border-neutral-800/80 rounded-lg space-y-1">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto animate-pulse" />
                  <h5 className="text-xs font-bold text-white font-mono uppercase">Medalhas Digitais</h5>
                  <p className="text-[10px] text-neutral-500 font-sans">Rankings mundiais e premiação exclusiva registrada no dojo.</p>
                </div>

                <div className="bg-neutral-950/60 p-4 border border-neutral-800/80 rounded-lg space-y-1">
                  <Shield className="w-6 h-6 text-red-500 mx-auto" />
                  <h5 className="text-xs font-bold text-white font-mono uppercase">Chaves Automáticas</h5>
                  <p className="text-[10px] text-neutral-500 font-sans">Combates virtuais de Shotokan avaliados em tempo real.</p>
                </div>

                <div className="bg-neutral-950/60 p-4 border border-neutral-800/80 rounded-lg col-span-2 md:col-span-1 space-y-1">
                  <Award className="w-6 h-6 text-green-500 mx-auto" />
                  <h5 className="text-xs font-bold text-white font-mono uppercase">Certificado Kumite</h5>
                  <p className="text-[10px] text-neutral-500 font-sans">Autenticado por Prof. Paulo Souza (Presidente).</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-400 text-sm font-sans">
              Nenhum torneio cadastrado no banco de dados do dojo.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
