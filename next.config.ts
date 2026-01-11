import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  transpilePackages: [
    "@prisma/client",
    "@prisma/client-runtime-utils",
    "@prisma/adapter-neon",
  ],
};

export default nextConfig;
