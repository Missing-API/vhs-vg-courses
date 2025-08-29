import { describe, expect, test } from "vitest";
import { cleanCharset } from "./cleanCharset";

describe("cleanCharset", () => {
  test("should remove line separator characters from a string", () => {
    const input = "Hello\u2028World\u2029!";
    const expected = "HelloWorld!";
    expect(cleanCharset(input)).toBe(expected);
  });

  test("should handle empty string", () => {
    expect(cleanCharset("")).toBe("");
  });

  test("should handle null or undefined inputs", () => {
    // @ts-expect-error: Testing with null
    expect(cleanCharset(null)).toBe("");
    // @ts-expect-error: Testing with undefined
    expect(cleanCharset(undefined)).toBe("");
  });

  test("should not modify strings without line separator characters", () => {
    const input = "Hello World!";
    expect(cleanCharset(input)).toBe(input);
  });

  test("should remove multiple line separator characters", () => {
    const input = "Hello\u2028\u2029World\u2028\u2029!";
    const expected = "HelloWorld!";
    expect(cleanCharset(input)).toBe(expected);
  });
});
