import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raycon.oasismgmt2.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
} as any;

export default nextConfig;


