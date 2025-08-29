import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // SwaggerUI uses some non-strict React features
  experimental: {
    useCache: true,
    dynamicIO: true,
    cacheLife: {
      mateo: {
        stale: 3600, // 1 hour
        revalidate: 120, // 2 minutes
        expire: 120, // 2 minutes, just to reduce http traffic
      },
      google: {
        stale: 3600, // 1 hour
        revalidate: 120, // 2 minutes
        expire: 120, // 2 minutes, just to reduce http traffic
      },
    },
  },
};

export default nextConfig;
