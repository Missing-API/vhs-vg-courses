import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

/**
 * Google Auth object for server-to-server usage.
 */
export const googleAuth: JWT = new google.auth.JWT(
  process.env.GOOGLEAPI_CLIENT_EMAIL,
  undefined,
  JSON.parse(`"${process.env.GOOGLEAPI_PRIVATE_KEY}"`),
  process.env.GOOGLEAPI_SCOPES,
);

// const auth = new google.auth.GoogleAuth({
//   scopes: ['process.env.GOOGLEAPI_SCOPES'],
// });
// const authClient = await auth.getClient();
