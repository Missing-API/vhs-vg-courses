import { ApiConfig, getApiHost, getApiToken } from "../../helpers/config";
import { ClientTypesense } from "@/src/logging/loggerApps.config";

// Environment variable names for Typesense API
const TYPESENSE_HOST_ENV = "TYPESENSE_HOST";
const TYPESENSE_TOKEN_ENV = "TYPESENSE_TOKEN";

/**
 * Returns the Typesense host from environment variables
 * @returns The validated Typesense host URL
 */
export const getTypesenseHost = (): string => {
  return getApiHost(TYPESENSE_HOST_ENV, ClientTypesense.config);
};

/**
 * Returns the validated Typesense API key from environment variables
 * @returns The validated API key
 */
export const getTypesenseApiKey = (): string => {
  return getApiToken(TYPESENSE_TOKEN_ENV, ClientTypesense.config);
};

/**
 * Safe wrapper to get Typesense API configuration
 * Returns all Typesense configuration parameters
 * @returns Object containing Typesense configuration
 */
export const getTypesenseApiConfig = () => {
  return {
    host: getTypesenseHost(),
    token: getTypesenseApiKey(),
  } as ApiConfig;
};
