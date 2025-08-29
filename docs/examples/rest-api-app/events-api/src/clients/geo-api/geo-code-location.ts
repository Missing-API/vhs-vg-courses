import { GeoLocation } from "./types/geo-location.types";
import { getLogger } from "../../logging/logger";
import { ClientGeo } from "@/src/logging/loggerApps.config";
import { getGeoApiConfig } from "./helpers/config";
// import { cacheLife } from "next/dist/server/use-cache/cache-life";

type GeoCodeLocationResponse = GeoLocation | null;

/**
 * geocode location using the svf geoapi
 * @param location: string
 * @returns GeoLocation
 */
export const geoCodeLocation = async (
  location: string
): Promise<GeoCodeLocationResponse> => {
  // "use cache";
  // cacheLife("geo");

  const log = getLogger(ClientGeo.findbyaddress);

  log.trace(
    {
      query: {
        location,
      },
    },
    "geoCodeLocation called"
  );

  try {
    const config = getGeoApiConfig();
    const url = new URL("/api/findbyaddress/", config.host);
    url.searchParams.append("location", location);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Sheep-Token": config.token,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.data) {
      log.debug(
        {
          data: {
            hasData: true,
            locationFound: !!data.data,
            status: data.status,
            message: data.message,
          },
        },
        "Geocoding successful"
      );
      return data.data as GeoLocation;
    } else {
      log.warn(
        {
          data: {
            location,
            result: "empty response or missing data property",
            responseStatus: data?.status,
            responseMessage: data?.message,
          },
        },
        "Geocoding returned no data"
      );
      return null;
    }
  } catch (error) {
    log.error(error, "Error while geocoding location");
    return null;
  }
};
