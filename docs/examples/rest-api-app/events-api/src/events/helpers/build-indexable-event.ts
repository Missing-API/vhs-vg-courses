import { getLogger } from "../../logging/logger";
import { RuralEventClassification } from "../../../packages/rural-event-types/src/rural-event-classification.types";

import {
  EventContentWithMetadata,
  PostEventRequestBody,
} from "../events.types";
import { GeoLocation } from "../../clients/geo-api/types/geo-location.types";
import {
  IndexedEvent,
  IndexedEventSchema,
  IndexedEventTimeData,
} from "../types/indexed-event.types";

import { getDocumentLinkFromAttachments } from "./attachments/getDocumentLinkFromAttachments";
import { getImageLinkFromAttachments } from "./attachments/getImageLinkFromAttachments";
import { googleDatetimeToTimestamp } from "./datetime/googleDatetimeToTimestamp";
import { eventUuid } from "./uuids/eventUuid";
import { TranslatedContents } from "@/src/clients/translation-api/translation.types";
import { ApiEvents } from "@/src/logging/loggerApps.config";
import { buildIndexableEventTimeData } from "./build-indexable-event-time-data";
import { GoogleEventTimeDataSchema } from "../types/google-event.types";
import { RuralEventScope } from "@/packages/rural-event-types/src/rural-event-scope.types";

const log = getLogger(ApiEvents["build-indexable-event"]);

