import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock helper modules
vi.mock("./extract-search-form-url", () => ({
  extractSearchFormUrl: vi.fn(),
}));
vi.mock("./build-course-search-request", () => ({
  buildCourseSearchRequest: vi.fn(),
  courseSearchHeaders: vi.fn().mockReturnValue({
    "Content-Type": "application/x-www-form-urlencoded",
  }),
}));
vi.mock("./extract-pagination-links", () => ({
  extractPaginationLinks: vi.fn(),
}));
vi.mock("./parse-course-results", () => ({
  parseCourseResults: vi.fn(),
}));
vi.mock("./get-locations", () => ({
  getLocations: vi.fn(),
}));

import { getCourses } from "./get-courses";
import { extractSearchFormUrl } from "./extract-search-form-url";
import { buildCourseSearchRequest } from "./build-course-search-request";
import { extractPaginationLinks } from "./extract-pagination-links";
import { parseCourseResults } from "./parse-course-results";
import { getLocations } from "./get-locations";

describe("getCourses", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (getLocations as any).mockResolvedValue({
      locations: [
        { id: "anklam", name: "Anklam", address: "" },
        { id: "greifswald", name: "Greifswald", address: "" },
      ],
    });
    (extractSearchFormUrl as any).mockResolvedValue(
      "https://www.vhs-vg.de/kurse?kathaupt=1&cHash=xyz#kw-filter"
    );
    (buildCourseSearchRequest as any).mockReturnValue("mock-body");
    (extractPaginationLinks as any).mockReturnValue([
      "https://www.vhs-vg.de/kurse?page=2",
      "https://www.vhs-vg.de/kurse?page=3",
    ]);

    // Mock fetch for initial and pagination pages
    vi.spyOn(global, "fetch").mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes("cHash=xyz") && init?.method === "POST") {
        const html = `
          <html><body>
            <div id="kw-filter-ortvalues">
              <label>Anklam (2)</label>
            </div>
            <div class="kw-kursuebersicht"><table><tbody><!-- rows --></tbody></table></div>
            <div class="kw-paginationleiste"><nav><ul></ul></nav></div>
          </body></html>
        `;
        return Promise.resolve(new Response(html, { status: 200 }));
      }
      if (url.endsWith("page=2")) {
        return Promise.resolve(new Response("<html><body>P2</body></html>", { status: 200 }));
      }
      if (url.endsWith("page=3")) {
        return Promise.resolve(new Response("<html><body>P3</body></html>", { status: 200 }));
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    // parseCourseResults will map HTML marker to different sets to simulate pages
    (parseCourseResults as any).mockImplementation((html: string) => {
      if (html.includes("P2")) {
        return [
          {
            id: "252A001",
            title: "Course 1",
            detailUrl: "https://www.vhs-vg.de/kurse/kurs/course-1/252A001",
            start: "2025-09-01T10:00:00.000Z",
            location: "Ort A",
            available: true,
            bookable: true,
          },
        ];
      }
      if (html.includes("P3")) {
        return [
          {
            id: "252A002",
            title: "Course 2",
            detailUrl: "https://www.vhs-vg.de/kurse/kurs/course-2/252A002",
            start: "2025-09-02T11:00:00.000Z",
            location: "Ort B",
            available: true,
            bookable: false,
          },
        ];
      }
      // initial page -> include a duplicate of Course 1 to test dedup
      return [
        {
          id: "252A001",
          title: "Course 1",
          detailUrl: "https://www.vhs-vg.de/kurse/kurs/course-1/252A001",
          start: "2025-09-01T10:00:00.000Z",
          location: "Ort A",
          available: true,
          bookable: true,
        },
      ];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should orchestrate flow and return combined, deduplicated courses", async () => {
    const result = await getCourses("anklam");
    expect(extractSearchFormUrl).toHaveBeenCalledTimes(1);
    expect(buildCourseSearchRequest).toHaveBeenCalledWith("Anklam");
    expect(extractPaginationLinks).toHaveBeenCalledTimes(1);
    expect(parseCourseResults).toHaveBeenCalled();

    // Should deduplicate Course 1
    expect(result.courses).toHaveLength(2);
    const ids = result.courses.map(c => c.id).sort();
    expect(ids).toEqual(["252A001", "252A002"].sort());

    // Count and validation
    expect(result.count).toBe(2);
    expect(result.expectedCount).toBe(2);
    expect(result.warnings).toBeUndefined();
  });

  it("should validate location id and throw for unknown", async () => {
    await expect(getCourses("unknown")).rejects.toThrow(/Unknown location id/);
  });
});