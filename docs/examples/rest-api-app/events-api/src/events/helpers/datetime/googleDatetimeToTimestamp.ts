import { googleDateObjectToTimestamp } from "./googleDateObjectToTimestamp";
import { googleDatetimeObjectToTimestamp } from "./googleDatetimeObjectToTimestamp";
import { googleDatetimeStringToTimestamp } from "./googleDatetimeStringToTimestamp";
import { calendar_v3 } from "@googleapis/calendar";
import Schema$EventDateTime = calendar_v3.Schema$EventDateTime;

export const googleDatetimeToTimestamp = (
  datetime?: Schema$EventDateTime | string | null
): number | null => {
  if (!datetime) return null;

  if (typeof datetime === "string") {
    return googleDatetimeStringToTimestamp({ dateTime: datetime as string });
  } else if (datetime.hasOwnProperty("date")) {
    return googleDateObjectToTimestamp({ date: datetime.date as string });
  } else if (
    datetime.hasOwnProperty("dateTime") &&
    datetime.hasOwnProperty("timeZone")
  ) {
    return googleDatetimeObjectToTimestamp({
      dateTime: datetime.dateTime as string,
      timeZone: datetime.timeZone as string,
    });
  } else if (datetime.hasOwnProperty("dateTime")) {
    return googleDatetimeStringToTimestamp({
      dateTime: datetime.dateTime as string,
    });
  }
  return null;
};
