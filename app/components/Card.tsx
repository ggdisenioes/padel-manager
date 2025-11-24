import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function Card({ children, title, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Si le pasamos un título, lo muestra. Si no, no muestra nada. */}
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      )}
      
      {/* Aquí va el contenido que metamos dentro de la Card */}
      <div>{children}</div>
    </div>
  );
}