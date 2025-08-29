import { cleanSpaces } from "./helpers/cleanSpaces";
import { containsHtml } from "./helpers/containsHtml";
import { TextWithData } from "./types";

const dataToHtml = (data: TextWithData): string => {
  let descriptionLine: string = cleanSpaces(data.description);
  if (!containsHtml(descriptionLine)) {
    descriptionLine = `<p class="p-description">${descriptionLine}</p>`;
  }

  const imageLine: string | null = data.image
    ? `<img class="u-photo" src="${data.image}" />`
    : null;

  const urlLine: string | null = data.url
    ? `<p class="link"><a class="u-url" href="${data.url}">${data.url}</a></p>`
    : null;

  const tags: string | null =
    data.tags
      ?.map((tag: string) => `<span class="p-category">#${tag}</span>`)
      .join(" ") || null;

  const scopes: string | null =
    data.scopes
      ?.map((scope: string) => `<span class="p-scope">@${scope}</span>`)
      .join(" ") || null;

  const tagScopeLine: string | null =
    tags || scopes
      ? '<p class="taxonomy">' +
        [tags, scopes].filter((item) => item !== null).join(" ") +
        "</p>"
      : null;

  return [descriptionLine, imageLine, urlLine, tagScopeLine]
    .filter((line) => line !== null)
    .join("\n");
};

export { dataToHtml };
