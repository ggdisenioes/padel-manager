"use client";

import { useEffect, useState } from 'react';
// CORRECCIÓN: Usamos '../..' (2 niveles) en lugar de '../../..' (3 niveles)
import { supabase } from '../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function PlayerProfile() {
  const params = useParams();
  const id = params.id;
  
  const [player, setPlayer] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({ played: 0, won: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pData) {
        setPlayer(pData);
        
        const { data: mData } = await supabase
            .from('matches')
            .select('*, tournaments(name)')
            .or(`player_1_a.eq.${pData.name},player_1_b.eq.${pData.name},player_2_a.eq.${pData.name},player_2_b.eq.${pData.name}`)
            .order('id', { ascending: false });

        if (mData) {
            setMatches(mData);
            calculateStats(mData, pData.name);
        }
      }
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  const calculateStats = (matchList: any[], playerName: string) => {
      let played = 0;
      let won = 0;

      matchList.forEach(m => {
          if (m.winner === 'pending') return;
          played++;
          const isTeamA = m.player_1_a === playerName || m.player_1_b === playerName;
          if ((isTeamA && m.winner === 'A') || (!isTeamA && m.winner === 'B')) {
              won++;
          }
      });

      setStats({
          played,
          won,
          winRate: played > 0 ? Math.round((won / played) * 100) : 0
      });
  };

  if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
  if (!player) return <div className="p-10 text-center">Jugador no encontrado</div>;

  return (
    <main className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center shrink-0">
                {player.avatar_url ? (
                    <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                        {player.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800">{player.name}</h2>
                <p className="text-gray-500 mb-2">{player.email || 'Sin email registrado'}</p>
                <div className="flex gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">Nivel {player.level}</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">🏆 {player.points || 0} Puntos</span>
                </div>
            </div>
            
            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats.played}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Jugados</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.won}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Ganados</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.winRate}%</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Efectividad</p>
                </div>
            </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Partidos</h3>

        <div className="space-y-4">
            {matches.length === 0 ? (
                <p className="text-gray-500 italic">Este jugador aún no ha disputado partidos.</p>
            ) : (
                matches.map((m) => {
                    const isWinner = (m.winner === 'A' && (m.player_1_a === player.name || m.player_1_b === player.name)) ||
                                     (m.winner === 'B' && (m.player_2_a === player.name || m.player_2_b === player.name));
                    
                    const resultColor = m.winner === 'pending' ? 'border-l-gray-300' : isWinner ? 'border-l-green-500' : 'border-l-red-500';

                    return (
                        <Card key={m.id} className={`border-l-4 ${resultColor} py-4`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                                        {m.tournaments?.name} • {m.round_name}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={m.winner === 'A' ? 'font-bold text-gray-900' : 'text-gray-600'}>
                                            {m.player_1_a} / {m.player_1_b}
                                        </span>
                                        <span className="text-gray-300 font-bold">VS</span>
                                        <span className={m.winner === 'B' ? 'font-bold text-gray-900' : 'text-gray-600'}>
                                            {m.player_2_a} / {m.player_2_b}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    {m.winner === 'pending' ? (
                                        <Badge label="Pendiente" type="warning" />
                                    ) : (
                                        <div>
                                            <span className={`text-lg font-bold font-mono ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                                                {isWinner ? 'VICTORIA' : 'DERROTA'}
                                            </span>
                                            <p className="text-xs text-gray-500 font-mono">
                                                {m.score_set1} {m.score_set2} {m.score_set3}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    </main>
  );
}