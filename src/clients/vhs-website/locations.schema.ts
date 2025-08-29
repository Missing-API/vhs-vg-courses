import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string(), // slug: anklam, greifswald, pasewalk
  name: z.string(),
  address: z.string().optional(),
});
export type Location = z.infer&lt;typeof LocationSchema&gt;;

export const LocationsResponseSchema = z.object({
  locations: z.array(LocationSchema),
  totalLocations: z.number(),
  totalCourses: z.number().optional(),
  lastUpdated: z.string().datetime(),
});
export type LocationsResponse = z.infer&lt;typeof LocationsResponseSchema&gt;;