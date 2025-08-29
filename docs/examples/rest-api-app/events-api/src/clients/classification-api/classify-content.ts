// import { unstable_cacheLife as cacheLife } from "next/cache";
import { getLogger } from "../../logging/logger";
import { getClassificationApiConfig } from "./helpers/config";
import { ClientClassification } from "@/src/logging/loggerApps.config";
import {
  ClassifyContentQuery,
  ClassifyContentQuerySchema,
  ClassifyContentResponse,
  ClassifyContentResponseSchema,
  FallbackClassification,
} from "./classify-content.types";
import { ApiError } from "next/dist/server/api-utils";
import { AnyResult } from "@/src/rest/any-result.schema";

const log = getLogger(ClientClassification.classify);

export const classifyContent = async (
  query: ClassifyContentQuery
): Promise<ClassifyContentResponse> => {
  // "use cache";
  // cacheLife("classification");

  log.trace(
    {
      query: {
        ...query,
      },
    },
    "classifyContent called"
  );

  // check incoming params
  try {
    ClassifyContentQuerySchema.parse(query);

    // Get API configuration
    const { host, token } = getClassificationApiConfig();

    // if no tags, then classify by using the classification api with fetch at SVF_CLASSIFICATIONAPI_URL
    const url = new URL("/api/classify", host);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Sheep-Token": token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    // check classification for category and scope
    const classificationResponse: AnyResult = await response.json();
    const classification: ClassifyContentResponse =
      ClassifyContentResponseSchema.parse(classificationResponse.data);

    log.debug(
      {
        data: classification,
      },
      "Classification successful"
    );
    return classification;
  } catch (error) {
    log.error(error, "Classification failed");
    return FallbackClassification;
  }
};
