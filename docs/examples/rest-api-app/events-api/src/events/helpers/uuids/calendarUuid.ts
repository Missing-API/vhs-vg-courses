import getUuidByString from "uuid-by-string";
import { PostEventRequestBody } from "../../events.types";

/**
 * Generates stable uuid for a calendar which is mainly the organizer in google event data.
 * @param event
 * @returns string
 */
export const calendarUuid = (event: PostEventRequestBody): string => {
  const calendarId: string | null =
    event.organizer?.id ||
    event.organizer?.email ||
    event.organizer?.displayName ||
    null;

  if (calendarId) return getUuidByString(calendarId);

  throw new Error("could not generate a calendar uuid");
};
