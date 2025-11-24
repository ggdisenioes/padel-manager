"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
// Borramos import Sidebar
import Card from '../../components/Card';

export default function CreateTournament() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    start_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('tournaments')
      .insert([
        { 
          name: formData.name, 
          category: formData.category, 
          start_date: formData.start_date,
          status: 'abierto'
        }
      ]);

    if (error) {
      alert('Error al crear: ' + error.message);
      setLoading(false);
    } else {
      router.push('/tournaments');
      router.refresh();
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuevo Torneo</h2>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Torneo</label>
              <input 
                type="text" required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Open de Verano 2025"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Selecciona una categoría...</option>
                <option value="1ra Categoría">1ra Categoría</option>
                <option value="2da Categoría">2da Categoría</option>
                <option value="3ra Categoría">3ra Categoría</option>
                <option value="Mixto A">Mixto A</option>
                <option value="Mixto B">Mixto B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
              <input 
                type="date" required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Crear Torneo'}
              </button>
            </div>

          </form>
        </Card>
    </main>
  );
}