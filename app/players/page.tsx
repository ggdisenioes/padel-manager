"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);
      const { data } = await supabase.from('players').select('*').order('name', { ascending: true });
      setPlayers(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar jugador?")) return;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (!error) setPlayers(players.filter(p => p.id !== id));
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Jugadores</h2>
          {isAdmin && (
              <Link href="/players/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">
                  + Nuevo Jugador
              </Link>
          )}
      </div>

      {loading ? <p>Cargando...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p) => (
                  <Card key={p.id} className="hover:shadow-md transition p-0 overflow-hidden">
                      <div className="flex items-center p-4">
                          
                          {/* ENLACE AL PERFIL (Solo envuelve foto y texto) */}
                          <Link href={`/players/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0 group cursor-pointer">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition overflow-hidden">
                                  {p.avatar_url ? (
                                      <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                      p.name.charAt(0).toUpperCase()
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition">{p.name}</h3>
                                  <div className="flex gap-2 mt-1">
                                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Nivel {p.level}</span>
                                      {p.points > 0 && <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">🏆 {p.points}</span>}
                                  </div>
                              </div>
                          </Link>

                          {/* BOTONES DE ACCIÓN (Fuera del enlace principal) */}
                          {isAdmin && (
                              <div className="flex flex-col gap-1 ml-2 border-l pl-2">
                                  <Link 
                                    href={`/players/edit/${p.id}`} 
                                    className="text-blue-500 hover:bg-blue-50 p-1.5 rounded text-center"
                                    title="Editar"
                                  >✏️</Link>
                                  <button 
                                    onClick={() => handleDelete(p.id)} 
                                    className="text-gray-400 hover:text-red-500 p-1.5 rounded"
                                    title="Eliminar"
                                  >🗑️</button>
                              </div>
                          )}
                      </div>
                  </Card>
              ))}
          </div>
      )}
    </main>
  );
}