import { getLogger } from "../../logging/logger";

import { getTranslationApiConfig } from "./helpers/config";
// import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { TranslatedContents } from "./translation.types";
import { ClientTranslation } from "@/src/logging/loggerApps.config";

export const translateContent = async (
  title: string,
  body: string
): Promise<TranslatedContents | null> => {
  // "use cache";
  // cacheLife("translation");

  const log = getLogger(ClientTranslation.translate);

  // check incoming data
  if (!title || title.length === 0) {
    log.error("no title given");
    return null;
  }

  const config = getTranslationApiConfig();
  if (!config.host || !config.token) {
    log.error("Translation API configuration is missing");
    return null;
  }

  // Create URL safely
  const baseUrl = new URL("/api/translate", config.host);

  try {
    const response = await fetch(baseUrl.toString(), {
      method: "POST",
      headers: {
        "Sheep-Token": config.token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        text: body || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const translations: TranslatedContents = await response.json();

    // check response body for valid classification
    if (
      !translations ||
      !translations.translations ||
      translations.translations.length === 0 ||
      !translations.translations[0].language
    ) {
      throw new Error("Translation failed with no/invalid result.");
    }

    log.debug(
      {
        query: { title: title, body: body },
        translations: translations.translations,
      },
      "Successfully translated."
    );
    return translations;
  } catch (error) {
    log.error(
      { query: { title: title, body: body }, error },
      "Translation error."
    );
    return null;
  }
};
