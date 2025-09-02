"use cache";

import { extractSearchFormUrl } from "./extract-search-form-url";
import {
  buildCourseSearchRequest,
  courseSearchHeaders,
} from "./build-course-search-request";
import { extractPaginationLinks } from "./extract-pagination-links";
import { parseCourseResults } from "./parse-course-results";
import { CoursesResponse, Course } from "./courses.schema";
import { getLocations } from "./get-locations";
import * as cheerio from "cheerio";
import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";
import { VhsSessionManager } from "./vhs-session-manager";
import { fetchWithTimeoutCookies } from "./fetch-with-timeout-cookies";
import { fetchCourseDetailsBatch, MAX_CONCURRENT_DETAILS } from "./fetch-course-details-batch";

/**
 * Options for enhancing the course list with detailed information.
 */
export interface GetCoursesOptions {
  includeDetails?: boolean;
  batchSize?: number; // number of details to fetch in one parallel batch (throttled to MAX_CONCURRENT_DETAILS)
  concurrentBatches?: boolean; // reserved for future use; batches currently run sequentially
}

/**
 * Extract a VHS course id from a detail URL if present.
 * Matches trailing segment like /252A21003
 */
function extractCourseIdFromUrl(url: string): string | undefined {
  try {
    const m = url.match(/\/([0-9]{3}[A-Z][0-9]{5})\b/i);
    return m?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Get full course list for a specific location id (e.g., "anklam", "greifswald", "pasewalk").
 * Flow:
 *  1. Validate location id and resolve display name
 *  2. Extract search form URL
 *  3. Build POST request body for the location and default filters
 *  4. Fetch initial results page
 *  5. Extract pagination links
 *  6. Fetch all pages in parallel (including the first page content)
 *  7. Parse and de-duplicate courses
 *  8. Optionally validate count against filter count if present
 *  9. Optionally enrich with details (throttled, resilient)
 */
export async function getCourses(
  locationId: string,
  options?: GetCoursesOptions
): Promise<CoursesResponse> {
  const log = withCategory(logger, "courseProcessing");
  const end = startTimer();

  if (!locationId) {
    log.error(
      { operation: "courses.get", reason: "missing_locationId" },
      "locationId is required"
    );
    throw new Error("locationId is required");
  }

  // Resolve location name from our known list (validate id)
  log.debug({ operation: "courses.get", locationId }, "Resolving location");
  const locs = await getLocations();
  const loc = locs.locations.find((l) => l.id === locationId);
  if (!loc) {
    const known = locs.locations.map((l) => l.id).join(", ");
    log.error(
      { operation: "courses.get", locationId, known },
      "Unknown location id"
    );
    throw new Error(
      `Unknown location id '${locationId}'. Known ids: ${known}`
    );
  }
  const locationName = loc.name;

  // 1) Extract form URL
  log.debug(
    { operation: "courses.get", step: "extract_form_url" },
    "Extracting search form URL"
  );
  const formUrl = await extractSearchFormUrl();
  const base = new URL(formUrl);
  const baseHref = `${base.origin}/`;

  // 2) Build request body + headers
  const body = buildCourseSearchRequest(locationName);
  const headers = courseSearchHeaders();

  // 2a) Initialize a session manager
  const session = new VhsSessionManager();

  // 3) Fetch initial page (POST) using session-aware client
  const initialRes = await fetchWithTimeoutCookies(formUrl, {
    method: "POST",
    headers,
    body,
    useSession: true,
    sessionManager: session,
  });
  const initialHtml = await initialRes.text();

  // 4) Extract pagination links (GET pages)
  const pageLinks = extractPaginationLinks(initialHtml, baseHref);
  log.debug(
    { operation: "courses.get", pages: pageLinks.length },
    "Extracted pagination links"
  );

  // 5) Fetch all pagination pages in parallel with the same session
  const pageFetches = pageLinks.map((url) =>
    fetchWithTimeoutCookies(url, {
      method: "GET",
      useSession: true,
      sessionManager: session,
    }).then((r) => r.text())
  );

  const pagesHtml = await Promise.all(pageFetches);

  // 6) Parse courses from all pages including the first page
  const allHtml = [initialHtml, ...pagesHtml];

  const allCourses: Course[] = [];
  for (const html of allHtml) {
    const parsed = parseCourseResults(html, baseHref);
    allCourses.push(...parsed);
  }

  // 7) Deduplicate by id or detailUrl
  const dedupMap = new Map<string, Course>();
  for (const c of allCourses) {
    const key = c.id || c.detailUrl;
    if (!dedupMap.has(key)) {
      dedupMap.set(key, c);
    }
  }
  let courses = Array.from(dedupMap.values());

  // 8) Validate count if possible by reading the filter label count
  const expectedCount = extractSelectedLocationCount(initialHtml, locationName);
  const warnings: string[] = [];
  if (typeof expectedCount === "number" && expectedCount !== courses.length) {
    warnings.push(
      `Parsed ${courses.length} courses but filter shows ${expectedCount}.`
    );
    log.warn(
      {
        operation: "courses.get",
        expectedCount,
        parsedCount: courses.length,
        locationId,
      },
      "Course count mismatch"
    );
  }

  let detailsMeta: { requested: number; succeeded: number; failed: number; cacheHits?: number; durationMs?: number } | undefined;

  // 9) Optional enrichment with details
  if (options?.includeDetails) {
    const ids: (string | undefined)[] = courses.map((c) => {
      // Prefer explicit id if it matches the expected pattern, else extract from URL
      const byUrl = extractCourseIdFromUrl(c.detailUrl);
      const id = /^[0-9]{3}[A-Z][0-9]{5}$/i.test(c.id) ? c.id : byUrl;
      return id;
    });
    const validIds = ids.filter((v): v is string => Boolean(v));

    // If some courses don't have a valid id, note a warning
    if (validIds.length !== courses.length) {
      const missing = courses.length - validIds.length;
      warnings.push(`${missing} course(s) missing a valid id for details fetch`);
      log.warn(
        {
          operation: "courses.get",
          locationId,
          missing,
          total: courses.length,
        },
        "Some courses missing valid ids for details"
      );
    }

    const batchSize = Math.min(
      options.batchSize ?? MAX_CONCURRENT_DETAILS,
      MAX_CONCURRENT_DETAILS
    );

    const endDetails = startTimer();
    const { results: detailsMap, errors, metrics } =
      await fetchCourseDetailsBatch(validIds, batchSize);

    const detailsDurationMs = endDetails();

    // Merge back into course list by matching on extracted id from url or id field
    courses = courses.map((c) => {
      const cid =
        (/^[0-9]{3}[A-Z][0-9]{5}$/i.test(c.id) ? c.id : extractCourseIdFromUrl(c.detailUrl)) ||
        undefined;
      const details = cid ? detailsMap[cid] : undefined;
      return details ? { ...c, details } : c;
    });

    // Add warnings for failures
    const failedIds = Object.keys(errors);
    if (failedIds.length) {
      warnings.push(
        `Failed to fetch details for ${failedIds.length} course(s)`
      );
    }

    detailsMeta = {
      ...metrics,
      durationMs: detailsDurationMs,
    };
  }

  const durationMs = end();
  log.info(
    {
      operation: "courses.get",
      locationId,
      count: courses.length,
      durationMs,
      includeDetails: !!options?.includeDetails,
      detailsRequested: detailsMeta?.requested,
      detailsSucceeded: detailsMeta?.succeeded,
      detailsFailed: detailsMeta?.failed,
    },
    "Fetched courses"
  );

  return {
    courses,
    count: courses.length,
    expectedCount,
    warnings: warnings.length ? warnings : undefined,
    detailsMeta,
  };
}

/**
 * Attempt to extract the expected result count for the selected location
 * from the filter sidebar labels: e.g., "Anklam (66)".
 */
function extractSelectedLocationCount(
  html: string,
  locationName: string
): number | undefined {
  try {
    const $ = cheerio.load(html);
    let count: number | undefined;

    // Inspect labels under kw-filter-ortvalues
    $("#kw-filter-ortvalues label").each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (!txt) return;

      // Expect something like "Anklam (66)"
      if (txt.toLowerCase().includes(locationName.toLowerCase())) {
        const m = txt.match(/\((\d+)\)/);
        if (m) {
          count = Number(m[1]);
          return false; // break
        }
      }
    });

    return count;
  } catch {
    return undefined;
  }
});

    if (detailsResult.failedIds.length) {
      warnings.push(`Failed to fetch details for ${detailsResult.failedIds.length} courses.`);
    }

    detailsMeta = {
      requested: detailsResult.meta.requested,
      succeeded: detailsResult.meta.fetched,
      failed: detailsResult.meta.failed,
      cacheHits: detailsResult.meta.cacheHits,
      durationMs: detailsResult.meta.durationMs,
    };
  }

  const durationMs = end();
  log.info({ operation: 'courses.get', locationId, count: courses.length, durationMs }, 'Fetched courses');

  return {
    courses,
    count: courses.length,
    expectedCount,
    warnings: warnings.length ? warnings : undefined,
    detailsMeta,
  };
}

/**
 * Attempt to extract the expected result count for the selected location
 * from the filter sidebar labels: e.g., "Anklam (66)".
 */
function extractSelectedLocationCount(
  html: string,
  locationName: string
): number | undefined {
  try {
    const $ = cheerio.load(html);
    let count: number | undefined;

    // Inspect labels under kw-filter-ortvalues
    $("#kw-filter-ortvalues label").each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (!txt) return;

      // Expect something like "Anklam (66)"
      if (txt.toLowerCase().includes(locationName.toLowerCase())) {
        const m = txt.match(/\((\d+)\)/);
        if (m) {
          count = Number(m[1]);
          return false; // break
        }
      }
    });

    return count;
  } catch {
    return undefined;
  }
}