import { getGoogleTranslateApiConfig } from "./helpers/config";
import { getGoogleCloudAccessToken } from "./helpers/auth";
import { getLogger } from "../../logging/logger";
import { ServiceStatusSchema } from "../../rest/health.schema";
import { z } from "zod";

const log = getLogger("google-translate-health");

/**
 * Interface for Google Translate supported languages response
 */
interface SupportedLanguagesResponse {
  languages: Array<{
    languageCode: string;
    displayName?: string;
  }>;
}

/**
 * Checks the health of the Google Translate API by calling the getSupportedLanguages endpoint
 * @returns Promise<ServiceStatusSchema> Health check result
 */
export async function checkGoogleTranslateApiHealth(): Promise<z.infer<typeof ServiceStatusSchema>> {
  const startTime = Date.now();
  
  try {
    log.debug({}, "Starting Google Translate API health check");
    
    // Get configuration (this will try to get access token if available)
    const config = await getGoogleTranslateApiConfig();
    
    // Construct the API URL for getSupportedLanguages
    // Using URL constructor to properly handle host and path separation
    // For getSupportedLanguages, we use the project-level endpoint with GET method
    const apiPath = `/v3/projects/${config.projectId}/supportedLanguages`;
    const url = new URL(apiPath, config.host);
    
    log.debug({
      host: config.host,
      path: apiPath,
      projectId: config.projectId,
      constructedUrl: url.toString()
    }, "Constructing Google Translate API URL (supportedLanguages endpoint)");
    
    // Build headers based on authentication method
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    let finalUrl = url.toString();
    
    // Use access token if available (preferred for v3)
    if (config.accessToken) {
      headers['Authorization'] = `Bearer ${config.accessToken}`;
      log.debug({ url: finalUrl, authMethod: 'access_token' }, "Using access token authentication");
    } 
    // Fall back to API key
    else if (config.apiKey) {
      url.searchParams.set('key', config.apiKey);
      finalUrl = url.toString();
      log.debug({ url: finalUrl, authMethod: 'api_key' }, "Using API key authentication");
    }
    // If neither is available, try to get fresh access token
    else {
      try {
        log.debug({}, "No pre-configured auth found, attempting to generate fresh access token");
        const accessToken = await getGoogleCloudAccessToken();
        headers['Authorization'] = `Bearer ${accessToken}`;
        log.debug({ url: finalUrl, authMethod: 'fresh_access_token', tokenLength: accessToken.length }, "Using fresh access token authentication");
      } catch (authError) {
        const authErrorMessage = authError instanceof Error ? authError.message : 'Unknown auth error';
        log.error({ 
          error: authErrorMessage,
          errorType: authError instanceof Error ? authError.constructor.name : typeof authError,
          stack: authError instanceof Error ? authError.stack : undefined
        }, "Failed to get access token for health check");
        return {
          status: 503,
          error: `Authentication configuration error: ${authErrorMessage}`,
          name: "Google Translate API",
          version: "v3",
        };
      }
    }
    
    // Make the health check request
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
      // Set a reasonable timeout for health checks
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const duration = Date.now() - startTime;

    // Log response details for debugging
    log.debug({
      status: response.status,
      statusText: response.statusText,
      duration,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      url: finalUrl
    }, 'Google Translate API response received');

    if (!response.ok) {
      let errorBody = '';
      let errorDetails = null;
      
      try {
        errorBody = await response.text();
        log.error({ 
          status: response.status, 
          statusText: response.statusText,
          duration,
          errorBody,
          url: finalUrl,
          headers: Object.keys(headers)
        }, "Google Translate API returned error response with body");
        
        // Try to parse error body as JSON for more details
        try {
          errorDetails = JSON.parse(errorBody);
          log.error({
            errorDetails,
            errorCode: errorDetails?.error?.code,
            errorMessage: errorDetails?.error?.message,
            errorStatus: errorDetails?.error?.status
          }, "Parsed Google Translate API error details");
        } catch (parseError) {
          const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
          log.warn({ parseError: parseErrorMessage }, "Could not parse error response as JSON");
        }
      } catch (bodyError) {
        const bodyErrorMessage = bodyError instanceof Error ? bodyError.message : 'Unknown body error';
        log.error({ bodyError: bodyErrorMessage }, "Could not read error response body");
      }
      
      log.warn({ 
        status: response.status, 
        statusText: response.statusText,
        duration,
        errorSummary: errorDetails?.error?.message || errorBody || 'No error details available'
      }, "Google Translate API health check failed");
      
      return {
        status: response.status,
        error: `${response.status} ${response.statusText}${errorDetails?.error?.message ? ': ' + errorDetails.error.message : ''}`,
        name: "Google Translate API",
        version: "v3",
      };
    }

    // Parse and validate the response
    const data = await response.json() as SupportedLanguagesResponse;
    
    if (!data.languages || !Array.isArray(data.languages) || data.languages.length === 0) {
      log.warn({ duration, languageCount: data.languages?.length }, "Google Translate API returned unexpected response");
      
      return {
        status: 503,
        error: "Invalid response format",
        name: "Google Translate API",
        version: "v3",
      };
    }

    log.info({ 
      duration, 
      languageCount: data.languages.length 
    }, "Google Translate API health check successful");

    return {
      status: 200,
      message: "healthy",
      name: "Google Translate API",
      version: "v3",
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof Error) {
      log.error({ 
        error: error.message, 
        errorType: error.constructor.name,
        stack: error.stack,
        duration 
      }, "Google Translate API health check error with enhanced details");
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        return {
          status: 408,
          error: "Request timeout",
          name: "Google Translate API",
          version: "v3",
        };
      }
      
      if (error.message.includes('GOOGLE_TRANSLATE') || error.message.includes('GOOGLE_SERVICE_ACCOUNT')) {
        return {
          status: 503,
          error: `Configuration error: ${error.message}`,
          name: "Google Translate API",
          version: "v3",
        };
      }
      
      return {
        status: 503,
        error: `Service error: ${error.message}`,
        name: "Google Translate API",
        version: "v3",
      };
    }

    log.error({ error, duration }, "Google Translate API health check unexpected error");
    
    return {
      status: 503,
      error: "Service unavailable",
      name: "Google Translate API",
      version: "v3",
    };
  }
}
