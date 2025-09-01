import { createNextHandler } from "@ts-rest/serverless/next";
import { CoursesContract } from "./courses.contract";
import { getCourses, getLocations } from "@/clients/vhs-website/vhs-search.client";

const FIFTEEN_MIN_SECONDS = 60 * 15;

const handler = createNextHandler(
  CoursesContract,
  {
    courses: async ({ params }, res: { responseHeaders: Headers }) => {
      try {
        const locationId = params.location?.toLowerCase();
        if (!locationId) {
          return {
            status: 400,
            body: {
              status: 400,
              error: "Invalid location parameter",
            },
          };
        }

        const locations = await getLocations();
        const location = locations.locations.find((l) => l.id === locationId);
        if (!location) {
          return {
            status: 404,
            body: {
              status: 404,
              error: `Location not found: ${locationId}`,
            },
          };
        }

        const result = await getCourses(locationId);

        // 15 minutes cache for course lists
        res.responseHeaders.set(
          "Cache-Control",
          `public, max-age=${FIFTEEN_MIN_SECONDS}`
        );

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data: {
              location,
              courses: result.courses,
              totalCount: result.count,
            },
          },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error fetching courses";
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