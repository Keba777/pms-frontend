import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "export",
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
  // NOTE: eslint option removed — run eslint with an npm script or CI job instead.
};

export default nextConfig;
