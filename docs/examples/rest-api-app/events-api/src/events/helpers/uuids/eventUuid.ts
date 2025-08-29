import getUuidByString from "uuid-by-string";
import { PostEventRequestBody } from "../../events.types";

/**
 * Generates stable uuid for an event.
 * @param event
 * @returns string
 */
export const eventUuid = (event: PostEventRequestBody): string => {
  const eventId: string | null =
    event?.iCalUID && event?.id
      ? event.iCalUID + event.id
      : event?.iCalUID || event?.id || null;

  if (eventId) return getUuidByString(eventId);

  throw new Error("could not generate an event uuid");
};
