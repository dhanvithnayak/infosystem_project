import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placebear.com',
        port: '',
        pathname: '/g/200/200',
        search: '',
      },
    ],
  },
};

export default nextConfig;
