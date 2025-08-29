import { z } from "zod";

export const ISO8601Schema = z
  .string()
  .describe("Datetime in ISO8601 format")
  .regex(
    /^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[\+-]\d{2}:\d{2})?)$/
  )
  .transform((v) => new Date(v).toISOString());

export type ISO8601 = z.infer<typeof ISO8601Schema>;

// ensure valid month and valid day
export const ISO8601DateSchema = z
  .string()
  .describe("Date in ISO8601 format")
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    "Date must be in YYYY-MM-DD format with valid month (01-12) and day (01-31)"
  );
export type ISO8601Date = z.infer<typeof ISO8601DateSchema>;
