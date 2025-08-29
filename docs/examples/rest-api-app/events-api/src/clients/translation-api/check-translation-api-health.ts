import {
  HealthyServiceInfoSchema,
  ServiceStatusSchema,
  UnhealthyServiceInfoSchema,
} from "@/src/rest/health.schema";
import { getConfigCacheTTL } from "@/src/config/cache-control-header";
import { getTranslationApiConfig } from "./helpers/config";

/**
 * Checks the health of the translation-api service.
 * @returns Promise<ServiceStatusSchema>
 */
export const checkTranslationApiHealth =
  async (): Promise<ServiceStatusSchema> => {
    try {
      const config = getTranslationApiConfig();
      const url = new URL("", config.host); // TODO: use /api/health later when it's available

      const response = await fetch(url, {
        headers: {
          "Sheep-Token": config.token,
          Accept: "application/json",
        },
        cache: "force-cache",
        next: {
          revalidate: getConfigCacheTTL(),
        },
      });
      const body: string = await response.text();

      // get name from json until we have a health endpoint
      const nameRegex = /"title"\s*:\s*"([^"]+)"/;
      const name = body.match(nameRegex)?.[1];

      // get version from json until we have a health endpoint
      const versionRegex = /"version"\s*:\s*"(\d+\.\d+\.\d+)"/;
      const version = body.match(versionRegex)?.[1];

      if (!response.ok || !body.includes("translation-api")) {
        throw new Error(`translation-api is not healthy`);
      }

      const serviceInfo: HealthyServiceInfoSchema = {
        status: response.status | 200,
        message: "healthy",
        name: name || "translation-api",
        version: version || "unknown",
      };
      return serviceInfo;
    } catch (error) {
      console.error(error);

      const serviceInfo: UnhealthyServiceInfoSchema = {
        status: 503,
        error: (error instanceof Error
          ? error.message
          : "Unknown error") as string,
        name: "translation-api",
        version: "unknown",
      };
      return serviceInfo;
    }
  };
