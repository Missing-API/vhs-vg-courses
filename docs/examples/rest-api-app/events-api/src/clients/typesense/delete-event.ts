import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["delete-event"]);

export const deleteEvent = async (id: string): Promise<boolean> => {
  // Validate id
  if (!id) {
    log.error("No id provided for event deletion");
    throw new ApiError(400, "Event ID is required");
  }

  const { host, token } = getTypesenseApiConfig();
  const url: string = new URL(
    `/collections/${eventsSchema.name}/documents/${id}`,
    host
  ).toString();

  // Try to delete the event
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-TYPESENSE-API-KEY": token,
    },
  });

  // Happy path
  if (response.ok && response.status === 200) {
    log.debug({ id }, "Event deleted successfully");
    return true;
  }

  // 404 - Document not found
  if (response.status === 404) {
    log.warn({ id }, "Could not delete event because it doesn't exist");
    throw new ApiError(404, "Event not found");
  }

  // Everything else is an error
  log.error(
    {
      error: { status: response.status, message: response.statusText },
      data: { id },
    },
    "Could not delete event"
  );

  throw new ApiError(
    response.status,
    `Error deleting event: ${response.statusText}`
  );
};
