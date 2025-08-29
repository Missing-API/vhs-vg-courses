import getUuidByString from "uuid-by-string";
import { PostEventRequestBody } from "../../events.types";

/**
 * Generates stable uuid for the organizer, which is mainly the creator in google events data.
 * @param event: PostEventRequestBody
 * @returns string
 */
export const organizerUuid = (event: PostEventRequestBody): string => {
  const organizerId: string | null =
    event.creator?.id ||
    event.creator?.email ||
    event.creator?.displayName ||
    null;

  if (organizerId) return getUuidByString(organizerId);

  throw new Error("could not generate a organizer uuid");
};
