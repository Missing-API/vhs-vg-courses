import {
  cleanSpaces,
  htmlToData,
  textToData,
  TextWithData,
} from ".";
import { containsHtml } from "./helpers/containsHtml";
import { isDataHtml } from "./helpers/isDataHtml";

export const unknownToData = (body: string): TextWithData => {
  // extract tags from body
  let textWithData: TextWithData | null;
  if (isDataHtml(body)) {
    textWithData = htmlToData(body);
  } else if (containsHtml(body)) {
    textWithData = {
      ...textToData(body),
      description: cleanSpaces(body),
    };
  } else {
    textWithData = textToData(body);
  }

  const result = {
    description:
      textWithData && textWithData.description
        ? textWithData.description
        : body, // fallback to initial body
    url: textWithData && textWithData.url ? textWithData.url : "",
    tags: textWithData && textWithData.tags ? textWithData.tags : [],
    scopes: textWithData && textWithData.scopes ? textWithData.scopes : [],
    image: textWithData && textWithData.image ? textWithData.image : "",
  };

  return result;
};
