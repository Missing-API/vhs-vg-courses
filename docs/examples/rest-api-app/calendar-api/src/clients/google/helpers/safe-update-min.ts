/**
 * Validates and processes an ISO8601 date string for update queries
 * If the date is invalid, returns null
 * If the date is too far in the past (beyond maxDaysInPast),
 * it will be adjusted to the maximum allowed past date
 */

import { ISO8601, ISO8601Schema } from "@/rest/iso8601.types";
import { getLogger } from "@/logging/logger";
import { clientLoggerGoogle } from "@/logging/loggerApps.config";
import { ZodError } from "zod";
import { now as getCurrentDate } from "./now";

export function safeUpdateMin(
  isoDateString: ISO8601 | string | null | undefined
): ISO8601 | null {
  const log = getLogger(clientLoggerGoogle["events.helper.update-min"]);

  // Check if date is valid
  if (!isoDateString) {
    return null;
  }

  try {
    // Validate and parse using ISO8601Schema
    const parsedDate = ISO8601Schema.parse(isoDateString);
    const date = new Date(parsedDate);

    const maxDaysInPast = 25;
    const currentDate: Date = getCurrentDate();
    const maxPastDate = new Date(currentDate);
    maxPastDate.setDate(currentDate.getDate() - maxDaysInPast);

    // Check if date is more than max days in the past
    if (date < maxPastDate) {
      log.info(
        {
          originalDate: isoDateString,
          adjustedDate: maxPastDate.toISOString(),
        },
        `updatedMin date was too far in the past. Adjusted to ${maxDaysInPast} days ago.`
      );

      // Return the adjusted date (25 days in the past)
      return maxPastDate.toISOString() as ISO8601;
    }

    // If date is valid and within range, return it as is
    return parsedDate;
  } catch (error) {
    if (error instanceof ZodError) {
      log.warn(
        { updatedMin: isoDateString },
        "Invalid ISO8601 format provided for updatedMin"
      );
    } else {
      log.error(
        { updatedMin: isoDateString, error },
        "Error processing updatedMin date"
      );
    }
    return null;
  }
}
