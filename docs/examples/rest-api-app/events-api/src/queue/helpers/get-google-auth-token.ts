import { GoogleAuth } from "google-auth-library";

/**
 * Gets a Google Auth token for authenticating with the Cloud Tasks API
 * Using google-auth-library for proper authentication
 */
export async function getGoogleAuthToken(): Promise<string> {
  try {
    // Create a new GoogleAuth instance using environment variables
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLEAPI_CLIENT_EMAIL,
        private_key: process.env.GOOGLEAPI_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    // Get an access token
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    if (!token.token) {
      throw new Error("Failed to obtain access token");
    }

    return token.token;
  } catch (error) {
    console.error("Error getting authentication token:", error);
    throw error;
  }
}
