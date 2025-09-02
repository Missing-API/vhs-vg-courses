import { initContract } from "@ts-rest/core";
import { CoursesSuccessfulSchema } from "./courses.schema";
import { ApiErrorSchema } from "@/rest/health.schema";
import { z } from "zod";

const c = initContract();

export const CoursesContract = c.router({
  courses: {
    method: "GET",
    path: "/api/:location/courses",
    pathParams: z.object({
      location: z.string().min(1),
    }),
    query: z.object({
      details: z.coerce.boolean().optional(),
    }).optional(),
    responses: {
      200: CoursesSuccessfulSchema,
      400: ApiErrorSchema,
      404: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  },
});