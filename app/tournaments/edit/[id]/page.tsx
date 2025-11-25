"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
// Borramos import Sidebar
import Card from '../../../components/Card';

export default function EditTournament() {
  const router = useRouter();
  const params = useParams(); 
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    start_date: '',
    status: 'abierto'
  });

  // 1. CARGAR DATOS EXISTENTES
  useEffect(() => {
    const getTournament = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Error cargando torneo');
        router.push('/tournaments');
      } else if (data) {
        setFormData({
            name: data.name,
            category: data.category,
            start_date: data.start_date,
            status: data.status
        });
      }
      setLoading(false);
    };

    if (id) getTournament();
  }, [id, router]);

  // 2. GUARDAR CAMBIOS (UPDATE)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('tournaments')
      .update({ 
        name: formData.name, 
        category: formData.category, 
        start_date: formData.start_date,
        status: formData.status
      })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      setLoading(false);
    } else {
      router.push('/tournaments');
      router.refresh();
    }
  };

  // Usamos <main> directamente para evitar doble sidebar
  return (
    <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Editar Torneo</h2>

        {loading ? <p>Cargando datos...</p> : (
          <Card className="max-w-2xl">
            <form onSubmit={handleUpdate} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                   <option value="1ra Categoría">1ra Categoría</option>
                   <option value="2da Categoría">2da Categoría</option>
                   <option value="3ra Categoría">3ra Categoría</option>
                   <option value="Mixto A">Mixto A</option>
                   <option value="Mixto B">Mixto B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                   <option value="abierto">Abierto (Inscripciones)</option>
                   <option value="en_curso">En Curso</option>
                   <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded outline-none"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          </Card>
        )}
    </main>
  );
}