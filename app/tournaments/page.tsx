"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // <--- Estado del buscador

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
    e.preventDefault(); // Evita navegar al detalle
    e.stopPropagation();
    if (!confirm("¿Estás seguro de eliminar este torneo?")) return;
    
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (!error) setTournaments(tournaments.filter(t => t.id !== id));
  };

  // Filtrado por nombre o categoría
  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Torneos</h2>
          
          <div className="flex w-full md:w-auto gap-4 items-center">
            {/* Barra de Búsqueda */}
            <div className="relative flex-1 md:w-64">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <i className="fas fa-search"></i>
                </span>
                <input 
                    type="text" 
                    placeholder="Buscar torneo..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ccff00] focus:border-transparent outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isAdmin && (
                <Link href="/tournaments/create" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm font-bold whitespace-nowrap flex items-center gap-2">
                    <span>+</span> Crear
                </Link>
            )}
          </div>
      </div>
      
      {loading ? <p className="text-gray-500 animate-pulse">Cargando torneos...</p> : (
          <div className="grid grid-cols-1 gap-4">
              {filteredTournaments.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                      No se encontraron torneos que coincidan.
                  </div>
              )}

              {filteredTournaments.map((t) => (
                  // Estructura limpia para evitar errores de anidación
                  <Card key={t.id} className="hover:shadow-md transition p-0 overflow-hidden group border-l-4 border-l-[#ccff00] border-t border-r border-b border-gray-200">
                      <div className="flex items-center p-5">
                          
                          {/* ZONA CLICABLE PRINCIPAL -> LLEVA AL DETALLE */}
                          <Link href={`/tournaments/${t.id}`} className="flex-1 flex justify-between items-center cursor-pointer">
                              <div>
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-black transition">{t.name}</h3>
                                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                      <span>📂 {t.category || 'General'}</span>
                                      <span>📅 {t.start_date || 'Fecha pendiente'}</span>
                                  </div>
                              </div>

                              <div className="mr-6">
                                <Badge label={t.status || 'abierto'} type={t.status === 'abierto' ? 'success' : 'neutral'} />
                              </div>
                          </Link>

                          {/* BOTONES ADMIN (Fuera del enlace principal) */}
                          {isAdmin && (
                              <div className="flex gap-2 border-l pl-4 border-gray-200">
                                  <Link 
                                    href={`/tournaments/edit/${t.id}`}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded transition"
                                    title="Editar"
                                  >
                                      ✏️
                                  </Link>

                                  <button 
                                    onClick={(e) => handleDelete(e, t.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    title="Eliminar"
                                  >
                                      🗑️
                                  </button>
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