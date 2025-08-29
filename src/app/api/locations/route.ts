import { createNextHandler } from "@ts-rest/serverless/next";
import { LocationsContract } from "./locations.contract";
import { STATIC_LOCATION_LIST } from "@/clients/vhs-search/locations.constants";
import { LocationsResponseSchema } from "@/rest/locations.schema";

const handler = createNextHandler(
  LocationsContract,
  {
    list: async ({}, res) => {
      // 1 day cache
      res.responseHeaders.set("Cache-Control", "public, max-age=86400");

      const body = {
        locations: STATIC_LOCATION_LIST.map((l) => ({
          id: l.id,
          name: l.name,
          address: l.address,
          email: l.email,
        })),
        totalLocations: STATIC_LOCATION_LIST.length,
        totalCourses: 0,
        lastUpdated: new Date().toISOString(),
      };

      // Type-check and normalize via schema transform
      const parsed = LocationsResponseSchema.parse(body);

      return { status: 200, body: parsed };
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
  }
);

export { handler as GET };