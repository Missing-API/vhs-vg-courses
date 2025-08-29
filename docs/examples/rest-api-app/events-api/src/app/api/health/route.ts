import { createNextHandler } from "@ts-rest/serverless/next";
import { HealthContract } from "./health.contract";
import packageJson from "../../../../package.json" assert { type: "json" };
import {
  HealthyApiStatusSchema,
  ServiceStatusSchema,
  UnhealthyApiStatusSchema,
} from "@/src/rest/health.schema";
import { checkGeoApiHealth } from "@/src/clients/geo-api/check-geo-api-health";
import { checkClassificationApiHealth } from "@/src/clients/classification-api/classification-api-health";
import { checkTranslationApiHealth } from "@/src/clients/translation-api/check-translation-api-health";
import { checkTypesenseHealth } from "@/src/clients/typesense/check-typesense-health";
import { checkCalendarApiHealth } from "@/src/clients/calendar-api/calendar-api-health";
import { getHealthCacheControlHeader } from "@/src/config/cache-control-header";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { getLogger } from "@/src/logging/logger";

const log = getLogger("api-health");

const handler = createNextHandler(
  HealthContract,
  {
    health: async ({}, res) => {
      log.debug({}, "Health check started");

      try {
        // evaluate overall status code
        const status: number = 200;

        // check client services
        log.debug({}, "Checking client services health");
        const geoApiStatus: ServiceStatusSchema = await checkGeoApiHealth();
        const classificationApiStatus: ServiceStatusSchema =
          await checkClassificationApiHealth();
        const translationApiStatus: ServiceStatusSchema =
          await checkTranslationApiHealth();
        const calendarApiStatus: ServiceStatusSchema =
          await checkCalendarApiHealth();
        const searchEngineStatus: ServiceStatusSchema =
          await checkTypesenseHealth();

        if (
          geoApiStatus.status === 200 &&
          classificationApiStatus.status === 200 &&
          translationApiStatus.status === 200 &&
          calendarApiStatus.status === 200 &&
          searchEngineStatus.status === 200
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
            services: [
              geoApiStatus,
              classificationApiStatus,
              translationApiStatus,
              calendarApiStatus,
              searchEngineStatus,
            ],
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
          services: [
            geoApiStatus,
            classificationApiStatus,
            translationApiStatus,
            calendarApiStatus,
            searchEngineStatus,
          ],
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
