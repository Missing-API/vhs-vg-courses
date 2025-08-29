import { describe, expect, test } from "vitest";

import { calendar_v3 } from "@googleapis/calendar";
import Schema$Event = calendar_v3.Schema$Event;
import { isValidGoogleEvent } from "./isValidGoogleEvent";

describe("isValidGoogleEvent", () => {
  test("should return true for valid events with date", () => {
    const event: Schema$Event = {
      id: "123",
      kind: "calendar#event",
      summary: "test",
      start: { date: "today" },
      location: "some address",
    };
    expect(isValidGoogleEvent(event)).toBeTruthy();
  });

  test("should return true for valid events with dateTime", () => {
    const event: Schema$Event = {
      id: "123",
      kind: "calendar#event",
      summary: "test",
      start: { dateTime: "today" },
      location: "some address",
    };
    expect(isValidGoogleEvent(event)).toBeTruthy();
  });

  test("should return false for missing required attributes", () => {
    const event: Schema$Event = { etag: "world" };
    expect(isValidGoogleEvent(event)).toBeFalsy();
  });

  // TODO: add empty field checks
  // test("should return false for empty required fields", () => {
  //   const event: Schema$Event = {
  //     id: "123",
  //     kind: "calendar#event",
  //     summary: "",
  //     start: { date: "today" },
  //     location: "",
  //   };
  //   expect(isValidGoogleEvent(event)).toBeFalsy();
  // });
});
