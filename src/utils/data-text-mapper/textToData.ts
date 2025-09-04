import { cleanSpaces } from "./helpers/cleanSpaces";
import { imageFromText } from "./helpers/imageFromText";
import { removeScopesFromText, scopesFromText } from "./helpers/scopesFromText";
import { removeTagsFromText, tagsFromText } from "./helpers/tagsFromText";
import { removeUrlFromText, urlFromText } from "./helpers/urlFromText";
import { TextWithData } from "./types";

const textToData = (text: string): TextWithData | null => {
  const description: string = cleanSpaces(
    removeScopesFromText(removeTagsFromText(removeUrlFromText(text)))
  );
  const textWithData: TextWithData = {
    description: description,
    url: urlFromText(text) || undefined,
    image: imageFromText(text) || undefined,
    tags: tagsFromText(text) || undefined,
    scopes: scopesFromText(text) || undefined,
  };

  return textWithData;
};

export { textToData };
