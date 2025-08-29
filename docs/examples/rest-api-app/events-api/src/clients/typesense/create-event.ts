import {
  IndexedEvent,
  IndexedEventSchema,
} from "@/src/events/types/indexed-event.types";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["create-event"]);

export const createEvent = async (
  event: IndexedEvent
): Promise<IndexedEvent> => {
  const { host, token } = getTypesenseApiConfig();
  const url: string = new URL(
    `/collections/${eventsSchema.name}/documents`,
    host
  ).toString();

  // sanity check
  try {
    IndexedEventSchema.parse(event);
  } catch (error) {
    log.error({ error }, "Error parsing incoming event data");
    throw new ApiError(400, "Invalid event data");
  }

  // try to create the event
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-TYPESENSE-API-KEY": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  // happy path
  if ((response.ok && response.status === 200) || response.status === 201) {
    log.debug({ data: { id: event.id } }, "Event created successfully");
    const data = await response.json();
    try {
      IndexedEventSchema.parse(data);
      return data;
    } catch (error) {
      log.error(
        { error, data },
        "Error parsing the just created event, this never should happen, check the schema"
      );
      throw new ApiError(500, "Failed to parse event data");
    }
  }

  // 409 ObjectAlreadyExists
  if (response.status === 409) {
    log.debug(
      { data: { id: event.id } },
      "Could not create event, because it already exists"
    );
    throw new ApiError(
      409,
      "Event already exists, please update the event instead"
    );
  }

  // everything else is an error
  log.error(
    {
      error: { status: response.status, message: response.statusText },
      data: { id: event.id },
    },
    "Could not create event"
  );
  throw new ApiError(
    response.status,
    `Error creating event: ${response.statusText}`
  );
};
