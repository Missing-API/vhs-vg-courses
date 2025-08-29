import { cleanSpaces } from "./helpers/cleanSpaces";
import { TextWithData } from "./types";

const dataToText = (data: TextWithData): string => {
  let text: string = cleanSpaces(data.description);

  const image: string | null = data.image || null;

  const url: string | null = data.url || null;

  const tags: string | null =
    data.tags?.map((tag: string) => "#" + tag).join(" ") || null;

  const scopes: string | null =
    data.scopes?.map((scope: string) => "@" + scope).join(" ") || null;

  const tagScopeLine: string | null =
    tags || scopes ? [tags, scopes].filter(Boolean).join(" ") : null;

  return [text, image, url, tagScopeLine]
    .filter((line) => line !== null)
    .join("\n\n");
};

export { dataToText };
