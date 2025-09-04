import { describe, expect, test } from "vitest";

import {
  prefixedStringsFromText,
  removePrefixedStringsFromText,
} from "./prefixedStringsFromText";

describe("should return strings prefixed by a character from plain text", () => {
  test("returns single string", () => {
    const text: string = "Lorem #string Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns several string", () => {
    const text: string = "Lorem #One Ipsum #Two Lorem #Three Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(3);
    expect(prefixedStringsFromText(text, "#")).toEqual(["One", "Two", "Three"]);
  });

  test("returns camel case string", () => {
    const text: string = "Lorem #Somestring Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["Somestring"]);
  });

  test("returns lower case string", () => {
    const text: string = "Lorem #string Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns upper case string", () => {
    const text: string = "Lorem #string Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns minus-separated string", () => {
    const text: string = "Lorem #some-string Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["some-string"]);
  });

  test("returns underscore-separated string", () => {
    const text: string = "Lorem #some_string Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["some_string"]);
  });

  test("returns string at beginning of the text", () => {
    const text: string = "#string Ipsum";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns string at end of the text", () => {
    const text: string = "Ipsum #string";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns string wrapped in some html", () => {
    const text: string = "Ipsum <span>#string</span>";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns string if it's the only content", () => {
    const text: string = "#string";
    expect(prefixedStringsFromText(text, "#")).toHaveLength(1);
    expect(prefixedStringsFromText(text, "#")).toEqual(["string"]);
  });

  test("returns null if no string found", () => {
    const text: string = "Lorem Ipsum";
    expect(prefixedStringsFromText(text, "#")).toBeNull();
  });
});

describe("should remove string by # from plain text", () => {
  test("returns string with stripped string", () => {
    const text: string = "Lorem #One Ipsum #Two Lorem #Three Ipsum #Four";
    expect(removePrefixedStringsFromText(text, "#")).toBe(
      "Lorem Ipsum Lorem Ipsum"
    );
  });
});
