"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // <--- Estado del buscador

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

  // Lógica de filtrado: Busca por nombre o email (insensible a mayúsculas)
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="flex-1 overflow-y-auto p-8">
      
      {/* CABECERA CON BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Jugadores</h2>
          
          <div className="flex w-full md:w-auto gap-4 items-center">
            {/* Barra de Búsqueda */}
            <div className="relative flex-1 md:w-64">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fas fa-search"></i>
                </span>
                <input 
                    type="text" 
                    placeholder="Buscar nombre..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ccff00] focus:border-transparent outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isAdmin && (
                <Link href="/players/create" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm whitespace-nowrap font-bold flex items-center gap-2">
                    <span>+</span> Nuevo
                </Link>
            )}
          </div>
      </div>

      {loading ? <p className="text-gray-500 animate-pulse">Cargando jugadores...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.length === 0 && (
                  <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                      No se encontraron jugadores que coincidan con "{searchTerm}"
                  </div>
              )}

              {filteredPlayers.map((p) => (
                  <Card key={p.id} className="hover:shadow-md transition p-0 overflow-hidden border border-gray-100">
                      <div className="flex items-center p-4">
                          
                          {/* ENLACE AL PERFIL (Zona clicable principal) */}
                          <Link href={`/players/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0 group cursor-pointer">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg shrink-0 group-hover:bg-[#ccff00] group-hover:text-black transition overflow-hidden border border-gray-200">
                                  {p.avatar_url ? (
                                      <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                      p.name.charAt(0).toUpperCase()
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-800 truncate group-hover:text-black transition">{p.name}</h3>
                                  <div className="flex gap-2 mt-1">
                                      <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Nivel {p.level}</span>
                                      {p.points > 0 && <span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">🏆 {p.points}</span>}
                                  </div>
                              </div>
                          </Link>

                          {/* BOTONES DE ACCIÓN (Separados para evitar conflicto de clicks) */}
                          {isAdmin && (
                              <div className="flex flex-col gap-1 ml-3 border-l pl-3 border-gray-100">
                                  <Link 
                                    href={`/players/edit/${p.id}`} 
                                    className="text-blue-500 hover:bg-blue-50 p-1.5 rounded text-center transition"
                                    title="Editar"
                                  >✏️</Link>
                                  <button 
                                    onClick={() => handleDelete(p.id)} 
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition"
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