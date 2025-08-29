import { createNextHandler } from "@ts-rest/serverless/next";
import { LanguagesContract } from "./languages.contract";
import { getLogger } from "@/src/logging/logger";
import { Language } from "@/src/events/localization/types/languages.types";

import { LanguageList } from "./languages.schema";
import { getLanguageName } from "@/src/events/localization/helpers/get-lanuage-name";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { getConfigCacheControlHeader } from "@/src/config/cache-control-header";
import { ApiLanguages } from "@/src/logging/loggerApps.config";

const log = getLogger(ApiLanguages.get);

const handler = createNextHandler(
  LanguagesContract,
  {
    getLanguages: async ({ query }, res) => {
      const lang: Language = query?.language ?? "de";
      log.info({ lang }, `get languages`);

      const languageList: LanguageList = {
        de: getLanguageName("de", lang),
        en: getLanguageName("en", lang),
        pl: getLanguageName("pl", lang),
        uk: getLanguageName("uk", lang),
        ru: getLanguageName("ru", lang),
      };

      res.responseHeaders.set("Cache-Control", getConfigCacheControlHeader());

      return {
        status: 200,
        body: {
          status: 200,
          timestamp: new Date().toISOString(),
          data: languageList,
        },
      };
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as GET };
