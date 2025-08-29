import { z } from "zod";

export const GeonameIdSchema = z.string().regex(/^geoname\.\d+$/);

export type GeonameId = z.infer<typeof GeonameIdSchema>;
