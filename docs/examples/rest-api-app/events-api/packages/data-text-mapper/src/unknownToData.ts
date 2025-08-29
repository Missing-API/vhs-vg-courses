import {
  cleanSpaces,
  htmlToData,
  textToData,
  TextWithData,
} from "../../../packages/data-text-mapper/src";
import { containsHtml } from "../../../packages/data-text-mapper/src/helpers/containsHtml";
import { isDataHtml } from "./helpers/isDataHtml";
import { getLogger } from "../../../src/logging/logger";

const log = getLogger("data-text-mapper.unknownToData");

export const unknownToData = (body: string): TextWithData => {
  log.trace(
    {
      query: {
        body: body?.substring(0, 100) + (body?.length > 100 ? "..." : ""), // Truncate long content for logging
        bodyLength: body?.length || 0,
      },
    },
    "unknownToData called"
  );

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

  log.debug(
    {
      data: {
        hasDescription: !!result.description,
        hasUrl: !!result.url,
        tagsCount: result.tags.length,
        scopesCount: result.scopes.length,
        hasImage: !!result.image,
        processingPath: isDataHtml(body)
          ? "dataHtml"
          : containsHtml(body)
            ? "html"
            : "text",
      },
    },
    "unknownToData completed successfully"
  );

  return result;
};
