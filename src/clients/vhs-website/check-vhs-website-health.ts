import { fetchWithTimeout } from "./fetch-with-timeout";

export type VhsWebsiteHealthStatus = {
  status: "healthy" | "unhealthy" | "degraded";
  responseTime: number;
  statusCode: number | null;
  message: string;
  timestamp: string;
};

const VHS_URL = "https://www.vhs-vg.de/";
const DEFAULT_TIMEOUT_MS = Number(process.env.VHS_HEALTH_TIMEOUT_MS || 8000);

/**
 * Performs a lightweight health probe against the VHS-VG website.
 * - Uses a HEAD request by default, falls back to GET on servers that don't support HEAD.
 * - Validates HTTP status (2xx) and basic HTML structure when using GET.
 * - Classifies results into healthy/degraded/unhealthy.
 */
export async function checkVhsWebsiteHealth(timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<VhsWebsiteHealthStatus> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // First try a fast HEAD probe
  try {
    const headRes = await fetchWithTimeout(VHS_URL, { method: "HEAD" }, timeoutMs);
    const responseTime = Date.now() - start;
    const statusCode = headRes.status;

    // If HEAD is ok and fast, we can consider healthy without fetching body
    if (headRes.ok) {
      const status: VhsWebsiteHealthStatus["status"] =
        responseTime <= 10000 ? "healthy" : "degraded";

      return {
        status,
        responseTime,
        statusCode,
        message: status === "healthy" ? "VHS website is accessible" : "VHS website is slow but reachable",
        timestamp,
      };
    }
  } catch (e: any) {
    // Some servers may reject HEAD; fall through to GET for a definitive check
  }

  // Fallback to GET with minimal validation
  try {
    const getStart = Date.now();
    const res = await fetchWithTimeout(VHS_URL, { method: "GET" }, timeoutMs);
    const responseTime = Date.now() - getStart;
    const statusCode = res.status;

    let body = "";
    try {
      body = await res.text();
    } catch {
      // If we cannot read text, mark as unhealthy
      return {
        status: "unhealthy",
        responseTime,
        statusCode,
        message: "Unable to read website response body",
        timestamp,
      };
    }

    const hasHtml =
      typeof body === "string" &&
      /<html[^>]*>/i.test(body) &&
      /<head[^>]*>/i.test(body) &&
      /<body[^>]*>/i.test(body);

    // Determine status
    if (res.ok && hasHtml) {
      const status: VhsWebsiteHealthStatus["status"] =
        responseTime <= 10000 ? "healthy" : "degraded";

      return {
        status,
        responseTime,
        statusCode,
        message:
          status === "healthy"
            ? "VHS website is accessible"
            : "VHS website is slow but reachable",
        timestamp,
      };
    }

    if (res.ok && !hasHtml) {
      return {
        status: "degraded",
        responseTime,
        statusCode,
        message: "VHS website responded without expected HTML structure",
        timestamp,
      };
    }

    return {
      status: "unhealthy",
      responseTime,
      statusCode,
      message: `HTTP ${statusCode} from VHS website`,
      timestamp,
    };
  } catch (error: any) {
    const responseTime = Date.now() - start;
    const isAbort = error?.name === "AbortError" || /aborted/i.test(String(error?.message || ""));
    const message = isAbort
      ? "Timeout while connecting to VHS website"
      : `Network error while connecting to VHS website: ${error?.message || "unknown error"}`;

    return {
      status: "unhealthy",
      responseTime,
      statusCode: null,
      message,
      timestamp,
    };
  }
}