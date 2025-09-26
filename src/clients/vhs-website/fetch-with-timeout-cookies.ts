import logger from '@/logging/logger';
import { withCategory, startTimer, errorToObject } from '@/logging/helpers';
import { VhsSessionManager } from './vhs-session-manager';

export interface CookieOptions {
  useSession?: boolean;
  sessionManager?: VhsSessionManager;
  preserveCookies?: boolean;
}

/**
 * Backward-compatible fetch helper with optional cookie/session handling.
 * - When useSession is true, attaches Cookie header from session manager and
 *   stores Set-Cookie headers back into the same manager.
 */
export async function fetchWithTimeoutCookies(
  url: string,
  init?: RequestInit & CookieOptions,
  timeoutMs = Number(process.env.VHS_REQUEST_TIMEOUT) || 10000
): Promise<Response> {
  const log = withCategory(logger, 'vhsClient');
  const end = startTimer();

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const method = init?.method || 'GET';

  const useSession = init?.useSession;
  const manager = init?.sessionManager;

  const headers = new Headers(init?.headers || {});
  if (useSession && manager) {
    if (manager.isExpired()) {
      // soft reset on expiration; allow request to create a new session via Set-Cookie
      manager.reset();
    }
    const cookieHeader = manager.getCookieHeader(url);
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
  }

  log.debug({ operation: 'fetch', url, method, timeoutMs, useSession: !!useSession }, 'HTTP request start');

  // Log all request headers for debugging
  const requestHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    requestHeaders[key] = key.toLowerCase().includes('cookie') ? '[REDACTED]' : value;
  });
  if (log.trace) {
    log.trace({ operation: 'fetch.request', url, method, headers: requestHeaders, body: init?.body ? '[BODY_PRESENT]' : undefined }, 'Request details');
  }

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
      next: { revalidate: 86400 }, // 24 hours
    });

    // Log all response headers for debugging
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = key.toLowerCase().includes('cookie') ? '[REDACTED]' : value;
    });
    if (log.trace) {
      log.trace({ 
        operation: 'fetch.response.headers', 
        url, 
        status: res.status, 
        statusText: res.statusText,
        headers: responseHeaders,
        contentType: res.headers.get('content-type'),
        contentLength: res.headers.get('content-length'),
        cacheControl: res.headers.get('cache-control')
      }, 'Response headers received');
    }

    // Update cookies from response if requested
    if (useSession && manager) {
      try {
        manager.updateFromResponse(url, res);
      } catch (e) {
        log.warn({ operation: 'cookie.update.error', url, err: errorToObject(e) }, 'Failed to update cookies from response');
      }
    }



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