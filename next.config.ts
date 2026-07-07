import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: supabaseUrl.hostname,
            port: "",
            pathname: "/storage/v1/object/public/jugadores/**",
            search: "",
          },
          {
            protocol: "https",
            hostname: supabaseUrl.hostname,
            port: "",
            pathname: "/storage/v1/object/public/equipos/**",
            search: "",
          },
          {
            protocol: "https",
            hostname: supabaseUrl.hostname,
            port: "",
            pathname: "/storage/v1/object/public/media/**",
            search: "",
          },
        ]
      : [],
  },
  // Fija la raiz de Turbopack a este proyecto (evita warning por lockfile en $HOME)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
