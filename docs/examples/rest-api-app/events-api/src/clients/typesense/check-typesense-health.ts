import {
  HealthyServiceInfoSchema,
  ServiceStatusSchema,
  UnhealthyServiceInfoSchema,
} from "@/src/rest/health.schema";
import { getTypesenseApiConfig } from "./helpers/config";
import { getConfigCacheTTL } from "@/src/config/cache-control-header";

/**
 * Checks the health of the Typesense service.
 * Uses endpoints health and debug:
 * - https://typesense.org/docs/28.0/api/cluster-operations.html#health
 * - https://typesense.org/docs/28.0/api/cluster-operations.html#debug
 * @returns Promise<ServiceStatusSchema>
 */
export const checkTypesenseHealth = async (): Promise<ServiceStatusSchema> => {
  const serviceName: string = "search-engine";
  try {
    const { host, token } = getTypesenseApiConfig();
    const url: string = new URL("/health", host).toString();

    const response = await fetch(url, {
      headers: {
        "X-TYPESENSE-API-KEY": token,
        Accept: "application/json",
      },
      cache: "force-cache",
      next: {
        revalidate: getConfigCacheTTL(),
      },
    });

    // check for status 200 and body === { "ok": true }
    if (!response.ok) {
      throw new Error(`Search engine is not healthy: ${response.status}`);
    }
    const body = await response.json();
    if (typeof body !== "object" || !body.ok || body.ok !== true) {
      throw new Error("Search engine is not healthy");
    }

    // get version
    const debugUrl: string = new URL("/debug", host).toString();
    const debugResponse = await fetch(debugUrl, {
      headers: {
        "X-TYPESENSE-API-KEY": token,
        Accept: "application/json",
      },
      cache: "force-cache",
      next: {
        revalidate: getConfigCacheTTL(),
      },
    });
    // check body for version in { "state": 1, "version": "28.0" }
    const debugBody = await debugResponse.json();
    if (typeof debugBody !== "object" || !debugBody.version) {
      throw new Error("Search engine is not healthy, could not get version");
    }
    const version = debugBody.version.toString();

    const serviceInfo: HealthyServiceInfoSchema = {
      status: 200,
      message: "healthy",
      name: serviceName,
      version: version ?? "unknown",
    };
    return serviceInfo;
  } catch (error) {
    console.error(error);

    const serviceInfo: UnhealthyServiceInfoSchema = {
      status: 503,
      error: (error instanceof Error
        ? error.message
        : "Unknown error") as string,
      name: serviceName,
      version: "unknown",
    };
    return serviceInfo;
  }
};
