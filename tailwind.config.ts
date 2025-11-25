import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",     // Cubre todo lo que esté dentro de 'app'
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Por si tienes componentes fuera de app
    "./src/**/*.{js,ts,jsx,tsx,mdx}",      // Por seguridad, si usas carpeta src
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;