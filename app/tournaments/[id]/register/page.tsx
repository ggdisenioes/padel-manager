"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Card from '../../../components/Card';

export default function RegisterTournament() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    player_1_name: '',
    player_2_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchTournament = async () => {
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single();
      setTournament(data);
    };
    if (id) fetchTournament();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('registrations').insert([{
      tournament_id: id,
      player_1_name: formData.player_1_name,
      player_2_name: formData.player_2_name, // Ahora puede ir vacío
      email: formData.email,
      phone: formData.phone
    }]);

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      alert("✅ ¡Solicitud enviada con éxito! El administrador revisará tu inscripción.");
      router.push(`/tournaments/${id}`);
    }
  };

  if (!tournament) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center bg-gray-50">
      <Card className="max-w-lg w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Inscripción al Torneo</h2>
          <p className="text-blue-600 font-bold mt-1">{tournament.name}</p>
          <p className="text-gray-500 text-sm">Categoría: {tournament.category}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Jugador 1 (Tú) *</label>
            <input 
              type="text" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tu nombre completo"
              value={formData.player_1_name}
              onChange={e => setFormData({...formData, player_1_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Jugador 2 (Pareja) <span className="text-gray-400 font-normal text-xs">(Opcional)</span></label>
            <input 
              type="text" 
              // Ya no es required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nombre de tu pareja (si tienes)"
              value={formData.player_2_name}
              onChange={e => setFormData({...formData, player_2_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal text-xs">(Opcional)</span></label>
                <input 
                type="email" 
                // Ya no es required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400 font-normal text-xs">(Opcional)</span></label>
                <input 
                type="tel" 
                // Ya no es required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="600 000 000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
                type="button" onClick={() => router.back()}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
            >
                Cancelar
            </button>
            <button 
                type="submit" disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg"
            >
                {loading ? 'Enviando...' : '📝 Confirmar Inscripción'}
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}