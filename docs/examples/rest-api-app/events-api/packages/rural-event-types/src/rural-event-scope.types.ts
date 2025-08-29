import { z } from "zod";

export const RuralEventAdminScopeSchema = z
  .enum([
    "community", // village, populated place
    "municipality", // municipality, city, town, admin4
    "county", // county, district, admin3
    "state", // state, province, region, admin2
    "country", // country, nation, admin1
  ])
  .describe("Scopes enum for rural events based on administrative boundaries.");
export type RuralEventAdminScope = z.infer<typeof RuralEventAdminScopeSchema>;

export const RuralEventDistanceScopeSchema = z
  .enum([
    "nearby", // nearby the current location approximately 5-7km
    "region", // in the greater region of the current location approximately 20-30km
  ])
  .describe("Scopes enum for rural events based on distance.");

export type RuralEventDistanceScope = z.infer<
  typeof RuralEventDistanceScopeSchema
>;

export const RuralEventScopeSchema = z
  .enum([
    ...RuralEventAdminScopeSchema.options,
    ...RuralEventDistanceScopeSchema.options,
  ])
  .describe("Scopes enum for rural events.");
export type RuralEventScope = z.infer<typeof RuralEventScopeSchema>;

export function isRuralEventDistanceScope(scopeInQuestion: string): boolean {
  return RuralEventDistanceScopeSchema.safeParse(scopeInQuestion).success;
}

export function isRuralEventAdminScope(scopeInQuestion: string): boolean {
  return RuralEventAdminScopeSchema.safeParse(scopeInQuestion).success;
}
