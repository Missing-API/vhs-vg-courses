import logger from '@/logging/logger';
import { withCategory, startTimer, errorToObject } from '@/logging/helpers';

/**
 * Fetch helper with timeout and basic error surface
 * Uses Next.js fetch caching with 24-hour revalidation
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs?: number
): Promise<Response> {
  // Compute timeout inside function to ensure test can override environment
  const actualTimeout = timeoutMs ?? (Number(process.env.VHS_REQUEST_TIMEOUT) || 8000);
  
  const log = withCategory(logger, 'vhsClient');
  const end = startTimer();

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), actualTimeout);
  const method = options?.method || 'GET';

  log.debug({ operation: 'fetch', url, method, timeoutMs: actualTimeout }, 'HTTP request start');

  try {
    const res = await fetch(url, { 
      ...options, 
      signal: controller.signal,
      next: { 
        revalidate: 86400, // 24 hours in seconds
        tags: ['vhs-courses'] // Optional: for manual cache invalidation
      },
      cache: 'force-cache' // Use cached response, revalidate in background when stale
    });

    const durationMs = end();

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      log.error(
        { operation: 'fetch', url, method, status: res.status, durationMs, bodySnippet: body ? body.slice(0, 200) : undefined },
        'HTTP request failed'
      );
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} ${body ? "- " + body.slice(0, 200) : ""}`);
    }

    log.info({ operation: 'fetch', url, method, status: res.status, durationMs }, 'HTTP request success');
    return res;
  } catch (err) {
    const durationMs = end();
    log.error({ operation: 'fetch', url, method, durationMs, err: errorToObject(err) }, 'HTTP request error');
    throw err;
  } finally {
    clearTimeout(id);
  }
}
