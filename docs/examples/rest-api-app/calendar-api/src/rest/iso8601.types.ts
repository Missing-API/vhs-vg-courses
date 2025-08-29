import { z } from "zod";

export const ISO8601Schema = z
  .string()
  .describe("Datetime in ISO8601 format")
  .regex(
    /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[\+-]\d{2}:\d{2})?)$/
  )
  .transform((v) => new Date(v).toISOString());

export type ISO8601 = z.infer<typeof ISO8601Schema>;
