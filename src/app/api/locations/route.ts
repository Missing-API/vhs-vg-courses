import { createNextHandler } from "@ts-rest/serverless/next";
import { LocationsContract } from "./locations.contract";
import { getLocations } from "@/clients/vhs-website/vhs-search.client";

const ONE_DAY_SECONDS = 60 * 60 * 24;

const handler = createNextHandler(
  LocationsContract,
  {
    // @ts-expect-error - ts-rest handler signature doesn't expose headers type here
    locations: async ({}, res: { responseHeaders: Headers }) =&gt; {
      try {
        const payload = await getLocations();

        // 1 day cache as per API specification
        res.responseHeaders.set(
          "Cache-Control",
          `public, max-age=${ONE_DAY_SECONDS}`
        );

        return {
          status: 200,
          body: payload,
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