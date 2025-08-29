/**
 * Helper function to normalize error objects for consistent logging
 */
interface NormalizedErrorLogPayload {
  status?: number;
  error: string;
  trace?: unknown;
}

/**
 * Normalizes any error object into a consistent structure
 * @param error Any error object
 * @returns A normalized error object with status, error message, and optional trace
 */
export function normalizeError(error: unknown): NormalizedErrorLogPayload {
  // Handle null or undefined
  if (!error) {
    return { error: "Unknown error (null or undefined)" };
  }

  // Handle ApiError type
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // Check for ApiError pattern with details
    if ("details" in err) {
      return {
        status: typeof err.status === "number" ? err.status : undefined,
        error: typeof err.message === "string" ? err.message : "API Error",
        trace: err.details,
      };
    }

    // Extract status - check both top-level and nested locations
    let status: number | undefined;
    if (typeof err.status === "number") {
      status = err.status;
    } else if (
      err.error &&
      typeof err.error === "object" &&
      typeof (err.error as Record<string, unknown>).status === "number"
    ) {
      status = (err.error as Record<string, unknown>).status as number;
    }

    // Extract error message - check various locations
    let errorMessage: string;
    if (typeof err.message === "string") {
      errorMessage = err.message;
    } else if (err.error !== undefined) {
      if (typeof err.error === "string") {
        errorMessage = err.error;
      } else if (typeof err.error === "object" && err.error !== null) {
        const nestedError = err.error as Record<string, unknown>;
        if (nestedError.message !== undefined) {
          errorMessage = String(nestedError.message);
        } else {
          errorMessage = String(err.error);
        }
      } else {
        errorMessage = String(err.error);
      }
    } else {
      errorMessage = String(error);
    }

    // Extract trace information - check various locations
    let trace = err.trace;
    if (!trace && err.stack) {
      trace = err.stack;
    } else if (!trace && err.error && typeof err.error === "object") {
      trace = (err.error as Record<string, unknown>).trace;
    }

    return {
      status,
      error: errorMessage,
      trace,
    };
  }

  // Handle primitive error (like string)
  return { error: String(error) };
}
