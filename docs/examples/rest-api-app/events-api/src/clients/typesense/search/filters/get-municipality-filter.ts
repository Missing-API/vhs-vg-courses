import { isValidGeonameId } from "../../../geo-api/helpers/is-valid-geoname-id";

export const getMunicipalityFilter = (municipalityId: string): string => {
  if (!municipalityId || municipalityId.length === 0)
    throw new Error("municipalityId is required");
  if (!isValidGeonameId(municipalityId))
    throw new Error("municipality id is not valid");

  return `municipality.id: ${municipalityId} && scope: [municipality,nearby,region,county,state,country]`;
};
