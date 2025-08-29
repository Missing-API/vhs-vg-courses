import {
  IndexedEvent,
  IndexedEventSchema,
} from "@/src/events/types/indexed-event.types";
import { createEvent } from "./create-event";
import { updateEvent } from "./update-event";
import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["create-or-update-event"]);

export const createOrUpdateEvent = async (
  event: IndexedEvent
): Promise<IndexedEvent> => {
  // sanity check
  try {
    IndexedEventSchema.parse(event);
  } catch (error) {
    log.error({ error }, "Error parsing incoming event data");
    throw new ApiError(400, "Invalid event data");
  }

  try {
    // First try to create the event
    return await createEvent(event);
  } catch (error) {
    // If we get a 409 (already exists), try to update instead
    if (error instanceof ApiError && error.status === 409) {
      log.debug(
        { data: { id: event.id } },
        "Event exists, attempting to update instead"
      );
      return await updateEvent(event);
    }
    // Any other error should be propagated
    throw error as ApiError;
  }
};
