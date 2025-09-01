"use cache";

import { Location, LocationsResponse } from "./locations.schema";
import { extractLocationsFromSearchForm } from "./extract-locations-from-search-form";
import { extractLocationDetails } from "./extract-location-details";
import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";

/**
 * Public wrapper combining locations from the search form and enriching with address details.
 */
export async function getLocations(): Promise<LocationsResponse> {
  const log = withCategory(logger, 'locationProcessing');
  const end = startTimer();

  log.info({ operation: 'locations.get' }, 'Fetching locations');

  const [formLocations, detailMap] = await Promise.all([
    extractLocationsFromSearchForm(),
    extractLocationDetails(),
  ]);

  const locations: Location[] = formLocations.map((loc) => {
    const detail = detailMap[loc.id] || {};
    return {
      id: loc.id,
      name: loc.name,
      address: detail.address || "",
    };
  });

  const durationMs = end();
  log.info({ operation: 'locations.get', count: locations.length, durationMs }, 'Fetched locations');

  return {
    locations,
  };
}
