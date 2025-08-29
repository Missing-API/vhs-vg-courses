import { GeoLocation } from "./types/geo-location.types";
import { getLogger } from "../../logging/logger";
import { ClientGeo } from "../../logging/loggerApps.config";
import { getGeoApiConfig } from "./helpers/config";
// import { cacheLife } from "next/dist/server/use-cache/cache-life";

type GetGeoLocationResponse = GeoLocation | null;

/**
 * geocode location using the svf geoapi
 * @param geonameId: number
 * @returns GeoLocation
 */
export const getGeoLocation = async (
  geonameId: number
): Promise<GetGeoLocationResponse> => {
  // "use cache";
  // cacheLife("geo");

  const log = getLogger(ClientGeo.getcommunity);

  log.trace(
    {
      query: {
        geonameId,
      },
    },
    "getGeoLocation called"
  );

  try {
    const config = getGeoApiConfig();

    // Add diagnostic logging for URL construction
    log.debug(
      {
        data: {
          geonameId,
          configHost: config.host,
          configHostType: typeof config.host,
          pathSegment: `/api/community/${geonameId}`,
        },
      },
      "About to construct URL for geo location request"
    );

    const url = new URL(`/api/community/${geonameId}`, config.host);

    log.debug(
      {
        data: {
          constructedUrl: url.toString(),
          urlHost: url.host,
          urlHostname: url.hostname,
          urlProtocol: url.protocol,
          urlPathname: url.pathname,
        },
      },
      "URL constructed successfully for geo location request"
    );

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
        "Geo location retrieved successfully"
      );
      return data.data as GeoLocation;
    } else {
      log.warn(
        {
          data: {
            geonameId,
            result: "empty response or missing data property",
            responseStatus: data?.status,
            responseMessage: data?.message,
          },
        },
        "Geo location retrieval returned no data"
      );
      return null;
    }
  } catch (error) {
    log.error(error, "Error while retrieving geo location");
    return null;
  }
};
