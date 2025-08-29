import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // SwaggerUI uses some non-strict React features
  experimental: {
    useCache: true,
    cacheLife: {
      classification: {
        stale: 3600, // 1 hour
        revalidate: 900, // 15 minutes
        expire: 3600, // 1 hour, just to reduce http traffic
      },
      translation: {
        stale: 3600, // 1 hour
        revalidate: 900, // 15 minutes
        expire: 3600, // 1 hour, just to reduce http traffic
      },
      geo: {
        stale: 3600, // 1 hour
        revalidate: 900, // 15 minutes
        expire: 3600, // 1 hour, just to reduce http traffic
      },
    },
  },
};

export default nextConfig;
