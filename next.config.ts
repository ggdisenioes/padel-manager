/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esto crea una carpeta pequeña y optimizada para subir al hosting
  output: 'standalone',
  
  // Desactivamos la optimización de imágenes si tu hosting no la soporta nativamente
  images: {
    unoptimized: true,
  },
};

export default nextConfig;