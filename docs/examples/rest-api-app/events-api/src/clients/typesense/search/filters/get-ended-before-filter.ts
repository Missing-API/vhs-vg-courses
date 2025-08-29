import { now as getCurrentTime } from "@/src/events/helpers/datetime/now";
import { ISO8601, ISO8601Schema } from "../../../../rest/iso8601.types";

/**
 * Returns a date filter for events that ended before the specified date.
 * Accepts either an ISO8601 date string or 'now'.
 * @param isoDate ISO8601 date string or 'now'
 */
export const getEndedBeforeFilter = (
  isoDate: ISO8601 | "now" = "now"
): string => {
  const currentDate: Date = getCurrentTime();

  let beforeTimestamp: number;
  if (isoDate.toLowerCase() === "now") {
    // Use current timestamp in milliseconds
    beforeTimestamp = currentDate.getTime();
  } else {
    // Validate the ISO format first
    ISO8601Schema.parse(isoDate);
    // Parse the ISO date string to get timestamp
    beforeTimestamp = new Date(isoDate).getTime();
  }

  return `start:<=${beforeTimestamp} && end:<=${beforeTimestamp}`;
};
