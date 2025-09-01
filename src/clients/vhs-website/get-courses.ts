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
export async function getCourses(locationId: string): Promise<CoursesResponse> {
  if (!locationId) {
    throw new Error("locationId is required");
  }

  // Resolve location name from our known list (validate id)
  const locs = await getLocations();
  const loc = locs.locations.find((l) => l.id === locationId);
  if (!loc) {
    throw new Error(
      `Unknown location id '${locationId}'. Known ids: ${locs.locations
        .map((l) => l.id)
        .join(", ")}`
    );
  }
  const locationName = loc.name;

  // 1) Extract form URL
  const formUrl = await extractSearchFormUrl();
  const base = new URL(formUrl);
  const baseHref = `${base.origin}/`;

  // 2) Build request body + headers
  const body = buildCourseSearchRequest(locationName);
  const headers = courseSearchHeaders();

  // 3) Fetch initial page (POST)
  const initialRes = await fetchWithTimeout(formUrl, {
    method: "POST",
    headers,
    body,
  });
  const initialHtml = await initialRes.text();

  // 4) Extract pagination links (GET pages)
  const pageLinks = extractPaginationLinks(initialHtml, baseHref);

  // 5) Fetch all pagination pages in parallel
  const pageFetches = pageLinks.map((url) =>
    fetchWithTimeout(url, { method: "GET" }).then((r) => r.text())
  );

  const pagesHtml = await Promise.all(pageFetches);

  // 6) Parse courses from all pages including the first page
  const allHtml = [initialHtml, ...pagesHtml];

  const allCourses: Course[] = [];
  for (const html of allHtml) {
    const parsed = parseCourseResults(html, baseHref);
    allCourses.push(...parsed);
  }

  // 7) Deduplicate by courseNumber or detailUrl
  const dedupMap = new Map<string, Course>();
  for (const c of allCourses) {
    const key = c.courseNumber || c.detailUrl;
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
  }

  return {
    courses,
    count: courses.length,
    expectedCount,
    warnings: warnings.length ? warnings : undefined,
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