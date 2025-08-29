import { describe, it, expect, vi } from "vitest";
import { googleDatetimeToTimestamp } from "./googleDatetimeToTimestamp";
import * as dateObjectModule from "./googleDateObjectToTimestamp";
import * as datetimeObjectModule from "./googleDatetimeObjectToTimestamp";
import * as datetimeStringModule from "./googleDatetimeStringToTimestamp";

describe("googleDatetimeToTimestamp", () => {
  describe("should use the correct convert function dependent on the incoming type", () => {
    it("use googleDateObjectToTimestamp for date string", async () => {
      const spy = vi.spyOn(dateObjectModule, "googleDateObjectToTimestamp");
      googleDatetimeToTimestamp({
        date: "2023-03-29",
      });
      expect(spy).toHaveBeenCalled();
    });

    it("use googleDatetimeObjectToTimestamp for datetime object", () => {
      const spy = vi.spyOn(
        datetimeObjectModule,
        "googleDatetimeObjectToTimestamp"
      );
      googleDatetimeToTimestamp({
        dateTime: "2023-03-25T14:00:00+01:00",
        timeZone: "Europe/Berlin",
      });
      expect(spy).toHaveBeenCalled();
    });

    it("use googleDatetimeStringToTimestamp for datetime string", () => {
      const spy = vi.spyOn(
        datetimeStringModule,
        "googleDatetimeStringToTimestamp"
      );
      googleDatetimeToTimestamp({ dateTime: "2023-03-24T07:01:51.045Z" });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("should return null for broken incoming type", () => {
    it("return null for missing property", async () => {
      const timestamp = googleDatetimeToTimestamp({
        timeZone: "Europe/Berlin",
      });
      expect(timestamp).toBeNull();
    });
  });
});
