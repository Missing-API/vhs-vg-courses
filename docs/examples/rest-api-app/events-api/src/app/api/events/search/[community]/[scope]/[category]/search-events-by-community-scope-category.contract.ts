import { initContract } from "@ts-rest/core";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { z } from "zod";
import { SearchEventsSuccessfulSchema } from "../../search-events.schema";
import { SearchEventsQuerySchema } from "../../search-events-query.schema";
import { RuralEventScopeSchema } from "@/packages/rural-event-types/src/rural-event-scope.types";
import { RuralEventCategoryIdSchema } from "@/packages/rural-event-types/src/rural-event-category.types";
import { GeonameIdSchema } from "@/src/events/types/geonames.types";

const c = initContract();

export const SearchEventsByCommunityScopeCategoryContract = c.router({
  "search-events-by-community-scope-category": {
    method: "GET",
    path: "/api/events/search/:community/:scope/:category",
    pathParams: z.object({
      community: GeonameIdSchema,
      scope: RuralEventScopeSchema,
      category: RuralEventCategoryIdSchema,
    }),
    query: SearchEventsQuerySchema,
    responses: {
      200: SearchEventsSuccessfulSchema,
      400: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Search events by community, scope, and category",
    description:
      "Search for events within a specific community, scope, and category.",
  },
});
