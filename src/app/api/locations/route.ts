import { createNextHandler } from "@ts-rest/serverless/next";
import { LocationsContract } from "./locations.contract";
import { getLocations } from "@/clients/vhs-website/vhs-search.client";

const handler = createNextHandler(
  LocationsContract,
  {
    list: async () => {
      try {
        const locations = await getLocations();
        const totalLocations = locations.length;
        const totalCourses = locations.reduce(
          (acc, l) => acc + (l.courseCount || 0),
          0
        );

        return {
          status: 200,
          body: {
            locations,
            totalLocations,
            totalCourses,
            lastUpdated: new Date().toISOString(),
          },
          headers: {
            "Cache-Control": "public, max-age=86400",
          },
        };
      } catch (err: any) {
        return {
          status: 500,
          body: {
            status: 500 as const,
            error: err?.message || "Failed to fetch locations",
          },
          headers: {
            "Cache-Control": "no-store",
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