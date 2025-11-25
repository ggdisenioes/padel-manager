"use client";

import './globals.css';
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  // Ocultamos sidebar y header en el login
  const showNav = pathname !== '/login';

  return (
    <html lang="es">
      <head>
        <title>Twinco Pádel Manager</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="description" content="Gestión integral de torneos de pádel" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="flex h-screen bg-gray-50 overflow-hidden">
        
        {/* El Sidebar (Menú Lateral / Botón Hamburguesa) */}
        {showNav && <Sidebar />}
        
        {/* Contenedor Principal */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
            
            {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
            {/* Se queda fijo arriba, el contenido scrollea debajo */}
            {showNav && (
              <header className="md:hidden h-16 bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-md z-30 relative">
                  {/* El botón del menú (Sidebar) flota a la izquierda automáticamente */}
                  
                  {/* LOGO CENTRADO PERFECTAMENTE */}
                  <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-xl font-black italic tracking-tighter leading-none">
                      TWINCO
                    </h1>
                    <span className="text-[#ccff00] text-[8px] font-bold tracking-[0.3em] uppercase leading-none mt-0.5">
                        Pádel Manager
                    </span>
                  </div>
              </header>
            )}
            
            {/* Aquí se renderiza cada página (Dashboard, Torneos, etc.) */}
            {children}
        </div>

      </body>
    </html>
  );
}