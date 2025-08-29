import { getLogger } from "@/logging/logger";
import { apiLoggerCalendars } from "@/logging/loggerApps.config";
import { createNextHandler } from "@ts-rest/serverless/next";
import { MateoContactListItem } from "@/clients/mateo/types/mateo-contact-list.types";
import { getMateoContacts } from "@/clients/mateo/mateo-get-contacts";
import { Organizer } from "@/organizer/types/organizer.types";
import { ErrorSchema } from "@/rest/error.schema";
import { handleZodError } from "@/rest/zod-error-handler";
import { mapToOrganizers } from "@/clients/mateo/helpers/map-to-organizers";
import { transformOrganizersToCalendars } from "@/organizer/helper/transform-organizers-to-calendars";
import { Calendar } from "@/calendar/types/calendar.types";
import { getDataCacheControlHeader } from "@/config/cache-control-header";
import { GetCalendarContract } from "./get-calendar.contract";
import { filterCalendarsById } from "@/calendar/helpers/filter-calendars-by-id";
import { GetCalendarSuccessful } from "./get-calendar.schema";

const log = getLogger(apiLoggerCalendars.calendar);

const handler = createNextHandler(
  GetCalendarContract,
  {
    "get-calendar": async ({ params }, res) => {
      try {
        log.trace(
          {
            query: {
              id: params.id,
            },
          },
          "Fetching calendar"
        );

        // Fetch all mateo contacts
        const mateoContacts: MateoContactListItem[] = await getMateoContacts();

        // set response timestamp
        const timestamp = new Date().toISOString();

        // map to organizer object and filter out null values, if some were filtered out by mapping
        const organizers: Organizer[] = mapToOrganizers(mateoContacts);

        // transform to calendar list
        const calendars: Calendar[] =
          transformOrganizersToCalendars(organizers);

        // search for calendar by id
        const calendar: Calendar | null = filterCalendarsById(
          calendars,
          params.id
        );

        if (!calendar) {
          log.warn(
            {
              data: { id: params.id },
            },
            "Calendar not found"
          );

          return {
            status: 404,
            body: {
              status: 404,
              error: "Not Found",
            } as ErrorSchema,
          };
        }

        // Set cache control header
        res.responseHeaders.set("Cache-Control", getDataCacheControlHeader());

        log.info(
          {
            data: {
              id: params.id,
            },
          },
          "Calendar fetched successfully"
        );

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: timestamp,
            data: calendar,
          } as GetCalendarSuccessful,
        };
      } catch (error) {
        log.error(error, "Error while fetching calendar");

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
