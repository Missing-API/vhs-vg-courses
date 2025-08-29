import { z } from "zod";

/**
 * Formatted as an IANA Time Zone Database name, e.g. "Europe/Zurich"
 */
export const IanaTimezone = z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+$/);

/**
 * Common time standards like UTC, GMT, etc.
 */
export const TimeStandard = z
  .string()
  .regex(/^(UTC|GMT|EST|CST|MST|PST|EDT|CDT|MDT|PDT)$/);

/**
 * Timezone that can be either an IANA timezone or a time standard
 */
export const Timezone = z.union([IanaTimezone, TimeStandard]);

export type IanaTimezone = z.infer<typeof IanaTimezone>;
export type TimeStandard = z.infer<typeof TimeStandard>;
export type Timezone = z.infer<typeof Timezone>;
