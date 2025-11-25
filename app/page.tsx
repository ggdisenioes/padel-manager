"use client";

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useRouter } from 'next/navigation';
import Card from './components/Card';
import Badge from './components/Badge';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({ tournamentsCount: 0, playersCount: 0, pendingMatches: 0 });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setCheckingAuth(false);
      loadDashboardData();
    };
    initPage();
  }, [router]);

  const loadDashboardData = async () => {
    const { count: tCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    const { count: pCount } = await supabase.from('players').select('*', { count: 'exact', head: true });
    const { count: mCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('winner', 'pending');
    const { data: matches } = await supabase.from('matches').select('*, tournaments(name)').order('start_time', { ascending: true }).limit(5);

    setStats({ tournamentsCount: tCount || 0, playersCount: pCount || 0, pendingMatches: mCount || 0 });
    if (matches) setRecentMatches(matches);
    setLoading(false);
  };

  if (checkingAuth) return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="text-gray-400 animate-pulse">Cargando...</p></div>;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      
      {/* Encabezado Responsive: Se apila en móvil (flex-col), se alinea en PC (flex-row) */}
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Panel General</h2>
          <p className="text-gray-500 text-sm">Resumen de tu club en tiempo real.</p>
        </div>
        <div className="text-xs md:text-sm text-gray-400 font-mono bg-white px-3 py-1 rounded border border-gray-100 shadow-sm self-start md:self-auto">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* Grid Responsive: 1 columna en móvil, 3 en tablet/PC */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Torneos</p>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '-' : stats.tournamentsCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 text-xl">🏆</div>
            </div>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Jugadores</p>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '-' : stats.playersCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600 text-xl">👥</div>
            </div>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Por Jugar</p>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '-' : stats.pendingMatches}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 text-xl">🎾</div>
            </div>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-800">Agenda de Partidos</h3>
          <Link href="/matches" className="text-blue-600 text-xs md:text-sm hover:underline font-medium">Ver todos &rarr;</Link>
      </div>

      {/* Tabla Responsive: Scroll horizontal si no cabe */}
      <Card className="overflow-hidden p-0 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs md:text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] md:text-xs border-b">
              <tr>
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Torneo</th>
                <th className="px-4 py-3">Enfrentamiento</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={4} className="p-4 text-center text-gray-500">Cargando...</td></tr> : 
               recentMatches.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay partidos.</td></tr> : 
               recentMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-mono text-gray-600">
                        {m.start_time ? new Date(m.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium truncate max-w-[100px]">{m.tournaments?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                          <span className={m.winner === 'A' ? 'font-bold text-green-600' : 'text-gray-800'}>
                              {m.player_1_a} / {m.player_1_b}
                          </span>
                          <span className={m.winner === 'B' ? 'font-bold text-green-600' : 'text-gray-800'}>
                              {m.player_2_a} / {m.player_2_b}
                          </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                        <Badge label={m.winner === 'pending' ? 'Por Jugar' : 'Finalizado'} type={m.winner === 'pending' ? 'warning' : 'neutral'} />
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