export const buildIndexableEvent = (
  rawEvent: PostEventRequestBody,
  geolocation: GeoLocation,
  community: GeoLocation,
  contentWithMetadata: EventContentWithMetadata | null,
  scope: RuralEventScope,
  classification: RuralEventClassification,
  translatedContents: TranslatedContents | null
): IndexedEvent => {
  // build time data
  let indexableEventTimeData: IndexedEventTimeData;
  try {
    indexableEventTimeData = buildIndexableEventTimeData(
      GoogleEventTimeDataSchema.parse(rawEvent)
    );
  } catch (error) {
    log.error(
      { error, event: { data: { rawEvent } } },
      "Error while parsing event time data."
    );
    throw new Error("Error while parsing event time data.", { cause: error });
  }

  const indexableEvent: IndexedEvent = {
    id: eventUuid(rawEvent),
    "org.id": rawEvent.id || "",

    /**
     * contents
     */
    // find item with language==de
    "summary.de":
      translatedContents?.translations
        .find((translation) => translation.language === "de")
        ?.title?.trim() ||
      rawEvent.summary ||
      "",
    "summary.en":
      translatedContents?.translations
        .find((translation) => translation.language === "en")
        ?.title?.trim() ||
      rawEvent.summary ||
      "",
    "summary.pl":
      translatedContents?.translations
        .find((translation) => translation.language === "pl")
        ?.title?.trim() ||
      rawEvent.summary ||
      "",
    "summary.uk":
      translatedContents?.translations
        .find((translation) => translation.language === "uk")
        ?.title?.trim() ||
      rawEvent.summary ||
      "",
    "summary.ru":
      translatedContents?.translations
        .find((translation) => translation.language === "ru")
        ?.title?.trim() ||
      rawEvent.summary ||
      "",
    "description.de":
      translatedContents?.translations
        .find((translation) => translation.language === "de")
        ?.text?.trim() ||
      contentWithMetadata?.description ||
      rawEvent.description ||
      "",
    "description.en":
      translatedContents?.translations
        .find((translation) => translation.language === "en")
        ?.text?.trim() ||
      contentWithMetadata?.description ||
      rawEvent.description ||
      "",
    "description.pl":
      translatedContents?.translations
        .find((translation) => translation.language === "pl")
        ?.text?.trim() ||
      contentWithMetadata?.description ||
      rawEvent.description ||
      "",
    "description.uk":
      translatedContents?.translations
        .find((translation) => translation.language === "uk")
        ?.text?.trim() ||
      contentWithMetadata?.description ||
      rawEvent.description ||
      "",

    "description.ru":
      translatedContents?.translations
        .find((translation) => translation.language === "ru")
        ?.text?.trim() ||
      contentWithMetadata?.description ||
      rawEvent.description ||
      "",
    link: contentWithMetadata?.url || "",

    /**
     * attachments
     */
    image:
      getImageLinkFromAttachments(rawEvent?.attachments) ||
      contentWithMetadata?.image ||
      "", // set google calender attachments and use from description as fallback
    "image.exists":
      getImageLinkFromAttachments(rawEvent?.attachments) ||
      contentWithMetadata?.image
        ? true
        : false,
    document:
      getDocumentLinkFromAttachments(rawEvent?.attachments) ||
      contentWithMetadata?.document ||
      "", // set google calender attachments and use from description as fallback
    "document.exists":
      getDocumentLinkFromAttachments(rawEvent?.attachments) ||
      contentWithMetadata?.document
        ? true
        : false,

    /**
     * classification and scope
     */
    categories: classification?.category
      ? [classification?.category]
      : ["unknown"],
    tags: classification?.tags || [],
    scope: scope || "community",

    /**
     * dates and times
     */
    ...indexableEventTimeData,

    /**
     * location infos
     */
    "location.raw": rawEvent.location?.trim() || "",
    "location.name.de": geolocation.name || rawEvent.location || "",
    "location.localname.de":
      geolocation.localName || geolocation.name || rawEvent.location || "",
    "location.address": geolocation.address || rawEvent.location || "",
    "location.geopoint": [
      geolocation.geo?.point.lat || 0,
      geolocation.geo?.point.lng || 0,
    ],

    /**
     * geo data
     */
    "community.id":
      "geoname." + geolocation.hierarchy?.community?.geonameId || "",
    "community.geopoint": [
      community.geo?.point.lat || geolocation.geo?.point.lat || 0,
      community.geo?.point.lng || geolocation.geo?.point.lng || 0,
    ], // TODO: we need the geo point of the community
    "community.name.de": geolocation.hierarchy?.community?.name || "",
    "municipality.id":
      "geoname." + geolocation.hierarchy?.municipality?.geonameId,
    "municipality.name.de": geolocation.hierarchy?.municipality?.name || "",
    "county.id": "geoname." + geolocation.hierarchy?.county?.geonameId || "",
    "county.name.de": geolocation.hierarchy?.county?.name || "",
    "state.id": "geoname." + geolocation.hierarchy?.state?.geonameId || "",
    "state.name.de": geolocation.hierarchy?.state?.name || "",
    "country.id": "geoname." + geolocation.hierarchy?.country?.geonameId || "",
    "country.name.de": geolocation.hierarchy?.country?.name || "",

    /**
     * hierarchy data
     */
    "organizer.id": rawEvent.creator?.id || rawEvent.creator?.email || "",
    "organizer.name":
      rawEvent.creator?.displayName?.trim() || rawEvent.creator?.email || "",
    "calendar.id": rawEvent.organizer?.id || rawEvent.organizer?.email || "",
    "calendar.name":
      rawEvent.organizer?.displayName?.trim() ||
      rawEvent.creator?.displayName?.trim() ||
      "",

    /**
     * systeme data
     */
    created: googleDatetimeToTimestamp(rawEvent?.created) || 0,
    changed: googleDatetimeToTimestamp(rawEvent?.updated) || 0,
    deleted:
      rawEvent?.status === "cancelled"
        ? googleDatetimeToTimestamp(rawEvent?.updated) || 0
        : 0,
  };

  // validate
  try {
    IndexedEventSchema.parse(indexableEvent);
  } catch (error) {
    log.error(
      { error, event: { summary: rawEvent.summary, indexableEvent } },
      "Event is not valid. Event will be skipped."
    );
    throw new Error("Indexable event is not valid");
  }

  // log warnings
  if (indexableEvent.categories.includes("unknown")) {
    log.warn(
      { event: { summary: rawEvent.summary }, classification: classification },
      "Event has no category."
    );
  }

  return indexableEvent;
};
