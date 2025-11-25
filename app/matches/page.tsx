"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*, tournaments ( name )')
      .order('id', { ascending: false });
    if (data) setMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Carga inicial y chequeo de admin
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);
        fetchMatches();
    };
    checkUser();

    // 2. Suscripción a cambios en tiempo real (Live)
    const channel = supabase.channel('partidos-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchMatches)
        .subscribe();
        
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24"> {/* Padding extra abajo para móviles */}
      
      {/* Encabezado Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">En Vivo</h2>
            {/* Efecto de luz roja parpadeante */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          
          {isAdmin && (
            <Link 
                href="/matches/create" 
                className="w-full sm:w-auto bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 shadow-sm font-bold flex justify-center items-center gap-2 transition transform active:scale-95"
            >
                <span>+</span> Nuevo Partido
            </Link>
          )}
      </div>

      {loading ? (
          <div className="flex justify-center p-10"><p className="text-gray-500 animate-pulse">Conectando al satélite...</p></div>
      ) : (
          <div className="grid grid-cols-1 gap-4">
              {matches.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-gray-500 mb-2">No hay partidos en pista.</p>
                  </div>
              ) : (
                  matches.map((m) => (
                      <Card key={m.id} className="relative overflow-hidden border-t-4 border-t-blue-500 p-4 shadow-sm hover:shadow-md transition">
                          
                          {/* Cabecera de la Tarjeta */}
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
                              <Badge label={m.winner === 'pending' ? 'En Juego' : 'Final'} type={m.winner === 'pending' ? 'success' : 'neutral'} />
                          </div>
                          
                          {/* Enfrentamiento (Diseño flexible para nombres largos) */}
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
                                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm border-2 border-white shadow-sm">
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
                          
                          {/* Botón Admin (Full width en móvil) */}
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