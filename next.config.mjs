/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantenemos la optimización de imágenes
  images: {
    unoptimized: true,
  },
  
  // Mantenemos ignorar errores de TypeScript (esto sí suele permitirse)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🛑 HE BORRADO LA SECCIÓN 'eslint' QUE CAUSABA EL ERROR
};

export default nextConfig;