import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raycon.oasismgmt2.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
