"use cache";

import { fetchWithTimeout } from "./fetch-with-timeout";
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
 */
export interface GetCoursesOptions {
  includeDetails?: boolean;
  batchSize?: number;
  concurrentBatches?: boolean; // when true, process batches in parallel
}

export async function getCourses(locationId: string, options?: GetCoursesOptions): Promise<CoursesResponse> {
  const log = withCategory(logger, 'courseProcessing');
  const end = startTimer();

  if (!locationId) {
    log.error({ operation: 'courses.get', reason: 'missing_locationId' }, 'locationId is required');
    throw new Error("locationId is required");
  }

  // Resolve location name from our known list (validate id)
  log.debug({ operation: 'courses.get', locationId }, 'Resolving location');
  const locs = await getLocations();
  const loc = locs.locations.find((l) => l.id === locationId);
  if (!loc) {
    const known = locs.locations.map((l) => l.id).join(", ");
    log.error({ operation: 'courses.get', locationId, known }, 'Unknown location id');
    throw new Error(
      `Unknown location id '${locationId}'. Known ids: ${known}`
    );
  }
  const locationName = loc.name;

  // 1) Extract form URL
  log.debug({ operation: 'courses.get', step: 'extract_form_url' }, 'Extracting search form URL');
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
  log.debug({ operation: 'courses.get', pages: pageLinks.length }, 'Extracted pagination links');

  // 5) Fetch all pagination pages in parallel with the same session
  const pageFetches = pageLinks.map((url) =>
    fetchWithTimeoutCookies(url, { method: "GET", useSession: true, sessionManager: session }).then((r) => r.text())
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
  const courses = Array.from(dedupMap.values());

  // 8) Validate count if possible by reading the filter label count
  const expectedCount = extractSelectedLocationCount(initialHtml, locationName);
  const warnings: string[] = [];
  if (typeof expectedCount === "number" && expectedCount !== courses.length) {
    warnings.push(
      `Parsed ${courses.length} courses but filter shows ${expectedCount}.`
    );
    log.warn({ operation: 'courses.get', expectedCount, parsedCount: courses.length, locationId }, 'Course count mismatch');
  }

  // 9) Cache warming and optional detail inclusion
  const { warmCourseDetailsCache, fetchCourseDetailsBatch } = await import("./fetch-course-details-batch");
  const { COURSE_DETAIL_CONFIG } = await import("./performance");

  const ids = courses.map(c => c.id).filter((id) => /^[0-9]{3}[A-Z][0-9]{5}$/i.test(id));

  // Fire-and-forget cache warming regardless of includeDetails
  warmCourseDetailsCache(ids, { batchSize: COURSE_DETAIL_CONFIG.BATCH_SIZE });

  let detailsRequested = 0;
  let detailsSucceeded = 0;
  let detailsFailed = 0;

  if (options?.includeDetails) {
    const batchSize = Math.min(options.batchSize || COURSE_DETAIL_CONFIG.BATCH_SIZE, COURSE_DETAIL_CONFIG.MAX_CONCURRENT_DETAILS);
    detailsRequested = ids.length;

    const concurrencyMode = options.concurrentBatches ? "parallel" : "sequential";
    const batchResult = await fetchCourseDetailsBatch(ids, {
      batchSize,
      concurrency: concurrencyMode,
      retryAttempts: COURSE_DETAIL_CONFIG.RETRY_ATTEMPTS,
      retryDelayMs: COURSE_DETAIL_CONFIG.RETRY_DELAY_MS,
    });

    detailsSucceeded = batchResult.results.length;
    detailsFailed = batchResult.errors.length;

    // Merge details into courses by id
    const byId = new Map(batchResult.results.map((d) => [d.id, d] as const));
    for (const c of courses) {
      const d = byId.get(c.id);
      if (d) {
        (c as any).details = d;
      }
    }
  }

  const durationMs = end();
  log.info({ operation: 'courses.get', locationId, count: courses.length, durationMs, includeDetails: !!options?.includeDetails, detailsRequested, detailsSucceeded, detailsFailed }, 'Fetched courses');

  return {
    courses,
    count: courses.length,
    expectedCount,
    warnings: warnings.length ? warnings : undefined,
    meta: {
      includeDetails: !!options?.includeDetails,
      detailsRequested: detailsRequested || undefined,
      detailsSucceeded: detailsSucceeded || undefined,
      detailsFailed: detailsFailed || undefined,
      cacheWarmingTriggered: true,
    },
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