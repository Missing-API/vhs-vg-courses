import { ClientCalendar } from "@/src/logging/loggerApps.config";
import { ApiConfig, getApiHost, getApiToken } from "../../helpers/config";

// Environment variable names for calendar API
const CALENDAR_API_HOST_ENV = "SVF_CALENDARAPI_HOST";
const CALENDAR_API_TOKEN_ENV = "SVF_CALENDARAPI_TOKEN";

/**
 * Returns the validated calendar API host URL from environment variables
 * @returns The API host URL or throws an error if not configured
 */
export const getCalendarApiHost = (): string => {
  return getApiHost(CALENDAR_API_HOST_ENV, ClientCalendar.config);
};

/**
 * Returns the validated calendar API token from environment variables
 * @returns The API token or throws an error if not configured
 */
export const getCalendarApiToken = (): string => {
  return getApiToken(CALENDAR_API_TOKEN_ENV, ClientCalendar.config);
};

/**
 * Safe wrapper to get calendar API configuration
 * Returns the host and token or null values if either is missing
 * @returns Object containing host and token, or null values if configuration is invalid
 */
export const getCalendarApiConfig = () => {
  return {
    host: getCalendarApiHost(),
    token: getCalendarApiToken(),
  } as ApiConfig;
};
