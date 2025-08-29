import { createNextHandler } from "@ts-rest/serverless/next";
import { SearchEventsByCommunityContract } from "./search-events-by-community.contract";
import { getLogger } from "@/src/logging/logger";
import { ApiEvents } from "@/src/logging/loggerApps.config";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { SearchEventsSuccessfulSchema } from "./search-events.schema";
import {
  CommunityCenterQuery,
  searchEvents,
} from "@/src/clients/typesense/search/searchEvents";
import { getCommunityCenter } from "@/src/clients/typesense/search/helpers/get-community-center";
import { extractGeonameId } from "@/src/clients/geo-api/helpers/extract-geoname-id";
import { ISO8601 } from "@/src/rest/iso8601.types";
import { GeonameId } from "@/src/events/types/geonames.types";
import { HttpError } from "http-errors";
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
  SearchEventsByCommunityContract,
  {
    "search-events-by-community": async ({ params, query }, res) => {
      console.log(
        "🚀 HANDLER: Route handler called with params:",
        params,
        "query:",
        query
      );

      // Add diagnostic logging for route parameters
      log.debug(
        {
          data: {
            rawParams: params,
            rawQuery: query,
            communityParam: params?.community,
            communityType: typeof params?.community,
          },
        },
        "Raw route parameters received"
      );

      const community: GeonameId = params?.community ?? "";
      const before: ISO8601 | undefined =
        (query?.before as ISO8601) ?? undefined;
      const after: ISO8601 | undefined = (query?.after as ISO8601) ?? undefined;
      const language: Language = (query?.language as Language) ?? "de";
      const country: Country = (query?.country as Country) ?? "DE";

      log.info(
        { community, before, after, language, country },
        `search events by community`
      );

      const timestamp = new Date().toISOString();

      // get community details to configure scoped search
      const communityCenter: CommunityCenterQuery = await getCommunityCenter(
        extractGeonameId(community)
      );

      // Add diagnostic logging for searchEvents parameters
      const searchParams = {
        center: communityCenter,
        scope: "region" as const, // TODO: check which should be the default scope if not set
        containTighterScopes: true,
        after: after,
        before: before,
        language: language,
      };

      log.debug(
        {
          data: {
            searchParams,
            afterType: typeof after,
            beforeType: typeof before,
            afterValue: after,
            beforeValue: before,
          },
        },
        "About to call searchEvents with parameters"
      );

      console.log(
        "🔍 DEBUG: About to call searchEvents with params:",
        JSON.stringify(searchParams, null, 2)
      );

      return await searchEvents(searchParams)
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

          console.log("❌ ERROR: Search events failed:", {
            error: error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            errorType: error?.constructor?.name,
            httpCode: httpCode,
          });

          // Enhanced error logging
          log.error(
            {
              data: {
                error: error,
                errorMessage:
                  error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : undefined,
                errorType: error?.constructor?.name,
                httpCode: httpCode,
                searchParams: {
                  community,
                  before,
                  after,
                  language,
                  country,
                },
              },
            },
            "Search events failed with error"
          );

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
    errorHandler: (error) => {
      console.log("🔥 TS-REST ERROR HANDLER:", error);
      return handleZodError(error);
    },
  }
);

export { handler as GET };
