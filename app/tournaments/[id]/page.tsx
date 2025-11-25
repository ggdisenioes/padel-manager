"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Ajusta los puntos si es necesario (3 niveles)
import { useRouter, useParams } from 'next/navigation';
// Borramos import Sidebar
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Link from 'next/link';

export default function TournamentDetail() {
  const params = useParams();
  const id = params.id;
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Datos del Torneo
      const { data: tData } = await supabase.from('tournaments').select('*').eq('id', id).single();
      setTournament(tData);

      // 2. Partidos del Torneo
      const { data: mData } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', id)
        .order('id', { ascending: true });
      
      setMatches(mData || []);
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  // Lógica para agrupar partidos por Ronda
  const matchesByRound = matches.reduce((acc: any, match) => {
    const round = match.round_name || 'Sin Ronda';
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});

  // Orden lógico de rondas
  const roundOrder = ['Fase de Grupos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
  
  const sortedRounds = Object.keys(matchesByRound).sort((a, b) => {
    return roundOrder.indexOf(a) - roundOrder.indexOf(b);
  });

  if (loading) return <div className="p-10 text-center">Cargando cuadro...</div>;

  // Usamos <main> directamente, sin Sidebar ni div flex extra
  return (
    <main className="flex-1 overflow-y-auto p-8">
        
        {/* Cabecera del Torneo */}
        <div className="mb-8 flex justify-between items-end">
            <div>
                <Link href="/tournaments" className="text-sm text-gray-500 hover:text-blue-600 mb-2 block">&larr; Volver a Torneos</Link>
                <h2 className="text-3xl font-bold text-gray-800">{tournament?.name}</h2>
                <div className="flex gap-4 mt-2">
                    <span className="text-gray-500 bg-white px-3 py-1 rounded shadow-sm border text-sm">📂 {tournament?.category}</span>
                    <Badge label={tournament?.status} type="neutral" />
                </div>
            </div>
            <Link href="/matches/create" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold text-sm">
                + Añadir Partido al Cuadro
            </Link>
        </div>

        {/* VISUALIZACIÓN DEL BRACKET (Scroll horizontal) */}
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-max">
                
                {sortedRounds.length === 0 && (
                    <div className="text-gray-400 italic">No hay partidos creados para este torneo aún.</div>
                )}

                {sortedRounds.map((roundName) => (
                    <div key={roundName} className="w-80 flex flex-col gap-4">
                        {/* Título de la Ronda */}
                        <div className="text-center font-bold text-gray-400 uppercase tracking-wider text-sm border-b pb-2 mb-2">
                            {roundName}
                        </div>

                        {/* Lista de Partidos de esa ronda */}
                        {matchesByRound[roundName].map((m: any) => (
                            <div key={m.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group">
                                {/* Estado visual (Borde de color) */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.winner !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                
                                <div className="p-3 pl-4">
                                    {/* Pareja A */}
                                    <div className={`flex justify-between items-center mb-1 ${m.winner === 'A' ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                                        <span className="text-sm truncate w-24">{m.player_1_a} / {m.player_1_b}</span>
                                        {m.winner !== 'pending' && <span className="bg-gray-100 px-1 rounded text-xs">{m.score_set1?.split('-')[0] || 0}</span>}
                                    </div>
                                    
                                    {/* Pareja B */}
                                    <div className={`flex justify-between items-center ${m.winner === 'B' ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                                        <span className="text-sm truncate w-24">{m.player_2_a} / {m.player_2_b}</span>
                                        {m.winner !== 'pending' && <span className="bg-gray-100 px-1 rounded text-xs">{m.score_set1?.split('-')[1] || 0}</span>}
                                    </div>
                                </div>

                                {/* Botón flotante para ir al partido */}
                                <Link 
                                    href={`/matches/score/${m.id}`}
                                    className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                                >
                                    <span className="bg-white shadow px-2 py-1 rounded text-xs font-bold text-blue-600">Ver Partido</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </main>
  );
}