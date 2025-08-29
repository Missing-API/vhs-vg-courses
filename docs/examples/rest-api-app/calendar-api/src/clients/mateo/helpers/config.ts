import { clientLoggerMateo } from '@/logging/loggerApps.config';
import {
  ApiConfig,
  getApiConfig,
  getApiHost,
  getApiToken,
} from '../../helpers/config';

// Environment variable names for geo API
const API_HOST_ENV = 'MATEO_API_ENDPOINT';
const API_TOKEN_ENV = 'MATEO_TOKEN';

/**
 * Returns the validated geo API host URL from environment variables
 * @returns The API host URL or throws an error if not configured
 */
export const getMateoApiHost = (): string => {
  return getApiHost(API_HOST_ENV, clientLoggerMateo.config);
};

/**
 * Returns the validated geo API token from environment variables
 * @returns The API token or throws an error if not configured
 */
export const getMateoApiToken = (): string => {
  return getApiToken(API_TOKEN_ENV, clientLoggerMateo.config);
};

/**
 * Safe wrapper to get geo API configuration
 * Returns the host and token or null values if either is missing
 * @returns Object containing host and token, or null values if configuration is invalid
 */
export const getMateoApiConfig = (): ApiConfig => {
  return getApiConfig(API_HOST_ENV, API_TOKEN_ENV, clientLoggerMateo.config);
};
