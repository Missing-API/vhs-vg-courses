import { createNextHandler } from "@ts-rest/serverless/next";
import { getLogger } from "@/src/logging/logger";
import { ApiEvents } from "@/src/logging/loggerApps.config";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { SearchEventsByCommunityScopeCategoryContract } from "./search-events-by-community-scope-category.contract";
import { SearchEventsSuccessfulSchema } from "../../search-events.schema";
import { HttpError } from "http-errors";
import {
  CommunityCenterQuery,
  searchEvents,
} from "@/src/clients/typesense/search/searchEvents";
import { extractGeonameId } from "@/src/clients/geo-api/helpers/extract-geoname-id";
import { getCommunityCenter } from "@/src/clients/typesense/search/helpers/get-community-center";
import { RuralEventCategoryId } from "@/packages/rural-event-types/src/rural-event-category.types";
import { GeonameId } from "@/src/events/types/geonames.types";
import { RuralEventScope } from "@/packages/rural-event-types/src/rural-event-scope.types";
import { ISO8601 } from "@/src/rest/iso8601.types";
import {
  Country,
  Language,
} from "@/src/events/localization/types/languages.types";
import {
  getDataCacheControlHeader,
  getErrorCacheControlHeader,
} from "@/src/config/cache-control-header";
import { LocalizedEvent } from "@/src/events/types/localized-event.types";
import { IndexedEvent } from "@/src/events/types/indexed-event.types";
import { localizedEvent } from "@/src/events/helpers/localized-event";

const log = getLogger(ApiEvents.search);

const handler = createNextHandler(
  SearchEventsByCommunityScopeCategoryContract,
  {
    "search-events-by-community-scope-category": async (
      { params, query },
      res
    ) => {
      const community: GeonameId = params?.community ?? "";
      const scope: RuralEventScope = params?.scope ?? "";
      const category: RuralEventCategoryId = params?.category ?? "";
      const before: ISO8601 | undefined =
        (query?.before as ISO8601) ?? undefined;
      const after: ISO8601 | undefined = (query?.after as ISO8601) ?? undefined;
      const language: Language = (query?.language as Language) ?? "de";
      const country: Country = (query?.country as Country) ?? "DE";

      log.info(
        { community, scope, category, before, after, language, country },
        `search events by community`
      );
      const timestamp = new Date().toISOString();

      // get community details to configure scoped search
      const communityCenter: CommunityCenterQuery = await getCommunityCenter(
        extractGeonameId(community)
      );

      return await searchEvents({
        center: communityCenter,
        scope: scope,
        containTighterScopes: true,
        category: category,
        after: after,
        before: before,
        language: language,
      })
        .then((result) => {
          // map all result item trhough localizedEvent
          const localizedEvents: LocalizedEvent[] = result.hits.map(
            (event: IndexedEvent) => {
              return localizedEvent(event, language, country);
            }
          );

          // Set cache control header
          res.responseHeaders.set("Cache-Control", getDataCacheControlHeader());

          return {
            status: 200 as const,
            body: {
              status: 200,
              results: result.found,
              timestamp: timestamp,
              data: localizedEvents,
            } as SearchEventsSuccessfulSchema,
          };
        })
        .catch((error: HttpError | unknown) => {
          let httpCode: number | undefined;
          if (error instanceof HttpError) httpCode = error?.status;
          res.responseHeaders.set(
            "Cache-Control",
            getErrorCacheControlHeader()
          );
          return {
            status: 500 as const,
            body: {
              status: httpCode ?? 500,
              error: error ?? "Internal Server Error",
            } as ApiErrorSchema,
          };
        });
    },
  },
  {
    jsonQuery: true,
    responseValidation: false, // TODO: Check why it fails
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as GET };
