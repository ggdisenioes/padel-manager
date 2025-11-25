"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Link from 'next/link';

export default function RankingPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .order('points', { ascending: false });
      
      setPlayers(data || []);
      setLoading(false);
    };
    fetchRanking();
  }, []);

  const maxPoints = players.length > 0 ? players[0].points : 100;

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse text-sm">Cargando ranking...</div>;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-gray-50">
      
      <div className="text-center mb-12">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">RANKING OFICIAL</h2>
        <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Temporada 2025</p>
      </div>

      {/* 🏆 EL PODIO (TOP 3) - ALINEADO ABAJO (Espacio arriba) */}
      {players.length >= 3 && (
        <div className="flex flex-row items-end justify-center gap-3 md:gap-6 mb-12 px-2">
            
            {/* 2do Lugar */}
            <div className="order-1 flex flex-col items-center w-1/3 max-w-[120px]">
                <div className="relative z-10 mb-[-12px]">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gray-200 overflow-hidden shadow-sm bg-white">
                        {players[1].avatar_url ? <img src={players[1].avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-50 flex items-center justify-center font-bold text-lg text-gray-400">{players[1].name.charAt(0)}</div>}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border border-white shadow-sm">2</div>
                </div>
                <div className="bg-white w-full pt-5 pb-3 px-2 rounded-t-lg shadow-sm border-t-4 border-gray-300 text-center">
                    <h3 className="font-bold text-gray-800 text-xs md:text-sm truncate w-full">{players[1].name}</h3>
                    <p className="text-gray-500 font-mono text-[10px] md:text-xs font-medium mt-0.5">{players[1].points} pts</p>
                </div>
                {/* Pedestal Normal */}
                <div className="h-12 w-full bg-gradient-to-b from-gray-100 to-transparent rounded-b-lg opacity-50"></div>
            </div>

            {/* 1er Lugar (Campeón) - MÁS ALTO, NO LEVANTADO */}
            <div className="order-2 flex flex-col items-center w-1/3 max-w-[140px] z-20">
                <div className="relative z-10 mb-[-16px]">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xl drop-shadow-sm animate-bounce">👑</div>
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-300 overflow-hidden shadow-lg bg-white ring-4 ring-yellow-50">
                        {players[0].avatar_url ? <img src={players[0].avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-yellow-50 flex items-center justify-center font-bold text-2xl text-yellow-500">{players[0].name.charAt(0)}</div>}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold text-[10px] border border-white shadow-sm">#1</div>
                </div>
                <div className="bg-white w-full pt-8 pb-4 px-2 rounded-t-xl shadow-md border-t-4 border-yellow-400 text-center">
                    <h3 className="font-black text-gray-900 text-sm md:text-base truncate w-full">{players[0].name}</h3>
                    <p className="text-yellow-600 font-mono font-bold text-xs md:text-sm mt-0.5">{players[0].points} pts</p>
                </div>
                {/* Pedestal Alto (Esto crea la altura extra arriba) */}
                <div className="h-20 w-full bg-gradient-to-b from-yellow-50 to-transparent rounded-b-2xl opacity-60"></div>
            </div>

            {/* 3er Lugar */}
            <div className="order-3 flex flex-col items-center w-1/3 max-w-[120px]">
                <div className="relative z-10 mb-[-12px]">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-orange-200 overflow-hidden shadow-sm bg-white">
                        {players[2].avatar_url ? <img src={players[2].avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-50 flex items-center justify-center font-bold text-lg text-orange-400">{players[2].name.charAt(0)}</div>}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-orange-400 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border border-white shadow-sm">3</div>
                </div>
                <div className="bg-white w-full pt-5 pb-3 px-2 rounded-t-lg shadow-sm border-t-4 border-orange-300 text-center">
                    <h3 className="font-bold text-gray-800 text-xs md:text-sm truncate w-full">{players[2].name}</h3>
                    <p className="text-gray-500 font-mono text-[10px] md:text-xs font-medium mt-0.5">{players[2].points} pts</p>
                </div>
                {/* Pedestal Bajo */}
                <div className="h-8 w-full bg-gradient-to-b from-orange-50 to-transparent rounded-b-lg opacity-50"></div>
            </div>
        </div>
      )}

      {/* LISTA COMPLETA */}
      <Card className="max-w-2xl mx-auto overflow-hidden p-0 border border-gray-200 shadow-sm rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-gray-100">
                    <tr>
                        <th className="p-3 w-10 text-center font-medium">#</th>
                        <th className="p-3 font-medium">Jugador</th>
                        <th className="p-3 hidden sm:table-cell text-center font-medium">Nivel</th>
                        <th className="p-3 text-right font-medium">Puntos</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                    {players.map((p, index) => (
                        <tr key={p.id} className={`group transition-colors hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50/10' : ''}`}>
                            <td className="p-3 text-center align-middle">
                                <span className={`font-mono font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400 bg-gray-100'}`}>
                                    {index + 1}
                                </span>
                            </td>
                            <td className="p-3 align-middle">
                                <Link href={`/players/${p.id}`} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-200">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-sm">
                                        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-[10px]">{p.name.charAt(0)}</div>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-xs md:text-sm leading-tight">{p.name}</p>
                                        <p className="text-[10px] text-gray-400 sm:hidden mt-0.5">Nivel {p.level}</p>
                                    </div>
                                </Link>
                            </td>
                            <td className="p-3 hidden sm:table-cell text-center align-middle">
                                <span className="text-gray-400 text-[10px] font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{p.level}</span>
                            </td>
                            <td className="p-3 align-middle text-right">
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-mono font-bold text-blue-600 text-xs md:text-sm">{p.points}</span>
                                    
                                    <div className="w-16 md:w-20 bg-gray-100 rounded-full h-1 overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-1 rounded-full transition-all duration-500 ease-out" 
                                            style={{ width: `${(p.points / maxPoints) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </Card>
    </main>
  );
}