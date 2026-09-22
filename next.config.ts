import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tlklbizvrysjefkadwpo.supabase.co',
      },
    ],
  },
};

export default nextConfig;
