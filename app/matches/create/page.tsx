"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
// Borramos import Sidebar
import Card from '../../components/Card';

export default function CreateMatch() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tournament_id: '',
    round_name: 'Fase de Grupos',
    player_1_a: '', 
    player_1_b: '', 
    player_2_a: '', 
    player_2_b: '',
    place: 'Club Central',
    court: '',
    start_time: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: tourns } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      const { data: plyrs } = await supabase.from('players').select('*').order('name');
      if (tourns) setTournaments(tourns);
      if (plyrs) setPlayers(plyrs);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedPlayers = [formData.player_1_a, formData.player_1_b, formData.player_2_a, formData.player_2_b];
    const activePlayers = selectedPlayers.filter(p => p !== "");
    const uniquePlayers = new Set(activePlayers);

    if (uniquePlayers.size !== activePlayers.length) {
        alert("⛔ ERROR: Has seleccionado al mismo jugador más de una vez.");
        setLoading(false);
        return;
    }

    const { error } = await supabase.from('matches').insert([{
        tournament_id: formData.tournament_id,
        round_name: formData.round_name,
        player_1_a: formData.player_1_a,
        player_1_b: formData.player_1_b,
        player_2_a: formData.player_2_a,
        player_2_b: formData.player_2_b,
        place: formData.place,
        court: formData.court,
        start_time: formData.start_time,
        winner: 'pending'
    }]);

    if (error) {
        alert('Error al guardar: ' + error.message);
        setLoading(false);
    } else {
        router.push('/matches');
        router.refresh();
    }
  };

  const PlayerSelect = ({ label, value, onChange }: any) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{label}</label>
      <select 
        required
        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccionar...</option>
        {players.map(p => (
            <option key={p.id} value={p.name}>{p.name} (Niv {p.level})</option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Programar Partido</h2>

        <Card className="max-w-4xl">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-blue-800 mb-1">Torneo</label>
                        <select 
                            required
                            className="w-full p-3 border border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.tournament_id}
                            onChange={(e) => setFormData({...formData, tournament_id: e.target.value})}
                        >
                            <option value="">-- Selecciona un Torneo --</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name} - {t.category}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ronda / Fase</label>
                        <input type="text" required placeholder="Ej: Octavos de Final" className="w-full p-2 border border-gray-300 rounded" value={formData.round_name} onChange={(e) => setFormData({...formData, round_name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
                        <input type="datetime-local" required className="w-full p-2 border border-gray-300 rounded" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                        <input type="text" placeholder="Ej: Club Padel Center" className="w-full p-2 border border-gray-300 rounded" value={formData.place} onChange={(e) => setFormData({...formData, place: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nº Pista</label>
                        <input type="text" placeholder="Ej: Pista 4" className="w-full p-2 border border-gray-300 rounded" value={formData.court} onChange={(e) => setFormData({...formData, court: e.target.value})} />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="flex-1 w-full bg-gray-50 p-5 rounded-xl border-l-4 border-l-blue-500 shadow-sm">
                        <h3 className="font-bold text-blue-700 mb-4 border-b pb-2">PAREJA 1</h3>
                        <div className="space-y-4">
                            <PlayerSelect label="Jugador Revés" value={formData.player_1_a} onChange={(val: string) => setFormData({...formData, player_1_a: val})} />
                            <PlayerSelect label="Jugador Drive" value={formData.player_1_b} onChange={(val: string) => setFormData({...formData, player_1_b: val})} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-300 italic">VS</div>
                    <div className="flex-1 w-full bg-gray-50 p-5 rounded-xl border-r-4 border-r-red-500 shadow-sm text-right">
                        <h3 className="font-bold text-red-700 mb-4 border-b pb-2">PAREJA 2</h3>
                        <div className="space-y-4">
                            <PlayerSelect label="Jugador Revés" value={formData.player_2_a} onChange={(val: string) => setFormData({...formData, player_2_a: val})} />
                            <PlayerSelect label="Jugador Drive" value={formData.player_2_b} onChange={(val: string) => setFormData({...formData, player_2_b: val})} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex-1 px-6 py-3 text-white bg-green-600 rounded hover:bg-green-700 font-bold text-lg shadow-lg">
                        {loading ? 'Guardando...' : '✅ Confirmar Partido'}
                    </button>
                </div>
            </form>
        </Card>
    </main>
  );
}