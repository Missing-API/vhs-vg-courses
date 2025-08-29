import { GeoLocation } from "@/src/clients/geo-api/types/geo-location.types";
import { CommunityCenterQuery } from "../searchEvents";
import { getGeoLocation } from "@/src/clients/geo-api/get-geo-location";

export const getCommunityCenter = async (
  geonameId: number
): Promise<CommunityCenterQuery> => {
  console.log("🌍 getCommunityCenter: Called with geonameId:", geonameId);

  const communityObject: GeoLocation = (await getGeoLocation(
    geonameId
  )) as GeoLocation;

  console.log(
    "🌍 getCommunityCenter: Received geo data:",
    JSON.stringify(communityObject, null, 2)
  );

  // Check if geo coordinates are available
  if (!communityObject.geo?.point?.lat || !communityObject.geo?.point?.lng) {
    console.error(
      "❌ getCommunityCenter: Missing geo coordinates in API response"
    );
    throw new Error(
      `Missing geo coordinates for geonameId ${geonameId}. API response: ${JSON.stringify(communityObject)}`
    );
  }

  const geopoint: [number, number] = [
    communityObject.geo.point.lat,
    communityObject.geo.point.lng,
  ];

  console.log("🌍 getCommunityCenter: Extracted geopoint:", geopoint);

  // Validate hierarchy data
  if (
    !communityObject.hierarchy?.municipality?.geonameId ||
    !communityObject.hierarchy?.county?.geonameId ||
    !communityObject.hierarchy?.state?.geonameId ||
    !communityObject.hierarchy?.country?.geonameId
  ) {
    console.error(
      "❌ getCommunityCenter: Missing hierarchy data in API response"
    );
    throw new Error(
      `Missing hierarchy data for geonameId ${geonameId}. Hierarchy: ${JSON.stringify(communityObject.hierarchy)}`
    );
  }

  const communityId: string = ("geoname." +
    communityObject.geonameId?.toString()) as string;
  const municipalityId: string =
    "geoname." + communityObject.hierarchy.municipality.geonameId;
  const countyId: string =
    "geoname." + communityObject.hierarchy.county.geonameId;
  const stateId: string =
    "geoname." + communityObject.hierarchy.state.geonameId;
  const countryId: string =
    "geoname." + communityObject.hierarchy.country.geonameId;

  return {
    geopoint,
    communityId,
    municipalityId,
    countyId,
    stateId,
    countryId,
  };
};
