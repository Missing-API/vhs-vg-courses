import { getApiHost, ApiConfig } from "../../helpers/config";
import { getGoogleCloudAccessToken, getProjectIdFromServiceAccount } from './auth';

/**
 * Google Translate API configuration
 */
export interface GoogleTranslateApiConfig extends Omit<ApiConfig, 'token'> {
  projectId: string;
  location: string;
  apiKey?: string;
  accessToken?: string;
}

/**
 * Retrieves Google Translate API configuration from environment variables
 * @returns Google Translate API configuration
 * @throws Error if required environment variables are not set
 */
export const getGoogleTranslateApiConfig = async (): Promise<GoogleTranslateApiConfig> => {
  const host = getApiHost("GOOGLE_TRANSLATE_API_HOST", "google-translate.config");
  const location = getGoogleTranslateLocation();
  
  // Get project ID from service account JSON
  const projectId = await getProjectIdFromServiceAccount();
  
  // Try to get static access token from env first
  let accessToken = process.env.GOOGLE_TRANSLATE_ACCESS_TOKEN;
  
  // If no static token, try to generate one from service account
  if (!accessToken && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      accessToken = await getGoogleCloudAccessToken();
    } catch (error) {
      console.warn('Failed to generate access token from service account:', error);
    }
  }
  
  // Fall back to API key
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_TRANSLATE_API_TOKEN;
  
  if (!accessToken && !apiKey) {
    throw new Error("Either GOOGLE_TRANSLATE_ACCESS_TOKEN, GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_TRANSLATE_API_KEY environment variable is required for google-translate.config");
  }

  return {
    host,
    projectId,
    location,
    accessToken: accessToken?.trim(),
    apiKey: apiKey?.trim(),
  };
};

/**
 * Retrieves Google Translate location from environment variables
 * @returns Google Translate location (defaults to 'global' if not set)
 */
export const getGoogleTranslateLocation = (): string => {
  const location = process.env.GOOGLE_TRANSLATE_LOCATION;
  return location && location.trim() !== "" ? location.trim() : "global";
};
