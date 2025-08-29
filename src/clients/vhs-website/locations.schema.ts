import { z } from "zod";

/**
 * Location identifiers available on vhs-vg.de
 */
export const LocationIdSchema = z.enum(["anklam", "greifswald", "pasewalk"]);
export type LocationId = z.infer<typeof LocationIdSchema>;

/**
 * Basic location information
 */
export const LocationSchema = z.object({
  id: LocationIdSchema,
  name: z.string(),
  address: z.string().min(3),
  courseCount: z.number().int().nonnegative().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

/**
 * API response schema for /api/locations
 * Matches docs/requirements/rest-api-structure.md
 */
export const LocationsResponseSchema = z.object({
  locations: z.array(LocationSchema),
  totalLocations: z.number().int().nonnegative(),
  totalCourses: z.number().int().nonnegative().optional(),
  lastUpdated: z.string().transform((val) => new Date(val).toISOString()),
});
export type LocationsResponse = z.infer<typeof LocationsResponseSchema>;