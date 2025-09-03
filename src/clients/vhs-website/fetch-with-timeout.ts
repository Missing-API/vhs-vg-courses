import logger from '@/logging/logger';
import { withCategory, startTimer, errorToObject } from '@/logging/helpers';

/**
 * Fetch helper with timeout and basic error surface
 * Uses Next.js fetch caching with 24-hour revalidation
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 20000
): Promise<Response> {
  const log = withCategory(logger, 'vhsClient');
  const end = startTimer();

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const method = options?.method || 'GET';

  log.debug({ operation: 'fetch', url, method, timeoutMs }, 'HTTP request start');

  try {
    const res = await fetch(url, { 
      ...options, 
      signal: controller.signal,
      next: { revalidate: 86400 } // 24 hours in seconds
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
