import { z } from "zod";

/**
 * Location schemas
 */

export const LocationIdSchema = z.enum(["anklam", "greifswald", "pasewalk"]);
export type LocationId = z.infer<typeof LocationIdSchema>;

export const LocationSchema = z.object({
  id: LocationIdSchema,
  name: z.string(),
  address: z.string(),
  // Optional contact information (may be filled by client/static data)
  phone: z.string().optional(),
  email: z.string().email().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

export const LocationsResponseSchema = z.object({
  locations: z.array(LocationSchema).min(1),
  totalLocations: z.number().int().nonnegative(),
  totalCourses: z.number().int().nonnegative(),
  lastUpdated: z
    .string()
    .transform((val) => new Date(val).toISOString()),
});
export type LocationsResponse = z.infer<typeof LocationsResponseSchema>;