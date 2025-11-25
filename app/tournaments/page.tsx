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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);
      const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      if (!error) setTournaments(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("¿Estás seguro?")) return;
    const { error } = await supabase.from('tournaments').delete().eq('id', id);
    if (!error) setTournaments(tournaments.filter(t => t.id !== id));
  };

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20"> {/* pb-20 para espacio extra en móvil */}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Torneos</h2>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 md:w-64">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><i className="fas fa-search"></i></span>
                <input type="text" placeholder="Buscar torneo..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ccff00] outline-none transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {isAdmin && (
                <Link href="/tournaments/create" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition shadow-sm font-bold flex justify-center items-center gap-2">
                    <span>+</span> Crear
                </Link>
            )}
          </div>
      </div>
      
      {loading ? <p className="text-gray-500 animate-pulse">Cargando...</p> : (
          <div className="grid grid-cols-1 gap-4">
              {filteredTournaments.map((t) => (
                  <Link href={`/tournaments/${t.id}`} key={t.id} className="block group">
                      <Card className="hover:shadow-md transition p-0 overflow-hidden border-l-4 border-l-[#ccff00]">
                          <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                              <div className="flex-1">
                                  <h3 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-black">{t.name}</h3>
                                  <div className="flex flex-wrap gap-3 mt-2 text-xs md:text-sm text-gray-500">
                                      <span>📂 {t.category}</span>
                                      <span>📅 {t.start_date}</span>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                                  <Badge label={t.status || 'abierto'} type={t.status === 'abierto' ? 'success' : 'neutral'} />
                                  {isAdmin && (
                                      <div className="flex gap-2">
                                          <Link href={`/tournaments/edit/${t.id}`} className="p-2 text-blue-500 bg-blue-50 rounded" onClick={(e) => e.stopPropagation()}>✏️</Link>
                                          <button onClick={(e) => handleDelete(e, t.id)} className="p-2 text-red-500 bg-red-50 rounded">🗑️</button>
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