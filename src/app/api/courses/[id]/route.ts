import { createNextHandler } from "@ts-rest/serverless/next";
import { CourseDetailsContract } from "./course-details.contract";
import { fetchCourseDetails } from "@/clients/vhs-website/fetch-course-details";
import { setCacheControlHeader } from "@/rest/cache";

const handler = createNextHandler(
  CourseDetailsContract,
  {
    courseDetails: async ({ params }, res: { responseHeaders: Headers }) => {
      try {
        const { id } = params;

        // ts-rest contract already validates the param, but keep a defensive check
        if (!/^[0-9]{3}[A-Z][0-9]{5}$/i.test(id)) {
          return {
            status: 400,
            body: {
              status: 400,
              error:
                "Invalid course id format. Expected ^[0-9]{3}[A-Z][0-9]{5}$ (e.g., 252P40405)",
            },
          };
        }

        const data = await fetchCourseDetails(id);

        // Set cache control header for successful response
        setCacheControlHeader(res.responseHeaders);

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data,
          },
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error fetching course details";

        // Map error types to status codes
        if (message.includes("HTTP 404")) {
          return {
            status: 404,
            body: { status: 404, error: message },
          };
        }
        // Timeout/Abort
        if ((err as any)?.name === "AbortError") {
          return {
            status: 408,
            body: { status: 408, error: "Request timeout fetching course details" },
          };
        }

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