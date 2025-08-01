import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media0.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'media1.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'media2.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'media3.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'media4.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'giphy.com',
      },
    ],
  },
};

export default nextConfig;
