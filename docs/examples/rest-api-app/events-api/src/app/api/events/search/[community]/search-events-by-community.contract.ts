import { initContract } from "@ts-rest/core";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { z } from "zod";
import { SearchEventsSuccessfulSchema } from "./search-events.schema";
import { SearchEventsQuerySchema } from "./search-events-query.schema";
import { GeonameIdSchema } from "@/src/events/types/geonames.types";

const c = initContract();

export const SearchEventsByCommunityContract = c.router({
  "search-events-by-community": {
    method: "GET",
    path: "/api/events/search/:community",
    pathParams: z.object({
      community: GeonameIdSchema,
    }),
    query: SearchEventsQuerySchema,
    responses: {
      200: SearchEventsSuccessfulSchema,
      // 400: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Search events by community",
    description: "Search for events within a specific community.",
  },
});
