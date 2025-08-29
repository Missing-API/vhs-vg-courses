import getUuidByString from "uuid-by-string";
import { GoogleEventTimeData } from "../types/google-event.types";
import {
  IndexedEventTimeData,
  IndexedEventTimeDataSchema,
} from "../types/indexed-event.types";
import { googleDatetimeToTimestamp } from "./datetime/googleDatetimeToTimestamp";
import { getLogger } from "@/src/logging/logger";
import { ApiEvents } from "@/src/logging/loggerApps.config";

const log = getLogger(ApiEvents["build-indexable-event-time-data"]);

export const buildIndexableEventTimeData = (
  googleEventTimeData: GoogleEventTimeData
): IndexedEventTimeData => {
  if (!googleEventTimeData) {
    log.debug(
      { event: { data: { googleEventTimeData } } },
      "No time data provided"
    );
    throw new Error("No time data provided");
  }
  if (!googleEventTimeData.start) {
    log.debug(
      { event: { data: { googleEventTimeData } } },
      "No start date provided"
    );
    throw new Error("No start date provided");
  }
  if (!googleEventTimeData.start.date && !googleEventTimeData.start.dateTime) {
    log.debug(
      { event: { data: { googleEventTimeData } } },
      "No start date or dateTime provided"
    );
    throw new Error("No start date or dateTime provided");
  }

  const indexedEventTimeData: IndexedEventTimeData = {
    /**
     * dates and times
     */
    start: googleDatetimeToTimestamp(googleEventTimeData?.start) || 0,
    end: googleDatetimeToTimestamp(googleEventTimeData?.end) || 0,
    allday: googleEventTimeData?.start?.date ? true : false,
    // TODO: check as well for recurrence[] and sequence, both could indicate a recurrency
    occurrence: googleEventTimeData.recurringEventId ? "recurring" : "once",
    "series.id": googleEventTimeData.recurringEventId
      ? getUuidByString(googleEventTimeData.recurringEventId) || ""
      : "",
  };

  try {
    IndexedEventTimeDataSchema.parse(indexedEventTimeData);
  } catch (error) {
    log.error(
      { error, event: { data: { indexedEventTimeData } } },
      "Error while parsing event time data."
    );
    throw new Error("Error while parsing event time data.");
  }
  return indexedEventTimeData;
};
