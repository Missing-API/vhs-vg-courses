import { describe, expect, test } from "vitest";

import {
  GoogleDatetimeString,
  googleDatetimeStringToTimestamp,
} from "./googleDatetimeStringToTimestamp";

describe("should convert a google event DATETIME STRING into a utc timestamp", () => {
  test("timestamp and local datetime for .000Z", () => {
    const datetime: GoogleDatetimeString = {
      dateTime: "2023-03-24T07:05:14.000Z",
    };
    const timestamp: number | null = googleDatetimeStringToTimestamp(datetime);
    expect(timestamp).toBe(1679641514000);

    const utcDateString: string = new Date(timestamp).toUTCString();
    expect(utcDateString).toBe("Fri, 24 Mar 2023 07:05:14 GMT"); // utc time

    const isoDateString: string = new Date(timestamp).toISOString();
    expect(isoDateString).toBe("2023-03-24T07:05:14.000Z"); // utc time

    const localDateString: string = new Date(timestamp).toLocaleString(
      "de-DE",
      {
        timeZone: "Europe/Berlin",
        dateStyle: "long",
        timeStyle: "long",
      }
    );
    expect(localDateString).toBe("24. März 2023 um 08:05:14 MEZ"); // german local time
  });

  test("timestamp and local datetime with milliseconds .570Z", () => {
    const datetime: GoogleDatetimeString = {
      dateTime: "2023-03-24T07:05:14.570Z",
    };
    const timestamp: number | null = googleDatetimeStringToTimestamp(datetime);
    expect(timestamp).toBe(1679641514570);

    const utcDateString: string = new Date(timestamp).toUTCString();
    expect(utcDateString).toBe("Fri, 24 Mar 2023 07:05:14 GMT"); // utc time

    const isoDateString: string = new Date(timestamp).toISOString();
    expect(isoDateString).toBe("2023-03-24T07:05:14.570Z"); // utc time

    const localDateString: string = new Date(timestamp).toLocaleString(
      "de-DE",
      {
        timeZone: "Europe/Berlin",
        dateStyle: "long",
        timeStyle: "long",
      }
    );
    expect(localDateString).toBe("24. März 2023 um 08:05:14 MEZ"); // german local time
  });
});
