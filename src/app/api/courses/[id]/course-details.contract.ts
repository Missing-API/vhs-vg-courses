import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { CourseDetailsSuccessfulSchema } from "./course-details.schema";
import { ApiErrorSchema } from "@/rest/health.schema";

const c = initContract();

export const CourseDetailsContract = c.router({
  courseDetails: {
    method: "GET",
    path: "/api/courses/:id",
    pathParams: z.object({
      id: z.string().regex(/^[0-9]{3}[A-Z][0-9]{5}$/i, {
        message: "Invalid course id format. Expected ^[0-9]{3}[A-Z][0-9]{5}$ (e.g., 252P40405)",
      }),
    }),
    responses: {
      200: CourseDetailsSuccessfulSchema,
      400: ApiErrorSchema,
      404: ApiErrorSchema,
      408: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  },
});