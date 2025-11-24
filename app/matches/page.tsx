"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
// Borramos import Sidebar
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, tournaments ( name )')
      .order('id', { ascending: false });
    if (!error) setMatches(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Partidos en Vivo</h2>
          <Link href="/matches/create" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-sm font-bold flex items-center gap-2">
              <span>+</span> Nuevo Partido
          </Link>
      </div>

      {loading ? (
          <div className="flex justify-center p-10"><p className="text-gray-500 animate-pulse">Cargando partidos...</p></div>
      ) : (
          <div className="grid grid-cols-1 gap-6">
              {matches.length === 0 ? (
                  <Card className="text-center py-10 border-dashed border-2 border-gray-200">
                      <p className="text-gray-500 mb-4 text-lg">No hay partidos programados.</p>
                      <Link href="/matches/create" className="text-green-600 font-bold hover:underline text-lg">¡Programa el primero!</Link>
                  </Card>
              ) : (
                  matches.map((m) => (
                      <Card key={m.id} className="relative overflow-hidden border-t-4 border-t-blue-500 hover:shadow-lg transition duration-200">
                          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-3">
                              <div>
                                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded">{m.tournaments?.name || 'Torneo Desconocido'}</span>
                                  <div className="flex gap-3 mt-2 text-sm text-gray-500">
                                      <span>📍 {m.round_name}</span>
                                      {m.court && <span>🏟️ {m.court}</span>}
                                      {m.start_time && <span>🕒 {new Date(m.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                  </div>
                              </div>
                              <Badge label={m.winner === 'pending' ? 'En Juego' : 'Finalizado'} type={m.winner === 'pending' ? 'success' : 'neutral'} />
                          </div>
                          <div className="flex items-center justify-between px-2">
                              <div className="text-left w-5/12">
                                  <p className={`font-bold text-lg ${m.winner === 'A' ? 'text-green-600' : 'text-gray-800'}`}>{m.player_1_a} {m.winner === 'A' && '👑'}</p>
                                  <p className={`font-bold text-lg ${m.winner === 'A' ? 'text-green-600' : 'text-gray-800'}`}>{m.player_1_b}</p>
                              </div>
                              <div className="text-center w-2/12 flex flex-col items-center justify-center">
                                  {m.winner === 'pending' ? (
                                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xl italic border-2 border-white shadow-sm">VS</div>
                                  ) : (
                                      <div className="bg-gray-800 text-white px-3 py-1 rounded font-mono font-bold tracking-widest text-sm md:text-base shadow-inner">{m.score_set1} {m.score_set2} {m.score_set3}</div>
                                  )}
                              </div>
                              <div className="text-right w-5/12">
                                  <p className={`font-bold text-lg ${m.winner === 'B' ? 'text-green-600' : 'text-gray-800'}`}>{m.winner === 'B' && '👑'} {m.player_2_a}</p>
                                  <p className={`font-bold text-lg ${m.winner === 'B' ? 'text-green-600' : 'text-gray-800'}`}>{m.player_2_b}</p>
                              </div>
                          </div>
                          {m.winner === 'pending' && (
                              <div className="mt-6 text-center border-t border-gray-100 pt-4">
                                  <Link href={`/matches/score/${m.id}`} className="inline-flex items-center gap-2 text-sm bg-blue-50 text-blue-700 py-2 px-6 rounded-full hover:bg-blue-100 font-bold border border-blue-200 transition transform hover:scale-105">✏️ Actualizar Marcador</Link>
                              </div>
                          )}
                      </Card>
                  ))
              )}
          </div>
      )}
    </main>
  );
}