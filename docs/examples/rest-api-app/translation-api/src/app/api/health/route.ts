import { createNextHandler } from "@ts-rest/serverless/next";
import packageJson from "../../../../package.json" assert { type: "json" };
import {
  HealthyApiStatusSchema,
  ServiceStatusSchema,
  UnhealthyApiStatusSchema,
} from "@/src/rest/health.schema";
import { getHealthCacheControlHeader } from "@/src/config/cache-control-header";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { getLogger } from "@/src/logging/logger";
import { checkGoogleTranslateApiHealth } from "@/src/clients/googletranslate/googletranslate-api-health";
import { HealthContract } from "./health.contract";

const log = getLogger("api-health");

const handler = createNextHandler(
  HealthContract,
  {
    // @ts-expect-error - Type mismatch with ts-rest handler signature
    health: async ({}, res: { responseHeaders: Headers }) => {
      log.debug({}, "Health check started");

      try {
        // evaluate overall status code
        const status: number = 200;

        // check client services
        log.debug({}, "Checking client services health");
        const googleTranslateApiStatus: ServiceStatusSchema =
          await checkGoogleTranslateApiHealth();

        if (
          googleTranslateApiStatus.status === 200 
        ) {
          // Set cache control header
          res.responseHeaders.set(
            "Cache-Control",
            getHealthCacheControlHeader()
          );
          const apiStatus: HealthyApiStatusSchema = {
            status: status,
            version: packageJson.version,
            name: packageJson.name,
            description: packageJson.description,
            services: [googleTranslateApiStatus],
          };
          log.info({}, "Health check completed successfully");
          return { status: 200, body: apiStatus };
        }

        // Set cache control header
        res.responseHeaders.set("Cache-Control", getHealthCacheControlHeader());
        const apiStatus: UnhealthyApiStatusSchema = {
          status: 503,
          error: "Unhealthy services",
          version: packageJson.version,
          name: packageJson.name,
          description: packageJson.description,
          services: [googleTranslateApiStatus],
        };
        log.warn(
          { data: apiStatus },
          "Health check completed with unhealthy services"
        );
        return { status: 503, body: apiStatus };
      } catch (error) {
        log.error(error, "Error performing health check");
        throw error;
      }
    },
  },

  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as GET };
