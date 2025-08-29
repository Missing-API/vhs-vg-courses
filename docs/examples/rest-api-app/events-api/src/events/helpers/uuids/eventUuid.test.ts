import { describe, expect, test } from "vitest";

import { PostEventRequestBody } from "../../events.types";
import { eventUuid } from "./eventUuid";

describe("should generate a stable event uuid based on a google event", () => {
  test("return uuid", () => {
    const googleEvent: PostEventRequestBody = {
      iCalUID: "ical123",
      id: "google123",
    };
    const uuid: string | null = eventUuid(googleEvent);
    expect(uuid).toBe("9691928f-8ee0-5983-98fe-1eb51106a784");
  });

  test("return uuid while icaluid is missing", () => {
    const googleEvent: PostEventRequestBody = {
      id: "google123",
    };
    const uuid: string | null = eventUuid(googleEvent);
    expect(uuid).toBe("e279e023-60fc-533d-b0db-6c32c23454bb");
  });

  test("return uuid while id is missing", () => {
    const googleEvent: PostEventRequestBody = {
      iCalUID: "ical123",
    };
    const uuid: string | null = eventUuid(googleEvent);
    expect(uuid).toBe("7cb4280e-100a-5539-8032-334631d79157");
  });

  test("throw error if icaluid and id are missing", () => {
    const googleEvent: PostEventRequestBody = {};
    expect(() => {
      eventUuid(googleEvent);
    }).toThrow();
  });
});
