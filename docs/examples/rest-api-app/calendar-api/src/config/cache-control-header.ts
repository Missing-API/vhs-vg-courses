export const getCacheControlHeader = (ttl: number): string => {
  const staleTime = ttl * 10;
  return `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${staleTime}, stale-if-error=${staleTime}`;
};

/**
 * Cache ttl for health check responses, should be low but any to avoid spamming the service
 * @returns
 */
export const getConfigCacheTTL = (): number => {
  return Number(process.env.CONFIG_CACHE_TTL || 5);
};

/**
 * Cache control header for static config responses
 * @returns
 */
export const getConfigCacheControlHeader = (): string => {
  const ttl = getConfigCacheTTL();
  return getCacheControlHeader(Number(ttl));
};

/**
 * Cache ttl for data responses
 */
export const getDataCacheTTL = (): number => {
  return Number(process.env.DATA_CACHE_TTL || 300);
};

/**
 * Cache control header for dynamic data responses
 * @returns
 */
export const getDataCacheControlHeader = (): string => {
  const ttl = getDataCacheTTL();
  return getCacheControlHeader(Number(ttl));
};

/**
 * Cache ttl for health check responses, should be low but any to avoid spamming the service
 * @returns
 */
export const getHealthCacheTTL = (): number => {
  return Number(process.env.HEALTH_CACHE_TTL || 2);
};

/**
 * Cache control header for health check responses
 * @returns
 */
export const getHealthCacheControlHeader = (): string => {
  const ttl = getHealthCacheTTL();
  return getCacheControlHeader(Number(ttl));
};
