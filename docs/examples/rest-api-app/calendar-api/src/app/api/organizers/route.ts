import { getLogger } from "@/logging/logger";
import { apiLoggerOrganizers } from "@/logging/loggerApps.config";
import { createNextHandler } from "@ts-rest/serverless/next";
import { GetOrganizersContract } from "./get-organizers.contract";
import { MateoContactListItem } from "@/clients/mateo/types/mateo-contact-list.types";
import { getMateoContacts } from "@/clients/mateo/mateo-get-contacts";
import { Organizer } from "@/organizer/types/organizer.types";
import { GetOrganizersSuccessful } from "./get-organizers.schema";
import { ErrorSchema } from "@/rest/error.schema";
import { handleZodError } from "@/rest/zod-error-handler";
import { mapToOrganizers } from "@/clients/mateo/helpers/map-to-organizers";
import { getDataCacheControlHeader } from "@/config/cache-control-header";

const log = getLogger(apiLoggerOrganizers.organizers);

const handler = createNextHandler(
  GetOrganizersContract,
  {
    "get-organizers": async ({}, res) => {
      log.debug({}, "Fetching organizers");

      try {
        // Fetch all mateo contacts
        const mateoContacts: MateoContactListItem[] = await getMateoContacts();

        // map to organizer object and filter out null values, if some were filtered out by mapping
        const organizers: Organizer[] = mapToOrganizers(mateoContacts);

        // set response timestamp
        const timestamp = new Date().toISOString();

        if (organizers.length === 0) {
          log.info({}, "No organizers found");
          return {
            status: 200,
            body: {
              status: 204,
              timestamp: timestamp,
              results: 0,
              data: [],
            } as GetOrganizersSuccessful,
          };
        }

        // Set cache control header
        res.responseHeaders.set("Cache-Control", getDataCacheControlHeader());

        log.info(
          {
            data: {
              count: organizers.length,
            },
          },
          "Organizers fetched successfully"
        );

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: timestamp,
            results: organizers.length,
            data: organizers,
          } as GetOrganizersSuccessful,
        };
      } catch (error) {
        log.error(error, "Error while fetching organizers");

        return {
          status: 500,
          body: {
            status: 500,
            error: "Internal Server Error",
            trace: error,
          } as ErrorSchema,
        };
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
