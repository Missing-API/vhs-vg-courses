import { initContract } from "@ts-rest/core";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { z } from "zod";
import { SearchEventsSuccessfulSchema } from "../search-events.schema";
import { SearchEventsQuerySchema } from "../search-events-query.schema";
import { RuralEventScopeSchema } from "@/packages/rural-event-types/src/rural-event-scope.types";
import { GeonameIdSchema } from "@/src/events/types/geonames.types";

const c = initContract();

export const SearchEventsByCommunityScopeContract = c.router({
  "search-events-by-community-scope": {
    method: "GET",
    path: "/api/events/search/:community/:scope",
    pathParams: z.object({
      community: GeonameIdSchema,
      scope: RuralEventScopeSchema,
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
    summary: "Search events by community and scope",
    description: "Search for events within a specific community and scope.",
  },
});
