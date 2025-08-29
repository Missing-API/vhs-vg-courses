import { getLogger } from "../../logging/logger";

/**
 * Interface defining the return type of API configuration
 */
export interface ApiConfig {
  host: string;
  token: string;
}

/**
 * Generic function to retrieve and validate API host from environment variables
 * @param hostEnvVar Environment variable name for the API host URL
 * @param loggerName Name for the logger
 * @returns The API host URL or throws an error if not configured
 */
export const getApiHost = (
  hostEnvVar: string,
  loggerName = "api.config"
): string => {
  const log = getLogger(loggerName);
  const host = process.env[hostEnvVar];

  log.debug(
    {
      data: {
        envVarName: hostEnvVar,
        rawHostValue: host,
        hostType: typeof host,
        hostLength: host?.length,
      },
    },
    "Processing API host environment variable"
  );

  if (!host || host.length <= 1) {
    const error = `${hostEnvVar} is not properly configured`;
    log.error(error);
    throw new Error(error);
  }

  try {
    // validate by using URL constructor
    const url = new URL(host);
    const processedHost = url.toString();

    log.debug(
      {
        data: {
          originalHost: host,
          processedHost: processedHost,
          urlProtocol: url.protocol,
          urlHostname: url.hostname,
          urlPort: url.port,
        },
      },
      "API host URL processed successfully"
    );

    return processedHost;
  } catch (urlError) {
    log.error(
      {
        error: {
          message: (urlError as Error).message,
          originalHost: host,
          envVarName: hostEnvVar,
        },
      },
      "Failed to parse API host URL"
    );
    throw urlError;
  }
};

/**
 * Generic function to retrieve and validate API token from environment variables
 * @param tokenEnvVar Environment variable name for the API token
 * @param loggerName Name for the logger
 * @returns The API token or throws an error if not configured
 */
export const getApiToken = (
  tokenEnvVar: string,
  loggerName = "api.config"
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
