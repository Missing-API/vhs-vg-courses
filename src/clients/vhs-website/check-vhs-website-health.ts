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
    const status: VhsWebsiteHealthStatus["status"] =
      responseTime <= 10000 ? "healthy" : "degraded";

    return {
      status,
      responseTime,
      statusCode,
      message: status === "healthy" ? "VHS website is accessible" : "VHS website is slow but reachable",
      timestamp,
    };
  } catch (e: any) {
    const responseTime = Date.now() - start;
    
    // Check if this is an HTTP error (includes status code) or network/timeout error
    const httpErrorMatch = e?.message?.match(/HTTP (\d+)/);
    if (httpErrorMatch) {
      const statusCode = parseInt(httpErrorMatch[1], 10);
      return {
        status: "unhealthy",
        responseTime,
        statusCode,
        message: `HTTP ${statusCode} from VHS website`,
        timestamp,
      };
    }
    
    // Check if this is a timeout/abort error
    const isAbort = e?.name === "AbortError" || 
                    /aborted/i.test(String(e?.message || "")) ||
                    /aborterror/i.test(String(e?.message || ""));
    if (isAbort) {
      return {
        status: "unhealthy",
        responseTime,
        statusCode: null,
        message: "Timeout while connecting to VHS website",
        timestamp,
      };
    }
    
    // Network/other error - fall through to GET for a definitive check
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
    const status: VhsWebsiteHealthStatus["status"] =
      responseTime <= 10000 ? "healthy" : "degraded";

    if (!hasHtml) {
      return {
        status: "degraded",
        responseTime,
        statusCode,
        message: "VHS website responded without expected HTML structure",
        timestamp,
      };
    }

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
  } catch (error: any) {
    const responseTime = Date.now() - start;
    
    // Check if this is an HTTP error (includes status code) or network/timeout error
    const httpErrorMatch = error?.message?.match(/HTTP (\d+)/);
    if (httpErrorMatch) {
      const statusCode = parseInt(httpErrorMatch[1], 10);
      return {
        status: "unhealthy",
        responseTime,
        statusCode,
        message: `HTTP ${statusCode} from VHS website`,
        timestamp,
      };
    }
    
    // This is a network/timeout error
    const isAbort = error?.name === "AbortError" || 
                    /aborted/i.test(String(error?.message || "")) ||
                    /aborterror/i.test(String(error?.message || ""));
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