import { describe, expect, test } from "vitest";

import { isCancelledEvent } from "./isCancelledEvent";

describe("isCancelledEvent", () => {
  test("should return true for valid cancelled event", () => {
    const validCancelledEvent = {
      id: "123",
      status: "cancelled",
      updated: "2023-01-01T10:00:00Z",
    };
    expect(isCancelledEvent(validCancelledEvent)).toBeTruthy();
  });

  test("should return false when missing required properties", () => {
    const missingId = {
      status: "cancelled",
      updated: "2023-01-01T10:00:00Z",
    };
    const missingStatus = {
      id: "123",
      updated: "2023-01-01T10:00:00Z",
    };
    const missingUpdated = {
      id: "123",
      status: "cancelled",
    };

    expect(isCancelledEvent(missingId)).toBeFalsy();

    expect(isCancelledEvent(missingStatus)).toBeFalsy();
    expect(isCancelledEvent(missingUpdated)).toBeFalsy();
  });

  test("should return false when required values are incorrect", () => {
    const wrongStatus = {
      id: "123",
      status: "confirmed",
      updated: "2023-01-01T10:00:00Z",
    };

    expect(isCancelledEvent(wrongStatus)).toBeFalsy();
  });

  test("should return false for empty object", () => {
    expect(isCancelledEvent({})).toBeFalsy();
  });
});
