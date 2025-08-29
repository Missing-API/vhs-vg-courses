import { createNextHandler } from "@ts-rest/serverless/next";
import { CategoriesContract } from "./categories.contract";
import { getLogger } from "@/src/logging/logger";
import { ruralEventCategories } from "@/packages/rural-event-types/src/rural-event-category";
import { RuralEventCategoryList } from "@/packages/rural-event-types/src/rural-event-category.types";

import { getConfigCacheControlHeader } from "@/src/config/cache-control-header";
import { ApiCategories } from "@/src/logging/loggerApps.config";

const log = getLogger(ApiCategories.get);

const handler = createNextHandler(
  CategoriesContract,
  {
    getCategories: async ({ query }, res) => {
      const lang: string | undefined = query?.language ?? undefined;
      const examples: boolean | undefined = query?.examples ?? undefined;

      log.debug(
        {
          query: {
            language: lang,
            examples,
          },
        },
        "Get categories request received"
      );

      try {
        // copy categories to avoid mutation
        const categories: RuralEventCategoryList = JSON.parse(
          JSON.stringify(ruralEventCategories)
        );

        // filter localizations by given language on locale
        // remove examples if not requested
        categories.map((category) => {
          if (lang) {
            category.localizations = category.localizations.filter(
              (localization) => localization.locale === lang
            );
          }
          if (examples !== true) {
            category.localizations = category.localizations.map(
              (localization) => {
                delete localization.examples;
                return localization;
              }
            );
          }
          return category;
        });

        res.responseHeaders.set("Cache-Control", getConfigCacheControlHeader());

        log.info(
          {
            data: {
              count: categories.length,
              language: lang,
              hasExamples: examples === true,
            },
          },
          "Categories retrieved successfully"
        );

        return {
          status: 200,
          body: {
            status: 200,
            results: categories.length,
            timestamp: new Date().toISOString(),
            data: categories,
          },
        };
      } catch (error) {
        log.error(error, "Error retrieving categories");
        throw error;
      }
    },
  },
  {
    handlerType: "app-router",
  }
);

export { handler as GET };
