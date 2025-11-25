"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import WinLossChart from '../../components/WinLossChart'; // <--- Importamos el gráfico

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
          if ((isTeamA && m.winner === 'A') || (!isTeamA && m.winner === 'B')) won++;
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
        
        {/* SECCIÓN SUPERIOR: DATOS + GRÁFICO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Tarjeta Izquierda: Info del Jugador */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center shrink-0">
                    {player.avatar_url ? (
                        <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left w-full">
                    <h2 className="text-4xl font-bold text-gray-800 mb-1">{player.name}</h2>
                    <p className="text-gray-500 mb-4">{player.email || 'Sin email'}</p>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-bold border border-gray-200">
                            Nivel {player.level}
                        </span>
                        <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-bold border border-yellow-200">
                            🏆 {player.points || 0} Puntos
                        </span>
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-200">
                            {stats.winRate}% Efectividad
                        </span>
                    </div>
                </div>
            </div>

            {/* Tarjeta Derecha: Gráfico */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
                <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Rendimiento</h3>
                <WinLossChart won={stats.won} played={stats.played} />
            </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Partidos</h3>

        {/* Lista de Partidos */}
        <div className="space-y-3">
            {matches.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 italic">Sin historial de partidos.</p>
                </div>
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
                                        <span className="text-gray-300 font-bold text-xs">VS</span>
                                        <span className={m.winner === 'B' ? 'font-bold text-gray-900' : 'text-gray-600'}>
                                            {m.player_2_a} / {m.player_2_b}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    {m.winner === 'pending' ? (
                                        <Badge label="Pendiente" type="warning" />
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-bold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                                                {isWinner ? 'VICTORIA' : 'DERROTA'}
                                            </span>
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded mt-1">
                                                {m.score_set1} {m.score_set2} {m.score_set3}
                                            </span>
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