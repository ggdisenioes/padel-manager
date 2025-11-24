import React from 'react';

interface BadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'danger' | 'neutral';
}

export default function Badge({ label, type = 'neutral' }: BadgeProps) {
  // Definimos los colores según el tipo
  const styles = {
    success: 'bg-green-100 text-green-800', // Para "En juego" o "Ganador"
    warning: 'bg-yellow-100 text-yellow-800', // Para "Pendiente"
    danger: 'bg-red-100 text-red-800',     // Para "Cancelado"
    neutral: 'bg-gray-100 text-gray-800'   // Para "Finalizado" u otros
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[type]}`}>
      {label}
    </span>
  );
}