import { initContract } from "@ts-rest/core";
import { LocationsResponseSchema } from "@/clients/vhs-website/locations.schema";
import { ApiErrorSchema } from "@/rest/health.schema";

const c = initContract();

export const LocationsContract = c.router({
  locations: {
    method: "GET",
    path: "/api/locations",
    responses: {
      200: LocationsResponseSchema,
      500: ApiErrorSchema,
    },
  },
});