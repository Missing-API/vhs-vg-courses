import { getCalendarApiConfig } from "./helpers/config";
import { ResultsSchema } from "@/src/rest/results.schema";
import { z } from "zod";
import { getLogger } from "@/src/logging/logger";
import { ClientCalendar } from "@/src/logging/loggerApps.config";
import { CalendarEventsQuery } from "./types/calendar-events-query.types";
import { getCalendarEventsQuery } from "./helpers/calendar-events-query";

const log = getLogger(ClientCalendar.events);

const CalendarApiResponseSchema = ResultsSchema.extend({
  data: z.array(z.any()),
});
type CalendarApiResponse = z.infer<typeof CalendarApiResponseSchema>;

/**
 * Fetches calendar events from the calendar-api.
 * @param id: string
 * @param timeMin: ISO8601
 * @param timeMax: ISO8601
 * @param updatedMin: ISO8601
 * @returns Promise<object[]>
 * @throws Error
 */
export const getCalendarEvents = async (
  query: CalendarEventsQuery
): Promise<object[]> => {
  const { host, token } = getCalendarApiConfig();
  const url: URL = new URL(`/api/calendars/${query.id}/events`, host);

  const validQuery = getCalendarEventsQuery(query);

  if (validQuery.after) url.searchParams.append("timeMin", validQuery.after);
  if (validQuery.before) url.searchParams.append("timeMax", validQuery.before);
  if (validQuery.updatedSince)
    url.searchParams.append("updatedMin", validQuery.updatedSince);

  log.debug(
    { url: url.toString(), query },
    "Fetching calendar events from calendar-api"
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Sheep-Token": token,
        Accept: "application/json",
      },
    });
    const data: CalendarApiResponse = await response.json();
    CalendarApiResponseSchema.parse(data);
    return data.data;
  } catch (error) {
    log.error({ url, error }, "Failed to fetch calendar events");
    throw new Error("Failed to fetch calendar events", { cause: error });
  }
};
