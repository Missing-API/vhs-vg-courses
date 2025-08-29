import { Country, Language } from "../localization/types/languages.types";
import { IndexedEvent } from "../types/indexed-event.types";
import { LocalizedEvent } from "../types/localized-event.types";

export const localizedEvent = (
  event: IndexedEvent,
  language: Language, // Use to select the language of the event data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  country: Country // Use to select the language for location labels
): LocalizedEvent => {
  const localizedEvent: LocalizedEvent = {
    id: event.id,
    summary: event[`summary.${language}`],
    description: event[`description.${language}`],
    link: event.link,
    image: event.image,
    "image.exists": event["image.exists"],
    document: event.document,
    "document.exists": event["document.exists"],
    categories: event.categories,
    tags: event.tags,
    start: event.start,
    end: event.end,
    allday: event.allday,
    occurrence: event.occurrence,
    "series.id": event["series.id"],
    "location.raw": event["location.raw"],
    "location.name": event["location.name.de"], // extend later to multilingual locations
    "location.localname": event[`location.localname.de`], // extend later to multilingual locations
    "location.address": event["location.address"],
    "location.geopoint": event["location.geopoint"],
    scope: event.scope,
    "community.id": event["community.id"],
    "community.geopoint": event["community.geopoint"],
    "community.name": event["community.name.de"], // extend later to multilingual locations
    "municipality.id": event["municipality.id"],
    "municipality.name": event["municipality.name.de"], // extend later to multilingual locations
    "county.id": event["county.id"],
    "county.name": event["county.name.de"], // extend later to multilingual locations
    "state.id": event["state.id"],
    "state.name": event["state.name.de"], // extend later to multilingual locations
    "country.id": event["country.id"],
    "country.name": event["country.name.de"], // extend later to multilingual locations
    "organizer.id": event["organizer.id"],
    "organizer.name": event["organizer.name"],
    "calendar.id": event["calendar.id"],
    "calendar.name": event["calendar.name"],
    created: event.created,
    changed: event.changed,
    deleted: event.deleted,
  };
  return localizedEvent;
};
