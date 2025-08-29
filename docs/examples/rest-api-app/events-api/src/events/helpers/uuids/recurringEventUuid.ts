import getUuidByString from "uuid-by-string";
import { PostEventRequestBody } from "../../events.types";

/**
 * Generates stable recurring event uuid for an event.
 * @param event
 * @returns string
 */
export const recurringEventUuid = (
  event: PostEventRequestBody
): string | null => {
  const recurringEventId: string | null = event?.recurringEventId || null;

  if (recurringEventId) return getUuidByString(recurringEventId);

  return null;
};
