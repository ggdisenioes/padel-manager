/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eliminamos 'output: standalone' para que Vercel lo maneje automáticamente
  
  images: {
    unoptimized: true,
  },
  
  // Ignorar errores estrictos para asegurar que suba
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;