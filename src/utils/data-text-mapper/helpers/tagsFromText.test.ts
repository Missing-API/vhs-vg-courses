import { describe, expect, test } from "vitest";

import { removeTagsFromText, tagsFromText } from "./tagsFromText";

describe("should return tags by # from plain text", () => {
  test("returns single tag", () => {
    const text: string = "Lorem #Tag Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["Tag"]);
  });

  test("returns several tags", () => {
    const text: string = "Lorem #One Ipsum #Two Lorem #Three Ipsum";
    expect(tagsFromText(text)).toHaveLength(3);
    expect(tagsFromText(text)).toEqual(["One", "Two", "Three"]);
  });

  // several tags if </hr> is somewhre in between
  test("returns several tags if </hr> is somewhere in between", () => {
    const text: string = "Lorem #One Ipsum </hr>#Two Lorem #Three Ipsum";
    expect(tagsFromText(text)).toHaveLength(3);
    expect(tagsFromText(text)).toEqual(["One", "Two", "Three"]);
  });

  test("returns camel case tag", () => {
    const text: string = "Lorem #SomeTag Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["SomeTag"]);
  });

  test("returns lower case tag", () => {
    const text: string = "Lorem #tag Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["tag"]);
  });

  test("returns upper case tag", () => {
    const text: string = "Lorem #TAG Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["TAG"]);
  });

  test("returns minus-separated tag", () => {
    const text: string = "Lorem #some-tag Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["some-tag"]);
  });

  test("returns underscore-separated tag", () => {
    const text: string = "Lorem #some_tag Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["some_tag"]);
  });

  test("returns tag at beginning of the text", () => {
    const text: string = "#tag Ipsum";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["tag"]);
  });

  test("returns tag at end of the text", () => {
    const text: string = "Ipsum #tag";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["tag"]);
  });

  test("returns tag if it's the only content", () => {
    const text: string = "#tag";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["tag"]);
  });

  test("returns tag if it's followed by </br>", () => {
    const text: string = "#tag</br>";
    expect(tagsFromText(text)).toHaveLength(1);
    expect(tagsFromText(text)).toEqual(["tag"]);
  });

  test("returns null if no tags found", () => {
    const text: string = "Lorem Ipsum";
    expect(tagsFromText(text)).toBeNull();
  });
});

describe("should remove tags by # from plain text", () => {
  test("returns string with stripped tags", () => {
    const text: string = "Lorem #One Ipsum #Two Lorem #Three Ipsum #Four";
    expect(removeTagsFromText(text)).toBe("Lorem Ipsum Lorem Ipsum");
  });
});
