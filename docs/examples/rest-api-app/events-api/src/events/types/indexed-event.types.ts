import { z } from "zod";
import { OccurrenceSchema } from "./occurrence.types";
import { RuralEventScopeSchema } from "@/packages/rural-event-types/src/rural-event-scope.types";
import { GeonameIdSchema } from "./geonames.types";

export const IndexedEventTimeDataSchema = z.object({
  start: z.number(),
  end: z.number(),
  allday: z.boolean(),
  occurrence: OccurrenceSchema,
  "series.id": z.string(),
});
export type IndexedEventTimeData = z.infer<typeof IndexedEventTimeDataSchema>;

export const IndexedEventSchema = z
  .object({
    id: z.string(),
    "org.id": z.string(),
    "summary.de": z.string(),
    "summary.en": z.string(),
    "summary.pl": z.string(),
    "summary.uk": z.string(),
    "summary.ru": z.string(),
    "description.de": z.string(),
    "description.en": z.string(),
    "description.pl": z.string(),
    "description.uk": z.string(),
    "description.ru": z.string(),
    link: z.string(),
    image: z.string(),
    "image.exists": z.boolean().default(false),
    document: z.string(),
    "document.exists": z.boolean().default(false),
    categories: z.array(z.string()).default(["unknown"]),
    tags: z.array(z.string()),
    "location.raw": z.string(),
    "location.name.de": z.string(),
    "location.localname.de": z.string(),
    "location.address": z.string(),
    "location.geopoint": z.any(), // TODO: add proper type
    scope: RuralEventScopeSchema.default("community"),
    "community.id": GeonameIdSchema,
    "community.geopoint": z.any(), // TODO: add proper type
    "community.name.de": z.string(),
    "municipality.id": GeonameIdSchema,
    "municipality.name.de": z.string(),
    "county.id": GeonameIdSchema,
    "county.name.de": z.string(),
    "state.id": GeonameIdSchema,
    "state.name.de": z.string(),
    "country.id": z.string(),
    "country.name.de": z.string(),
    "organizer.id": z.string(),
    "organizer.name": z.string(),
    "calendar.id": z.string(),
    "calendar.name": z.string(),
    created: z.number(),
    changed: z.number(),
    deleted: z.number(),
  })
  .merge(IndexedEventTimeDataSchema);
export type IndexedEvent = z.infer<typeof IndexedEventSchema>;
