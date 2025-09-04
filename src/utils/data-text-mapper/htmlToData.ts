import { cleanSpaces } from "./helpers/cleanSpaces";
import { imageFromText } from "./helpers/imageFromText";
import { scopesFromText } from "./helpers/scopesFromText";
import { tagsFromText } from "./helpers/tagsFromText";
import { urlFromText } from "./helpers/urlFromText";
import { TextWithData } from "./types";

const htmlToData = (text: string): TextWithData | null => {
  let description: string = text;

  // strip link tag from description
  description = description.replace(
    new RegExp('(<p class="link">.*</p>)', "gi"),
    ""
  );

  // strip taxonomy tag from description
  description = description.replace(
    new RegExp('(<p class="taxonomy">.*</p>)', "gi"),
    ""
  );

  // strip image tag from description
  description = description.replace(new RegExp("(<img .*/>)", "gi"), "");

  // strip html from description if wrapped in known tag
  if (description.match('<p class="p-description">.*</p>'))
    description = description
      .replace('<p class="p-description">', "")
      .replace("</p>", "");

  // final cleanup of the description
  description = cleanSpaces(description);

  const textWithData: TextWithData = {
    description: description,
    url: urlFromText(text) || undefined,
    tags: tagsFromText(text) || undefined,
    scopes: scopesFromText(text) || undefined,
    image: imageFromText(text) || undefined,
  };

  return textWithData;
};

export { htmlToData };
