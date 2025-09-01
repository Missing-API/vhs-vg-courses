/**
 * Fetch helper with timeout and basic error surface
 * Uses Next.js fetch caching with 24-hour revalidation
 */
export async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { 
      ...init, 
      signal: controller.signal,
      next: { revalidate: 86400 } // 24 hours in seconds
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} ${body ? "- " + body.slice(0, 200) : ""}`);
    }
    return res;
  } finally {
    clearTimeout(id);
  }
}
