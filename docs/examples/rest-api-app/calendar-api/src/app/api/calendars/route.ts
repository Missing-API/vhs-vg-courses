import { getLogger } from "@/logging/logger";
import { apiLoggerCalendars } from "@/logging/loggerApps.config";
import { createNextHandler } from "@ts-rest/serverless/next";
import { MateoContactListItem } from "@/clients/mateo/types/mateo-contact-list.types";
import { getMateoContacts } from "@/clients/mateo/mateo-get-contacts";
import { Organizer } from "@/organizer/types/organizer.types";
import { ErrorSchema } from "@/rest/error.schema";
import { handleZodError } from "@/rest/zod-error-handler";
import { GetCalendarsContract } from "./get-calendars.contract";
import { mapToOrganizers } from "@/clients/mateo/helpers/map-to-organizers";
import { transformOrganizersToCalendars } from "@/organizer/helper/transform-organizers-to-calendars";
import { Calendar } from "@/calendar/types/calendar.types";
import { GetCalendarsSuccessful } from "./get-calendars.schema";
import { getDataCacheControlHeader } from "@/config/cache-control-header";

const log = getLogger(apiLoggerCalendars.calendars);

const handler = createNextHandler(
  GetCalendarsContract,
  {
    "get-calendars": async ({}, res) => {
      log.debug({}, "Fetching calendars");

      try {
        // Fetch all mateo contacts
        const mateoContacts: MateoContactListItem[] = await getMateoContacts();

        // set response timestamp
        const timestamp = new Date().toISOString();

        // map to organizer object and filter out null values, if some were filtered out by mapping
        const organizers: Organizer[] = mapToOrganizers(mateoContacts);

        // transform to calendar list
        const calendars: Calendar[] =
          transformOrganizersToCalendars(organizers);

        if (calendars.length === 0) {
          log.info({}, "No calendars found");
          return {
            status: 200,
            body: {
              status: 204,
              timestamp: timestamp,
              results: 0,
              data: [],
            } as GetCalendarsSuccessful,
          };
        }

        // Set cache control header
        res.responseHeaders.set("Cache-Control", getDataCacheControlHeader());

        log.info(
          {
            data: {
              count: calendars.length,
            },
          },
          "Calendars fetched successfully"
        );

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: timestamp,
            results: calendars.length,
            data: calendars,
          } as GetCalendarsSuccessful,
        };
      } catch (error) {
        log.error(error, "Error while fetching calendars");
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
