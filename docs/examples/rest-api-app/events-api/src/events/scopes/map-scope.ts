import { RuralEventScope } from "../../../packages/rural-event-types/src/rural-event-scope.types";
import { scopeSynonymsLowercase } from "./scope-synonyms";

export const defaultScope: RuralEventScope = "nearby";

/**
 * Maps scopes from loose text to RuralEventScope.
 * @param scopes
 * @returns RuralEventScope
 */
export const mapScope = (scope: string | undefined | null): RuralEventScope => {
  if (!scope) return defaultScope;

  const scopeLowercase: string = scope.toLowerCase();

  if (scopeSynonymsLowercase.community.includes(scopeLowercase))
    return "community";
  if (scopeSynonymsLowercase.nearby.includes(scopeLowercase)) return "nearby";
  if (scopeSynonymsLowercase.region.includes(scopeLowercase)) return "region";
  if (scopeSynonymsLowercase.municipality.includes(scopeLowercase))
    return "municipality";
  if (scopeSynonymsLowercase.county.includes(scopeLowercase)) return "county";
  if (scopeSynonymsLowercase.state.includes(scopeLowercase)) return "state";
  if (scopeSynonymsLowercase.country.includes(scopeLowercase)) return "country";

  return defaultScope;
};
