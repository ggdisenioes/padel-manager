"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Badge from '../../components/Badge';
import Link from 'next/link';

export default function TournamentDetail() {
  const params = useParams();
  const id = params.id;
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Función para cargar todo
  const fetchData = async () => {
    // 0. Chequeo Admin
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === 'admin@padel.com') setIsAdmin(true);

    // 1. Torneo
    const { data: tData } = await supabase.from('tournaments').select('*').eq('id', id).single();
    setTournament(tData);

    // 2. Partidos (Bracket)
    const { data: mData } = await supabase.from('matches').select('*').eq('tournament_id', id).order('id', { ascending: true });
    setMatches(mData || []);

    // 3. Inscripciones (Solo cargamos si es admin y están pendientes)
    if (session?.user?.email === 'admin@padel.com') {
        const { data: rData } = await supabase.from('registrations').select('*').eq('tournament_id', id).eq('status', 'pending');
        setRegistrations(rData || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ✅ APROBAR SOLICITUD
  const handleApprove = async (regId: number, p1: string, p2: string, email: string) => {
    const confirmMsg = p2 
        ? `¿Aprobar a la pareja ${p1} y ${p2}?` 
        : `¿Aprobar al jugador ${p1}?`;

    if(!confirm(confirmMsg)) return;

    // 1. Crear jugador 1 (siempre existe)
    await supabase.from('players').insert([{ name: p1, email: email || null, level: 4.0 }]);
    
    // 2. Crear jugador 2 (solo si se escribió nombre)
    if(p2 && p2.trim() !== "") {
        await supabase.from('players').insert([{ name: p2, level: 4.0 }]);
    }

    // 3. Actualizar estado de la inscripción
    await supabase.from('registrations').update({ status: 'approved' }).eq('id', regId);

    // 4. Recargar lista
    fetchData();
    alert("✅ Inscripción aprobada y jugadores creados.");
  };

  // ❌ RECHAZAR SOLICITUD
  const handleReject = async (regId: number) => {
    if(!confirm("¿Seguro que quieres rechazar esta solicitud? Desaparecerá de la lista.")) return;

    await supabase.from('registrations').update({ status: 'rejected' }).eq('id', regId);
    fetchData(); // Recargamos la lista para que desaparezca visualmente
  };

  // Agrupar partidos para Bracket
  const matchesByRound = matches.reduce((acc: any, match) => {
    const round = match.round_name || 'Sin Ronda';
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});
  
  const roundOrder = ['Fase de Grupos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
  const sortedRounds = Object.keys(matchesByRound).sort((a, b) => roundOrder.indexOf(a) - roundOrder.indexOf(b));

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando...</div>;

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-screen bg-gray-50">
        
        {/* CABECERA FIJA */}
        <div className="p-6 bg-white border-b border-gray-200 flex flex-col gap-4 shrink-0 z-10 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link href="/tournaments" className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-1 block uppercase tracking-wide">&larr; Volver</Link>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{tournament?.name}</h2>
                    <div className="flex gap-3 mt-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold border border-gray-200 uppercase tracking-wider">{tournament?.category}</span>
                        <Badge label={tournament?.status} type="neutral" />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    {/* Botón para TODOS: Inscribirse */}
                    {tournament?.status === 'abierto' && (
                        <Link 
                            href={`/tournaments/${id}/register`} 
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg font-bold text-sm flex items-center gap-2"
                        >
                            📝 Inscribirse
                        </Link>
                    )}

                    {/* Botón Solo Admin: Añadir Partido */}
                    {isAdmin && (
                        <Link href="/matches/create" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-black transition shadow-lg font-bold text-sm flex items-center gap-2">
                            <span>+</span> Partido
                        </Link>
                    )}
                </div>
            </div>

            {/* PANEL DE SOLICITUDES (SOLO ADMIN) */}
            {isAdmin && registrations.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                        🔔 Solicitudes Pendientes ({registrations.length})
                    </h4>
                    <div className="space-y-2">
                        {registrations.map(reg => (
                            <div key={reg.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded border border-yellow-100 shadow-sm gap-3">
                                <div>
                                    <p className="font-bold text-sm text-gray-800">
                                        {reg.player_1_name} 
                                        {reg.player_2_name ? ` & ${reg.player_2_name}` : <span className="text-gray-400 font-normal"> (Sin pareja)</span>}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {reg.email || 'Sin email'} • {reg.phone || 'Sin tel'}
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        onClick={() => handleReject(reg.id)}
                                        className="flex-1 sm:flex-none text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded font-bold hover:bg-red-200 transition"
                                    >
                                        Rechazar
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(reg.id, reg.player_1_name, reg.player_2_name, reg.email)}
                                        className="flex-1 sm:flex-none text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold hover:bg-green-200 transition"
                                    >
                                        Aprobar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* ÁREA DEL BRACKET (Scrollable) */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="flex gap-12 min-w-max pb-10">
                {sortedRounds.length === 0 && (
                    <div className="flex flex-col items-center justify-center w-full h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                        <i className="fas fa-project-diagram text-4xl mb-3 opacity-50"></i>
                        <p>Aún no hay partidos en el cuadro.</p>
                    </div>
                )}
                
                {/* COLUMNAS DEL BRACKET */}
                {sortedRounds.map((roundName, roundIndex) => (
                    <div key={roundName} className="flex flex-col w-72 relative">
                        {/* Título Ronda */}
                        <div className="text-center mb-6 sticky top-0 z-10">
                            <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md border border-gray-700">
                                {roundName}
                            </span>
                        </div>
                        
                        {/* Partidos */}
                        <div className="flex flex-col justify-around h-full gap-8">
                            {matchesByRound[roundName].map((m: any, index: number) => (
                                <div key={m.id} className="relative flex items-center">
                                    
                                    {/* Línea Entrada (izq) */}
                                    {roundIndex > 0 && <div className="absolute -left-6 w-6 h-px bg-gray-300"></div>}
                                    
                                    {/* TARJETA PARTIDO */}
                                    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative group transition hover:shadow-md hover:border-blue-300">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${m.winner !== 'pending' ? 'bg-[#ccff00]' : 'bg-gray-300'}`}></div>
                                        <div className="p-3 pl-5">
                                            <div className={`flex justify-between items-center mb-2 pb-2 border-b border-gray-50 ${m.winner === 'A' ? 'opacity-100' : m.winner === 'pending' ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {m.winner === 'A' && <span className="text-[#ccff00] text-xs">👑</span>}
                                                    <span className={`text-sm font-bold truncate ${m.winner === 'A' ? 'text-black' : 'text-gray-600'}`}>{m.player_1_a} / {m.player_1_b}</span>
                                                </div>
                                                {m.winner !== 'pending' && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono font-bold">{m.score_set1?.split('-')[0] || 0}</span>}
                                            </div>
                                            <div className={`flex justify-between items-center ${m.winner === 'B' ? 'opacity-100' : m.winner === 'pending' ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {m.winner === 'B' && <span className="text-[#ccff00] text-xs">👑</span>}
                                                    <span className={`text-sm font-bold truncate ${m.winner === 'B' ? 'text-black' : 'text-gray-600'}`}>{m.player_2_a} / {m.player_2_b}</span>
                                                </div>
                                                {m.winner !== 'pending' && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono font-bold">{m.score_set1?.split('-')[1] || 0}</span>}
                                            </div>
                                        </div>
                                        <Link href={`/matches/score/${m.id}`} className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition z-10">
                                            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow transition-opacity">VER</span>
                                        </Link>
                                    </div>

                                    {/* Líneas Salida (der) */}
                                    {roundIndex < sortedRounds.length - 1 && <div className="absolute -right-6 w-6 h-px bg-gray-300"></div>}
                                    
                                    {/* Conector Rama */}
                                    {roundIndex < sortedRounds.length - 1 && <div className={`absolute -right-6 w-px bg-gray-300 ${index % 2 === 0 ? 'h-[calc(50%+16px)] top-1/2' : 'h-[calc(50%+16px)] bottom-1/2'}`}></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </main>
  );
}