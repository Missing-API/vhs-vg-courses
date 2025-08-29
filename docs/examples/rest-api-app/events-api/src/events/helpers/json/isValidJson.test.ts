import { describe, expect, test } from "vitest";

import { isValidJson } from "./isValidJson";

describe("should check any input if it is a valid json object", () => {
  test("return true for a json object", () => {
    expect(isValidJson({ hello: "Jan" })).toBeTruthy();
    expect(isValidJson({ "hello?123": "Jan" })).toBeTruthy();
  });
  test("return false for a string which might contain json", () => {
    expect(isValidJson('{ "hello": "Jan" }')).toBeFalsy();
  });
  test("return false for an empty json object", () => {
    expect(isValidJson({})).toBeFalsy();
  });
  test("return false for null", () => {
    expect(isValidJson(null)).toBeFalsy();
  });
  test("return false for undefined", () => {
    expect(isValidJson(undefined)).toBeFalsy();
  });
  test("return false for a string", () => {
    expect(isValidJson("test")).toBeFalsy();
  });
  test("return false for a number", () => {
    expect(isValidJson(123)).toBeFalsy();
  });
});
