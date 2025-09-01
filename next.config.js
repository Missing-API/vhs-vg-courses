/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['cheerio'],
  experimental: {
    useCache: true,
  },
  env: {
    // Environment variables for caching
    CACHE_DURATION_TEASERS: '900', // 15 minutes
    CACHE_DURATION_DETAILS: '3600', // 1 hour
  },
}

export default nextConfig
