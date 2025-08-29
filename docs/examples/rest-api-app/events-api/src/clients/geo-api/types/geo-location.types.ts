// TODO: import from geo-api module as soon as it is available on public npm

/**
 * Wrapper for geo API responses
 */
export interface GeoApiResponse<T> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoBox {
  north: number;
  east: number;
  south: number;
  west: number;
  accuracyLevel?: number;
}

export interface GeoPosition {
  point: GeoPoint;
  box?: GeoBox;
}

export interface GeoIdentifiers {
  geonameId: number | null;
  googlePlaceId: string | null;
  wikidataId: string | null;
  googleMyBusinessId: string | null;
}

type GeoAddress = string;

export type GeoLocationType =
  | "place"
  | "community"
  | "municipality"
  | "county"
  | "state"
  | "country";

export interface GeoAdministrativeHierarchyItem {
  geonameId: number | null;
  name: string;
  ISO3166: string;
  zip: string | null;
  code: string | null;
  class: string | null;
}

export type GeoAdministrativeCountry = Pick<
  GeoAdministrativeHierarchyItem,
  "geonameId" | "name" | "ISO3166"
>;
export type GeoAdministrativeState = Pick<
  GeoAdministrativeHierarchyItem,
  "geonameId" | "name" | "ISO3166"
>;
export type GeoAdministrativeCounty = Pick<
  GeoAdministrativeHierarchyItem,
  "geonameId" | "name"
>;
type GeoAdministrativeMunicipalityBase = Pick<
  GeoAdministrativeHierarchyItem,
  "geonameId" | "name" | "zip"
>;
export interface GeoAdministrativeMunicipality
  extends GeoAdministrativeMunicipalityBase {
  wikidataId: string | null;
}

type GeoAdministrativeCommunityBase = Pick<
  GeoAdministrativeHierarchyItem,
  "geonameId" | "name"
>;

export interface GeoAdministrativeCommunity
  extends GeoAdministrativeCommunityBase {
  wikidataId: string | null;
}

type GeoAdministrativePlaceBase = Pick<
  GeoAdministrativeHierarchyItem,
  "geonameId" | "name" | "code" | "class"
>;
export interface GeoAdministrativePlace extends GeoAdministrativePlaceBase {
  wikidataId: string | null;
}
export interface GeoAdministrativeHierarchy {
  country?: GeoAdministrativeCountry;
  state?: GeoAdministrativeState; // state = admin1@geonames
  county?: GeoAdministrativeCounty; // county = admin3@geonames
  municipality?: GeoAdministrativeMunicipality; // municipality = admin4@geonames
  community?: GeoAdministrativeCommunity;
  place?: GeoAdministrativePlace;
}

export interface GeoDemography {
  population: number | null;
}

/**
 * Geo location.
 */
export interface GeoLocation extends GeoIdentifiers {
  name: string;
  localName?: string;
  asciiName?: string;
  type?: GeoLocationType;
  geo?: GeoPosition;
  location?: string;
  address?: GeoAddress;
  hierarchy?: GeoAdministrativeHierarchy;
  demography?: GeoDemography;
  timezone?: string;
}
