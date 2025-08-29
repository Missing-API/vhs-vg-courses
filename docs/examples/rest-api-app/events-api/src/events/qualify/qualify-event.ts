import { GoogleEvent } from "../types/google-event.types";
import { IndexedEvent } from "../types/indexed-event.types";
import { GeoLocation } from "../../clients/geo-api/types/geo-location.types";
import { EventContentWithMetadata } from "../events.types";

import { RuralEventClassification } from "../../../packages/rural-event-types/src/rural-event-classification.types";
import { geoCodeLocation } from "../../clients/geo-api/geo-code-location";
import { mapScopes } from "../scopes/map-scopes";
// import { translateContent } from "../../clients/translation-api/translate-content";
import { getGeoLocation } from "../../clients/geo-api/get-geo-location";
import { classifyContent } from "@/src/clients/classification-api/classify-content";
import { unknownToData } from "@/packages/data-text-mapper/src/unknownToData";
// import { TranslatedContents } from "@/src/clients/translation-api/translation.types";
import { RuralEventScope } from "@/packages/rural-event-types/src/rural-event-scope.types";
import { getLogger } from "@/src/logging/logger";
import { ApiEvents } from "@/src/logging/loggerApps.config";
import { measureTime } from "@/src/logging/measure-time";
import { buildIndexableEvent } from "../helpers/build-indexable-event";
import { scopifyContent } from "@/src/clients/classification-api/scopify-content";
import { translateContent } from "@/src/clients/translation-api/translate-content";
import { TranslatedContents } from "@/src/clients/translation-api/translation.types";
import { calculateTimespan } from "../helpers/datetime/calculate-timespan";

// import { TranslatedContents } from "@/src/clients/translation-api/translation.types";

const log = getLogger(ApiEvents.qualify);

export async function qualifyEvent(
  incomingEvent: GoogleEvent
): Promise<IndexedEvent> {
  // prepare enhancement of the event data
  let geolocation: GeoLocation | null | undefined = null;
  let metadata: EventContentWithMetadata | null | undefined = null;
  let scope: RuralEventScope | undefined = undefined;
  let classification: RuralEventClassification;
  let translatedContents: TranslatedContents | null | undefined = undefined;

  try {
    // try to extract some metdata e.g. tags or scopesfrom the description
    metadata = unknownToData(incomingEvent?.description as string);

    // set scope if found something in description
    if (metadata && (metadata?.scopes ?? []).length > 0) {
      scope = await mapScopes(metadata.scopes as string[]);
    }

    // Start geo coding early
    const geoLocationPromise = measureTime(
      "geoCodeLocation",
      geoCodeLocation(incomingEvent?.location as string),
      log
    );

    // Start classification early
    const classificationPromise = measureTime(
      "classifyContent",
      classifyContent({
        summary: incomingEvent.summary as string,
        description: (incomingEvent.description as string) || "",
        tags: metadata?.tags as string[],
        occurrence: incomingEvent?.recurringEventId ? "recurring" : "once",
      }),
      log
    );

    // Start translation early
    const translationPromise = measureTime(
      "translateContent",
      translateContent(
        incomingEvent.summary as string,
        incomingEvent.description as string
      ),
      log
    );

    // Resolve classification as first, because so we can start the scopification before the other ended
    classification = await classificationPromise;

    // do scopification at the end, because we need classification data first
    if (!scope) {
      const timespan: string = calculateTimespan(
        incomingEvent.start,
        incomingEvent.end
      );
      scope = await scopifyContent({
        category: classification?.category as string,
        tags: [
          ...(classification?.tags as string[]),
          ...(metadata?.tags as string[]),
        ],
        timespan: timespan || "",
        occurrence: incomingEvent?.recurringEventId ? "recurring" : "once",
      });
    }

    translatedContents = await translationPromise;
    if (!translatedContents) {
      log.warn(
        { event: incomingEvent },
        "No translated contents found, using original content"
      );
    }

    // Resolve geo coding promise at the end
    geolocation = await geoLocationPromise;
    if (!geolocation) {
      throw new Error("No geolocation found");
    }

    // get community details, after geo coding
    const community = await measureTime(
      "getGeoLocation",
      getGeoLocation(
        geolocation.hierarchy?.community?.geonameId as number
      ) as Promise<GeoLocation>,
      log
    );

    // build proper indexable object
    const newEvent: IndexedEvent = buildIndexableEvent(
      incomingEvent,
      geolocation,
      community,
      metadata,
      scope,
      classification,
      translatedContents
    );

    log.debug(
      { event: newEvent },
      "Event qualified successfully and built as IndexedEvent"
    );

    return newEvent;
  } catch (error: Error | unknown) {
    log.error(
      {
        error: error instanceof Error ? error.message : "unknown error",
        query: incomingEvent,
      },
      "Qualify event failed"
    );
    throw error instanceof Error
      ? error
      : new Error("Qualify event failed", {
          cause: error,
        });
  }
}
