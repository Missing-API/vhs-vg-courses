import {
  HealthyServiceInfoSchema,
  ServiceStatusSchema,
  UnhealthyServiceInfoSchema,
} from "@/src/rest/health.schema";
import { getConfigCacheTTL } from "@/src/config/cache-control-header";
import { getCalendarApiConfig } from "./helpers/config";
import { getLogger } from "@/src/logging/logger";
import { ClientCalendar } from "@/src/logging/loggerApps.config";

const log = getLogger(ClientCalendar.health);

/**
 * Checks the health of the calendar API service.
 * @returns Promise<ServiceStatusSchema>
 */
export const checkCalendarApiHealth =
  async (): Promise<ServiceStatusSchema> => {
    log.debug({}, "Checking calendar API health");
    try {
      const { host, token } = getCalendarApiConfig();
      const url: URL = new URL("/api/health", host);
      const response = await fetch(url, {
        headers: {
          "Sheep-Token": token,
          Accept: "application/json",
        },
        cache: "force-cache",
        next: {
          revalidate: getConfigCacheTTL(),
        },
      });
      const healthReport: HealthyServiceInfoSchema =
        (await response.json()) as HealthyServiceInfoSchema;

      if (!response.ok || healthReport.status !== 200) {
        throw new Error(`calendar-api is not healthy`);
      }

      const serviceInfo: HealthyServiceInfoSchema = {
        status: response.status || 200,
        message: "healthy",
        name: healthReport.name,
        version: healthReport.version,
      };

      log.info(
        {
          data: {
            status: serviceInfo.status,
            name: serviceInfo.name,
          },
        },
        "Calendar API health check successful"
      );
      return serviceInfo;
    } catch (error) {
      log.error(error, "Calendar API health check failed");

      const serviceInfo: UnhealthyServiceInfoSchema = {
        status: 503,
        error: (error instanceof Error
          ? error.message
          : "Unknown error") as string,
        name: "calendar-api",
        version: "unknown",
      };
      return serviceInfo;
    }
  };
