import { RuralEventScope } from "../../../packages/rural-event-types/src/rural-event-scope.types";
import { defaultScope, mapScope } from "./map-scope";

/**
 * Maps scopes from loose text to RuralEventScope.
 * @param scopes
 * @returns RuralEventScope
 */
export const mapScopes = async (scopes: string[]): Promise<RuralEventScope> => {
  if (!scopes) return defaultScope;
  if (scopes.length === 0) return defaultScope;
  if (scopes.length === 1) return mapScope(scopes[0]);

  // map scopes if multiple scopes coming in
  const mappedScopes: RuralEventScope[] = scopes.map((scope) => {
    return mapScope(scope);
  });

  // return the scope with the highest range
  if (mappedScopes.includes("country")) return "country";
  if (mappedScopes.includes("state")) return "state";
  if (mappedScopes.includes("county")) return "county";
  if (mappedScopes.includes("region")) return "region";
  if (mappedScopes.includes("nearby")) return "nearby";
  if (mappedScopes.includes("municipality")) return "municipality";
  if (mappedScopes.includes("community")) return "community";

  // fallback
  return defaultScope;
};
