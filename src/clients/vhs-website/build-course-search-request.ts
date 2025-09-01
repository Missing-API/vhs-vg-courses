/**
 * Build POST request body to search courses for a given location with default filters applied.
 *
 * Reference (docs/requirements/vhs-vg.md lines 44-51):
 * Content-Type: application/x-www-form-urlencoded
 *
 * Body (decoded):
 * - katortfilter[] = <LocationName>
 * - katkeinebegonnenenfilter[] = 1   (exclude started)
 * - katnichtvollefilter[] = 1         (exclude fully booked)
 * - resets for all unused filters
 *
 * The function returns a URL-encoded string suitable for fetch() body.
 */
export function buildCourseSearchRequest(locationName: string): string {
  if (!locationName) {
    throw new Error("Location name is required to build course search request");
  }

  // Construct entries in a deterministic order to make tests straightforward
  const params: [string, string][] = [
    ["katortfilter[]", locationName],
    ["katortfilter[]", "__reset__"],

    // Unused filters we reset explicitly
    ["katwotagefilter[]", "__reset__"],
    ["katzeitraumfilter", "__reset__"],

    // Default filters
    ["katkeinebegonnenenfilter[]", "1"],
    ["katkeinebegonnenenfilter[]", "__reset__"],

    ["katneuerkursfilter[]", "__reset__"],

    ["katnichtvollefilter[]", "1"],
    ["katnichtvollefilter[]", "__reset__"],
  ];

  const body = params
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )
    .join("&");

  return body;
}

/**
 * Convenience helper returning headers for course POST requests.
 */
export function courseSearchHeaders(): HeadersInit {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
  };
}