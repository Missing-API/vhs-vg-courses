import { describe, expect, test } from "vitest";

import {
  GoogleDatetimeObject,
  googleDatetimeObjectToTimestamp,
} from "./googleDatetimeObjectToTimestamp";

describe("should convert a google event DATETIME OBJECT into a utc timestamp", () => {
  test("timestamp and local datetime for .000Z", () => {
    const datetime: GoogleDatetimeObject = {
      dateTime: "2023-03-21T08:30:00+01:00",
      timeZone: "Europe/Berlin",
    };
    const timestamp: number | null = googleDatetimeObjectToTimestamp(datetime);
    expect(timestamp).toBe(1679383800000);

    const utcDateString: string = new Date(timestamp).toUTCString();
    expect(utcDateString).toBe("Tue, 21 Mar 2023 07:30:00 GMT"); // utc time

    const isoDateString: string = new Date(timestamp).toISOString();
    expect(isoDateString).toBe("2023-03-21T07:30:00.000Z"); // utc time

    const localDateString: string = new Date(timestamp).toLocaleString(
      "de-DE",
      {
        timeZone: "Europe/Berlin",
        dateStyle: "long",
        timeStyle: "long",
      }
    );
    expect(localDateString).toBe("21. März 2023 um 08:30:00 MEZ"); // german local time
  });
});
