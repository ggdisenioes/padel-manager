"use client";

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Card from './components/Card';
import Badge from './components/Badge';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    tournamentsCount: 0,
    playersCount: 0,
    pendingMatches: 0
  });
  
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const { count: tCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
      const { count: pCount } = await supabase.from('players').select('*', { count: 'exact', head: true });
      const { count: mCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('winner', 'pending');

      const { data: matches } = await supabase
        .from('matches')
        .select('*, tournaments(name)')
        .order('start_time', { ascending: true })
        .limit(5);

      setStats({
        tournamentsCount: tCount || 0,
        playersCount: pCount || 0,
        pendingMatches: mCount || 0
      });

      if (matches) setRecentMatches(matches);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Panel General</h2>
          <p className="text-gray-500">Resumen de tu club en tiempo real.</p>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 transform hover:scale-105 transition duration-200">
            <div className="flex justify-between items-center">
              <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Torneos</p>
                  <p className="text-4xl font-bold text-gray-800">{loading ? '-' : stats.tournamentsCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">🏆</div>
            </div>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 transform hover:scale-105 transition duration-200">
            <div className="flex justify-between items-center">
              <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Jugadores</p>
                  <p className="text-4xl font-bold text-gray-800">{loading ? '-' : stats.playersCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full text-green-600">👥</div>
            </div>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 transform hover:scale-105 transition duration-200">
            <div className="flex justify-between items-center">
              <div>
                  <p className="text-gray-500 text-sm font-bold uppercase">Por Jugar</p>
                  <p className="text-4xl font-bold text-gray-800">{loading ? '-' : stats.pendingMatches}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">🎾</div>
            </div>
        </Card>
      </div>

      {/* TABLA DE PRÓXIMOS PARTIDOS */}
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Agenda de Partidos</h3>
          <Link href="/matches" className="text-blue-600 text-sm hover:underline">Ver todos &rarr;</Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="px-6 py-4">Horario</th>
                <th className="px-6 py-4">Torneo</th>
                <th className="px-6 py-4">Enfrentamiento</th>
                <th className="px-6 py-4">Pista</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">Cargando datos...</td></tr>
              ) : recentMatches.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay partidos programados.</td></tr>
              ) : (
                  recentMatches.map((m) => (
                      <tr key={m.id} className="hover:bg-blue-50 transition cursor-default">
                        <td className="px-6 py-4 font-mono text-gray-600">
                          {m.start_time ? new Date(m.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{m.tournaments?.name || 'Amistoso'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                              <span className={m.winner === 'A' ? 'font-bold text-green-600' : 'text-gray-800'}>{m.player_1_a} / {m.player_1_b}</span>
                              <span className="text-xs text-gray-400">VS</span>
                              <span className={m.winner === 'B' ? 'font-bold text-green-600' : 'text-gray-800'}>{m.player_2_a} / {m.player_2_b}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{m.court || 'Sin asignar'}</td>
                        <td className="px-6 py-4">
                          <Badge label={m.winner === 'pending' ? 'Por Jugar' : 'Finalizado'} type={m.winner === 'pending' ? 'warning' : 'neutral'} />
                        </td>
                      </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}