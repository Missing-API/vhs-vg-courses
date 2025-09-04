import { describe, expect, test } from "vitest";

import { removeUrlFromText, urlFromText } from "./urlFromText";

describe("should return a valid url from a plain text", () => {
  test("returns simple url", () => {
    const text: string = "Lorem https://www.domain.com/ Ipsum";
    expect(urlFromText(text)).toBe("https://www.domain.com/");
  });
  test("returns simple url without slash", () => {
    const text: string = "Lorem https://www.domain.com Ipsum";
    expect(urlFromText(text)).toBe("https://www.domain.com");
  });

  test("returns url with path", () => {
    const text: string = "Lorem https://www.domain.com/path/ Ipsum";
    const url: string | null = urlFromText(text);
    expect(urlFromText(text)).toBe("https://www.domain.com/path/");
  });

  test("returns url with parameters", () => {
    const text: string = "Lorem https://www.domain.com/path/param=value Ipsum";
    const url: string | null = urlFromText(text);
    expect(urlFromText(text)).toBe("https://www.domain.com/path/param=value");
  });

  test("returns first url if multiple urls are includes", () => {
    const text: string =
      "Lorem https://www.first.de/ Ipsum https://www.second.de/ Lorem";
    const url: string | null = urlFromText(text);
    expect(url).toBe("https://www.first.de/");
  });

  test("returns null if image url", () => {
    const text: string = "Lorem https://www.first.de/hello.png Ipsum";
    const url: string | null = urlFromText(text);
    expect(url).toBeNull();
  });

  test("returns proper url if multiple urls including image urls are includes", () => {
    const text: string =
      "Lorem https://www.first.de/hello.jpg Ipsum https://www.second.de/ Lorem";
    const url: string | null = urlFromText(text);
    expect(url).toBe("https://www.second.de/");
  });

  test("returns null if no url is included", () => {
    const text: string = "Lorem Ipsum";
    const url: string | null = urlFromText(text);
    expect(url).toBeNull();
  });
});

describe("should remove url from plain text", () => {
  test("returns string with stripped url", () => {
    const text: string = "Lorem https://www.domain.com/path/param=value Ipsum";
    expect(removeUrlFromText(text)).toBe("Lorem  Ipsum");
  });
  // TODO: Think about how to handle multiple urls
  // TODO: Think about how to handle double spaces cause by url removal
});
