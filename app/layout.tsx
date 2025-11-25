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
  // Ocultamos el sidebar si estamos en la página de login
  const showSidebar = pathname !== '/login';

  return (
    <html lang="es">
      <head>
        <title>Twinco Pádel Manager</title>
        <meta name="description" content="Gestión integral de torneos de pádel desarrollado por GGDisenio.es" />
        {/* Iconos de FontAwesome para toda la app */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="flex h-screen bg-gray-50 overflow-hidden">
        
        {showSidebar && <Sidebar />}
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {children}
        </div>

      </body>
    </html>
  );
}