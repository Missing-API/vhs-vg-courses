import { z } from "zod";

/**
 * Formatted as an IANA Time Zone Database name, e.g. "Europe/Zurich"
 */
export const Timezone = z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+$/);

export type Timezone = z.infer<typeof Timezone>;
