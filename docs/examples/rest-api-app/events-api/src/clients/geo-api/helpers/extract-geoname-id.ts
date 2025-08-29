import { GeonameId } from "@/src/events/types/geonames.types";
import { getLogger } from "@/src/logging/logger";
import { ClientGeo } from "@/src/logging/loggerApps.config";

/**
 * Extract the id from a geoname id string.
 * @param geonameId: string in the format "geoname.2838887"
 * @returns number
 */
export const extractGeonameId = (geonameId: GeonameId): number => {
  const log = getLogger(ClientGeo.config);

  log.debug(
    {
      data: {
        inputGeonameId: geonameId,
        inputType: typeof geonameId,
        inputLength: geonameId?.length,
      },
    },
    "Extracting geoname ID"
  );

  const parts = geonameId.split(".");
  const numericPart = parts[1];
  const extractedId = parseInt(numericPart);

  log.debug(
    {
      data: {
        splitParts: parts,
        numericPart: numericPart,
        extractedId: extractedId,
        isValidNumber: !isNaN(extractedId),
      },
    },
    "Geoname ID extraction completed"
  );

  return extractedId;
};
