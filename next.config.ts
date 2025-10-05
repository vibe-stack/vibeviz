import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: { turbopackScopeHoisting: false },
};

export default nextConfig;
