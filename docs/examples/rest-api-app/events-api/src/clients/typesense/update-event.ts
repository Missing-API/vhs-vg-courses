import {
  IndexedEvent,
  IndexedEventSchema,
} from "@/src/events/types/indexed-event.types";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["update-event"]);

export const updateEvent = async (
  event: IndexedEvent
): Promise<IndexedEvent> => {
  const { host, token } = getTypesenseApiConfig();

  // sanity check
  try {
    IndexedEventSchema.parse(event);
  } catch (error) {
    log.error({ error }, "Error parsing incoming event data");
    throw new ApiError(400, "Invalid event data");
  }

  // check if the event id is set
  if (!event.id) {
    log.error({ event }, "Event id is not set");
    throw new ApiError(400, "Event id is not set");
  }

  // build update url
  const url: string = new URL(
    `/collections/${eventsSchema.name}/documents/${event.id}`,
    host
  ).toString();

  // try to create the event
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "X-TYPESENSE-API-KEY": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  // happy path
  if (response.ok && response.status === 200) {
    log.debug({ data: { id: event.id } }, "Event updated successfully");
    const data = await response.json();
    try {
      IndexedEventSchema.parse(data);
      return data;
    } catch (error) {
      log.error(
        { error, data },
        "Error parsing the just updated event, this never should happen, check the schema"
      );
      throw new ApiError(500, "Failed to parse event data");
    }
  }

  // everything else is an error
  log.error(
    {
      error: { status: response.status, message: response.statusText },
      data: { id: event.id },
    },
    "Could not update event"
  );
  throw new ApiError(
    response.status,
    `Error updating event: ${response.statusText}`
  );
};
