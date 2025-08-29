import { ISO8601Schema } from "../../../rest/iso8601.types";
import { z } from "zod";

export const CalendarEventsQueryParamsSchema = z.object({
  after: ISO8601Schema.optional().describe(
    "Datetime in ISO8601 format to define the lower bound of the time interval to filter for"
  ),
  before: ISO8601Schema.optional().describe(
    "Datetime in ISO8601 format to define the upper bound of the time interval to filter for"
  ),
  updatedSince: ISO8601Schema.optional().describe(
    "Datetime in ISO8601 format to define the lower bound for an events last modification time"
  ),
});
export type CalendarEventsQueryParams = z.infer<
  typeof CalendarEventsQueryParamsSchema
>;

export const CalendarEventsQuerySchema = CalendarEventsQueryParamsSchema.extend(
  {
    id: z
      .string()
      .describe("The calendar id (at calendar-api) of the calendar to update"),
  }
);
export type CalendarEventsQuery = z.infer<typeof CalendarEventsQuerySchema>;
