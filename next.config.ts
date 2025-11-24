import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mantenemos esto para que las imágenes funcionen en cualquier hosting
  images: {
    unoptimized: true,
  },
  
  // Esto sí suele permitirse aún para ignorar errores de TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;