import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.lovart.ai",
      },
      {
        protocol: "https",
        hostname: "assets-persist.lovart.ai",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
