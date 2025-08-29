import { describe, expect, test } from "vitest";

import {
  GoogleDateObject,
  googleDateObjectToTimestamp,
} from "./googleDateObjectToTimestamp";

describe("should convert a google event DATE string into a utc timestamp", () => {
  test("timestamp and local date", () => {
    const datetime: GoogleDateObject = { date: "2023-03-29" };
    const timestamp: number | null = googleDateObjectToTimestamp(datetime);
    expect(timestamp).toBe(1680058800000);

    const utcDateString: string = new Date(timestamp).toUTCString();
    expect(utcDateString).toBe("Wed, 29 Mar 2023 03:00:00 GMT"); // utc time

    const isoDateString: string = new Date(timestamp).toISOString();
    expect(isoDateString).toBe("2023-03-29T03:00:00.000Z"); // utc time

    const localDateString: string = new Date(timestamp).toLocaleDateString(
      "de-DE",
      {
        dateStyle: "long",
      }
    );
    expect(localDateString).toBe("29. März 2023"); // german local time
  });
});
