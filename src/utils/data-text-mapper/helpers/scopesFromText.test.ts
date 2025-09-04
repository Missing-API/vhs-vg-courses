import { describe, expect, test } from "vitest";

import { removeScopesFromText, scopesFromText } from "./scopesFromText";

describe("should return scopes by @ from plain text", () => {
  test("returns single scope", () => {
    const text: string = "Lorem @scope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["scope"]);
  });

  test("returns several scopes", () => {
    const text: string = "Lorem @One Ipsum @Two Lorem @Three Ipsum";
    expect(scopesFromText(text)).toHaveLength(3);
    expect(scopesFromText(text)).toEqual(["One", "Two", "Three"]);
  });

  test("returns camel case scope", () => {
    const text: string = "Lorem @Somescope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["Somescope"]);
  });

  test("returns lower case scope", () => {
    const text: string = "Lorem @scope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["scope"]);
  });

  test("returns upper case scope", () => {
    const text: string = "Lorem @scope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["scope"]);
  });

  test("returns minus-separated scope", () => {
    const text: string = "Lorem @some-scope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["some-scope"]);
  });

  test("returns underscore-separated scope", () => {
    const text: string = "Lorem @some_scope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["some_scope"]);
  });

  test("returns scope at beginning of the text", () => {
    const text: string = "@scope Ipsum";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["scope"]);
  });

  test("returns scope at end of the text", () => {
    const text: string = "Ipsum @scope";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["scope"]);
  });

  test("returns scope if it's the only content", () => {
    const text: string = "@scope";
    expect(scopesFromText(text)).toHaveLength(1);
    expect(scopesFromText(text)).toEqual(["scope"]);
  });

  test("returns null if no scopes found", () => {
    const text: string = "Lorem Ipsum";
    expect(scopesFromText(text)).toBeNull();
  });
});

describe("should remove scopes by @ from plain text", () => {
  test("returns string with stripped scopes", () => {
    const text: string = "Lorem @One Ipsum @Two Lorem @Three Ipsum @Four";
    expect(removeScopesFromText(text)).toBe("Lorem Ipsum Lorem Ipsum");
  });
});
