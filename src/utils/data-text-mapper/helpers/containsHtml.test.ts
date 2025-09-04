import { describe, expect, test } from "vitest";

import { containsHtml } from "./containsHtml";

describe("tests if any html is included in a string", () => {
  test("returns true if some html tag found", () => {
    const text: string = "<p>Lorem</p>";
    expect(containsHtml(text)).toBeTruthy();
  });

  test("returns true if some closing html tag found", () => {
    const text: string = "Lorem <br/> Ipsum";
    expect(containsHtml(text)).toBeTruthy();
  });

  test("returns false if no html found", () => {
    const text: string = "Lorem Ipsum";
    expect(containsHtml(text)).toBeFalsy();
  });
});
