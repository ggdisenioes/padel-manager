"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabase';
import Card from './components/Card';
import Badge from './components/Badge';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState<'live' | 'finished'>('live');

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*, tournaments ( name )')
      .order('id', { ascending: false });
    if (data) setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);
        fetchMatches();
    };
    checkUser();

    const channel = supabase.channel('partidos-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchMatches)
        .subscribe();
        
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Filtrar partidos según la pestaña
  const liveMatches = matches.filter(m => m.winner === 'pending');
  const finishedMatches = matches.filter(m => m.winner !== 'pending');
  
  const displayedMatches = activeTab === 'live' ? liveMatches : finishedMatches;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
      
      {/* Encabezado con Botón Nuevo */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 self-start sm:self-auto">Partidos</h2>
          
          {isAdmin && (
            <Link 
                href="/matches/create" 
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm font-bold flex justify-center items-center gap-2 text-sm"
            >
                <span>+</span> Nuevo Partido
            </Link>
          )}
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === 'live' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'live' ? 'bg-red-400' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTab === 'live' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
            </span>
            En Vivo ({liveMatches.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('finished')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all
                ${activeTab === 'finished' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Resultados ({finishedMatches.length})
          </button>
      </div>

      {loading ? (
          <div className="flex justify-center p-10"><p className="text-gray-500 animate-pulse">Cargando datos...</p></div>
      ) : (
          <div className="grid grid-cols-1 gap-4">
              {displayedMatches.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-gray-500 mb-2">
                        {activeTab === 'live' ? 'No hay partidos en pista ahora mismo.' : 'Aún no hay partidos finalizados.'}
                      </p>
                  </div>
              ) : (
                  displayedMatches.map((m) => (
                      <Card key={m.id} className={`relative overflow-hidden border-t-4 p-4 shadow-sm hover:shadow-md transition ${m.winner === 'pending' ? 'border-t-red-500' : 'border-t-gray-400'}`}>
                          
                          <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
                              <div>
                                  <span className="text-[10px] md:text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded tracking-wider">
                                    {m.tournaments?.name || 'Amistoso'}
                                  </span>
                                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                      <span>📍 {m.round_name}</span>
                                      {m.court && <span>🏟️ {m.court}</span>}
                                  </div>
                              </div>
                              <Badge 
                                label={m.winner === 'pending' ? 'En Juego' : 'Final'} 
                                type={m.winner === 'pending' ? 'success' : 'neutral'} 
                              />
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                              
                              {/* Equipo A */}
                              <div className="text-left flex-1 min-w-0">
                                  <p className={`font-bold text-sm md:text-lg truncate leading-tight ${m.winner === 'A' ? 'text-green-600' : 'text-gray-800'}`}>
                                    {m.player_1_a}
                                  </p>
                                  <p className={`font-bold text-sm md:text-lg truncate leading-tight ${m.winner === 'A' ? 'text-green-600' : 'text-gray-800'}`}>
                                    {m.player_1_b}
                                  </p>
                              </div>
                              
                              {/* Score Central */}
                              <div className="text-center px-2 shrink-0">
                                  {m.winner === 'pending' ? (
                                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm border-2 border-white shadow-sm animate-pulse">
                                        VS
                                      </div>
                                  ) : (
                                      <div className="bg-gray-800 text-white px-3 py-1 rounded font-mono font-bold text-xs md:text-sm shadow-inner whitespace-nowrap">
                                        {m.score_set1} {m.score_set2} {m.score_set3}
                                      </div>
                                  )}
                              </div>

                              {/* Equipo B */}
                              <div className="text-right flex-1 min-w-0">
                                  <p className={`font-bold text-sm md:text-lg truncate leading-tight ${m.winner === 'B' ? 'text-green-600' : 'text-gray-800'}`}>
                                    {m.player_2_a}
                                  </p>
                                  <p className={`font-bold text-sm md:text-lg truncate leading-tight ${m.winner === 'B' ? 'text-green-600' : 'text-gray-800'}`}>
                                    {m.player_2_b}
                                  </p>
                              </div>
                          </div>
                          
                          {/* Botón Admin */}
                          {m.winner === 'pending' && isAdmin && (
                              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                  <Link 
                                    href={`/matches/score/${m.id}`} 
                                    className="block w-full bg-blue-50 text-blue-700 py-3 rounded-lg font-bold text-sm hover:bg-blue-100 transition border border-blue-100"
                                  >
                                    ✏️ Actualizar Marcador
                                  </Link>
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