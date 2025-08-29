import { getCalendarApiConfig } from "./helpers/config";
import { ResultsSchema } from "@/src/rest/results.schema";
import { z } from "zod";
import { getLogger } from "@/src/logging/logger";
import { ClientCalendar } from "@/src/logging/loggerApps.config";

const log = getLogger(ClientCalendar.calendars);

// any object but with id
export const CalendarSchema = z.object({
  id: z.string(),
});
export type Calendar = z.infer<typeof CalendarSchema>;

const CalendarApiResponseSchema = ResultsSchema.extend({
  data: z.array(CalendarSchema),
});
type CalendarApiResponse = z.infer<typeof CalendarApiResponseSchema>;

/**
 * Fetches all calendars from the calendar-api.
 * @returns Promise<Calendar[]>
 * @throws Error
 */
export const getCalendars = async (): Promise<Calendar[]> => {
  const { host, token } = getCalendarApiConfig();
  const url: URL = new URL(`/api/calendars`, host);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Sheep-Token": token,
        Accept: "application/json",
      },
    });
    const data: CalendarApiResponse = await response.json();
    // ensure reduced data structure by parsing
    return CalendarApiResponseSchema.parse(data).data;
  } catch (error) {
    log.error({ url, error }, "Failed to fetch calendars");
    throw new Error("Failed to fetch calendars", { cause: error });
  }
};
