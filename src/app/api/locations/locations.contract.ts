import { initContract } from "@ts-rest/core";
import { LocationsSuccessfulSchema } from "./locations.schema";
import { ApiErrorSchema } from "@/rest/health.schema";

const c = initContract();

export const LocationsContract = c.router({
  locations: {
    method: "GET",
    path: "/api/locations",
    responses: {
      200: LocationsSuccessfulSchema,
      500: ApiErrorSchema,
    },
  },
});