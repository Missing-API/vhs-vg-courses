import { ApiError } from "next/dist/server/api-utils";
import { GoogleApiError } from "../types/google-api-error.types";

// Einfachere Version ohne vollständiges Schema
export function extractErrorInfo(googleApiError: GoogleApiError): ApiError {
  return {
    statusCode: googleApiError.status || googleApiError.response?.status || 500,
    message: googleApiError.response?.data?.error?.message || "Unknown error",
    name: "GoogleApiError",
  };
}
