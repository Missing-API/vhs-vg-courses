// import { unstable_cacheLife as cacheLife } from "next/cache";
import { getLogger } from "../../logging/logger";
import { getClassificationApiConfig } from "./helpers/config";
import { ClientClassification } from "@/src/logging/loggerApps.config";
import {
  FallbackScopification,
  ScopifyContentQuery,
  ScopifyContentQuerySchema,
  ScopifyContentResponse,
  ScopifyContentResponseSchema,
} from "./scopify-content.types";
import { ApiError } from "next/dist/server/api-utils";
import { AnyResult } from "@/src/rest/any-result.schema";

const log = getLogger(ClientClassification.scopify);

export const scopifyContent = async (
  query: ScopifyContentQuery
): Promise<ScopifyContentResponse> => {
  // "use cache";
  // cacheLife("classification");

  log.trace(
    {
      query: {
        ...query,
      },
    },
    "scopifyContent called"
  );

  // check incoming params
  try {
    ScopifyContentQuerySchema.parse(query);

    // Get API configuration
    const { host, token } = getClassificationApiConfig();

    // if no tags, then scopify by using the classification api with fetch at SVF_CLASSIFICATIONAPI_URL
    const url = new URL("/api/scopify", host);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Sheep-Token": token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // just post the query as it is
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    // check classification for category and scope
    const scopifyResponse: AnyResult = await response.json();

    // Add diagnostic logging to understand the response structure
    log.debug(
      {
        data: {
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          rawResponse: scopifyResponse,
          responseType: typeof scopifyResponse,
          isObject: typeof scopifyResponse === "object",
          hasData: scopifyResponse?.data !== undefined,
          dataValue: scopifyResponse?.data,
          dataType: typeof scopifyResponse?.data,
        },
      },
      "Raw scopify API response received"
    );

    // Add diagnostic logging before schema parsing
    log.debug(
      {
        data: {
          aboutToParse: scopifyResponse,
          aboutToParseData: scopifyResponse?.data,
          aboutToParseScope: scopifyResponse?.data?.scope,
          schemaExpects:
            "string enum: 'community' | 'municipality' | 'county' | 'state' | 'country' | 'nearby' | 'region'",
        },
      },
      "About to parse scopify response with schema"
    );

    // Extract the scope value from the nested data structure
    const scopeValue = scopifyResponse?.data?.scope;
    const scopification: ScopifyContentResponse =
      ScopifyContentResponseSchema.parse(scopeValue);

    log.debug(
      {
        data: scopification,
      },
      "Scopification successful"
    );
    return scopification;
  } catch (error) {
    log.error(error, "Scopification failed");
    return FallbackScopification;
  }
};
