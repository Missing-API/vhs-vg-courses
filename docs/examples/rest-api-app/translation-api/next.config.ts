import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // SwaggerUI uses some non-strict React features
  experimental: {
    useCache: true,
    cacheLife: {
      translation: {
        stale: 86400, // 24 hours - content considered stale but still served
        revalidate: 900, // 15 minutes - background revalidation interval
        expire: 2592000, // 30 days - absolute expiration time
      },
      auth: {
        stale: 3000, // 50 minutes - Google tokens last ~1 hour
        revalidate: 300, // 5 minutes - frequent revalidation for auth
        expire: 3600, // 1 hour - align with Google token expiration
      },
    },
  },
};

export default nextConfig;
