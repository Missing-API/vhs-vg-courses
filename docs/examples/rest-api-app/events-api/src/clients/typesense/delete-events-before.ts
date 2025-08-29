import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { ISO8601 } from "@/src/rest/iso8601.types";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { ApiError } from "@/src/rest/error.schema";
import { getEndedBeforeFilter } from "./search/filters/get-ended-before-filter";

const log = getLogger(ClientTypesense["delete-events"]);

export const deleteEventsBefore = async (before: ISO8601): Promise<number> => {
  // Validate query parameters
  if (!before) {
    log.error("Missing before parameter for event deletion");
    throw new ApiError(400, "Missing parameter, before is required");
  }

  let deleted: number = 0;

  const { host, token } = getTypesenseApiConfig();

  let beforeFilter: string;
  try {
    beforeFilter = getEndedBeforeFilter(before);
  } catch (error) {
    log.error({ error, before: before }, "Invalid before date format");
    throw new ApiError(
      400,
      error instanceof Error ? error.message : "Invalid before date format"
    );
  }

  // add filter as parameter to url
  const url = new URL(`/collections/${eventsSchema.name}/documents`, host);
  url.searchParams.append("filter_by", beforeFilter);

  try {
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "X-TYPESENSE-API-KEY": token,
        "Content-Type": "application/json",
      },
    });

    if (response.ok && response.status === 200) {
      const data = await response.json();
      deleted = data.num_deleted || 0;

      log.debug(
        { count: deleted, filter: beforeFilter },
        "Events deleted by filter"
      );
    } else {
      log.error(
        {
          error: { status: response.status, message: response.statusText },
          filter: beforeFilter,
        },
        "Could not delete events by filter"
      );
      throw new ApiError(
        response.status,
        `Error deleting events by filter: ${response.statusText}`
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    log.error(
      { error, filter: beforeFilter },
      "Error deleting events by filter"
    );
    throw new ApiError(500, "Error while deleting events by filter");
  }

  return deleted;
};
