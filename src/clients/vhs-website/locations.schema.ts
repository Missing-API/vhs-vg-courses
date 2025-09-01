import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string(), // slug: anklam, greifswald, pasewalk
  name: z.string(),
  address: z.string(),
});
export type Location = z.infer<typeof LocationSchema>;

export const LocationsResponseSchema = z.object({
  locations: z.array(LocationSchema),
});
export type LocationsResponse = z.infer<typeof LocationsResponseSchema>;