"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
// Borramos Sidebar para evitar duplicados
import Card from '../../../components/Card';

export default function ScoreMatch() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [scores, setScores] = useState({
    set1_a: '', set1_b: '',
    set2_a: '', set2_b: '',
    set3_a: '', set3_b: '',
    winner: '' // 'A' o 'B'
  });

  // 1. Cargar datos del partido
  useEffect(() => {
    const getMatch = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*, tournaments(name)')
        .eq('id', id)
        .single();

      if (data) {
        setMatch(data);
      }
      setLoading(false);
    };
    if (id) getMatch();
  }, [id]);

  // 2. Función auxiliar para sumar puntos a un jugador por nombre
  const addPointsToPlayer = async (playerName: string, pointsToAdd: number) => {
    // Primero buscamos al jugador para saber cuántos puntos tiene ahora
    const { data: player } = await supabase
        .from('players')
        .select('id, points')
        .eq('name', playerName) // Buscamos por nombre exacto
        .single();
    
    if (player) {
        const newPoints = (player.points || 0) + pointsToAdd;
        // Actualizamos sus puntos
        await supabase.from('players').update({ points: newPoints }).eq('id', player.id);
    }
  };

  // 3. Guardar Resultado y Actualizar Ranking
  const handleSave = async () => {
    if (!scores.winner) {
        alert("Por favor, selecciona quién ganó el partido.");
        return;
    }
    setSaving(true);

    // Formatear sets
    const s1 = scores.set1_a && scores.set1_b ? `${scores.set1_a}-${scores.set1_b}` : null;
    const s2 = scores.set2_a && scores.set2_b ? `${scores.set2_a}-${scores.set2_b}` : null;
    const s3 = scores.set3_a && scores.set3_b ? `${scores.set3_a}-${scores.set3_b}` : null;

    // A) Actualizamos el partido
    const { error } = await supabase
      .from('matches')
      .update({
        score_set1: s1,
        score_set2: s2,
        score_set3: s3,
        winner: scores.winner
      })
      .eq('id', id);

    if (error) {
        alert(error.message);
        setSaving(false);
        return;
    }

    // B) ¡MAGIA! Sumamos puntos a los ganadores
    // Identificamos quiénes son los ganadores según la selección (A o B)
    const winners = scores.winner === 'A' 
        ? [match.player_1_a, match.player_1_b] 
        : [match.player_2_a, match.player_2_b];

    // Sumamos 3 puntos a cada ganador
    // (Usamos Promise.all para hacerlo en paralelo y que sea rápido)
    await Promise.all(winners.map(name => addPointsToPlayer(name, 3)));

    alert(`¡Partido finalizado! Se han sumado +3 puntos a: ${winners.join(' y ')}`);
    router.push('/matches');
    router.refresh();
  };

  if (loading) return <div className="p-10">Cargando...</div>;
  if (!match) return <div className="p-10">Partido no encontrado</div>;

  // Usamos <main> directamente para evitar doble sidebar
  return (
    <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Mesa de Control</h2>
        <p className="text-gray-500 mb-6">Torneo: {match.tournaments?.name} - {match.round_name}</p>

        <Card className="max-w-3xl mx-auto border-t-8 border-t-blue-600">
            
            {/* CABECERA DE EQUIPOS */}
            <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-lg">
                <div className="text-center w-1/3">
                    <h3 className="font-bold text-blue-700 text-lg">PAREJA 1 (A)</h3>
                    <p className="text-gray-800 font-medium">{match.player_1_a}</p>
                    <p className="text-gray-800 font-medium">{match.player_1_b}</p>
                </div>
                <div className="text-2xl font-black text-gray-300">VS</div>
                <div className="text-center w-1/3">
                    <h3 className="font-bold text-red-700 text-lg">PAREJA 2 (B)</h3>
                    <p className="text-gray-800 font-medium">{match.player_2_a}</p>
                    <p className="text-gray-800 font-medium">{match.player_2_b}</p>
                </div>
            </div>

            {/* INPUTS DE LOS SETS */}
            <div className="space-y-6">
                {/* Set 1 */}
                <div className="flex items-center justify-center gap-4">
                    <span className="w-16 font-bold text-gray-500 text-right">SET 1</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-blue-500 outline-none" 
                        value={scores.set1_a} onChange={e => setScores({...scores, set1_a: e.target.value})} />
                    <span className="text-gray-400">-</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-red-500 outline-none" 
                        value={scores.set1_b} onChange={e => setScores({...scores, set1_b: e.target.value})} />
                </div>

                {/* Set 2 */}
                <div className="flex items-center justify-center gap-4">
                    <span className="w-16 font-bold text-gray-500 text-right">SET 2</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-blue-500 outline-none" 
                        value={scores.set2_a} onChange={e => setScores({...scores, set2_a: e.target.value})} />
                    <span className="text-gray-400">-</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-red-500 outline-none" 
                        value={scores.set2_b} onChange={e => setScores({...scores, set2_b: e.target.value})} />
                </div>

                {/* Set 3 */}
                <div className="flex items-center justify-center gap-4">
                    <span className="w-16 font-bold text-gray-500 text-right">SET 3</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-blue-500 outline-none" 
                        placeholder="-"
                        value={scores.set3_a} onChange={e => setScores({...scores, set3_a: e.target.value})} />
                    <span className="text-gray-400">-</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-red-500 outline-none" 
                         placeholder="-"
                        value={scores.set3_b} onChange={e => setScores({...scores, set3_b: e.target.value})} />
                </div>
            </div>

            {/* SELECCIÓN DEL GANADOR */}
            <div className="mt-10 bg-yellow-50 p-6 rounded-xl text-center border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-4">¿QUIÉN HA GANADO EL PARTIDO?</h4>
                <div className="flex justify-center gap-6">
                    <label className={`cursor-pointer border-2 p-4 rounded-lg transition w-40 ${scores.winner === 'A' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                        <input type="radio" name="winner" className="hidden" 
                            onChange={() => setScores({...scores, winner: 'A'})} />
                        <span className="font-bold block">Pareja 1</span>
                        <span className="text-xs opacity-75">(Azul)</span>
                    </label>

                    <label className={`cursor-pointer border-2 p-4 rounded-lg transition w-40 ${scores.winner === 'B' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 hover:border-red-300'}`}>
                        <input type="radio" name="winner" className="hidden" 
                            onChange={() => setScores({...scores, winner: 'B'})} />
                        <span className="font-bold block">Pareja 2</span>
                        <span className="text-xs opacity-75">(Rojo)</span>
                    </label>
                </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-4 mt-8">
                <button onClick={() => router.back()} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                    Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg shadow">
                    {saving ? 'Guardando...' : '🏁 Finalizar y Sumar Puntos'}
                </button>
            </div>

        </Card>
    </main>
  );
}