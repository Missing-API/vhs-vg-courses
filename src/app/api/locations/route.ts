import { createNextHandler } from "@ts-rest/serverless/next";
import { LocationsContract } from "./locations.contract";
import { getLocations } from "@/clients/vhs-website/vhs-search.client";

const ONE_DAY_SECONDS = 60 * 60 * 24;

const handler = createNextHandler(
  LocationsContract,
  {
    locations: async ({}, res: { responseHeaders: Headers }) => {
      try {
        const locationsData = await getLocations();

        // 1 day cache as per API specification
        res.responseHeaders.set(
          "Cache-Control",
          `public, max-age=${ONE_DAY_SECONDS}`
        );

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data: locationsData,
          },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error fetching locations";
        return {
          status: 500,
          body: {
            status: 500,
            error: message,
          },
        };
      }
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
  }
);

export { handler as GET };