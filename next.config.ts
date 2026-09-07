import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['10.116.8.107', 'localhost', '127.0.0.1'],
};

export default nextConfig;
