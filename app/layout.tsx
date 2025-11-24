"use client";

import './globals.css';
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';

// Si tienes metadatos exportados, muévelos a un layout separado o archivo page,
// pero para simplificar en "use client" lo omitimos aquí o usamos Next estándar.
// Para este MVP vamos directo al grano:

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  // Ocultar sidebar si estamos en la página de login
  const showSidebar = pathname !== '/login';

  return (
    <html lang="es">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="flex h-screen bg-gray-50 overflow-hidden">
        
        {/* Solo mostramos el Sidebar si NO estamos en el login */}
        {showSidebar && <Sidebar />}
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {children}
        </div>

      </body>
    </html>
  );
}