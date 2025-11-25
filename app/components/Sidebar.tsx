"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation'; // Importamos usePathname

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); // Para cerrar el menú al cambiar de ruta
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estado para el menú móvil
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Cerrar menú móvil automáticamente al navegar
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        if (session.user.email === 'admin@padel.com') setIsAdmin(true);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_OUT') {
         setUser(null);
         setIsAdmin(false);
         router.push('/login');
       } else if (session?.user) {
         setUser(session.user);
         if (session.user.email === 'admin@padel.com') setIsAdmin(true);
       }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Panel General', icon: 'fa-tachometer-alt', href: '/' },
    { id: 'tournaments', label: 'Torneos', icon: 'fa-trophy', href: '/tournaments' },
    { id: 'players', label: 'Jugadores', icon: 'fa-users', href: '/players' },
    { id: 'matches', label: 'Partidos en Vivo', icon: 'fa-table-tennis', href: '/matches' },
    { id: 'ranking', label: 'Ranking', icon: 'fa-star', href: '/ranking' },
  ];

  return (
    <>
      {/* BOTÓN HAMBURGUESA (SOLO MÓVIL) */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-md shadow-lg hover:bg-black transition"
      >
        <i className={`fas ${isMobileOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
      </button>

      {/* OVERLAY OSCURO (FONDO) - SOLO VISIBLE EN MÓVIL CUANDO EL MENÚ ESTÁ ABIERTO */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR (CAJÓN DESLIZANTE) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col h-screen transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none
      `}>
        
        {/* LOGO TWINCO */}
        <div className="h-20 flex items-center justify-center border-b border-gray-700 flex-col p-4">
          <h1 className="text-2xl font-extrabold tracking-tighter italic">
            TWINCO
          </h1>
          <span className="text-[#ccff00] text-[10px] font-bold tracking-[0.2em] uppercase">
              Pádel Manager
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className={`block py-3 px-6 transition duration-200 flex items-center gap-3
                ${pathname === item.href
                  ? 'bg-gray-800 border-l-4 border-[#ccff00]' 
                  : 'hover:bg-gray-800 border-l-4 border-transparent'
                }`}
            >
               <span className="w-6 text-center">
                  {item.id === 'dashboard' && '📊'}
                  {item.id === 'tournaments' && '🏆'}
                  {item.id === 'players' && '👥'}
                  {item.id === 'matches' && '🎾'}
                  {item.id === 'ranking' && '⭐'}
              </span> 
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer Usuario */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          {user ? (
              <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-[#ccff00] text-black' : 'bg-gray-500 text-white'}`}>
                          {isAdmin ? 'AD' : 'CL'}
                      </div>
                      <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate w-32">{isAdmin ? 'Admin' : 'Cliente'}</p>
                          <p className="text-xs text-gray-400 truncate w-32" title={user.email}>{user.email}</p>
                      </div>
                  </div>
                  <button onClick={handleLogout} className="w-full text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 py-1.5 rounded transition border border-red-900/50">
                      Cerrar Sesión
                  </button>
              </div>
          ) : (
              <div className="text-center">
                   <Link href="/login" className="text-sm text-[#ccff00] hover:underline">Iniciar Sesión &rarr;</Link>
              </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-700 text-center">
              <p className="text-[10px] text-gray-500">
                  Desarrollado por <a href="https://ggdisenio.es" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#ccff00] transition font-bold">GGDisenio.es</a>
              </p>
          </div>
        </div>
      </aside>
    </>
  );
}