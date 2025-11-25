"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const COURTS = ['Pista 1', 'Pista 2', 'Pista 3', 'Pista Central'];
  const HOURS = Array.from({ length: 14 }, (_, i) => i + 9); // 09:00 a 22:00

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('matches')
        .select('*, tournaments(name)')
        .ilike('start_time', `${selectedDate}%`);
      setMatches(data || []);
      setLoading(false);
    };
    fetchMatches();
  }, [selectedDate]);

  // Navegación rápida de fechas
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const getMatchForSlot = (courtName: string, hour: number) => {
    return matches.find(m => {
      if (!m.start_time || !m.court) return false;
      const matchDate = new Date(m.start_time);
      return m.court.toLowerCase().trim() === courtName.toLowerCase().trim() && matchDate.getHours() === hour;
    });
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      
      {/* CABECERA CON NAVEGACIÓN DE FECHA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">CALENDARIO</h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Gestión de Pistas</p>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <button onClick={() => changeDate(-1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-100 text-gray-600 transition">
                <i className="fas fa-chevron-left"></i>
            </button>
            
            <input 
                type="date" 
                className="border-none outline-none font-bold text-gray-800 bg-transparent cursor-pointer text-center w-32"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button onClick={() => changeDate(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-100 text-gray-600 transition">
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
      </div>

      {/* TABLA VISUAL */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden overflow-x-auto">
        <div className="min-w-[900px]">
            
            {/* Cabecera Pistas */}
            <div className="grid grid-cols-5 bg-gray-900 text-white">
                <div className="p-3 font-bold text-center text-sm border-r border-gray-700/50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-clock mr-2"></i> HORA
                </div>
                {COURTS.map(court => (
                    <div key={court} className="p-3 font-bold text-center text-sm border-r border-gray-700/50 last:border-none uppercase tracking-wider">
                        {court}
                    </div>
                ))}
            </div>

            {/* Cuerpo Horario */}
            {loading ? (
                <div className="p-20 text-center text-gray-400 animate-pulse">Cargando agenda...</div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {HOURS.map(hour => (
                        <div key={hour} className="grid grid-cols-5 min-h-[100px]"> {/* Altura fija para consistencia */}
                            
                            {/* Columna Hora */}
                            <div className="p-4 flex flex-col items-center justify-center bg-gray-50/50 border-r border-gray-100 text-gray-400 font-mono text-sm">
                                <span className="font-bold text-lg text-gray-600">{hour}:00</span>
                                <span className="text-xs opacity-50">{hour + 1}:00</span>
                            </div>

                            {/* Celdas */}
                            {COURTS.map(court => {
                                const match = getMatchForSlot(court, hour);
                                
                                return (
                                    <div key={`${court}-${hour}`} className="border-r border-gray-100 p-1 relative group transition-colors hover:bg-blue-50/30">
                                        {match ? (
                                            // PARTIDO OCUPADO
                                            <Link 
                                                href={`/matches/score/${match.id}`} 
                                                className={`block h-full w-full rounded-lg p-2 border-l-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md flex flex-col justify-between
                                                    ${match.winner === 'pending' 
                                                        ? 'bg-blue-50 border-blue-500 text-blue-900' 
                                                        : 'bg-gray-100 border-gray-400 text-gray-500 opacity-80 grayscale'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-bold uppercase truncate bg-white/50 px-1.5 rounded">
                                                        {match.tournaments?.name || 'Amistoso'}
                                                    </span>
                                                    {match.winner !== 'pending' && <span className="text-[10px] bg-gray-200 px-1 rounded">FINAL</span>}
                                                </div>
                                                
                                                <div className="my-1">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="truncate w-1/2 pr-1">{match.player_1_a}</span>
                                                        <span className="truncate w-1/2 text-right pl-1">{match.player_2_a}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-opacity-80">
                                                        <span className="truncate w-1/2 pr-1">{match.player_1_b}</span>
                                                        <span className="truncate w-1/2 text-right pl-1">{match.player_2_b}</span>
                                                    </div>
                                                </div>

                                                {match.winner === 'pending' && isAdmin && (
                                                    <div className="mt-auto pt-1 text-center">
                                                        <span className="text-[10px] bg-blue-200/50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                            Gestionar
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            // HUECO LIBRE
                                            <div className="h-full w-full flex items-center justify-center">
                                                {isAdmin ? (
                                                    // Botón "+" para admin
                                                    <Link 
                                                        href={`/matches/create?date=${selectedDate}&time=${hour}&court=${court}`}
                                                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 flex flex-col items-center gap-1 text-gray-400 hover:text-green-600"
                                                    >
                                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center text-lg font-bold bg-white">
                                                            +
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase">Reservar</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-200 text-xs font-bold uppercase tracking-widest select-none group-hover:text-gray-300 transition">
                                                        Libre
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}