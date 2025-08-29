import { describe, expect, test } from "vitest";

import { PostEventRequestBody } from "../../events.types";
import { calendarUuid } from "./calendarUuid";

describe("should generate a stable calendar uuid based on a google event", () => {
  test("return uuid", () => {
    const googleEvent: PostEventRequestBody = {
      organizer: {
        id: "123",
        email: "cal123@google.com",
        displayName: "Cal 123",
      },
    };
    const uuid: string | null = calendarUuid(googleEvent);
    expect(uuid).toBe("40bd0015-6308-5fc3-9165-329ea1ff5c5e");
  });

  test("return uuid while display name is missing", () => {
    const googleEvent: PostEventRequestBody = {
      organizer: {
        id: "123",
        email: "cal123@google.com",
      },
    };
    const uuid: string | null = calendarUuid(googleEvent);
    expect(uuid).toBe("40bd0015-6308-5fc3-9165-329ea1ff5c5e");
  });

  test("return uuid while email is missing", () => {
    const googleEvent: PostEventRequestBody = {
      organizer: {
        id: "123",
      },
    };
    const uuid: string | null = calendarUuid(googleEvent);
    expect(uuid).toBe("40bd0015-6308-5fc3-9165-329ea1ff5c5e");
  });

  test("return uuid while id is missing", () => {
    const googleEvent: PostEventRequestBody = {
      organizer: {
        email: "cal123@google.com",
      },
    };
    const uuid: string | null = calendarUuid(googleEvent);
    expect(uuid).toBe("b7848feb-2fe8-5ddf-8f11-30b70f93c1df");
  });

  test("throw error if organizer is missing", () => {
    const googleEvent: PostEventRequestBody = {};
    expect(() => {
      calendarUuid(googleEvent);
    }).toThrow();
  });
});
