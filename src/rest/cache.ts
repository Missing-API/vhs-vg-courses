/**
 * HTTP cache configuration utilities
 */

/**
 * Default cache duration in seconds (1 day)
 */
const DEFAULT_CACHE_DURATION_SECONDS = 60 * 60 * 24;

/**
 * Get the cache duration from environment variable or use default
 * @returns Cache duration in seconds
 */
export function getCacheDurationSeconds(): number {
  const envValue = process.env.HTTP_CACHE_DURATION_SECONDS;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_CACHE_DURATION_SECONDS;
}

/**
 * Set cache control header for successful responses
 * Sets public caching with max-age, s-maxage, and stale-while-revalidate directives
 * - max-age: Browser cache duration
 * - s-maxage: CDN/shared cache duration (same as max-age)
 * - stale-while-revalidate: Time to serve stale content while revalidating in background
 * @param headers - Headers object to set the cache control header on
 * @param durationSeconds - Optional override for cache duration
 */
export function setCacheControlHeader(
  headers: Headers,
  durationSeconds?: number
): void {
  const duration = durationSeconds ?? getCacheDurationSeconds();
  const staleWhileRevalidate = Math.min(300, Math.floor(duration / 288)); // 300s max, or ~0.35% of duration
  headers.set("Cache-Control", `public, max-age=${duration}, s-maxage=${duration}, stale-while-revalidate=${staleWhileRevalidate}`);
}
