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
  const showSidebar = pathname !== '/login';

  return (
    <html lang="es">
      <head>
        <title>Twinco Pádel Manager</title>
        {/* Viewport crítico para móviles: evita zoom automático y ajusta el ancho */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="description" content="Gestión integral de torneos de pádel" />
        
        {/* Configuración PWA (Iconos y color) */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        
        {/* Iconos */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="flex h-screen bg-gray-50 overflow-hidden">
        
        {showSidebar && <Sidebar />}
        
        {/* CONTENEDOR PRINCIPAL */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
            
            {/* ESPACIADOR MÓVIL:
                Crea un hueco invisible de 64px (h-16) arriba en móviles (md:hidden) 
                para que el contenido empiece debajo del botón hamburguesa y no detrás.
            */}
            {showSidebar && <div className="h-16 md:hidden shrink-0"></div>}
            
            {children}
        </div>

      </body>
    </html>
  );
}