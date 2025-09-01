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
    query: z
      .object({
        includeDetails: z
          .union([z.string(), z.boolean()])
          .optional()
          .transform((v) => {
            if (typeof v === "boolean") return v;
            if (typeof v === "string") return v.toLowerCase() === "true";
            return undefined;
          }),
        batchSize: z
          .union([z.string(), z.number()])
          .optional()
          .transform((v) => {
            const n = typeof v === "number" ? v : Number(v);
            return Number.isFinite(n) ? Math.max(1, Math.min(100, Math.floor(n))) : undefined;
          }),
      })
      .optional(),
    responses: {
      200: CoursesSuccessfulSchema,
      400: ApiErrorSchema,
      404: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  },
});