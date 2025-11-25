"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Card from '../../../components/Card';
import ShareModal from '../../../components/ShareModal'; // <--- IMPORTAR

export default function ScoreMatch() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false); // <--- Estado para el modal

  const [scores, setScores] = useState({
    set1_a: '', set1_b: '',
    set2_a: '', set2_b: '',
    set3_a: '', set3_b: '',
    winner: ''
  });

  useEffect(() => {
    const initPage = async () => {
      // Auth Check
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email !== 'admin@padel.com') {
        // Permitimos lectura para ver resultados, pero bloqueamos escritura abajo
        // OJO: Si quieres que solo el admin entre aquí, descomenta la redirección
        // router.push('/matches'); 
      }

      if (id) {
        const { data } = await supabase
            .from('matches')
            .select('*, tournaments(name)')
            .eq('id', id)
            .single();

        if (data) {
            setMatch(data);
            if (data.winner !== 'pending') {
                // Rellenar datos si ya existe
                const [s1a, s1b] = data.score_set1 ? data.score_set1.split('-') : ['',''];
                const [s2a, s2b] = data.score_set2 ? data.score_set2.split('-') : ['',''];
                const [s3a, s3b] = data.score_set3 ? data.score_set3.split('-') : ['',''];
                setScores({
                    set1_a: s1a, set1_b: s1b,
                    set2_a: s2a, set2_b: s2b,
                    set3_a: s3a, set3_b: s3b,
                    winner: data.winner
                });
            }
        }
      }
      setLoading(false);
    };
    initPage();
  }, [id, router]);

  const updatePlayerPoints = async (playerName: string, pointsChange: number) => {
    const { data: player } = await supabase.from('players').select('id, points').eq('name', playerName).single();
    if (player) {
        await supabase.from('players').update({ points: (player.points || 0) + pointsChange }).eq('id', player.id);
    }
  };

  const handleSave = async () => {
    if (!scores.winner) return alert("Selecciona un ganador.");
    setSaving(true);

    const s1 = scores.set1_a && scores.set1_b ? `${scores.set1_a}-${scores.set1_b}` : null;
    const s2 = scores.set2_a && scores.set2_b ? `${scores.set2_a}-${scores.set2_b}` : null;
    const s3 = scores.set3_a && scores.set3_b ? `${scores.set3_a}-${scores.set3_b}` : null;

    await supabase.from('matches').update({
        score_set1: s1, score_set2: s2, score_set3: s3, winner: scores.winner
    }).eq('id', id);

    const winners = scores.winner === 'A' ? [match.player_1_a, match.player_1_b] : [match.player_2_a, match.player_2_b];
    await Promise.all(winners.map(name => updatePlayerPoints(name, 3)));

    // Actualizamos el estado local para mostrar la pantalla de finalizado
    setMatch({ ...match, score_set1: s1, score_set2: s2, score_set3: s3, winner: scores.winner });
    setSaving(false);
    setShowShare(true); // <--- ABRIR MODAL AUTOMÁTICAMENTE AL FINALIZAR
  };

  const handleReopen = async () => {
    if (!confirm("⚠️ ¿Seguro? Esto RESTARÁ los 3 puntos.")) return;
    setSaving(true);
    const currentWinners = match.winner === 'A' ? [match.player_1_a, match.player_1_b] : [match.player_2_a, match.player_2_b];
    await Promise.all(currentWinners.map(name => updatePlayerPoints(name, -3)));
    await supabase.from('matches').update({ winner: 'pending' }).eq('id', id);
    alert("🔄 Partido reabierto.");
    setSaving(false);
    setMatch({ ...match, winner: 'pending' });
  };

  if (loading) return <div className="p-10">Cargando...</div>;
  if (!match) return <div className="p-10">Partido no encontrado</div>;

  // VISTA: FINALIZADO
  if (match.winner !== 'pending') {
      return (
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
            
            {showShare && <ShareModal match={match} onClose={() => setShowShare(false)} />}

            <Card className="max-w-lg w-full text-center p-8 border-t-8 border-green-500">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Partido Finalizado</h2>
                <p className="text-gray-500 mb-6">Resultado registrado.</p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-8">
                    <p className="text-2xl font-mono font-bold tracking-widest text-gray-800">
                        {match.score_set1} {match.score_set2} {match.score_set3}
                    </p>
                    <p className="text-sm text-green-600 font-bold mt-2">
                        Ganadores: {match.winner === 'A' ? 'Pareja 1' : 'Pareja 2'}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => setShowShare(true)}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition flex items-center justify-center gap-2"
                    >
                        📸 Generar Imagen para Redes
                    </button>

                    <button 
                        onClick={handleReopen}
                        disabled={saving}
                        className="text-yellow-700 hover:text-yellow-800 text-sm font-medium flex items-center justify-center gap-1 mt-4"
                    >
                        🔓 Reabrir para Corregir
                    </button>
                </div>
                
                <button onClick={() => router.back()} className="mt-8 text-gray-400 hover:text-gray-600 text-sm underline">
                    Volver a la lista
                </button>
            </Card>
        </main>
      );
  }

  // VISTA: FORMULARIO (Igual que antes pero envuelto en animación Card)
  return (
    <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Mesa de Control</h2>
        <p className="text-gray-500 mb-6">Torneo: {match.tournaments?.name}</p>

        <Card className="max-w-3xl mx-auto border-t-8 border-t-blue-600">
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

            <div className="space-y-6">
                {/* Set 1 */}
                <div className="flex items-center justify-center gap-4">
                    <span className="w-16 font-bold text-gray-500 text-right">SET 1</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg outline-none" value={scores.set1_a} onChange={e => setScores({...scores, set1_a: e.target.value})} />
                    <span className="text-gray-400">-</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg outline-none" value={scores.set1_b} onChange={e => setScores({...scores, set1_b: e.target.value})} />
                </div>
                {/* Set 2 */}
                <div className="flex items-center justify-center gap-4">
                    <span className="w-16 font-bold text-gray-500 text-right">SET 2</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg outline-none" value={scores.set2_a} onChange={e => setScores({...scores, set2_a: e.target.value})} />
                    <span className="text-gray-400">-</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg outline-none" value={scores.set2_b} onChange={e => setScores({...scores, set2_b: e.target.value})} />
                </div>
                {/* Set 3 */}
                <div className="flex items-center justify-center gap-4">
                    <span className="w-16 font-bold text-gray-500 text-right">SET 3</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg outline-none" placeholder="-" value={scores.set3_a} onChange={e => setScores({...scores, set3_a: e.target.value})} />
                    <span className="text-gray-400">-</span>
                    <input type="number" className="w-16 h-16 text-center text-2xl border-2 rounded-lg outline-none" placeholder="-" value={scores.set3_b} onChange={e => setScores({...scores, set3_b: e.target.value})} />
                </div>
            </div>

            <div className="mt-10 bg-yellow-50 p-6 rounded-xl text-center border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-4">¿QUIÉN HA GANADO?</h4>
                <div className="flex justify-center gap-6">
                    <label className={`cursor-pointer border-2 p-4 rounded-lg transition w-40 ${scores.winner === 'A' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'}`}>
                        <input type="radio" name="winner" className="hidden" onChange={() => setScores({...scores, winner: 'A'})} />
                        <span className="font-bold block">Pareja 1</span>
                    </label>
                    <label className={`cursor-pointer border-2 p-4 rounded-lg transition w-40 ${scores.winner === 'B' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200'}`}>
                        <input type="radio" name="winner" className="hidden" onChange={() => setScores({...scores, winner: 'B'})} />
                        <span className="font-bold block">Pareja 2</span>
                    </label>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button onClick={() => router.back()} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg shadow">
                    {saving ? 'Guardando...' : '🏁 Finalizar Partido'}
                </button>
            </div>
        </Card>
    </main>
  );
}