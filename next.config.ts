import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz de Turbopack a este proyecto (evita warning por lockfile en $HOME)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
