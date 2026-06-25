import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tlyllgwdjuohrrbxqken.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/media/**",
        search: "",
      },
    ],
  },
  // Fija la raíz de Turbopack a este proyecto (evita warning por lockfile en $HOME)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
