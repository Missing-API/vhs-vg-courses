import { describe, expect, test } from "vitest";

import { PostEventRequestBody } from "../../events.types";
import { recurringEventUuid } from "./recurringEventUuid";

describe("should generate a stable recurring event uuid based on a google event", () => {
  test("return uuid", () => {
    const googleEvent: PostEventRequestBody = {
      recurringEventId: "rec123",
    };
    const uuid: string | null = recurringEventUuid(googleEvent);
    expect(uuid).toBe("aa979053-75e4-5969-9050-579dce8b0ab2");
  });

  test("return null if recurringEventId is missing", () => {
    const googleEvent: PostEventRequestBody = {};
    const uuid: string | null = recurringEventUuid(googleEvent);
    expect(uuid).toBeNull();
  });
});
