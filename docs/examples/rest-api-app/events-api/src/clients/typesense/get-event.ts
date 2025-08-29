import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import {
  IndexedEvent,
  IndexedEventSchema,
} from "@/src/events/types/indexed-event.types";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["get-event"]);

export async function getEvent(id: string): Promise<IndexedEvent> {
  // Validate id
  if (!id) {
    log.error("No id provided for event retrieval");
    throw new ApiError(400, "Event ID is required");
  }

  const { host, token } = getTypesenseApiConfig();
  const url: string = new URL(
    `/collections/${eventsSchema.name}/documents/${id}`,
    host
  ).toString();

  // Try to retrieve the event
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-TYPESENSE-API-KEY": token,
    },
  });

  // Happy path
  if (response.ok && response.status === 200) {
    log.debug({ id }, "Event retrieved successfully");
    const data = await response.json();
    try {
      IndexedEventSchema.parse(data);
      return data;
    } catch (error) {
      log.error(
        { error, data },
        "Error parsing the retrieved event, this never should happen, check the schema"
      );
      throw new ApiError(500, "Failed to parse event data");
    }
  }

  // 404 - Document not found
  if (response.status === 404) {
    log.warn({ id }, "Event not found");
    throw new ApiError(404, "Event not found");
  }

  // Everything else is an error
  log.error(
    {
      error: { status: response.status, message: response.statusText },
      data: { id },
    },
    "Could not retrieve event"
  );

  throw new ApiError(
    response.status,
    `Error retrieving event: ${response.statusText}`
  );
}
