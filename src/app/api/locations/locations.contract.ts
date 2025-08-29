import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { LocationsResponseSchema } from "@/clients/vhs-website/locations.schema";

const c = initContract();

export const LocationsContract = c.router({
  list: {
    method: "GET",
    path: "/api/locations",
    responses: {
      200: LocationsResponseSchema,
      500: z.object({
        status: z.literal(500),
        error: z.string(),
      }),
    },
    summary: "List VHS-VG locations with address and course counts",
    description:
      "Scrapes the VHS-VG website to extract available locations, their addresses and number of courses. Data is cached for 1 day.",
  },
});