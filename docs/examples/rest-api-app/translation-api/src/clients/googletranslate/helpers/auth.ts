import { GoogleAuth } from 'google-auth-library';
import { getLogger } from '@/src/logging/logger';

const log = getLogger('google-translate-auth');

/**
 * Interface for Google Service Account JSON structure
 */
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

/**
 * Gets the project ID from the service account JSON
 * @returns Promise<string> Project ID
 * @throws Error if unable to extract project ID
 */
export async function getProjectIdFromServiceAccount(): Promise<string> {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
    }

    log.debug({}, 'Extracting project ID from service account JSON');

    const credentials: ServiceAccountCredentials = JSON.parse(serviceAccountJson);
    
    if (!credentials.project_id) {
      throw new Error('project_id not found in service account JSON');
    }
    
    log.debug({ data: { projectId: credentials.project_id } }, 'Successfully extracted project ID from service account');
    
    return credentials.project_id;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error({ error: errorMessage }, 'Failed to extract project ID from service account JSON');
    throw new Error(`Failed to extract project ID from service account: ${errorMessage}`);
  }
}

/**
 * Gets access token for Google Cloud services using service account with Next.js caching
 * The "use cache" directive provides persistent caching across serverless function instances
 * @returns Promise<string> Access token
 * @throws Error if unable to generate access token
 */
export async function getGoogleCloudAccessToken(): Promise<string> {
  "use cache";
  
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
    }

    log.debug({}, 'Getting Google Cloud access token (with Next.js caching)');

    // Enhanced logging for debugging
    log.debug({
      hasServiceAccountJson: !!serviceAccountJson,
      serviceAccountJsonLength: serviceAccountJson?.length,
      serviceAccountJsonPrefix: serviceAccountJson ? serviceAccountJson.substring(0, 50) + '...' : undefined
    }, 'Service account configuration check');

    const credentials = JSON.parse(serviceAccountJson);
    
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    
    if (!accessTokenResponse.token) {
      log.error({}, 'Failed to get access token - token is null or undefined');
      throw new Error('Failed to get access token from Google Cloud');
    }

    log.debug({ 
      tokenLength: accessTokenResponse.token.length,
      tokenPrefix: accessTokenResponse.token.substring(0, 10) + '...',
      tokenType: typeof accessTokenResponse.token
    }, 'Successfully got Google Cloud access token with Next.js caching');
    
    return accessTokenResponse.token;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error({ 
      error: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined
    }, 'Failed to get Google Cloud access token with enhanced details');
    throw new Error(`Failed to get Google Cloud access token: ${errorMessage}`);
  }
}
