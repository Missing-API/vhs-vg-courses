import { z } from "zod";
import { ResultSchema } from "@/rest/result.schema";
import { LocationSchema } from "@/clients/vhs-website/locations.schema";

/**
 * Locations list data structure
 */
export const LocationsDataSchema = z.object({
  locations: z.array(LocationSchema),
});
export type LocationsData = z.infer<typeof LocationsDataSchema>;

/**
 * Successful locations response following the example apps pattern
 */
export const LocationsSuccessfulSchema = ResultSchema.extend({
  data: LocationsDataSchema,
});
export type LocationsSuccessful = z.infer<typeof LocationsSuccessfulSchema>;
