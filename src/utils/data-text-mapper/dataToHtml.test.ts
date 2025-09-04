import { describe, expect, test } from "vitest";

import { dataToHtml } from "./dataToHtml";
import { htmlToData } from "./htmlToData";
import { TextWithData } from "./types";

describe("should wrap data in basic html", () => {
  test("returns paragraph with attached url as link", () => {
    const data: TextWithData = {
      description: "Lorem Ipsum",
      url: "https://www.domain.com/",
    };
    expect(dataToHtml(data)).toBe(
      '<p class="p-description">Lorem Ipsum</p>\n<p class="link"><a class="u-url" href="https://www.domain.com/">https://www.domain.com/</a></p>'
    );
  });

  test("returns html as it is with attached url as link", () => {
    const data: TextWithData = {
      description: "<div><p>Lorem <strong>Ipsum</strong></p></div>",
      url: "https://www.domain.com/",
    };
    expect(dataToHtml(data)).toBe(
      '<div><p>Lorem <strong>Ipsum</strong></p></div>\n<p class="link"><a class="u-url" href="https://www.domain.com/">https://www.domain.com/</a></p>'
    );
  });

  test("returns paragraph with tags in a separate line", () => {
    const data: TextWithData = {
      description: "Lorem Ipsum",
      tags: ["One", "Two", "Three"],
    };
    expect(dataToHtml(data)).toBe(
      '<p class="p-description">Lorem Ipsum</p>\n<p class="taxonomy"><span class="p-category">#One</span> <span class="p-category">#Two</span> <span class="p-category">#Three</span></p>'
    );
  });

  test("returns paragraph with scopes in a separate line", () => {
    const data: TextWithData = {
      description: "Lorem Ipsum",
      scopes: ["One", "Two", "Three"],
    };
    expect(dataToHtml(data)).toBe(
      '<p class="p-description">Lorem Ipsum</p>\n<p class="taxonomy"><span class="p-scope">@One</span> <span class="p-scope">@Two</span> <span class="p-scope">@Three</span></p>'
    );
  });

  test("returns paragraph with image included", () => {
    const data: TextWithData = {
      description: "Lorem Ipsum",
      scopes: ["One", "Two", "Three"],
      image: "https://www.domain.com/image.png",
    };
    expect(dataToHtml(data)).toBe(
      '<p class="p-description">Lorem Ipsum</p>\n<img class="u-photo" src="https://www.domain.com/image.png" />\n<p class="taxonomy"><span class="p-scope">@One</span> <span class="p-scope">@Two</span> <span class="p-scope">@Three</span></p>'
    );
  });

  test("returns paragraph with tags and scopes in one separate line", () => {
    const data: TextWithData = {
      description: "Lorem Ipsum",
      tags: ["One", "Two"],
      scopes: ["Three", "Four"],
    };
    expect(dataToHtml(data)).toBe(
      '<p class="p-description">Lorem Ipsum</p>\n<p class="taxonomy"><span class="p-category">#One</span> <span class="p-category">#Two</span> <span class="p-scope">@Three</span> <span class="p-scope">@Four</span></p>'
    );
  });

  test("returns paragraph with url, tags, scopes, and image attached", () => {
    const data: TextWithData = {
      description: "Lorem Ipsum",
      url: "https://www.domain.com/",
      tags: ["One", "Two"],
      scopes: ["Three", "Four"],
      image: "https://www.domain.com/image.png",
    };
    expect(dataToHtml(data)).toBe(
      '<p class="p-description">Lorem Ipsum</p>\n<img class="u-photo" src="https://www.domain.com/image.png" />\n<p class="link"><a class="u-url" href="https://www.domain.com/">https://www.domain.com/</a></p>\n<p class="taxonomy"><span class="p-category">#One</span> <span class="p-category">#Two</span> <span class="p-scope">@Three</span> <span class="p-scope">@Four</span></p>'
    );
  });
});

describe("should keep data after roundtrip transformation", () => {
  test("returns same object", () => {
    const original: TextWithData = {
      description: "Lorem Ipsum",
      url: "https://www.domain.com/",
      tags: ["One", "Two", "Three"],
      scopes: ["One", "Two", "Three"],
      image: "https://www.domain.com/image.png",
    };
    const transformed: TextWithData | null = htmlToData(dataToHtml(original));
    expect(transformed).toEqual(original);
  });
});
