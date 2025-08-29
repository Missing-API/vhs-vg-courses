import { describe, expect, test } from "vitest";

import { isGoogleEvent } from "./isGoogleEvent";

describe("isGoogleEvent", () => {
  test("should return true for valid Google event", () => {
    const validEvent = {
      id: "123",

      start: { dateTime: "2023-01-01T10:00:00Z" },
    };
    expect(isGoogleEvent(validEvent)).toBeTruthy();
  });

  test("should return false when missing required properties", () => {
    const missingId = {
      start: { dateTime: "2023-01-01T10:00:00Z" },
    };

    const missingStart = {
      id: "123",
    };

    expect(isGoogleEvent(missingId)).toBeFalsy();
    expect(isGoogleEvent(missingStart)).toBeFalsy();
  });

  test("should return false for invalid inputs", () => {
    expect(isGoogleEvent({} as object)).toBeFalsy();
    expect(isGoogleEvent(null as unknown as object)).toBeFalsy();
    expect(isGoogleEvent(undefined as unknown as object)).toBeFalsy();
  });
});
