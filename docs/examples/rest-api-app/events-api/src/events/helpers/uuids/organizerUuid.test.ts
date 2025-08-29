import { describe, expect, test } from "vitest";

import { PostEventRequestBody } from "../../events.types";
import { organizerUuid } from "./organizerUuid";

describe("should generate a stable organizer uuid based on a google event", () => {
  test("return uuid", () => {
    const googleEvent: PostEventRequestBody = {
      creator: {
        id: "123",
        email: "cal123@google.com",
        displayName: "Cal 123",
      },
    };
    const uuid: string | null = organizerUuid(googleEvent);
    expect(uuid).toBe("40bd0015-6308-5fc3-9165-329ea1ff5c5e");
  });

  test("return uuid while display name is missing", () => {
    const googleEvent: PostEventRequestBody = {
      creator: {
        id: "123",
        email: "cal123@google.com",
      },
    };
    const uuid: string | null = organizerUuid(googleEvent);
    expect(uuid).toBe("40bd0015-6308-5fc3-9165-329ea1ff5c5e");
  });

  test("return uuid while email is missing", () => {
    const googleEvent: PostEventRequestBody = {
      creator: {
        id: "123",
      },
    };
    const uuid: string | null = organizerUuid(googleEvent);
    expect(uuid).toBe("40bd0015-6308-5fc3-9165-329ea1ff5c5e");
  });

  test("return uuid while id is missing", () => {
    const googleEvent: PostEventRequestBody = {
      creator: {
        email: "cal123@google.com",
      },
    };
    const uuid: string | null = organizerUuid(googleEvent);
    expect(uuid).toBe("b7848feb-2fe8-5ddf-8f11-30b70f93c1df");
  });

  test("throw error if creator is missing", () => {
    const googleEvent: PostEventRequestBody = {};
    expect(() => {
      organizerUuid(googleEvent);
    }).toThrow();
  });
});
