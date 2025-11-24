"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';

export default function CreatePlayer() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    level: 4.0,
    avatar_url: '' // Guardaremos la URL aquí
  });

  // Función para subir la imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Por favor selecciona una imagen.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir al Storage 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // 3. Guardar URL en el estado
      setFormData({ ...formData, avatar_url: data.publicUrl });

    } catch (error: any) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('players')
      .insert([formData]);

    if (error) {
      alert('Error: ' + error.message);
      setLoading(false);
    } else {
      router.push('/players');
      router.refresh();
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuevo Jugador</h2>

        <Card className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FOTO DE PERFIL */}
            <div className="flex flex-col items-center mb-6 gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative">
                    {formData.avatar_url ? (
                        // Si hay foto, la mostramos
                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        // Si no, mostramos un icono
                        <span className="text-4xl text-gray-300">📷</span>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs">
                            Subiendo...
                        </div>
                    )}
                </div>
                
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-100 transition">
                    Subir Foto
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={uploading}
                        className="hidden" 
                    />
                </label>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input 
                type="text" required
                className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Ale Galán"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
              <input 
                type="email"
                className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Juego (1.0 - 7.0)
              </label>
              <div className="flex items-center gap-4">
                <input 
                    type="range" min="1" max="7" step="0.5"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: parseFloat(e.target.value)})}
                />
                <span className="text-xl font-bold text-blue-600 w-12 text-center">
                    {formData.level}
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button 
                type="submit" disabled={loading || uploading}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Jugador'}
              </button>
            </div>

          </form>
        </Card>
    </main>
  );
}