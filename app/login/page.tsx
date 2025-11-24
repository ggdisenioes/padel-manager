"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message === "Invalid login credentials" 
        ? "Usuario o contraseña incorrectos" 
        : error.message);
      setLoading(false);
    } else {
      // Login exitoso, vamos al panel
      router.push('/');
      router.refresh(); // Refresca para actualizar la Sidebar
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-wider text-gray-800">
            PADEL<span className="text-[#ccff00] bg-gray-800 px-1 rounded">MGR</span>
            </h1>
            <p className="text-gray-500 mt-2">Acceso a la plataforma</p>
        </div>

        {errorMsg && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm">
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="admin@padel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                    type="password" 
                    required
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-800 text-white font-bold py-3 rounded hover:bg-gray-700 transition duration-200 disabled:opacity-50"
            >
                {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
            <p>¿No tienes cuenta? Contacta con el club.</p>
        </div>
      </div>
    </div>
  );
}