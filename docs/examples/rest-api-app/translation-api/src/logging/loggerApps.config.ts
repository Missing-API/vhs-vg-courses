export enum ApiFindByAddress {}

export enum ApiCommunity {}

export enum ApiHealth {
  health = "api.health",
  config = "api.health.config",
}

export enum ClientGeoNames {
  health = "client.geonames.health",
}

export enum ClientGooglePlaces {
  health = "client.googleplaces.health",
  "text-search" = "client.googleplaces.text-search",
  "place-details" = "client.googleplaces.place-details",
  "get-api-error" = "client.googleplaces.get-api-error",
}

export enum GeoLocationHelpers {
  "compose-geocoded-geolocation" = "geolocation.helpers.compose-geocoded-geolocation",
  "get-name" = "geolocation.helpers.get-name",
  "get-wikidata-id" = "geolocation.helpers.get-wikidata-id",
  "evaluate-local-place-name" = "geolocation.helpers.evaluate-local-place-name",
  "adjust-geo-coordinate-precision" = "geolocation.helpers.adjust-geo-coordinate-precision",
}

export enum GeoLocationTransformers {
  "google-place-to-geo-position" = "geolocation.transformers.google-place-to-geo-position",
  "map-googlemaps-address-components" = "geolocation.transformers.map-googlemaps-address-components",
}

export enum GeoNamesHelpers {
  "determine-hierarchy-query" = "geonames.helpers.determine-hierarchy-query",
}
