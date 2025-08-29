import { getLogger } from '@/logging/logger';

/**
 * Interface defining the return type of API configuration
 */
export interface ApiConfig {
  host: string;
  token: string;
}

/**
 * Generic function to retrieve and validate API configuration from environment variables
 * @param hostEnvVar Environment variable name for the API host URL
 * @param tokenEnvVar Environment variable name for the API token
 * @param loggerName Name for the logger
 * @returns Object with validated host and token
 */
export const getApiConfig = (
  hostEnvVar: string,
  tokenEnvVar: string,
  loggerName = 'api.config',
): ApiConfig => {
  const log = getLogger(loggerName);
  const host = process.env[hostEnvVar];
  const token = process.env[tokenEnvVar];

  const errors = [];

  if (!host || host.length <= 1) {
    errors.push(`${hostEnvVar} is not properly configured`);
  }

  if (!token || token.length <= 1) {
    errors.push(`${tokenEnvVar} is not properly configured`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      log.error(error);
    }
    throw new Error(`API configuration errors: ${errors.join(', ')}`);
  }

  return {
    host: host as string,
    token: token as string,
  } as ApiConfig;
};

/**
 * Generic function to retrieve and validate API host from environment variables
 * @param hostEnvVar Environment variable name for the API host URL
 * @param loggerName Name for the logger
 * @returns The API host URL or throws an error if not configured
 */
export const getApiHost = (
  hostEnvVar: string,
  loggerName = 'api.config',
): string => {
  const log = getLogger(loggerName);
  const host = process.env[hostEnvVar];

  if (!host || host.length <= 1) {
    const error = `${hostEnvVar} is not properly configured`;
    log.error(error);
    throw new Error(error);
  }

  // validate by using URL constructor
  const url = new URL(host);
  return url.toString();
};

/**
 * Generic function to retrieve and validate API token from environment variables
 * @param tokenEnvVar Environment variable name for the API token
 * @param loggerName Name for the logger
 * @returns The API token or throws an error if not configured
 */
export const getApiToken = (
  tokenEnvVar: string,
  loggerName = 'api.config',
): string => {
  const log = getLogger(loggerName);
  const token = process.env[tokenEnvVar];

  if (!token || token.length <= 1) {
    const error = `${tokenEnvVar} is not properly configured`;
    log.error(error);
    throw new Error(error);
  }

  return token;
};
