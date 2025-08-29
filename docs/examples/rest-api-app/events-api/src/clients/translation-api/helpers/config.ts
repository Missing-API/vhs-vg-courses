import { ClientTranslation } from "@/src/logging/loggerApps.config";
import { ApiConfig, getApiHost, getApiToken } from "../../helpers/config";

// Environment variable names for translation API
const TRANSLATION_API_HOST_ENV = "SVF_TRANSLATIONAPI_HOST";
const TRANSLATION_API_TOKEN_ENV = "SVF_TRANSLATIONAPI_TOKEN";

/**
 * Returns the validated translation API host URL from environment variables
 * @returns The API host URL or throws an error if not configured
 */
export const getTranslationApiHost = (): string => {
  return getApiHost(TRANSLATION_API_HOST_ENV, ClientTranslation.config);
};

/**
 * Returns the validated translation API token from environment variables
 * @returns The API token or throws an error if not configured
 */
export const getTranslationApiToken = (): string => {
  return getApiToken(TRANSLATION_API_TOKEN_ENV, ClientTranslation.config);
};

/**
 * Safe wrapper to get translation API configuration
 * Returns the host and token or null values if either is missing
 * @returns Object containing host and token, or null values if configuration is invalid
 */
export const getTranslationApiConfig = () => {
  return {
    host: getTranslationApiHost(),
    token: getTranslationApiToken(),
  } as ApiConfig;
};
