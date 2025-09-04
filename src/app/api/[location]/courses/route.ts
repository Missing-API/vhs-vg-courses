import { createNextHandler } from "@ts-rest/serverless/next";
import { CoursesContract } from "./courses.contract";
import { getCourses, getLocations } from "@/clients/vhs-website/vhs-search.client";
import logger from "@/logging/logger";
import { withCategory, startTimer, errorToObject } from "@/logging/helpers";
import { setCacheControlHeader } from "@/rest/cache";

const handler = createNextHandler(
  CoursesContract,
  {
    courses: async ({ params, query }, res: { responseHeaders: Headers }) => {
      const reqId = crypto.randomUUID();
      const log = withCategory(logger, 'api').child({ requestId: reqId, route: '/api/[location]/courses' });
      const end = startTimer();
      log.info({ method: 'GET', locationParam: params.location, details: query?.details }, 'Courses request received');

      try {
        const locationId = params.location?.toLowerCase();
        if (!locationId) {
          const durationMs = end();
          log.warn({ status: 400, durationMs }, 'Invalid location parameter');
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
          const durationMs = end();
          log.warn({ status: 404, durationMs, locationId }, 'Location not found');
          return {
            status: 404,
            body: {
              status: 404,
              error: `Location not found: ${locationId}`,
            },
          };
        }

        const includeDetails = !!query?.details;
        const result = await getCourses(locationId, { includeDetails });

        // Set cache control header for successful response
        setCacheControlHeader(res.responseHeaders);

        const durationMs = end();
        log.info({ status: 200, durationMs, locationId, count: result.count, includeDetails }, 'Courses response sent');

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            results: result.count,
            data: result.courses,
            meta: result.meta,
          },
        };
      } catch (err) {
        const durationMs = end();
        log.error({ status: 500, durationMs, err: errorToObject(err) }, 'Courses handler error');
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