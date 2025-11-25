"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
// Borramos import Sidebar
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);

      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setTournaments(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Eliminar torneo?")) return;
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (!error) setTournaments(tournaments.filter(t => t.id !== id));
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Torneos</h2>
          {isAdmin && (
              <Link href="/tournaments/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">
                  + Crear Torneo
              </Link>
          )}
      </div>
      
      {loading ? <p className="text-gray-500">Cargando...</p> : (
          <div className="grid grid-cols-1 gap-4">
              {tournaments.map((t) => (
                  <Link href={`/tournaments/${t.id}`} key={t.id} className="block group">
                      <Card className="group-hover:shadow-md transition border-l-4 border-l-blue-500 cursor-pointer">
                          <div className="flex justify-between items-center">
                              <div>
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">{t.name}</h3>
                                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                      <span>📂 {t.category || 'General'}</span>
                                      <span>📅 {t.start_date || 'Pendiente'}</span>
                                  </div>
                              </div>

                              <div className="flex items-center gap-4">
                                  <Badge label={t.status || 'abierto'} type={t.status === 'abierto' ? 'success' : 'neutral'} />
                                  {isAdmin && (
                                      <div className="flex gap-2">
                                          <Link href={`/tournaments/edit/${t.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition z-10 relative" onClick={(e) => e.stopPropagation()}>✏️</Link>
                                          <button onClick={(e) => handleDelete(e, t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition z-10 relative">🗑️</button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </Card>
                  </Link>
              ))}
          </div>
      )}
    </main>
  );
}