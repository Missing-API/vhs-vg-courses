import { initContract } from "@ts-rest/core";
import { ApiErrorSchema } from "@/rest/health.schema";
import { LocationsResponseSchema } from "@/rest/locations.schema";

const c = initContract();

export const LocationsContract = c.router({
  list: {
    method: "GET",
    path: "/api/locations",
    responses: {
      200: LocationsResponseSchema,
      500: ApiErrorSchema,
    },
    summary: "List all VHS-VG locations with address information",
    description:
      "Returns all available VHS-VG locations with their identifiers, names and addresses. Cached for 1 day.",
  },
});