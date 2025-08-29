import { futureOrPastDate } from "../../../events/helpers/datetime/future-or-past-date";
import {
  CalendarEventsQuery,
  CalendarEventsQuerySchema,
} from "../types/calendar-events-query.types";

export const getCalendarEventsQuery = (
  query: CalendarEventsQuery,
  defaultBefore?: number,
  defaultAfter?: number,
  defaultChangedSince?: number
): CalendarEventsQuery => {
  // save parse incoming data
  CalendarEventsQuerySchema.parse(query);

  // set defaults to update all events from today to 90 days in the future
  const validQuery: CalendarEventsQuery = {
    id: query.id,
    after: query.after
      ? new Date(query.after).toISOString()
      : defaultAfter
        ? futureOrPastDate(defaultAfter).toISOString()
        : futureOrPastDate("today").toISOString(),
    before: query.before
      ? new Date(query.before).toISOString()
      : defaultBefore
        ? futureOrPastDate(defaultBefore, true).toISOString()
        : futureOrPastDate(90, true).toISOString(),
    updatedSince: query.updatedSince
      ? new Date(query.updatedSince).toISOString()
      : defaultChangedSince
        ? futureOrPastDate(defaultChangedSince).toISOString()
        : undefined,
  };
  return validQuery;
};
