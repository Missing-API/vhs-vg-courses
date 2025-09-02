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
import { optimizeLocationAddress } from "./optimize-location-address";
import { fetchCourseDetailsBatch, MAX_CONCURRENT_DETAILS } from "./fetch-course-details-batch";

export interface GetCoursesOptions {
  includeDetails?: boolean;
  batchSize?: number;
  concurrentBatches?: boolean; // reserved for future use
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
 *  9. Optionally fetch and merge course details in parallel with throttling
 */
export async function getCourses(locationId: string, options: GetCoursesOptions = {}): Promise<CoursesResponse> {
  const log = withCategory(logger, 'courseProcessing');
  const end = startTimer();

  if (!locationId) {
    log.error({ operation: 'courses.get', reason: 'missing_locationId' }, 'locationId is required');
    throw new Error("locationId is required");
  }

  const includeDetails = !!options.includeDetails;
  const detailsConcurrency = Math.min(options.batchSize || MAX_CONCURRENT_DETAILS, MAX_CONCURRENT_DETAILS);

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

  // 5a) Optional cache warming for details while other pages are being fetched
  const cacheWarmingEnabled =
    process.env.VHS_CACHE_WARMING_ENABLED === "1" || process.env.VHS_CACHE_WARMING_ENABLED === "true";
  if (cacheWarmingEnabled) {
    try {
      const firstPageCourses = parseCourseResults(initialHtml, baseHref);
      const extractIdWarm = (c: Course): string | undefined => {
        if (c.id) return c.id;
        const m = c.detailUrl?.match(/\/([0-9]{3}[A-Z][0-9]{5})$/i);
        return m?.[1];
      };
      const warmIds = firstPageCourses.map(extractIdWarm).filter((id): id is string => !!id);
      const warmLimit = Math.min(warmIds.length, Math.max(1, Math.min(MAX_CONCURRENT_DETAILS, 20)));
      const warmBatchIds = warmIds.slice(0, warmLimit);

      // Fire-and-forget warming with conservative concurrency
      void fetchCourseDetailsBatch(warmBatchIds, {
        concurrency: Math.min(10, MAX_CONCURRENT_DETAILS),
        batchSize: Math.min(10, MAX_CONCURRENT_DETAILS),
      }).catch(() => void 0);
      log.debug({ operation: 'courses.get', warmCount: warmBatchIds.length }, 'Started cache warming for details');
    } catch {
      // ignore warming errors
    }
  }

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

  // 7b) Optimize addresses based on location context
  courses = courses.map((c) => ({
    ...c,
    address: optimizeLocationAddress(c.locationText, { locationId }),
  }));

  // 8) Validate count if possible by reading the filter label count
  const expectedCount = extractSelectedLocationCount(initialHtml, locationName);
  const warnings: string[] = [];
  if (typeof expectedCount === "number" && expectedCount !== courses.length) {
    warnings.push(
      `Parsed ${courses.length} courses but filter shows ${expectedCount}.`
    );
    log.warn({ operation: 'courses.get', expectedCount, parsedCount: courses.length, locationId }, 'Course count mismatch');
  }

  let meta: CoursesResponse["meta"] = undefined;

  // 9) Optionally fetch and merge details in parallel with throttling
  if (includeDetails && courses.length) {
    const extractId = (c: Course): string | undefined => {
      if (c.id) return c.id;
      const m = c.detailUrl?.match(/\/([0-9]{3}[A-Z][0-9]{5})$/i);
      return m?.[1];
    };

    const courseIds = courses.map(extractId).filter((id): id is string => !!id);
    const { detailsById, stats } = await fetchCourseDetailsBatch(courseIds, {
      concurrency: detailsConcurrency,
      batchSize: detailsConcurrency,
    });

    for (const c of courses) {
      const id = extractId(c);
      if (!id) continue;
      const details = detailsById.get(id);
      if (details) {
        // Flatten details into list item fields
        if (details.start) {
          c.start = details.start;
        }
        (c as any).summary = details.summary;
        const addr = details.location?.address || "";
        if (addr) {
          (c as any).location = addr;
        }
      }
    }

    if (stats.failed) {
      warnings.push(`Failed to fetch details for ${stats.failed} course(s).`);
    }

    meta = {
      detailsRequested: true,
      attempted: stats.attempted,
      succeeded: stats.succeeded,
      failed: stats.failed,
      successRate: stats.successRate,
      cacheHits: stats.cacheHits,
      durationMs: stats.durationMs,
      batchSize: detailsConcurrency,
      concurrency: detailsConcurrency,
      warnings: warnings.length ? warnings : undefined,
    };
  }

  const durationMs = end();
  log.info(
    {
      operation: 'courses.get',
      locationId,
      count: courses.length,
      durationMs,
      details: includeDetails ? { attempted: meta?.attempted, succeeded: meta?.succeeded, failed: meta?.failed } : undefined,
    },
    'Fetched courses'
  );

  return {
    courses,
    count: courses.length,
    expectedCount,
    warnings: warnings.length ? warnings : undefined,
    meta,
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