import { z } from "zod";
import { ResultsSchema } from "@/rest/results.schema";
import { LocationSchema } from "@/clients/vhs-website/locations.schema";

/**
 * Locations list data structure (array of locations)
 */
export const LocationsDataSchema = z.array(LocationSchema);
export type LocationsData = z.infer<typeof LocationsDataSchema>;

/**
 * Successful locations response for a collection
 * - Uses ResultsSchema to include top-level results count
 */
export const LocationsSuccessfulSchema = ResultsSchema.extend({
  data: LocationsDataSchema,
});
export type LocationsSuccessful = z.infer<typeof LocationsSuccessfulSchema>;
